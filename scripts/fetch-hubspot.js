#!/usr/bin/env node
/**
 * fetch-hubspot.js
 * Pulls tasks and deals from HubSpot and writes hubspot-data.json
 * Requires: HUBSPOT_API_KEY environment variable (private app token)
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.HUBSPOT_API_KEY;

if (!API_KEY) {
  console.warn("⚠️  HUBSPOT_API_KEY not set — writing empty hubspot-data.json");
  const empty = {
    refreshedAt: new Date().toISOString(),
    currency: "€",
    portalId: null,
    owners: [],
    tasks: [],
    deals: [],
  };
  fs.writeFileSync(
    path.join(__dirname, "../hubspot-data.json"),
    JSON.stringify(empty, null, 2)
  );
  process.exit(0);
}

// ─── helpers ────────────────────────────────────────────────────────────────

function hsGet(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `https://api.hubapi.com${path}${qs ? "?" + qs : ""}`;
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (d) => (body += d));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`JSON parse error for ${url}: ${e.message}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function hsPost(path, body) {
  const url = `https://api.hubapi.com${path}`;
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (d) => (data += d));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON parse error for POST ${url}: ${e.message}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// Paginate through all results from a CRM search endpoint
async function searchAll(objectType, requestBody) {
  const results = [];
  let after = undefined;
  do {
    const body = after
      ? { ...requestBody, after }
      : requestBody;
    const res = await hsPost(`/crm/v3/objects/${objectType}/search`, body);
    if (res.results) results.push(...res.results);
    after = res.paging?.next?.after;
  } while (after);
  return results;
}

// ─── portal info ─────────────────────────────────────────────────────────────

async function fetchPortalId() {
  console.log("→ Fetching portal info...");
  try {
    const res = await hsGet("/account-info/v3/details");
    return res.portalId ? String(res.portalId) : null;
  } catch (e) {
    console.warn("  Could not fetch portal ID:", e.message);
    return null;
  }
}

// ─── owners ─────────────────────────────────────────────────────────────────

async function fetchOwners() {
  console.log("→ Fetching owners...");
  const res = await hsGet("/crm/v3/owners", { limit: 100 });
  return (res.results || []).map((o) => ({
    id: String(o.id),
    name: [o.firstName, o.lastName].filter(Boolean).join(" ") || o.email || o.id,
    email: o.email || null,
  }));
}

// ─── tasks ───────────────────────────────────────────────────────────────────

async function fetchTasks() {
  console.log("→ Fetching tasks...");
  const raw = await searchAll("tasks", {
    filterGroups: [
      {
        filters: [
          {
            propertyName: "hs_task_status",
            operator: "NEQ",
            value: "COMPLETED",
          },
        ],
      },
    ],
    properties: [
      "hs_task_subject",
      "hs_task_status",
      "hs_task_type",
      "hs_task_priority",
      "hs_timestamp",
      "hubspot_owner_id",
      "hs_task_body",
    ],
    sorts: [{ propertyName: "hs_timestamp", direction: "ASCENDING" }],
    limit: 100,
  });

  return raw.map((t) => {
    const p = t.properties || {};
    return {
      id: t.id,
      subject: p.hs_task_subject || "(no subject)",
      status: p.hs_task_status || "NOT_STARTED",
      type: p.hs_task_type || "TODO",
      priority: p.hs_task_priority || null,
      dueDate: p.hs_timestamp ? p.hs_timestamp.split("T")[0] : null,
      ownerId: p.hubspot_owner_id ? String(p.hubspot_owner_id) : null,
      body: p.hs_task_body || null,
    };
  });
}

// ─── deals ───────────────────────────────────────────────────────────────────

const CLOSED_STAGES = new Set([
  "closedwon",
  "closedlost",
  "closed won",
  "closed lost",
]);

async function fetchDeals() {
  console.log("→ Fetching deals...");
  const raw = await searchAll("deals", {
    filterGroups: [
      {
        filters: [
          {
            propertyName: "pipeline",
            operator: "HAS_PROPERTY",
          },
        ],
      },
    ],
    properties: [
      "dealname",
      "dealstage",
      "pipeline",
      "amount",
      "closedate",
      "hubspot_owner_id",
      "hs_deal_stage_probability",
      "hs_is_closed",
      "hs_is_closed_won",
    ],
    sorts: [{ propertyName: "closedate", direction: "ASCENDING" }],
    limit: 200,
  });

  return raw
    .filter((d) => {
      const stage = (d.properties?.dealstage || "").toLowerCase();
      return !CLOSED_STAGES.has(stage);
    })
    .map((d) => {
      const p = d.properties || {};
      const amount = p.amount ? parseFloat(p.amount) : null;
      return {
        id: d.id,
        name: p.dealname || "(unnamed deal)",
        stage: p.dealstage || "unknown",
        pipeline: p.pipeline || null,
        amount: amount,
        closeDate: p.closedate ? p.closedate.split("T")[0] : null,
        ownerId: p.hubspot_owner_id ? String(p.hubspot_owner_id) : null,
        probability: p.hs_deal_stage_probability
          ? parseFloat(p.hs_deal_stage_probability)
          : null,
      };
    });
}

// ─── pipeline stage labels ───────────────────────────────────────────────────

async function fetchPipelineStages() {
  console.log("→ Fetching pipeline stage labels...");
  try {
    const res = await hsGet("/crm/v3/pipelines/deals");
    const stageMap = {};
    for (const pipeline of res.results || []) {
      for (const stage of pipeline.stages || []) {
        stageMap[stage.id] = stage.label;
      }
    }
    return stageMap;
  } catch (e) {
    console.warn("  Could not fetch pipeline stages:", e.message);
    return {};
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔄 Fetching HubSpot data...");

  const [portalId, owners, tasks, deals, stageLabels] = await Promise.all([
    fetchPortalId(),
    fetchOwners(),
    fetchTasks(),
    fetchDeals(),
    fetchPipelineStages(),
  ]);

  // Build owner lookup map
  const ownerMap = {};
  for (const o of owners) ownerMap[o.id] = o.name;

  // Enrich tasks with owner names
  const enrichedTasks = tasks.map((t) => ({
    ...t,
    ownerName: t.ownerId ? (ownerMap[t.ownerId] || null) : null,
  }));

  // Enrich deals with human-readable stage names and owner names
  const enrichedDeals = deals.map((d) => ({
    ...d,
    stageLabel: stageLabels[d.stage] || d.stage,
    ownerName: d.ownerId ? (ownerMap[d.ownerId] || null) : null,
  }));

  const output = {
    refreshedAt: new Date().toISOString(),
    currency: "€",
    portalId: portalId || null,
    owners,
    tasks: enrichedTasks,
    deals: enrichedDeals,
  };

  const outPath = path.join(__dirname, "../hubspot-data.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(
    `✅ Done — ${owners.length} owners, ${tasks.length} open tasks, ${enrichedDeals.length} open deals`
  );
  console.log(`   Saved to ${outPath}`);
}

main().catch((err) => {
  console.error("❌ fetch-hubspot.js failed:", err.message);
  // Write empty file so the dashboard doesn't 404
  const fallback = {
    refreshedAt: new Date().toISOString(),
    currency: "€",
    owners: [],
    tasks: [],
    deals: [],
    error: err.message,
  };
  fs.writeFileSync(
    path.join(__dirname, "../hubspot-data.json"),
    JSON.stringify(fallback, null, 2)
  );
  process.exit(0); // exit 0 so the workflow keeps running
});
