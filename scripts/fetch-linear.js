#!/usr/bin/env node
/**
 * fetch-linear.js
 * Fetches initiatives → projects → issues from Linear GraphQL API
 * and writes gantt-data.json to the repo root.
 *
 * Requires: LINEAR_API_KEY env var (set as GitHub Secret)
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.LINEAR_API_KEY;
if (!API_KEY) { console.error("Missing LINEAR_API_KEY"); process.exit(1); }

async function gql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: "api.linear.app",
      path: "/graphql",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": API_KEY,
        "Content-Length": Buffer.byteLength(body),
      },
    }, res => {
      let data = "";
      res.on("data", d => data += d);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.errors) reject(new Error(JSON.stringify(parsed.errors)));
          else resolve(parsed.data);
        } catch(e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── QUERIES ───────────────────────────────────────────────────────────────────

const INITIATIVES_QUERY = `
  query Initiatives($after: String) {
    initiatives(first: 50, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id name status color url
        targetDate
        projects(first: 50) {
          nodes { id }
        }
      }
    }
  }
`;

const PROJECTS_QUERY = `
  query Projects($after: String) {
    projects(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id name color url
        startDate targetDate
        status { name }
        initiatives(first: 5) { nodes { id } }
      }
    }
  }
`;

const ISSUES_QUERY = `
  query Issues($projectId: ID!, $after: String) {
    project(id: $projectId) {
      issues(first: 100, after: $after, filter: { archivedAt: { null: true } }) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id identifier title url
          state { name }
          priority
          dueDate
          createdAt
          completedAt
          assignee { name }
        }
      }
    }
  }
`;

// ── HELPERS ───────────────────────────────────────────────────────────────────

async function fetchAll(queryFn) {
  const nodes = [];
  let after = null;
  do {
    const result = await queryFn(after);
    const page = result.nodes || [];
    nodes.push(...page);
    after = result.pageInfo.hasNextPage ? result.pageInfo.endCursor : null;
  } while (after);
  return nodes;
}

function priorityName(p) {
  return { 0:"No priority", 1:"Urgent", 2:"High", 3:"Medium", 4:"Low" }[p] || "";
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Fetching initiatives...");
  const initiativeNodes = await fetchAll(async (after) => {
    const d = await gql(INITIATIVES_QUERY, { after });
    return d.initiatives;
  });

  console.log(`Found ${initiativeNodes.length} initiatives. Fetching projects...`);
  const projectNodes = await fetchAll(async (after) => {
    const d = await gql(PROJECTS_QUERY, { after });
    return d.projects;
  });

  // Build initiative → project map
  const projsByInitiative = {};
  for (const proj of projectNodes) {
    for (const ini of (proj.initiatives?.nodes || [])) {
      if (!projsByInitiative[ini.id]) projsByInitiative[ini.id] = [];
      projsByInitiative[ini.id].push(proj);
    }
  }

  // Decide which projects to fetch issues for:
  // Only In Progress / Planned projects (avoid flooding on Backlog)
  const ACTIVE_STATUSES = new Set(["In Progress", "Planned", "In Review", "In Test"]);
  const activeProjects = projectNodes.filter(p => ACTIVE_STATUSES.has(p.status?.name));
  console.log(`Fetching issues for ${activeProjects.length} active projects...`);

  const issuesByProject = {};
  for (const proj of activeProjects) {
    try {
      const issues = await fetchAll(async (after) => {
        const d = await gql(ISSUES_QUERY, { projectId: proj.id, after });
        return d.project.issues;
      });
      issuesByProject[proj.id] = issues.map(iss => ({
        id: iss.id,
        identifier: iss.identifier,
        title: iss.title,
        status: iss.state?.name || "",
        start: iss.createdAt?.split("T")[0] || null,
        end: iss.dueDate || (iss.completedAt ? iss.completedAt.split("T")[0] : null),
        assignee: iss.assignee?.name || null,
        priority: priorityName(iss.priority),
        url: iss.url,
      }));
      console.log(`  ${proj.name}: ${issuesByProject[proj.id].length} issues`);
    } catch(e) {
      console.warn(`  Warning: could not fetch issues for ${proj.name}: ${e.message}`);
      issuesByProject[proj.id] = [];
    }
  }

  // Assemble final data
  const initiatives = initiativeNodes.map(ini => ({
    id: ini.id,
    name: ini.name,
    status: ini.status,
    color: ini.color || "#6366f1",
    url: ini.url,
    targetDate: ini.targetDate || null,
    projects: (projsByInitiative[ini.id] || []).map(proj => ({
      id: proj.id,
      name: proj.name,
      status: proj.status?.name || "",
      color: proj.color || ini.color || "#6366f1",
      url: proj.url,
      startDate: proj.startDate || null,
      targetDate: proj.targetDate || null,
      issues: issuesByProject[proj.id] || [],
    })),
  }));

  const output = {
    refreshedAt: new Date().toISOString(),
    initiatives,
  };

  const outPath = path.join(__dirname, "..", "gantt-data.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Written to gantt-data.json`);
  console.log(`   ${initiatives.length} initiatives, ${projectNodes.length} projects`);
}

main().catch(e => { console.error(e); process.exit(1); });
