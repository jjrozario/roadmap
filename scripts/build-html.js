#!/usr/bin/env node
/**
 * build-html.js
 * Writes a self-contained index.html shell. Data is loaded at runtime from gantt-data.json.
 */

const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "..", "gantt-data.json");
const outPath  = path.join(__dirname, "..", "index.html");

if (!fs.existsSync(dataPath)) {
  console.error("gantt-data.json not found. Run fetch-linear.js first.");
  process.exit(1);
}

// Still read the file so the build step fails fast if it's malformed
try { JSON.parse(fs.readFileSync(dataPath, "utf8")); }
catch(e) { console.error("gantt-data.json is invalid JSON:", e.message); process.exit(1); }

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Supplied · Product Roadmap</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #080b12;
  --surface: #0e1320;
  --surface2: #141927;
  --border: #1a2235;
  --border2: #222d42;
  --text: #e2e8f0;
  --text-muted: #4a5568;
  --text-dim: #2d3748;
  --accent: #3b82f6;
  --lw: 300px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body {
  font-family: 'DM Mono', monospace;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  overflow-x: hidden;
}
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

/* ── HEADER ─────────────────────────────────────────────────────────────── */
.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky; top: 0; z-index: 50;
}
.header-logo {
  font-family: 'Syne', sans-serif;
  font-size: 17px; font-weight: 800;
  color: var(--text);
  letter-spacing: -0.5px;
  display: flex; align-items: center; gap: 8px;
}
.header-logo span { color: var(--accent); }
.header-sub { font-size: 10px; color: var(--text-muted); letter-spacing: 0.5px; }
.header-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
.refresh-badge {
  font-size: 9px; color: var(--text-muted);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 3px 8px;
  letter-spacing: 0.5px;
}
.refresh-badge .dot {
  display: inline-block; width: 5px; height: 5px;
  border-radius: 50%; background: #10b981;
  margin-right: 5px; vertical-align: middle;
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

/* ── REFRESH BUTTON ─────────────────────────────────────────────────────── */
.refresh-btn {
  font-size: 9px; color: var(--text-muted);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 3px 10px;
  letter-spacing: 0.5px;
  cursor: pointer;
  font-family: 'DM Mono', monospace;
  display: flex; align-items: center; gap: 5px;
  transition: border-color 0.15s, color 0.15s;
}
.refresh-btn:hover { border-color: var(--accent); color: var(--accent); }
.refresh-btn .spin { display: inline-block; }
.refresh-btn.loading .spin { animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── STATS BAR ──────────────────────────────────────────────────────────── */
.stats {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 8px 20px;
  display: flex; gap: 24px; align-items: center;
  overflow-x: auto;
}
.stat { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.stat-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.stat-label { font-size: 10px; color: var(--text-muted); }
.stat-count { font-size: 10px; color: var(--text); font-weight: 500; }
.stat-divider { width: 1px; height: 16px; background: var(--border); }

/* ── LEGEND ─────────────────────────────────────────────────────────────── */
.legend {
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  padding: 6px 20px;
  display: flex; gap: 14px; flex-wrap: wrap; align-items: center;
}
.legend-item { display: flex; align-items: center; gap: 4px; font-size: 9px; color: var(--text-muted); }
.legend-swatch { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
.legend-today { display: flex; align-items: center; gap: 4px; font-size: 9px; color: #ef4444; }
.legend-today-line { width: 2px; height: 10px; background: #ef4444; }
.legend-hint { margin-left: auto; font-size: 9px; color: var(--text-dim); }

/* ── GANTT LAYOUT ───────────────────────────────────────────────────────── */
.gantt-wrapper {
  overflow: auto;
  height: calc(100vh - 130px);
}
.gantt-thead {
  display: flex;
  position: sticky; top: 0; z-index: 20;
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
}
.gantt-thead-label {
  width: var(--lw); min-width: var(--lw);
  border-right: 1px solid var(--border);
  padding: 4px 12px;
  font-size: 8px; color: var(--text-dim);
  font-weight: 500; letter-spacing: 1.5px;
  display: flex; align-items: center;
}
.gantt-thead-ticks {
  flex: 1; position: relative; height: 26px;
}
.tick {
  position: absolute; top: 0; height: 100%;
  border-left: 1px solid var(--border);
  padding-left: 4px;
  display: flex; align-items: center;
}
.tick span { font-size: 9px; color: var(--text-dim); white-space: nowrap; }
.tick.major span { color: var(--text-muted); }

/* ── ROWS ───────────────────────────────────────────────────────────────── */
.row {
  display: flex; height: 38px;
  border-bottom: 1px solid var(--bg);
  cursor: default;
  transition: background 0.1s;
}
.row:hover { background: var(--surface2); }
.row.clickable { cursor: pointer; }
.row-label {
  width: var(--lw); min-width: var(--lw);
  display: flex; align-items: center;
  padding-right: 8px;
  gap: 5px;
  border-right: 1px solid var(--border);
  overflow: hidden;
}
.row-arrow {
  font-size: 8px; color: var(--text-dim);
  transition: transform 0.15s;
  flex-shrink: 0; user-select: none; line-height: 1;
  padding-left: 2px;
}
.row-arrow.open { transform: rotate(90deg); }
.row-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.row-name {
  font-size: 11px; color: #94a3b8;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  flex: 1;
}
.row.initiative .row-name { color: var(--text); font-weight: 500; }
.row-badge {
  font-size: 7px; border-radius: 3px;
  padding: 1px 5px; flex-shrink: 0;
  white-space: nowrap; letter-spacing: 0.3px;
}
.row-bars {
  flex: 1; position: relative; overflow: hidden;
}
.today-line {
  position: absolute; top: 0; bottom: 0;
  width: 1px; background: #ef4444; opacity: 0.5;
  pointer-events: none; z-index: 5;
}
.bar {
  position: absolute; top: 50%; transform: translateY(-50%);
  height: 18px; border-radius: 3px;
  display: flex; align-items: center;
  overflow: hidden; padding-left: 5px;
  min-width: 3px; opacity: 0.85;
  transition: opacity 0.15s;
  cursor: default;
}
/* Only issue bars are clickable */
.bar.clickable-bar { cursor: pointer; }
.bar:hover { opacity: 1; }
.bar-label {
  font-size: 8px; color: #fff; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
  font-weight: 500;
  pointer-events: none;
}
.bar.initiative-bar { height: 22px; }
.no-dates {
  position: absolute; left: 10px; top: 50%;
  transform: translateY(-50%);
  font-size: 9px; color: var(--text-dim);
  font-style: italic;
}

/* ── TOOLTIP ────────────────────────────────────────────────────────────── */
.tooltip {
  position: fixed; background: #0e1320;
  border: 1px solid var(--border2);
  border-radius: 6px; padding: 10px 14px;
  font-size: 11px; pointer-events: none;
  z-index: 9999; max-width: 260px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.7);
  line-height: 1.7;
  font-family: 'DM Mono', monospace;
}
.tooltip-title { font-weight: 500; color: var(--text); margin-bottom: 2px; font-size: 11px; }
.tooltip-status { font-size: 10px; }
.tooltip-dates { font-size: 9px; color: var(--text-muted); }
.tooltip-assignee { font-size: 9px; color: var(--text-muted); }
.tooltip-link { font-size: 9px; color: var(--accent); margin-top: 3px; }

/* ── ASSIGNEE TAG ───────────────────────────────────────────────────────── */
.row-assignee {
  font-size: 7px; color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 5px; flex-shrink: 0;
  white-space: nowrap; max-width: 72px;
  overflow: hidden; text-overflow: ellipsis;
}

/* ── SECTION DIVIDER ────────────────────────────────────────────────────── */
.section-gap { height: 6px; background: var(--bg); border-bottom: 1px solid var(--border); }
</style>
</head>
<body>

<div class="header">
  <div class="header-logo">⬡ <span>Supplied</span> · Product Roadmap</div>
  <div class="header-sub">INITIATIVES · PROJECTS · ISSUES</div>
  <div class="header-right">
    <button class="refresh-btn" id="refresh-btn" onclick="doRefresh()">
      <span class="spin">↻</span> REFRESH
    </button>
    <div class="refresh-badge">
      <span class="dot"></span>
      <span id="refresh-time">LOADING…</span>
    </div>
  </div>
</div>

<div class="legend">
  ${[["Todo","#6366f1"],["In Progress","#f59e0b"],["In Review","#fb923c"],["In Test","#a78bfa"],["Blocked","#ef4444"],["Done","#10b981"],["Completed","#10b981"],["Planned","#8b5cf6"],["Backlog","#334155"]].map(([s,c])=>`
  <div class="legend-item">
    <span class="legend-swatch" style="background:${c}"></span>${s}
  </div>`).join("")}
  <div class="legend-today"><span class="legend-today-line"></span>Today</div>
  <div class="legend-hint">Click issue bar → open in Linear · Click row → expand</div>
</div>

<div class="gantt-wrapper" id="gantt">
  <div class="gantt-thead" id="thead">
    <div class="gantt-thead-label">NAME</div>
    <div class="gantt-thead-ticks" id="ticks"></div>
  </div>
  <div id="gantt-body"></div>
</div>

<div class="tooltip" id="tooltip" style="display:none"></div>

<script>
// ── STATUS COLORS ─────────────────────────────────────────────────────────────
const SC = {
  "Todo":"#6366f1","In Progress":"#f59e0b","In Review":"#fb923c",
  "In Test":"#a78bfa","Blocked":"#ef4444","Backlog":"#334155",
  "Done":"#10b981","Completed":"#10b981","Active":"#3b82f6",
  "Planned":"#8b5cf6","Paused":"#f97316","Cancelled":"#475569",
};
const sc = s => SC[s]||"#475569";

// ── DATE / RANGE ──────────────────────────────────────────────────────────────
const RANGE_START = (() => { const d=new Date(); d.setMonth(d.getMonth()-3,1); return d.toISOString().split("T")[0]; })();
const RANGE_END   = (() => { const d=new Date(); d.setFullYear(d.getFullYear()+1); d.setMonth(d.getMonth()+2,28); return d.toISOString().split("T")[0]; })();
const TOTAL_MS    = new Date(RANGE_END)-new Date(RANGE_START);
const dPct = dateStr => {
  if(!dateStr) return null;
  return Math.max(0, Math.min(100, (new Date(dateStr)-new Date(RANGE_START))/TOTAL_MS*100));
};
const TODAY_PCT = dPct(new Date().toISOString().split("T")[0]);

// ── TICKS ─────────────────────────────────────────────────────────────────────
const ticksEl = document.getElementById("ticks");
const cur = new Date(RANGE_START); cur.setDate(1);
const endD = new Date(RANGE_END);
while(cur <= endD){
  const pct = dPct(cur.toISOString().split("T")[0]);
  const t = document.createElement("div");
  t.className = "tick" + (cur.getDate()===1 && cur.getMonth()%3===0 ? " major":"");
  t.style.left = pct+"%";
  const s = document.createElement("span");
  s.textContent = cur.toLocaleString("default",{month:"short",year:"2-digit"});
  t.appendChild(s);
  ticksEl.appendChild(t);
  cur.setMonth(cur.getMonth()+1);
}

// ── STATE ─────────────────────────────────────────────────────────────────────
const expanded = {};
let DATA = null;

// ── TOOLTIP ───────────────────────────────────────────────────────────────────
const tip = document.getElementById("tooltip");
let tipVisible = false;
function showTip(e, d){
  tip.innerHTML = \`
    <div class="tooltip-title">\${d.label}</div>
    \${d.status ? \`<div class="tooltip-status" style="color:\${sc(d.status)}">\${d.status}</div>\`:""}
    \${d.start ? \`<div class="tooltip-dates">\${d.start} → \${d.end||"ongoing"}</div>\`:""}
    \${d.assignee ? \`<div class="tooltip-assignee">👤 \${d.assignee}</div>\`:""}
    \${d.priority ? \`<div class="tooltip-assignee">⚡ \${d.priority}</div>\`:""}
    \${d.clickable && d.url ? \`<div class="tooltip-link">↗ Open in Linear</div>\`:""}
  \`;
  tip.style.display="block";
  moveTip(e);
  tipVisible=true;
}
function moveTip(e){
  tip.style.left=(e.clientX+14)+"px";
  tip.style.top=(e.clientY-8)+"px";
}
function hideTip(){ tip.style.display="none"; tipVisible=false; }
document.addEventListener("mousemove", e => { if(tipVisible) moveTip(e); });

// ── BAR ───────────────────────────────────────────────────────────────────────
// isClickable: true only for issue bars — opens Linear on click
function makeBar(start, end, color, label, url, isIni, isClickable){
  if(!start) return null;
  const effEnd = end || new Date().toISOString().split("T")[0];
  const l = dPct(start), r = dPct(effEnd);
  if(l===null) return null;
  const w = Math.max((r||l)-l, 0.4);
  const bar = document.createElement("div");
  bar.className = "bar" + (isIni?" initiative-bar":"") + (isClickable?" clickable-bar":"");
  bar.style.left=l+"%";
  bar.style.width=w+"%";
  bar.style.background=color;
  if(w>4){
    const lbl=document.createElement("span");
    lbl.className="bar-label"; lbl.textContent=label;
    bar.appendChild(lbl);
  }
  // Only add click handler for issue bars — prevents stopPropagation from swallowing row expand clicks
  if(url && isClickable) bar.addEventListener("click", e => { e.stopPropagation(); window.open(url,"_blank"); });
  return bar;
}

// ── ROW ───────────────────────────────────────────────────────────────────────
function makeRow({indent, label, status, color, start, end, url, hasChildren, isExpanded, isIni, onClick, barData, barClickable, assignee}){
  const row = document.createElement("div");
  row.className = "row" + (isIni?" initiative":"") + (hasChildren||onClick?" clickable":"");
  if(onClick) row.addEventListener("click", onClick);

  // Label
  const lc = document.createElement("div");
  lc.className = "row-label";
  lc.style.paddingLeft = (10 + indent*14) + "px";

  if(hasChildren){
    const arr = document.createElement("span");
    arr.className = "row-arrow" + (isExpanded?" open":"");
    arr.textContent = "▶";
    lc.appendChild(arr);
  }
  const dot = document.createElement("span");
  dot.className = "row-dot";
  dot.style.background = color||sc(status);
  lc.appendChild(dot);

  const nm = document.createElement("span");
  nm.className = "row-name"; nm.textContent=label; nm.title=label;
  lc.appendChild(nm);

  if(status){
    const badge = document.createElement("span");
    badge.className="row-badge";
    badge.style.background=sc(status)+"22";
    badge.style.color=sc(status);
    badge.textContent=status;
    lc.appendChild(badge);
  }
  if(assignee){
    const asn = document.createElement("span");
    asn.className="row-assignee";
    asn.textContent=assignee.split(" ")[0]; // first name only to save space
    asn.title=assignee;
    lc.appendChild(asn);
  }
  row.appendChild(lc);

  // Bars
  const bc = document.createElement("div"); bc.className="row-bars";
  // Today line
  const tl = document.createElement("div"); tl.className="today-line"; tl.style.left=TODAY_PCT+"%"; bc.appendChild(tl);
  if(start){
    const bar = makeBar(start,end,color||sc(status),label,url,isIni,barClickable);
    if(bar){
      const bd = barData||{label,status,start,end,url,clickable:barClickable};
      bar.addEventListener("mouseenter", e => showTip(e,bd));
      bar.addEventListener("mouseleave", hideTip);
      bc.appendChild(bar);
    }
  } else {
    const nd = document.createElement("span"); nd.className="no-dates"; nd.textContent="no dates"; bc.appendChild(nd);
  }
  row.appendChild(bc);
  return row;
}

// ── RENDER ────────────────────────────────────────────────────────────────────
const body = document.getElementById("gantt-body");

function render(){
  if(!DATA){
    body.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:11px;letter-spacing:0.5px">LOADING…</div>';
    return;
  }
  body.innerHTML="";
  for(const ini of DATA.initiatives){
    const iniKey=ini.id;
    const iniExp=!!expanded[iniKey];
    const dated=ini.projects.filter(p=>p.startDate||p.targetDate);
    const iniStart=dated.reduce((a,p)=>(!a||(p.startDate&&p.startDate<a))?p.startDate:a,null);
    const iniEnd=dated.reduce((a,p)=>(!a||(p.targetDate&&p.targetDate>a))?p.targetDate:a,null)||ini.targetDate;

    body.appendChild(makeRow({
      indent:0, label:ini.name, status:ini.status,
      color:ini.color, start:iniStart, end:iniEnd, url:ini.url,
      hasChildren:ini.projects.length>0, isExpanded:iniExp, isIni:true,
      onClick:()=>{ expanded[iniKey]=!iniExp; render(); },
      barClickable:false,
      barData:{label:ini.name,status:ini.status,start:iniStart,end:iniEnd,url:ini.url,clickable:false}
    }));

    if(iniExp){
      for(const proj of ini.projects){
        const projKey=iniKey+"_"+proj.id;
        const projExp=!!expanded[projKey];
        const hasIssues=proj.issues&&proj.issues.length>0;
        body.appendChild(makeRow({
          indent:1, label:proj.name, status:proj.status||"",
          color:proj.color, start:proj.startDate, end:proj.targetDate, url:proj.url,
          hasChildren:hasIssues, isExpanded:projExp, isIni:false,
          onClick:hasIssues?()=>{ expanded[projKey]=!projExp; render(); }:null,
          barClickable:false,
          barData:{label:proj.name,status:proj.status,start:proj.startDate,end:proj.targetDate,url:proj.url,clickable:false}
        }));
        if(projExp&&hasIssues){
          for(const iss of proj.issues){
            body.appendChild(makeRow({
              indent:2, label:(iss.identifier+" "+iss.title).trim(),
              status:iss.status, color:sc(iss.status),
              start:iss.start, end:iss.end, url:iss.url,
              hasChildren:false, isExpanded:false, isIni:false, onClick:null,
              barClickable:true,
              assignee:iss.assignee||null,
              barData:{label:iss.title,status:iss.status,start:iss.start,end:iss.end,assignee:iss.assignee,priority:iss.priority,url:iss.url,clickable:true}
            }));
          }
        }
      }
      // Visual gap between initiatives
      const gap=document.createElement("div"); gap.className="section-gap"; body.appendChild(gap);
    }
  }
}

// ── INIT / REFRESH ────────────────────────────────────────────────────────────
async function init(){
  const btn = document.getElementById("refresh-btn");
  if(btn) btn.classList.add("loading");
  render(); // show loading placeholder
  try {
    const res = await fetch('./gantt-data.json?t='+Date.now());
    if(!res.ok) throw new Error('HTTP '+res.status);
    DATA = await res.json();
    const el = document.getElementById("refresh-time");
    if(el && DATA.refreshedAt) el.textContent = "UPDATED " + new Date(DATA.refreshedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    render();
  } catch(err){
    console.error("Failed to load gantt-data.json", err);
    body.innerHTML='<div style="padding:40px;text-align:center;color:#ef4444;font-size:11px;letter-spacing:0.5px">Failed to load data — check console.</div>';
    const el = document.getElementById("refresh-time");
    if(el) el.textContent = "ERROR";
  } finally {
    if(btn) btn.classList.remove("loading");
  }
}

function doRefresh(){ init(); }

init();
</script>
</body>
</html>`;

fs.writeFileSync(outPath, html);
console.log(`✅ Built index.html (${Math.round(html.length/1024)}KB)`);
