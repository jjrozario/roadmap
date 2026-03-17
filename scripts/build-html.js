#!/usr/bin/env node
/**
 * build-html.js
 * Builds the self-contained index.html for the Supplied Product & Operations Dashboard.
 * Tab 1: Customer & Product Roadmap (Linear)
 * Tab 2: Sales & Operations (HubSpot)
 */

const fs   = require("fs");
const path = require("path");

const ganttDataPath  = path.join(__dirname, "..", "gantt-data.json");
const hubspotPath    = path.join(__dirname, "..", "hubspot-data.json");
const outPath        = path.join(__dirname, "..", "index.html");

if (!fs.existsSync(ganttDataPath)) {
  console.error("gantt-data.json not found. Run fetch-linear.js first.");
  process.exit(1);
}
try { JSON.parse(fs.readFileSync(ganttDataPath, "utf8")); }
catch(e) { console.error("gantt-data.json is invalid JSON:", e.message); process.exit(1); }

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Supplied · Product & Operations Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMSIgcj0iNiIgZmlsbD0iIzZjNjNmNyIvPjxjaXJjbGUgY3g9IjI1IiBjeT0iOSIgcj0iOCIgZmlsbD0iIzZjNjNmNyIvPjxjaXJjbGUgY3g9IjE0IiBjeT0iMjciIHI9IjgiIGZpbGw9IiM2YzYzZjciLz48Y2lyY2xlIGN4PSIyOSIgY3k9IjI5IiByPSI1IiBmaWxsPSIjNmM2M2Y3Ii8+PC9zdmc+"/>
<style>
:root {
  --bg: #f8fafc;
  --surface: #ffffff;
  --surface2: #f1f5f9;
  --border: #e2e8f0;
  --border2: #cbd5e1;
  --text: #0f172a;
  --text-muted: #64748b;
  --text-dim: #94a3b8;
  --accent: #3b82f6;
  --lw: 400px;
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
  padding: 0 20px;
  display: flex;
  align-items: stretch;
  gap: 0;
  position: sticky; top: 0; z-index: 50;
  min-height: 48px;
}
.header-logo {
  font-family: 'Syne', sans-serif;
  font-size: 16px; font-weight: 800;
  color: var(--text);
  letter-spacing: -0.5px;
  display: flex; align-items: center; gap: 7px;
  padding: 0 20px 0 0;
  border-right: 1px solid var(--border);
  flex-shrink: 0;
}
.header-tabs {
  display: flex; align-items: stretch; gap: 0;
  flex: 1;
}
.tab-btn {
  font-family: 'DM Mono', monospace;
  font-size: 10px; letter-spacing: 0.5px;
  color: var(--text-muted);
  background: none; border: none;
  border-bottom: 2px solid transparent;
  padding: 0 18px;
  cursor: pointer; white-space: nowrap;
  display: flex; align-items: center; gap: 6px;
  transition: color 0.15s, border-color 0.15s;
  margin-bottom: -1px;
}
.tab-btn:hover { color: var(--text); }
.tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }
.tab-btn .tab-icon { font-size: 12px; }
.header-right {
  margin-left: auto; display: flex; align-items: center; gap: 10px;
  flex-shrink: 0; padding-left: 16px;
}
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
.refresh-btn.running { border-color: #f59e0b; color: #f59e0b; }
.refresh-btn.done    { border-color: #10b981; color: #10b981; }
@keyframes spin { to { transform: rotate(360deg); } }
.pat-overlay {
  display: none; position: fixed; inset: 0; background: rgba(0,0,0,.6);
  z-index: 9999; align-items: center; justify-content: center;
}
.pat-overlay.open { display: flex; }
.pat-modal {
  background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
  padding: 24px; width: 420px; max-width: 90vw;
}
.pat-modal-title { font-size: 11px; font-weight: 700; letter-spacing: .8px; color: var(--text); margin-bottom: 8px; }
.pat-modal-desc  { font-size: 10px; color: var(--text-dim); margin-bottom: 14px; line-height: 1.6; }
.pat-modal-desc a { color: var(--accent); text-decoration: none; }
.pat-modal-desc code { background: var(--bg); border: 1px solid var(--border); border-radius: 3px; padding: 0 4px; font-size: 9px; }
.pat-modal input {
  width: 100%; box-sizing: border-box;
  background: var(--bg); border: 1px solid var(--border); border-radius: 4px;
  color: var(--text); font-family: 'DM Mono', monospace; font-size: 10px;
  padding: 7px 10px; margin-bottom: 10px; outline: none;
}
.pat-modal input:focus { border-color: var(--accent); }
.pat-modal-actions { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
.pat-btn {
  font-size: 9px; letter-spacing: .5px; padding: 5px 14px; border-radius: 4px;
  cursor: pointer; font-family: 'DM Mono', monospace; border: 1px solid var(--border);
  background: var(--bg); color: var(--text-dim);
}
.pat-btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.pat-status { font-size: 9px; color: var(--text-dim); min-height: 13px; flex: 1; }

/* ── ALERT BAR (shared) ─────────────────────────────────────────────────── */
.alert-bar {
  background: var(--surface);
  border-bottom: 2px solid var(--border);
  padding: 8px 20px;
  display: flex; gap: 6px; align-items: center;
  overflow-x: auto;
}
.alert-section-label {
  font-size: 8px; color: var(--text-dim);
  letter-spacing: 1.2px; white-space: nowrap;
  margin-right: 4px; flex-shrink: 0;
}
.alert-badge {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 12px; border-radius: 5px;
  font-size: 9px; cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s; white-space: nowrap;
  font-family: 'DM Mono', monospace;
  letter-spacing: 0.3px;
  user-select: none; flex-shrink: 0;
  background: inherit;
}
.alert-badge:hover { opacity: 0.85; transform: translateY(-1px); }
.alert-badge.active { border-color: currentColor !important; }
.badge-urgent  { color: #ef4444; background: rgba(239,68,68,0.08); }
.badge-urgent.active  { background: rgba(239,68,68,0.15); }
.badge-high    { color: #f97316; background: rgba(249,115,22,0.08); }
.badge-high.active    { background: rgba(249,115,22,0.15); }
.badge-overdue { color: #f59e0b; background: rgba(245,158,11,0.08); }
.badge-overdue.active { background: rgba(245,158,11,0.15); }
.badge-today   { color: #3b82f6; background: rgba(59,130,246,0.08); }
.badge-today.active   { background: rgba(59,130,246,0.15); }
.badge-week    { color: #8b5cf6; background: rgba(139,92,246,0.08); }
.badge-week.active    { background: rgba(139,92,246,0.15); }
.badge-clear   { color: var(--text-muted); background: var(--bg); border: 1px solid var(--border) !important; font-size: 8px; }
.alert-num     { font-size: 16px; font-weight: 700; line-height: 1; }
.alert-lbl     { font-size: 8px; letter-spacing: 0.8px; }
.alert-divider { width: 1px; height: 22px; background: var(--border); flex-shrink: 0; margin: 0 2px; }
.alert-all-clear { font-size: 10px; color: #10b981; display: flex; align-items: center; gap: 6px; }
.filter-notice { font-size: 8px; color: var(--text-muted); margin-left: auto; white-space: nowrap; flex-shrink: 0; letter-spacing: 0.5px; }

/* ── PRIORITY / OVERDUE TAGS (shared) ───────────────────────────────────── */
.pri-tag {
  font-size: 7px; border-radius: 2px;
  padding: 1px 4px; flex-shrink: 0;
  white-space: nowrap; letter-spacing: 0.5px;
  font-weight: 600; line-height: 1.5;
}
.pri-urgent { color: #ef4444; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); }
.pri-high   { color: #f97316; background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.3); }
.overdue-tag {
  font-size: 7px; border-radius: 2px; padding: 1px 4px; flex-shrink: 0;
  white-space: nowrap; letter-spacing: 0.5px; font-weight: 600; line-height: 1.5;
  color: #f59e0b; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3);
  animation: overdueFlash 2.5s ease-in-out infinite;
}
.today-tag {
  font-size: 7px; border-radius: 2px; padding: 1px 4px; flex-shrink: 0;
  white-space: nowrap; letter-spacing: 0.5px; font-weight: 600; line-height: 1.5;
  color: #3b82f6; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3);
}
@keyframes overdueFlash { 0%,100%{opacity:1} 50%{opacity:0.5} }

/* ── ROW PRIORITY HIGHLIGHTS ─────────────────────────────────────────────── */
@keyframes urgentPulse {
  0%,100% { box-shadow: inset 3px 0 0 rgba(239,68,68,0.5); }
  50%     { box-shadow: inset 3px 0 0 rgba(239,68,68,1); background: rgba(239,68,68,0.04); }
}
.row.row-urgent { animation: urgentPulse 1.6s ease-in-out infinite; }
.row.row-urgent:hover { background: rgba(239,68,68,0.08) !important; }
.row.row-high   { box-shadow: inset 3px 0 0 rgba(249,115,22,0.5); }
.row.row-high:hover   { background: rgba(249,115,22,0.05) !important; }
.row.row-overdue { box-shadow: inset 3px 0 0 rgba(245,158,11,0.5); }
.bar-overdue::after {
  content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.2) 6px);
  border-radius: 3px; pointer-events: none;
}

/* ── TAB PANELS ─────────────────────────────────────────────────────────── */
.tab-panel { display: none; }
.tab-panel.active { display: block; }
#panel-roadmap.active { display: flex; flex-direction: column; }

/* ── LEGEND ─────────────────────────────────────────────────────────────── */
.legend {
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  padding: 6px 20px;
  display: flex; gap: 14px; flex-wrap: wrap; align-items: center;
}
.legend-item { display: flex; align-items: center; gap: 4px; font-size: 9px; color: var(--text-muted); }
.legend-swatch { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
.legend-today  { display: flex; align-items: center; gap: 4px; font-size: 9px; color: #ef4444; }
.legend-today-line { width: 2px; height: 10px; background: #ef4444; }
.legend-hint { margin-left: auto; font-size: 9px; color: var(--text-dim); }

/* ── GANTT LAYOUT ───────────────────────────────────────────────────────── */
.gantt-outer {
  display: flex; height: calc(100vh - 160px); overflow: hidden;
}
.gantt-wrapper { overflow: auto; flex: 1; height: 100%; }
.gantt-insights-panel {
  width: 300px; min-width: 300px; border-left: 1px solid var(--border);
  overflow-y: auto; background: var(--surface); height: 100%;
  display: flex; flex-direction: column;
}
.gantt-insights-hdr {
  font-size: 8px; letter-spacing: 1.5px; color: var(--text-dim);
  padding: 10px 14px 8px; border-bottom: 1px solid var(--border);
  background: var(--surface2); position: sticky; top: 0; z-index: 5;
  flex-shrink: 0;
}
.gi-section { padding: 12px 14px 6px; border-bottom: 1px solid var(--border); }
.gi-section:last-child { border-bottom: none; }
.gi-section-title {
  font-size: 8px; letter-spacing: 1px; margin-bottom: 8px;
  display: flex; align-items: center; gap: 5px;
}
.gi-item {
  padding: 7px 9px; border-radius: 5px; margin-bottom: 5px;
  background: var(--bg); border: 1px solid var(--border);
  cursor: pointer; transition: border-color 0.12s;
}
.gi-item:hover { border-color: var(--border2); }
.gi-item-id { font-size: 8px; color: var(--text-dim); margin-bottom: 2px; }
.gi-item-name { font-size: 10px; color: var(--text); line-height: 1.4; word-break: break-word; }
.gi-item-hint {
  margin-top: 5px; font-size: 9px; color: var(--text-dim); line-height: 1.4;
  padding: 4px 7px; background: rgba(59,130,246,0.06);
  border-left: 2px solid rgba(59,130,246,0.3); border-radius: 2px;
}
.gi-empty { font-size: 10px; color: var(--text-dim); text-align: center; padding: 28px 14px; opacity: .6; }
.gi-badge {
  font-size: 7px; padding: 1px 5px; border-radius: 3px; flex-shrink: 0; letter-spacing: .3px;
}
.gantt-thead {
  display: flex; position: sticky; top: 0; z-index: 20;
  background: var(--surface2); border-bottom: 1px solid var(--border);
}
.gantt-thead-label {
  width: var(--lw); min-width: var(--lw); border-right: 1px solid var(--border);
  padding: 4px 12px; font-size: 8px; color: var(--text-dim);
  font-weight: 500; letter-spacing: 1.5px; display: flex; align-items: center;
}
.gantt-thead-ticks { flex: 1; position: relative; height: 26px; }
.tick {
  position: absolute; top: 0; height: 100%;
  border-left: 1px solid var(--border); padding-left: 4px; display: flex; align-items: center;
}
.tick span { font-size: 10px; color: var(--text-dim); white-space: nowrap; }
.tick.major span { color: var(--text-muted); }

/* ── GANTT ROWS ─────────────────────────────────────────────────────────── */
.row {
  display: flex; min-height: 56px; height: auto; border-bottom: 1px solid var(--bg);
  cursor: default; transition: background 0.1s;
}
.row:hover { background: var(--surface2); }
.row.clickable { cursor: pointer; }
.row-label {
  width: var(--lw); min-width: var(--lw); display: flex; align-items: flex-start; padding-top: 10px; padding-bottom: 10px;
  padding-right: 8px; gap: 5px; border-right: 1px solid var(--border); overflow: hidden;
}
.row-arrow {
  font-size: 8px; color: var(--text-dim); transition: transform 0.15s;
  flex-shrink: 0; user-select: none; line-height: 1; padding-left: 2px;
}
.row-arrow.open { transform: rotate(90deg); }
.row-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.row-name {
  font-size: 12px; color: #94a3b8;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  white-space: normal; flex: 1; line-height: 1.4;
}
.row.initiative .row-name { color: var(--text); font-weight: 500; }
.row-badge {
  font-size: 7px; border-radius: 3px; padding: 1px 5px; flex-shrink: 0;
  white-space: nowrap; letter-spacing: 0.3px;
}
.row-bars { flex: 1; position: relative; overflow: hidden; }
.today-line {
  position: absolute; top: 0; bottom: 0;
  width: 1px; background: #ef4444; opacity: 0.5; pointer-events: none; z-index: 5;
}
.bar {
  position: absolute; top: 50%; transform: translateY(-50%);
  height: 24px; border-radius: 4px; display: flex; align-items: center;
  overflow: hidden; padding-left: 5px; min-width: 3px; opacity: 0.85;
  transition: opacity 0.15s; cursor: default;
}
.bar.clickable-bar { cursor: pointer; }
.bar:hover { opacity: 1; }
.bar-label {
  font-size: 10px; color: #fff; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; font-weight: 500; pointer-events: none;
}
.bar.initiative-bar { height: 28px; }
.no-dates {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  font-size: 9px; color: var(--text-dim); font-style: italic;
}
.row-assignee {
  font-size: 7px; color: var(--text-muted); background: var(--surface);
  border: 1px solid var(--border); border-radius: 3px; padding: 1px 5px;
  flex-shrink: 0; white-space: nowrap; max-width: 72px;
  overflow: hidden; text-overflow: ellipsis;
}
.section-gap { height: 6px; background: var(--bg); border-bottom: 1px solid var(--border); }

/* ── TOOLTIP ────────────────────────────────────────────────────────────── */
.tooltip {
  position: fixed; background: #ffffff; border: 1px solid var(--border2);
  border-radius: 6px; padding: 10px 14px; font-size: 11px; pointer-events: none;
  z-index: 9999; max-width: 260px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  line-height: 1.7; font-family: 'DM Mono', monospace;
}
.tooltip-title    { font-weight: 500; color: var(--text); margin-bottom: 2px; font-size: 11px; }
.tooltip-status   { font-size: 10px; }
.tooltip-dates    { font-size: 9px; color: var(--text-muted); }
.tooltip-assignee { font-size: 9px; color: var(--text-muted); }
.tooltip-link     { font-size: 9px; color: var(--accent); margin-top: 3px; }
.tooltip-priority { font-size: 9px; font-weight: 600; }
.tooltip-overdue  { font-size: 9px; color: #f59e0b; font-weight: 600; }

/* ── CLAUDE BRIEF PANEL ─────────────────────────────────────────────────── */
.claude-panel{background:var(--surface);border:1px solid var(--border);border-radius:10px;margin-bottom:14px;overflow:hidden;}
.claude-panel-hdr{display:flex;align-items:center;gap:8px;padding:9px 14px;border-bottom:1px solid var(--border);background:linear-gradient(135deg,rgba(99,102,241,.07) 0%,transparent 60%);font-size:10px;font-weight:700;letter-spacing:1px;color:var(--text-muted);}
.cpanel-key-btn{margin-left:auto;background:none;border:1px solid var(--border);border-radius:4px;color:var(--text-dim);font-size:9px;padding:2px 7px;cursor:pointer;letter-spacing:.5px;}.cpanel-key-btn:hover{border-color:var(--accent);color:var(--accent);}
.claude-msgs{padding:12px 16px;min-height:56px;max-height:260px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;}
.claude-msg-text{font-size:12.5px;line-height:1.65;color:var(--text);white-space:pre-wrap;word-break:break-word;}
.claude-msg-user{align-self:flex-end;}.claude-msg-user .claude-msg-text{background:rgba(99,102,241,.1);border-radius:8px;padding:7px 11px;font-size:12px;color:var(--text-muted);display:inline-block;}
.claude-msg-thinking{color:var(--text-dim);font-size:11px;font-style:italic;}
.claude-input-row{display:flex;gap:7px;padding:8px 12px;border-top:1px solid var(--border);}
.claude-input-row input{flex:1;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 11px;font-size:11.5px;color:var(--text);outline:none;font-family:inherit;}
.claude-input-row input:focus{border-color:var(--accent);}.claude-input-row input::placeholder{color:var(--text-dim);}
.claude-send-btn{background:var(--accent);border:none;border-radius:6px;color:#fff;font-size:10px;font-weight:700;letter-spacing:.8px;padding:6px 14px;cursor:pointer;}.claude-send-btn:disabled{opacity:.4;cursor:not-allowed;}
/* ── SIMPLE CHECKLIST ────────────────────────────────────────────────────── */
.checklist-wrap{background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:14px;}
.checklist-hdr{display:flex;align-items:center;gap:8px;padding:9px 14px;border-bottom:1px solid var(--border);font-size:10px;font-weight:700;letter-spacing:1px;color:var(--text-muted);}
.cl-item{display:flex;align-items:flex-start;gap:10px;padding:9px 14px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .12s;user-select:none;}
.cl-item:last-child{border-bottom:none;}.cl-item:hover{background:var(--surface2);}
.cl-item.cl-done{opacity:.32;}.cl-item.cl-done .cl-title{text-decoration:line-through;}
.cl-cb{flex-shrink:0;width:15px;height:15px;margin-top:2px;border:1.5px solid var(--border);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;transition:all .15s;}
.cl-item.cl-done .cl-cb{background:#22c55e;border-color:#22c55e;color:#fff;}
.cl-src{flex-shrink:0;font-size:8px;font-weight:700;letter-spacing:.5px;padding:2px 5px;border-radius:3px;margin-top:2px;white-space:nowrap;}
.cl-title{flex:1;font-size:12px;color:var(--text);line-height:1.45;}
.cl-meta{flex-shrink:0;font-size:10px;color:var(--text-muted);margin-top:2px;white-space:nowrap;}
.cl-more-btn{width:100%;background:none;border:none;border-top:1px solid var(--border);padding:9px;font-size:10px;color:var(--text-dim);cursor:pointer;letter-spacing:.5px;}.cl-more-btn:hover{color:var(--accent);}
/* ── MY DAY TAB ─────────────────────────────────────────────────────────── */
.myday-layout {
  height: calc(100vh - 120px);
  overflow-y: auto;
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 0;
}
.myday-main { padding: 0 0 60px 0; border-right: 1px solid var(--border); overflow-y: auto; height: 100%; }
.myday-sidebar { overflow-y: auto; height: 100%; background: var(--surface); }
.myday-greeting {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: baseline; gap: 12px;
}
.myday-greeting-title { font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; }
.myday-greeting-date { font-size: 10px; color: var(--text-dim); letter-spacing: 0.5px; }
.myday-section { border-bottom: 1px solid var(--border); }
.myday-section-hdr {
  padding: 6px 24px;
  font-size: 8px; letter-spacing: 1.2px; font-weight: 600;
  display: flex; align-items: center; gap: 6px;
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 5;
}
.myday-section-count {
  opacity: .5; font-weight: 400;
}
.myday-section-empty {
  padding: 12px 24px; font-size: 10px; color: var(--text-dim);
}
.myday-item {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 24px;
  border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background .12s;
  font-size: 11px;
}
.myday-item:hover { background: var(--surface2); }
.myday-item:last-child { border-bottom: none; }
.myday-source {
  font-size: 7.5px; letter-spacing: .8px; font-weight: 600;
  padding: 2px 5px; border-radius: 3px; flex-shrink: 0;
  border: 1px solid currentColor; opacity: .7;
}
.src-linear  { color: #6366f1; }
.src-hubspot { color: #f97316; }
.src-gcal    { color: #3b82f6; }
.src-gmail   { color: #ef4444; }
.src-drive   { color: #10b981; }
.myday-item-title { flex: 1; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.myday-item-owner { font-size: 9px; color: var(--text-dim); flex-shrink: 0; }
.myday-item-date  { font-size: 9px; flex-shrink: 0; color: var(--text-dim); }
.myday-item-date.overdue { color: #f59e0b; font-weight: 600; }
.myday-item-date.today   { color: #3b82f6; font-weight: 600; }
.myday-item-status { font-size: 8px; color: var(--text-dim); flex-shrink: 0; }
.myday-expand-chevron {
  flex-shrink: 0; font-size: 9px; color: var(--text-dim); opacity:.4;
  cursor: pointer; padding: 0 2px 0 4px; transition: transform 0.15s; line-height:1;
  user-select: none;
}
.myday-expand-chevron.open { transform: rotate(90deg); opacity:.7; }
.myday-expand-panel {
  display: none; padding: 8px 14px 10px 44px;
  background: rgba(0,0,0,0.012);
  border-top: 1px solid var(--border);
  font-size: 10.5px; color: var(--text); line-height: 1.55;
  flex-direction: column; gap: 6px;
}
.myday-expand-panel.open { display: flex; }
.myday-expand-reason { color: var(--text); font-size: 10.5px; line-height: 1.55; }
.myday-expand-suggestion {
  display: flex; gap: 6px; padding: 5px 8px; border-radius: 4px;
  background: rgba(59,130,246,0.06); border-left: 2px solid rgba(59,130,246,0.35);
  font-size: 10px; color: var(--text-dim); line-height: 1.45;
}
.myday-expand-link {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 9px; background: var(--surface2); border: 1px solid var(--border);
  border-radius: 4px; font-size: 9px; color: var(--text-dim);
  text-decoration: none; cursor: pointer; align-self: flex-start;
}
.myday-expand-link:hover { background: var(--border); }
.myday-coming-card {
  margin: 16px 16px 0;
  border: 1px dashed var(--border);
  border-radius: 6px; padding: 12px 14px;
  display: flex; align-items: center; gap: 10px;
}
.myday-coming-icon { font-size: 16px; flex-shrink: 0; opacity: .4; }
.myday-coming-text { font-size: 10px; }
.myday-coming-title { color: var(--text-dim); font-weight: 600; font-size: 9px; letter-spacing: .5px; margin-bottom: 2px; }
.myday-coming-desc  { color: var(--text-dim); opacity: .6; font-size: 9px; }
.myday-sidebar-hdr {
  padding: 6px 16px;
  font-size: 8px; letter-spacing: 1.2px; font-weight: 600;
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 6px;
  position: sticky; top: 0; z-index: 5;
}
.myday-deal-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border);
  cursor: pointer; font-size: 10px; transition: background .12s;
}
.myday-deal-row:hover { background: var(--surface2); }
.myday-deal-name { flex: 1; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.myday-deal-amt  { font-size: 9px; color: #10b981; font-weight: 600; flex-shrink: 0; }
.myday-deal-date { font-size: 9px; color: var(--text-dim); flex-shrink: 0; }
.myday-deal-date.overdue { color: #ef4444; }
.myday-deal-date.soon    { color: #f59e0b; }
.myday-person-bar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 8px 20px;
  display: flex; gap: 6px; align-items: center;
  overflow-x: auto; position: sticky; top: 0; z-index: 10;
}
.myday-section-bar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 6px 20px;
  display: flex; gap: 4px; align-items: center;
  overflow-x: auto; position: sticky; top: 41px; z-index: 9;
}
.section-pill {
  padding: 3px 10px; border-radius: 999px;
  border: 1px solid var(--border); background: transparent;
  font-size: 9px; font-weight: 700; letter-spacing: 0.5px;
  color: var(--text-dim); cursor: pointer; white-space: nowrap;
  transition: all 0.15s;
}
.section-pill:hover { border-color: var(--accent); color: var(--accent); }
.section-pill.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.myday-stats-bar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 7px 24px;
  display: flex; gap: 16px; align-items: center; font-size: 9px;
}
.myday-stat { display: flex; gap: 5px; align-items: center; color: var(--text-dim); }
.myday-stat-num { font-weight: 700; color: var(--text); font-size: 11px; }
.myday-stat-num.red { color: #ef4444; }
.myday-stat-num.amber { color: #f59e0b; }
.myday-stat-num.blue { color: #3b82f6; }

/* ── SALES & OPS TAB ────────────────────────────────────────────────────── */
.ops-layout {
  display: grid;
  grid-template-columns: 1fr 420px;
  height: calc(100vh - 120px);
  overflow: hidden;
}
.ops-col {
  overflow-y: auto;
  height: 100%;
}
.ops-col-tasks {
  border-right: 1px solid var(--border);
}
.ops-col-pipeline {
  background: var(--surface);
}

/* Owner filter strip */
.owner-strip {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 8px 20px;
  display: flex; gap: 6px; align-items: center;
  overflow-x: auto; position: sticky; top: 0; z-index: 10;
}
.owner-strip-label { font-size: 8px; color: var(--text-dim); letter-spacing: 1px; margin-right: 4px; flex-shrink: 0; }
.owner-pill {
  font-size: 9px; border-radius: 20px; padding: 3px 12px;
  border: 1px solid var(--border); cursor: pointer;
  font-family: 'DM Mono', monospace; letter-spacing: 0.3px;
  background: var(--bg); color: var(--text-muted);
  transition: all 0.15s; white-space: nowrap; flex-shrink: 0;
}
.owner-pill:hover { border-color: var(--accent); color: var(--accent); }
.owner-pill.active { background: var(--accent); color: #fff; border-color: var(--accent); }

/* Section headers */
.ops-section {
  margin: 0;
}
.ops-section-header {
  padding: 10px 20px 6px;
  font-size: 8px; color: var(--text-dim);
  letter-spacing: 1.5px; font-weight: 500;
  border-bottom: 1px solid var(--border);
  background: var(--surface2);
  display: flex; align-items: center; gap: 8px;
  position: sticky; top: 41px; z-index: 9;
}
.ops-section-count {
  background: var(--border); color: var(--text-muted);
  border-radius: 10px; padding: 1px 7px; font-size: 8px;
}

/* Task rows */
.task-row {
  display: flex; align-items: center; gap: 10px;
  padding: 0 20px; height: 44px;
  border-bottom: 1px solid var(--bg);
  cursor: pointer; transition: background 0.1s;
}
.task-row:hover { background: var(--surface2); }
.task-type-icon {
  font-size: 13px; flex-shrink: 0; width: 20px; text-align: center;
}
.task-name {
  font-size: 11px; color: var(--text);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  flex: 1; min-width: 0;
}
.task-company {
  font-size: 9px; color: var(--text-muted);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  max-width: 160px; flex-shrink: 0;
}
.task-due {
  font-size: 9px; color: var(--text-muted);
  white-space: nowrap; flex-shrink: 0; min-width: 64px; text-align: right;
}
.task-due.overdue { color: #f59e0b; font-weight: 600; }
.task-due.today   { color: #3b82f6; font-weight: 600; }
.task-owner-pill {
  font-size: 8px; padding: 2px 8px; border-radius: 3px;
  background: var(--surface2); border: 1px solid var(--border);
  color: var(--text-muted); white-space: nowrap; flex-shrink: 0;
}
@keyframes taskUrgentPulse {
  0%,100% { box-shadow: inset 3px 0 0 rgba(239,68,68,0.5); }
  50%     { box-shadow: inset 3px 0 0 rgba(239,68,68,1); background: rgba(239,68,68,0.03); }
}
.task-row.row-urgent { animation: taskUrgentPulse 1.6s ease-in-out infinite; }
.task-row.row-overdue { box-shadow: inset 3px 0 0 rgba(245,158,11,0.5); }

/* Pipeline table */
.pipeline-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.pipeline-table th {
  font-size: 8px; color: var(--text-dim); letter-spacing: 1.2px;
  padding: 8px 12px; text-align: left;
  background: var(--surface2); border-bottom: 1px solid var(--border);
  font-weight: 500;
}
.pipeline-table td {
  padding: 10px 12px; border-bottom: 1px solid var(--bg);
  color: var(--text); vertical-align: middle;
}
.pipeline-table tr:hover td { background: var(--surface2); }
.pipeline-table tr { cursor: pointer; }
.deal-name { font-weight: 500; }
.deal-stage-badge {
  font-size: 8px; border-radius: 3px; padding: 2px 7px;
  white-space: nowrap;
}
.deal-amount { font-weight: 500; color: #10b981; font-family: 'DM Mono', monospace; }
.deal-close-date { font-size: 10px; color: var(--text-muted); }
.deal-close-date.urgent { color: #ef4444; font-weight: 600; }
.deal-close-date.soon   { color: #f59e0b; font-weight: 600; }
.deal-owner-pill {
  font-size: 8px; padding: 2px 8px; border-radius: 3px;
  background: var(--surface2); border: 1px solid var(--border);
  color: var(--text-muted);
}
.pipeline-total-row td {
  font-size: 9px; color: var(--text-muted);
  background: var(--surface2); font-weight: 500;
  border-top: 2px solid var(--border);
}

/* Empty/connect state */
.ops-empty {
  padding: 60px 20px; text-align: center;
}
.ops-empty-icon { font-size: 40px; margin-bottom: 16px; }
.ops-empty-title { font-size: 14px; color: var(--text); font-weight: 500; margin-bottom: 8px; }
.ops-empty-sub { font-size: 11px; color: var(--text-muted); line-height: 1.7; max-width: 400px; margin: 0 auto; }
.ops-empty-cmd {
  margin-top: 20px; display: inline-block;
  font-size: 10px; background: var(--surface2); border: 1px solid var(--border);
  border-radius: 4px; padding: 8px 16px; color: var(--text); letter-spacing: 0.3px;
}
</style>
</head>
<body>

<div class="header">
  <div class="header-logo"><svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0"><circle cx="10" cy="11" r="6" fill="#6c63f7"/><circle cx="25" cy="9" r="8" fill="#6c63f7"/><circle cx="14" cy="27" r="8" fill="#6c63f7"/><circle cx="29" cy="29" r="5" fill="#6c63f7"/></svg> Supplied</div>

  <div class="header-tabs">
    <button class="tab-btn active" id="tab-myday-btn" onclick="switchTab('myday')">
      <span class="tab-icon">✅</span> TO DOs
    </button>
    <button class="tab-btn" id="tab-roadmap-btn" onclick="switchTab('roadmap')">
      <span class="tab-icon">🗺</span> CUSTOMER &amp; PRODUCT ROADMAP
    </button>
    <button class="tab-btn" id="tab-sales-btn" onclick="switchTab('sales')">
      <span class="tab-icon">📊</span> SALES &amp; OPERATIONS
    </button>
  </div>

  <div class="header-right">
    <button class="refresh-btn" id="refresh-btn" onclick="doRefresh()">
      <span class="spin">↻</span> REFRESH
    </button>
    <button class="refresh-btn" title="Update GitHub token" onclick="openPatModal()" style="padding:3px 7px;">⚙</button>
    <div class="refresh-badge">
      <span class="dot"></span>
      <span id="refresh-time">LOADING…</span>
    </div>
  </div>
</div>

<!-- ══ MY DAY TAB ══════════════════════════════════════════════════════════ -->
<div id="panel-myday" class="tab-panel active">
  <div class="myday-person-bar" id="myday-person-bar">
    <span class="owner-strip-label">SHOWING FOR</span>
  </div>
  <div class="myday-section-bar" id="myday-section-bar"></div>
  <div class="myday-stats-bar" id="myday-stats-bar"></div>
  <div class="myday-layout">
    <div class="myday-main" id="myday-main"></div>
    <div class="myday-sidebar" id="myday-sidebar"></div>
  </div>
</div>

<!-- ══ ROADMAP TAB ══════════════════════════════════════════════════════════ -->
<div id="panel-roadmap" class="tab-panel">
  <div class="alert-bar" id="alert-bar-roadmap">
    <span class="alert-section-label">NEEDS ATTENTION</span>
  </div>

  <div class="legend">
    ${[["Todo","#6366f1"],["In Progress","#f59e0b"],["In Review","#fb923c"],["In Test","#a78bfa"],["Blocked","#ef4444"],["Planned","#8b5cf6"],["Backlog","#334155"]].map(([s,c])=>`
    <div class="legend-item"><span class="legend-swatch" style="background:${c}"></span>${s}</div>`).join("")}
    <div class="legend-today"><span class="legend-today-line"></span>Today</div>
    <div class="legend-hint">Click issue bar → open in Linear · Click row → expand</div>
  </div>

  <div class="gantt-outer">
    <div class="gantt-wrapper" id="gantt">
      <div class="gantt-thead" id="thead">
        <div class="gantt-thead-label">NAME</div>
        <div class="gantt-thead-ticks" id="ticks"></div>
      </div>
      <div id="gantt-body"></div>
    </div>
    <div class="gantt-insights-panel" id="gantt-insights">
      <div class="gantt-insights-hdr">INSIGHTS &amp; RECOMMENDATIONS</div>
      <div id="gantt-insights-body"><div class="gi-empty">Loading…</div></div>
    </div>
  </div>
</div>

<!-- ══ SALES & OPS TAB ══════════════════════════════════════════════════════ -->
<div id="panel-sales" class="tab-panel">
  <div class="alert-bar" id="alert-bar-sales">
    <span class="alert-section-label">NEEDS ATTENTION</span>
  </div>

  <div class="owner-strip" id="owner-strip">
    <span class="owner-strip-label">OWNER</span>
  </div>

  <div class="ops-layout" id="ops-layout">
    <div class="ops-col ops-col-tasks" id="ops-tasks-col"></div>
    <div class="ops-col ops-col-pipeline" id="ops-pipeline-col"></div>
  </div>
</div>

<!-- Anthropic API key modal -->
<div class="pat-overlay" id="claude-key-overlay">
  <div class="pat-modal">
    <div class="pat-modal-title">&#x1F916; CONNECT CLAUDE AI</div>
    <div class="pat-modal-desc">
      Enter your Anthropic API key to enable the AI daily brief.<br>
      Stored only in your browser. Get a free key at
      <a href="https://console.anthropic.com" target="_blank" style="color:var(--accent)">console.anthropic.com</a>
    </div>
    <input type="password" id="claude-key-input" class="pat-input" placeholder="sk-ant-..." />
    <div id="claude-key-status" class="pat-status"></div>
    <div style="display:flex;gap:8px;margin-top:12px;">
      <button class="pat-save-btn" onclick="saveClaudeKey()">Connect</button>
      <button class="pat-save-btn" style="background:var(--surface2);color:var(--text-muted);" onclick="closeClaudeKeyModal()">Cancel</button>
    </div>
  </div>
</div>

<!-- PAT modal for on-demand refresh -->
<div class="pat-overlay" id="pat-overlay">
  <div class="pat-modal">
    <div class="pat-modal-title">🔑 CONNECT GITHUB FOR ON-DEMAND REFRESH</div>
    <div class="pat-modal-desc">
      A GitHub Personal Access Token lets the Refresh button trigger a live data pull
      without waiting for the scheduled workflow.<br><br>
      Create one at <a href="https://github.com/settings/tokens/new" target="_blank">github.com/settings/tokens</a>
      — scope needed: <code>repo</code> (or <code>workflow</code> for fine-grained tokens).<br><br>
      Your token is stored only in this browser. It never leaves your device.
    </div>
    <input type="password" id="pat-input" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" autocomplete="off" />
    <div class="pat-modal-actions">
      <span class="pat-status" id="pat-status"></span>
      <button class="pat-btn" onclick="closePatModal()">Cancel</button>
      <button class="pat-btn primary" onclick="savePat()">Save &amp; Refresh</button>
    </div>
  </div>
</div>

<div class="tooltip" id="tooltip" style="display:none"></div>

<script>
// ═══════════════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const SC = {
  "Todo":"#6366f1","In Progress":"#f59e0b","In Review":"#fb923c",
  "In Test":"#a78bfa","Blocked":"#ef4444","Backlog":"#334155",
  "Done":"#10b981","Completed":"#10b981","Active":"#3b82f6",
  "Planned":"#8b5cf6","Paused":"#f97316","Cancelled":"#475569",
};
const sc = s => SC[s]||"#475569";
const TODAY_STR  = new Date().toISOString().split("T")[0];
const DONE_STATES = new Set(["Done","Completed","Cancelled","Canceled","Duplicate","Won","Closed"]);
function isActive(status){ return !DONE_STATES.has(status); }
function priorityLevel(p){ const u=(p||"").toUpperCase(); if(u==="URGENT"||u==="1") return "urgent"; if(u==="HIGH"||u==="2") return "high"; return null; }
function isOverdue(end, status){ return !!end && isActive(status||"") && end < TODAY_STR; }
function daysDiff(dateStr){ return Math.ceil((new Date(dateStr)-new Date(TODAY_STR))/(1000*86400)); }
function fmtDate(d){ if(!d) return ""; const [y,m,day]=d.split("-"); return \`\${day} \${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} \${y.slice(2)}\`; }

// ═══════════════════════════════════════════════════════════════════════════
// TAB SWITCHING
// ═══════════════════════════════════════════════════════════════════════════
let currentTab = "myday";
function switchTab(tab){
  currentTab = tab;
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  document.getElementById("tab-"+tab+"-btn").classList.add("active");
  document.getElementById("panel-"+tab).classList.add("active");
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOLTIP
// ═══════════════════════════════════════════════════════════════════════════
const tip = document.getElementById("tooltip");
let tipVisible = false;
function showTip(e,d){
  const priLevel = priorityLevel(d.priority);
  const od = d.end && isActive(d.status||"") && d.end < TODAY_STR;
  const priColor = priLevel==="urgent"?"#ef4444":priLevel==="high"?"#f97316":null;
  tip.innerHTML=\`
    <div class="tooltip-title">\${d.label}</div>
    \${d.status?\`<div class="tooltip-status" style="color:\${sc(d.status)}">\${d.status}</div>\`:""}
    \${priColor?\`<div class="tooltip-priority" style="color:\${priColor}">⚡ \${d.priority}</div>\`:""}
    \${od?\`<div class="tooltip-overdue">⚠️ OVERDUE — due \${d.end}</div>\`:""}
    \${d.start?\`<div class="tooltip-dates">\${d.start} → \${d.end||"ongoing"}</div>\`:""}
    \${d.assignee?\`<div class="tooltip-assignee">👤 \${d.assignee}</div>\`:""}
    \${d.clickable&&d.url?\`<div class="tooltip-link">↗ Open in Linear</div>\`:""}
  \`;
  tip.style.display="block"; moveTip(e); tipVisible=true;
}
function moveTip(e){ tip.style.left=(e.clientX+14)+"px"; tip.style.top=(e.clientY-8)+"px"; }
function hideTip(){ tip.style.display="none"; tipVisible=false; }
document.addEventListener("mousemove", e=>{ if(tipVisible) moveTip(e); });

// ═══════════════════════════════════════════════════════════════════════════
// ROADMAP (LINEAR GANTT)
// ═══════════════════════════════════════════════════════════════════════════
const RANGE_START = (()=>{ const d=new Date(); d.setMonth(d.getMonth()-3,1); return d.toISOString().split("T")[0]; })();
const RANGE_END   = (()=>{ const d=new Date(); d.setFullYear(d.getFullYear()+1); d.setMonth(d.getMonth()+2,28); return d.toISOString().split("T")[0]; })();
const TOTAL_MS    = new Date(RANGE_END)-new Date(RANGE_START);
const dPct = s => { if(!s) return null; return Math.max(0,Math.min(100,(new Date(s)-new Date(RANGE_START))/TOTAL_MS*100)); };
const TODAY_PCT = dPct(TODAY_STR);

// Ticks
const ticksEl = document.getElementById("ticks");
const curT = new Date(RANGE_START); curT.setDate(1);
const endD = new Date(RANGE_END);
while(curT <= endD){
  const pct = dPct(curT.toISOString().split("T")[0]);
  const t = document.createElement("div");
  t.className = "tick"+(curT.getDate()===1&&curT.getMonth()%3===0?" major":"");
  t.style.left=pct+"%";
  const s = document.createElement("span");
  s.textContent = curT.toLocaleString("default",{month:"short",year:"2-digit"});
  t.appendChild(s); ticksEl.appendChild(t);
  curT.setMonth(curT.getMonth()+1);
}

const expanded = {};
let GANTT_DATA  = null;
let GANTT_FILTER = null;

function ganttComputeStats(data){
  let urgent=0,high=0,overdue=0,total=0;
  for(const ini of data.initiatives){
    if(DONE_STATES.has(ini.status||"")) continue;
    for(const proj of ini.projects){
      if(DONE_STATES.has(proj.status||"")) continue;
      for(const iss of (proj.issues||[])){
        if(!isActive(iss.status)) continue; total++;
        const p=priorityLevel(iss.priority);
        if(p==="urgent") urgent++; else if(p==="high") high++;
        if(isOverdue(iss.end,iss.status)) overdue++;
      }
    }
  }
  return {urgent,high,overdue,total};
}

function ganttIssueMatchesFilter(iss){
  if(!GANTT_FILTER) return true;
  if(!isActive(iss.status)) return false;
  if(GANTT_FILTER==="urgent")  return priorityLevel(iss.priority)==="urgent";
  if(GANTT_FILTER==="high")    return priorityLevel(iss.priority)==="high";
  if(GANTT_FILTER==="overdue") return isOverdue(iss.end,iss.status);
  return true;
}

function populateGanttAlertBar(stats){
  const bar = document.getElementById("alert-bar-roadmap"); bar.innerHTML="";
  const lbl=document.createElement("span"); lbl.className="alert-section-label"; lbl.textContent="NEEDS ATTENTION"; bar.appendChild(lbl);
  if(stats.urgent===0&&stats.high===0&&stats.overdue===0){
    const a=document.createElement("div"); a.className="alert-all-clear"; a.innerHTML=\`✓ <span>All \${stats.total} active issues on track</span>\`; bar.appendChild(a); return;
  }
  const badges=[{key:"urgent",num:stats.urgent,lbl:"URGENT",cls:"badge-urgent"},{key:"high",num:stats.high,lbl:"HIGH",cls:"badge-high"},{key:"overdue",num:stats.overdue,lbl:"OVERDUE",cls:"badge-overdue"}];
  let first=true;
  for(const b of badges){
    if(b.num===0) continue;
    if(!first){ const d=document.createElement("div"); d.className="alert-divider"; bar.appendChild(d); }
    first=false;
    const btn=document.createElement("button");
    btn.className=\`alert-badge \${b.cls}\${GANTT_FILTER===b.key?" active":""}\`;
    btn.dataset.filter=b.key;
    btn.innerHTML=\`<span class="alert-num">\${b.num}</span><span class="alert-lbl">\${b.lbl}</span>\`;
    btn.addEventListener("click",()=>{ GANTT_FILTER=(GANTT_FILTER===b.key)?null:b.key; renderGantt(); populateGanttAlertBar(stats); });
    bar.appendChild(btn);
  }
  const d=document.createElement("div"); d.className="alert-divider"; bar.appendChild(d);
  const clr=document.createElement("button"); clr.className="alert-badge badge-clear"; clr.innerHTML="✕ CLEAR FILTER";
  clr.addEventListener("click",()=>{ GANTT_FILTER=null; renderGantt(); populateGanttAlertBar(stats); }); bar.appendChild(clr);
  const sum=document.createElement("span"); sum.style.cssText="margin-left:auto;font-size:9px;color:var(--text-dim);white-space:nowrap;flex-shrink:0"; sum.textContent=\`\${stats.total} active issues total\`; bar.appendChild(sum);
}

function makeBar(start,end,color,label,url,isIni,isClickable,overdueFlag){
  if(!start) return null;
  const effEnd=end||TODAY_STR; const l=dPct(start),r=dPct(effEnd); if(l===null) return null;
  const w=Math.max((r||l)-l,0.4);
  const bar=document.createElement("div");
  bar.className="bar"+(isIni?" initiative-bar":"")+(isClickable?" clickable-bar":"")+(overdueFlag?" bar-overdue":"");
  bar.style.left=l+"%"; bar.style.width=w+"%"; bar.style.background=color;
  if(w>4){ const lbl=document.createElement("span"); lbl.className="bar-label"; lbl.textContent=label; bar.appendChild(lbl); }
  if(url&&isClickable) bar.addEventListener("click",e=>{ e.stopPropagation(); window.open(url,"_blank"); });
  return bar;
}

function makeGanttRow({indent,label,status,color,start,end,url,hasChildren,isExpanded,isIni,onClick,barData,barClickable,assignee,priority,overdueFlag}){
  const priLevel=priority?priorityLevel(priority):null;
  const row=document.createElement("div");
  let rc="row"+(isIni?" initiative":"")+(hasChildren||onClick?" clickable":"");
  if(!isIni&&priLevel==="urgent") rc+=" row-urgent";
  else if(!isIni&&priLevel==="high") rc+=" row-high";
  else if(!isIni&&overdueFlag) rc+=" row-overdue";
  row.className=rc;
  if(onClick) row.addEventListener("click",onClick);
  const lc=document.createElement("div"); lc.className="row-label"; lc.style.paddingLeft=(10+indent*14)+"px";
  if(hasChildren){ const arr=document.createElement("span"); arr.className="row-arrow"+(isExpanded?" open":""); arr.textContent="▶"; lc.appendChild(arr); }
  const dot=document.createElement("span"); dot.className="row-dot"; dot.style.background=color||sc(status); lc.appendChild(dot);
  const nm=document.createElement("span"); nm.className="row-name"; nm.textContent=label; nm.title=label; lc.appendChild(nm);
  if(!isIni&&priLevel==="urgent"){ const pt=document.createElement("span"); pt.className="pri-tag pri-urgent"; pt.textContent="URGENT"; lc.appendChild(pt); }
  else if(!isIni&&priLevel==="high"){ const pt=document.createElement("span"); pt.className="pri-tag pri-high"; pt.textContent="HIGH"; lc.appendChild(pt); }
  if(!isIni&&overdueFlag){ const ot=document.createElement("span"); ot.className="overdue-tag"; ot.textContent="OVERDUE"; lc.appendChild(ot); }
  if(status){ const badge=document.createElement("span"); badge.className="row-badge"; badge.style.background=sc(status)+"22"; badge.style.color=sc(status); badge.textContent=status; lc.appendChild(badge); }
  if(assignee){ const asn=document.createElement("span"); asn.className="row-assignee"; asn.textContent=assignee.split(" ")[0]; asn.title=assignee; lc.appendChild(asn); }
  row.appendChild(lc);
  const bc=document.createElement("div"); bc.className="row-bars";
  const tl=document.createElement("div"); tl.className="today-line"; tl.style.left=TODAY_PCT+"%"; bc.appendChild(tl);
  if(start){
    const bar=makeBar(start,end,color||sc(status),label,url,isIni,barClickable,overdueFlag&&!isIni);
    if(bar){ const bd=barData||{label,status,start,end,url,clickable:barClickable}; bar.addEventListener("mouseenter",e=>showTip(e,bd)); bar.addEventListener("mouseleave",hideTip); bc.appendChild(bar); }
  } else { const nd=document.createElement("span"); nd.className="no-dates"; nd.textContent="no dates"; bc.appendChild(nd); }
  row.appendChild(bc);
  return row;
}

const ganttBody = document.getElementById("gantt-body");
function renderGantt(){
  if(!GANTT_DATA){ ganttBody.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:11px;letter-spacing:0.5px">LOADING…</div>'; return; }
  ganttBody.innerHTML="";
  for(const ini of GANTT_DATA.initiatives){
    const iniKey=ini.id;
    if(DONE_STATES.has(ini.status||"")) continue; // hide completed/cancelled initiatives
    if(GANTT_FILTER){ const hm=ini.projects.some(p=>(p.issues||[]).some(i=>ganttIssueMatchesFilter(i))); if(!hm) continue; }
    const iniExp=GANTT_FILTER?true:!!expanded[iniKey];
    const dated=ini.projects.filter(p=>p.startDate||p.targetDate);
    const iniStart=dated.reduce((a,p)=>(!a||(p.startDate&&p.startDate<a))?p.startDate:a,null);
    const iniEnd=dated.reduce((a,p)=>(!a||(p.targetDate&&p.targetDate>a))?p.targetDate:a,null)||ini.targetDate;
    ganttBody.appendChild(makeGanttRow({indent:0,label:ini.name,status:ini.status,color:ini.color,start:iniStart,end:iniEnd,url:ini.url,hasChildren:ini.projects.length>0,isExpanded:iniExp,isIni:true,onClick:()=>{ expanded[iniKey]=!expanded[iniKey]; renderGantt(); },barClickable:!!ini.url,barData:{label:ini.name,status:ini.status,start:iniStart,end:iniEnd,url:ini.url,clickable:!!ini.url}}));
    if(iniExp){
      for(const proj of ini.projects){
        const projKey=iniKey+"_"+proj.id;
        if(DONE_STATES.has(proj.status||"")) continue; // hide completed/cancelled projects
        if(GANTT_FILTER){ const hm=(proj.issues||[]).some(i=>ganttIssueMatchesFilter(i)); if(!hm) continue; }
        const projExp=GANTT_FILTER?true:!!expanded[projKey];
        const hasIssues=proj.issues&&proj.issues.length>0;
        ganttBody.appendChild(makeGanttRow({indent:1,label:proj.name,status:proj.status||"",color:proj.color,start:proj.startDate,end:proj.targetDate,url:proj.url,hasChildren:hasIssues,isExpanded:projExp,isIni:false,onClick:hasIssues?()=>{ expanded[projKey]=!expanded[projKey]; renderGantt(); }:proj.url?()=>window.open(proj.url,"_blank"):null,barClickable:!!proj.url,barData:{label:proj.name,status:proj.status,start:proj.startDate,end:proj.targetDate,url:proj.url,clickable:!!proj.url}}));
        if(projExp&&hasIssues){
        const STATUS_RANK={Blocked:0,'In Test':1,'In Review':2,'In Progress':3,'Todo':4,'Backlog':5};
        const sortedIssues=[...proj.issues]
          .filter(i=>!DONE_STATES.has(i.status||''))
          .sort((a,b)=>{
            const ra=STATUS_RANK[a.status]??99, rb=STATUS_RANK[b.status]??99;
            return ra!==rb ? ra-rb : (a.identifier||'').localeCompare(b.identifier||'');
          });
        for(const iss of sortedIssues){
          if(GANTT_FILTER&&!ganttIssueMatchesFilter(iss)) continue;
          const od=isOverdue(iss.end,iss.status);
          ganttBody.appendChild(makeGanttRow({indent:2,label:(iss.identifier+" "+iss.title).trim(),status:iss.status,color:sc(iss.status),start:iss.start,end:iss.end,url:iss.url,hasChildren:false,isExpanded:false,isIni:false,onClick:iss.url?()=>window.open(iss.url,"_blank"):null,barClickable:true,assignee:iss.assignee||null,priority:iss.priority||null,overdueFlag:od,barData:{label:iss.title,status:iss.status,start:iss.start,end:iss.end,assignee:iss.assignee,priority:iss.priority,url:iss.url,clickable:true}}));
        }
        } // end if(projExp&&hasIssues)
      }
      const gap=document.createElement("div"); gap.className="section-gap"; ganttBody.appendChild(gap);
    }
  }
  populateGanttInsights();
}


// ── Gantt Insights Panel ─────────────────────────────────────────────────────
function populateGanttInsights(){
  const body = document.getElementById("gantt-insights-body");
  if(!body || !GANTT_DATA) return;
  body.innerHTML = "";

  const STATUS_RANK={Blocked:0,'In Test':1,'In Review':2,'In Progress':3,'Todo':4,'Backlog':5};
  const blocked=[], inReview=[], noDates=[], nextUp=[];

  for(const ini of GANTT_DATA.initiatives){
    for(const proj of ini.projects){
      for(const iss of (proj.issues||[])){
        if(DONE_STATES.has(iss.status||'')) continue;
        const item={id:iss.identifier,name:iss.title,url:iss.url,proj:proj.name,status:iss.status};
        if(iss.status==='Blocked')                         blocked.push(item);
        else if(iss.status==='In Review'||iss.status==='In Test') inReview.push(item);
        else if(iss.status==='In Progress'&&!iss.start&&!iss.end)  noDates.push(item);
        else if(iss.status==='Backlog'&&(iss.priority==='Urgent'||iss.priority==='High')) nextUp.push(item);
      }
    }
  }

  function makeSection(icon, color, title, items, hint){
    if(items.length===0) return;
    const sec=document.createElement("div"); sec.className="gi-section";
    const hdr=document.createElement("div"); hdr.className="gi-section-title";
    hdr.style.color=color;
    const badge=document.createElement("span"); badge.className="gi-badge";
    badge.style.cssText="background:"+color+"22;color:"+color;
    badge.textContent=items.length;
    hdr.textContent=icon+" "+title+" "; hdr.appendChild(badge);
    sec.appendChild(hdr);
    items.slice(0,8).forEach(it=>{
      const card=document.createElement("div"); card.className="gi-item";
      if(it.url) card.addEventListener("click",()=>window.open(it.url,"_blank"));
      const idEl=document.createElement("div"); idEl.className="gi-item-id"; idEl.textContent=it.proj+(it.id?" · "+it.id:""); card.appendChild(idEl);
      const nmEl=document.createElement("div"); nmEl.className="gi-item-name"; nmEl.textContent=it.name; card.appendChild(nmEl);
      const hintEl=document.createElement("div"); hintEl.className="gi-item-hint"; hintEl.textContent=hint; card.appendChild(hintEl);
      sec.appendChild(card);
    });
    if(items.length>8){ const m=document.createElement("div"); m.style.cssText="font-size:9px;color:var(--text-dim);padding:4px 2px;"; m.textContent="+"+(items.length-8)+" more"; sec.appendChild(m); }
    body.appendChild(sec);
  }

  makeSection("🔴","#ef4444","BLOCKED",blocked,"Unblock this to keep momentum — identify the dependency and loop in the right person.");
  makeSection("👁","#fb923c","NEEDS REVIEW",inReview,"These are waiting on a decision or feedback from you. A quick comment keeps things moving.");
  makeSection("📅","#f59e0b","IN PROGRESS · NO DATES",noDates,"Add start/end dates so the team knows when to expect delivery.");
  makeSection("⚡","#8b5cf6","HIGH PRIORITY BACKLOG",nextUp,"Consider pulling these into the current sprint — they're high priority but not yet scheduled.");

  if(body.children.length===0){
    body.innerHTML='<div class="gi-empty">✓ No blockers or items needing immediate attention</div>';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SALES & OPS (HUBSPOT)
// ═══════════════════════════════════════════════════════════════════════════
let HS_DATA     = null;
let GOOGLE_DATA = null;
let OPS_OWNER   = "all"; // "all" or ownerId string

function opsComputeStats(data){
  const tasks = data.tasks||[];
  const deals = data.deals||[];
  let overdue=0, today=0, closingWeek=0;
  for(const t of tasks){
    if(t.status==="COMPLETED") continue;
    if(isOverdue(t.dueDate,t.status||"OPEN")) overdue++;
    else if(t.dueDate===TODAY_STR) today++;
  }
  for(const d of deals){
    if(!isActive(d.stageType||"open")) continue;
    if(d.closeDate){ const dd=daysDiff(d.closeDate); if(dd>=0&&dd<=7) closingWeek++; }
  }
  return {overdue,today,closingWeek};
}

let OPS_FILTER = null;
function populateSalesAlertBar(stats){
  const bar=document.getElementById("alert-bar-sales"); bar.innerHTML="";
  const lbl=document.createElement("span"); lbl.className="alert-section-label"; lbl.textContent="NEEDS ATTENTION"; bar.appendChild(lbl);
  if(stats.overdue===0&&stats.today===0&&stats.closingWeek===0){
    const a=document.createElement("div"); a.className="alert-all-clear"; a.innerHTML="✓ <span>All tasks on track — no overdue items</span>"; bar.appendChild(a); return;
  }
  const badges=[{key:"overdue",num:stats.overdue,lbl:"OVERDUE TASKS",cls:"badge-overdue"},{key:"today",num:stats.today,lbl:"DUE TODAY",cls:"badge-today"},{key:"week",num:stats.closingWeek,lbl:"DEALS CLOSING THIS WEEK",cls:"badge-week"}];
  let first=true;
  for(const b of badges){
    if(b.num===0) continue;
    if(!first){ const d=document.createElement("div"); d.className="alert-divider"; bar.appendChild(d); }
    first=false;
    const btn=document.createElement("button");
    btn.className=\`alert-badge \${b.cls}\${OPS_FILTER===b.key?" active":""}\`;
    btn.dataset.filter=b.key;
    btn.innerHTML=\`<span class="alert-num">\${b.num}</span><span class="alert-lbl">\${b.lbl}</span>\`;
    btn.addEventListener("click",()=>{ OPS_FILTER=(OPS_FILTER===b.key)?null:b.key; renderOps(); populateSalesAlertBar(stats); });
    bar.appendChild(btn);
  }
  const d=document.createElement("div"); d.className="alert-divider"; bar.appendChild(d);
  const clr=document.createElement("button"); clr.className="alert-badge badge-clear"; clr.innerHTML="✕ CLEAR";
  clr.addEventListener("click",()=>{ OPS_FILTER=null; renderOps(); populateSalesAlertBar(stats); }); bar.appendChild(clr);
}

function populateOwnerStrip(data){
  const strip=document.getElementById("owner-strip"); strip.innerHTML="";
  const lbl=document.createElement("span"); lbl.className="owner-strip-label"; lbl.textContent="FILTER BY OWNER"; strip.appendChild(lbl);
  const all=document.createElement("button"); all.className="owner-pill"+(OPS_OWNER==="all"?" active":""); all.textContent="All"; all.addEventListener("click",()=>{ OPS_OWNER="all"; renderOps(); updateOwnerPills(); }); strip.appendChild(all);
  for(const o of (data.owners||[])){
    const pill=document.createElement("button");
    pill.className="owner-pill"+(OPS_OWNER===o.id?" active":"");
    pill.textContent=o.name.split(" ")[0]+(o.name.split(" ")[1]?" "+o.name.split(" ")[1][0]+".":"");
    pill.title=o.name;
    pill.addEventListener("click",()=>{ OPS_OWNER=o.id; renderOps(); updateOwnerPills(); });
    strip.appendChild(pill);
  }
}

function updateOwnerPills(){
  document.querySelectorAll(".owner-pill").forEach((p,i)=>{
    const id = i===0 ? "all" : (HS_DATA.owners||[])[i-1]?.id;
    p.classList.toggle("active", id===OPS_OWNER);
  });
}

const TASK_ICONS = { "CALL":"📞", "EMAIL":"✉️", "TODO":"☑️" };

function taskMatchesFilters(task){
  if(task.status==="COMPLETED") return false;
  if(OPS_OWNER!=="all" && task.ownerId!==OPS_OWNER) return false;
  if(OPS_FILTER==="overdue") return isOverdue(task.dueDate,"OPEN");
  if(OPS_FILTER==="today")   return task.dueDate===TODAY_STR;
  return true;
}

function dealMatchesFilters(deal){
  if(!isActive(deal.stageType||"open")) return false;
  if(OPS_OWNER!=="all" && deal.ownerId!==OPS_OWNER) return false;
  if(OPS_FILTER==="week") return deal.closeDate && daysDiff(deal.closeDate)>=0 && daysDiff(deal.closeDate)<=7;
  if(OPS_FILTER==="overdue"||OPS_FILTER==="today") return false; // tasks only
  return true;
}

// Stage color palette — cycles through these for pipeline stages
const STAGE_COLORS=["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6","#f97316","#a855f7"];
const _stageColorMap={};
function stageColor(label){
  if(!_stageColorMap[label]){
    const keys=Object.keys(_stageColorMap);
    _stageColorMap[label]=STAGE_COLORS[keys.length % STAGE_COLORS.length];
  }
  return _stageColorMap[label];
}

function renderOps(){
  const tasksCol=document.getElementById("ops-tasks-col");
  const pipeCol=document.getElementById("ops-pipeline-col");
  if(!tasksCol||!pipeCol) return;
  tasksCol.innerHTML=""; pipeCol.innerHTML="";

  if(!HS_DATA||(!HS_DATA.tasks?.length&&!HS_DATA.deals?.length)){ renderOpsEmpty(); return; }

  const tasks=(HS_DATA.tasks||[]).filter(taskMatchesFilters);
  const deals=(HS_DATA.deals||[]).filter(dealMatchesFilters);

  // ── LEFT: TASKS COLUMN ────────────────────────────────────────────────
  const taskHeader=document.createElement("div"); taskHeader.className="ops-section-header";
  taskHeader.style.top="0";
  taskHeader.innerHTML=\`<span>☑ TASKS</span> <span class="ops-section-count">\${tasks.length}</span>\`;
  tasksCol.appendChild(taskHeader);

  if(tasks.length===0){
    const em=document.createElement("div"); em.style.cssText="padding:32px 20px;font-size:11px;color:var(--text-dim);text-align:center";
    em.textContent=OPS_OWNER!=="all"?"No tasks assigned to this person.":"All tasks complete — nothing outstanding!";
    tasksCol.appendChild(em);
  } else {
    const groups = [
      { key:"overdue", label:"OVERDUE",    color:"#f59e0b", items:[] },
      { key:"today",   label:"DUE TODAY",  color:"#3b82f6", items:[] },
      { key:"week",    label:"THIS WEEK",  color:"#8b5cf6", items:[] },
      { key:"later",   label:"UPCOMING",   color:"#64748b", items:[] },
    ];
    for(const t of tasks){
      if(isOverdue(t.dueDate,"OPEN"))               groups[0].items.push(t);
      else if(t.dueDate===TODAY_STR)                groups[1].items.push(t);
      else if(t.dueDate && daysDiff(t.dueDate)<=7)  groups[2].items.push(t);
      else                                           groups[3].items.push(t);
    }

    for(const g of groups){
      if(g.items.length===0) continue;
      const grpH=document.createElement("div");
      grpH.style.cssText=\`padding:5px 16px;font-size:8px;color:\${g.color};letter-spacing:1.2px;border-bottom:1px solid var(--border);border-top:1px solid var(--border);background:var(--surface2);display:flex;align-items:center;gap:6px\`;
      grpH.innerHTML=\`<span style="width:5px;height:5px;border-radius:50%;background:\${g.color};flex-shrink:0;display:inline-block"></span>\${g.label} <span style="opacity:.5">(\${g.items.length})</span>\`;
      tasksCol.appendChild(grpH);

      for(const t of g.items){
        const od=isOverdue(t.dueDate,"OPEN"); const td=t.dueDate===TODAY_STR;
        const pri=priorityLevel(t.priority);
        const row=document.createElement("div");
        row.className="task-row"+(od?" row-overdue":"")+(pri==="urgent"?" row-urgent":"");
        row.title=t.subject||(t.body?"Has notes":"");
        const taskUrl=HS_DATA.portalId?\`https://app.hubspot.com/tasks/\${HS_DATA.portalId}?taskId=\${t.id}\`:null;
        if(taskUrl){ row.style.cursor="pointer"; row.addEventListener("click",()=>window.open(taskUrl,"_blank")); }

        // Type icon
        const icon=document.createElement("span"); icon.className="task-type-icon"; icon.textContent=TASK_ICONS[t.type]||"☑"; row.appendChild(icon);

        // Name — main content
        const nm=document.createElement("span"); nm.className="task-name"; nm.textContent=t.subject||"(no subject)"; row.appendChild(nm);

        // Priority badge
        if(pri==="urgent"){ const pt=document.createElement("span"); pt.className="pri-tag pri-urgent"; pt.textContent="URGENT"; row.appendChild(pt); }
        else if(pri==="high"){ const pt=document.createElement("span"); pt.className="pri-tag pri-high"; pt.textContent="HIGH"; row.appendChild(pt); }

        // Owner pill — always shown
        if(t.ownerName){
          const op=document.createElement("span"); op.className="task-owner-pill"; op.textContent=t.ownerName.split(" ")[0]; row.appendChild(op);
        }

        // Due date
        const du=document.createElement("span"); du.className="task-due"+(od?" overdue":td?" today":""); du.textContent=t.dueDate?fmtDate(t.dueDate):"No date"; row.appendChild(du);

        tasksCol.appendChild(row);
      }
    }
  }

  // ── RIGHT: PIPELINE COLUMN ─────────────────────────────────────────────
  const allDeals=(HS_DATA.deals||[]).filter(dealMatchesFilters);
  const pipeHeader=document.createElement("div"); pipeHeader.className="ops-section-header";
  pipeHeader.style.top="0";
  const totalVal=allDeals.reduce((s,d)=>s+(d.amount||0),0);
  const wgtVal=allDeals.reduce((s,d)=>s+(d.amount||0)*(d.probability||0),0);
  pipeHeader.innerHTML=\`<span>💼 PIPELINE</span> <span class="ops-section-count">\${allDeals.length}</span>
    \${totalVal>0?\`<span style="margin-left:auto;font-size:9px;color:#10b981;font-weight:600">\${(HS_DATA.currency||"€")}\${totalVal.toLocaleString()}</span>\`:""}
  \`;
  pipeCol.appendChild(pipeHeader);

  if(allDeals.length===0){
    const em=document.createElement("div"); em.style.cssText="padding:32px 16px;font-size:11px;color:var(--text-dim);text-align:center";
    em.textContent="No open deals match current filters.";
    pipeCol.appendChild(em);
  } else {
    // Group deals by stage
    const byStage={};
    const sorted=[...allDeals].sort((a,b)=>(a.closeDate||"9999")>(b.closeDate||"9999")?1:-1);
    for(const d of sorted){
      const sl=d.stageLabel||d.stage||"Unknown";
      if(!byStage[sl]) byStage[sl]=[];
      byStage[sl].push(d);
    }

    for(const [stageName, stagDeals] of Object.entries(byStage)){
      const sc=stageColor(stageName);
      const stageVal=stagDeals.reduce((s,d)=>s+(d.amount||0),0);

      // Stage group header
      const sh=document.createElement("div");
      sh.style.cssText=\`padding:5px 16px;font-size:8px;letter-spacing:1px;border-bottom:1px solid var(--border);border-top:1px solid var(--border);background:var(--surface2);display:flex;align-items:center;gap:6px;color:\${sc}\`;
      sh.innerHTML=\`<span style="width:5px;height:5px;border-radius:50%;background:\${sc};flex-shrink:0;display:inline-block"></span>
        \${stageName.toUpperCase()} <span style="opacity:.5">(\${stagDeals.length})</span>
        <span style="margin-left:auto;font-size:9px;font-weight:600;color:#10b981">\${(HS_DATA.currency||"€")}\${stageVal.toLocaleString()}</span>\`;
      pipeCol.appendChild(sh);

      for(const d of stagDeals){
        const dd=d.closeDate?daysDiff(d.closeDate):null;
        const isUrgent=dd!==null&&dd<0;
        const isSoon=dd!==null&&dd>=0&&dd<=7;
        const row=document.createElement("div");
        row.className="task-row"+(isUrgent?" row-overdue":"");
        row.title="Click to open in HubSpot";
        const dealUrl=HS_DATA.portalId?\`https://app.hubspot.com/contacts/\${HS_DATA.portalId}/deal/\${d.id}\`:null;
        if(dealUrl){ row.style.cursor="pointer"; row.addEventListener("click",()=>window.open(dealUrl,"_blank")); }

        // Color dot for stage
        const dot=document.createElement("span");
        dot.style.cssText=\`width:7px;height:7px;border-radius:50%;background:\${sc};flex-shrink:0;display:inline-block\`;
        row.appendChild(dot);

        // Deal name
        const nm=document.createElement("span"); nm.className="task-name"; nm.textContent=d.name; row.appendChild(nm);

        // Amount
        if(d.amount){
          const am=document.createElement("span"); am.className="deal-amount"; am.textContent=(HS_DATA.currency||"€")+d.amount.toLocaleString(); row.appendChild(am);
        }

        // Owner — always shown
        if(d.ownerName){
          const op=document.createElement("span"); op.className="task-owner-pill"; op.textContent=d.ownerName.split(" ")[0]; row.appendChild(op);
        }

        // Close date
        const du=document.createElement("span");
        du.className="task-due"+(isUrgent?" overdue":isSoon?" today":"");
        du.textContent=d.closeDate?fmtDate(d.closeDate):"—";
        row.appendChild(du);

        pipeCol.appendChild(row);
      }
    }

    // Weighted total footer
    if(wgtVal>0){
      const footer=document.createElement("div");
      footer.style.cssText="padding:10px 16px;border-top:2px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:9px;color:var(--text-muted)";
      footer.innerHTML=\`<span>WEIGHTED PIPELINE (prob.)</span><span style="color:#10b981;font-weight:700;font-size:11px">\${(HS_DATA.currency||"€")}\${Math.round(wgtVal).toLocaleString()}</span>\`;
      pipeCol.appendChild(footer);
    }
  }

  if(!tasks.length&&!deals.length&&!OPS_FILTER&&OPS_OWNER==="all") renderOpsEmpty();
}

function renderOpsEmpty(){
  const body=document.getElementById("ops-body");
  body.innerHTML=\`<div class="ops-empty">
    <div class="ops-empty-icon">📊</div>
    <div class="ops-empty-title">Connect HubSpot to see Sales &amp; Operations data</div>
    <div class="ops-empty-sub">
      Add your HubSpot API key as a repository secret, then run the workflow to pull tasks, deals, and pipeline data.
    </div>
    <div class="ops-empty-cmd">HUBSPOT_API_KEY → repo Settings → Secrets &amp; variables → Actions</div>
  </div>\`;
}

// ═══════════════════════════════════════════════════════════════════════════
// MY DAY TAB
// ═══════════════════════════════════════════════════════════════════════════
let MYDAY_PERSON  = localStorage.getItem("myday_person")  || "me";
let MYDAY_SECTION = localStorage.getItem("myday_section") || "all";
let MYDAY_URGENCY = localStorage.getItem("myday_urgency") || "";

// Flatten nested initiatives→projects→issues into a single array
function getLinearIssues(){
  if(!GANTT_DATA||!GANTT_DATA.initiatives) return [];
  const out=[];
  for(const ini of GANTT_DATA.initiatives)
    for(const proj of (ini.projects||[]))
      for(const iss of (proj.issues||[]))
        out.push({...iss, _project:proj.name, _initiative:ini.name});
  return out;
}

// Detect the "current user" first name from loaded data (heuristic: email contains first name)
function detectMyName(){
  if(HS_DATA&&HS_DATA.owners){
    const me = HS_DATA.owners.find(o=>o.email&&o.email.toLowerCase().includes("johann"));
    if(me) return me.name.split(" ")[0];
  }
  const all = getLinearIssues().filter(i=>i.assignee).map(i=>i.assignee.split(" ")[0]);
  if(all.includes("Johann")) return "Johann";
  return null;
}

// Load google-data-{name}.json if it exists, otherwise fall back to google-data.json
async function loadGoogleDataFor(personName){
  if(personName){
    try{
      const r=await fetch(\`./google-data-\${personName.toLowerCase()}.json?t=\${Date.now()}\`);
      if(r.ok){ GOOGLE_DATA=await r.json(); return; }
    }catch(e){}
  }
  try{
    const r=await fetch('./google-data.json?t='+Date.now());
    if(r.ok){ GOOGLE_DATA=await r.json(); }
  }catch(e){}
}

// Switch person filter, reload their Google data, and re-render
async function switchToPersonAndRender(personKey){
  MYDAY_PERSON=personKey;
  localStorage.setItem("myday_person",personKey);
  const name = personKey==="all" ? null : personKey==="me" ? detectMyName() : personKey;
  await loadGoogleDataFor(name);
  renderMyDay();
}

// Switch section filter and re-render
function switchSection(key){
  MYDAY_SECTION=key;
  localStorage.setItem("myday_section",key);
  MYDAY_URGENCY=""; localStorage.removeItem("myday_urgency");
  renderMyDay();
}

function renderMyDay(){
  const main    = document.getElementById("myday-main");
  const sidebar = document.getElementById("myday-sidebar");
  const pbar    = document.getElementById("myday-person-bar");
  const secbar  = document.getElementById("myday-section-bar");
  const sbar    = document.getElementById("myday-stats-bar");
  if(!main||!sidebar||!pbar||!sbar) return;

  // ── Build combined item list ─────────────────────────────────────────────
  const items = [];
  const today = TODAY_STR;

  // Linear issues (flatten from initiatives→projects→issues)
  for(const iss of getLinearIssues()){
    if(DONE_STATES.has(iss.status||"")) continue;
    items.push({
      source:"linear", id:iss.identifier||iss.id, title:iss.title,
      owner:iss.assignee||null, end:iss.end||null, status:iss.status||"",
      priority:iss.priority||"", url:iss.url||null,
      project:iss._project||null,
    });
  }

  // HubSpot tasks
  if(HS_DATA && HS_DATA.tasks){
    for(const t of HS_DATA.tasks){
      if(t.status==="COMPLETED") continue;
      const dueStr = t.dueDate ? t.dueDate.split("T")[0] : null;
      items.push({
        source:"hubspot", id:t.id, title:t.subject||t.title||"(untitled)",
        owner:t.ownerName||null, end:dueStr, status:t.status||"",
        priority:"", url: HS_DATA.portalId
          ? \`https://app.hubspot.com/tasks/\${HS_DATA.portalId}?taskId=\${t.id}\`
          : null,
        body: t.body||null,
      });
    }
  }

  // ── Determine person list for filter bar ──────────────────────────────────
  const people = new Set();
  people.add("me");
  for(const it of items) if(it.owner) people.add(it.owner.split(" ")[0]);
  // Detect current user via shared helper
  const myName = detectMyName();

  // ── Person filter pill bar ──────────────────────────────────────────────
  pbar.innerHTML = '<span class="owner-strip-label">SHOWING FOR</span>';
  const allPill = document.createElement("button");
  allPill.className = "owner-pill"+(MYDAY_PERSON==="all"?" active":"");
  allPill.textContent = "All";
  allPill.addEventListener("click",()=>switchToPersonAndRender("all"));
  pbar.appendChild(allPill);
  for(const p of Array.from(people).filter(x=>x!=="me")){
    const pill = document.createElement("button");
    pill.className = "owner-pill"+(MYDAY_PERSON===p?" active":"");
    pill.textContent = p==="me"? (myName||"Me") : p;
    pill.addEventListener("click",()=>switchToPersonAndRender(p));
    pbar.appendChild(pill);
  }

  // ── Section filter pills ─────────────────────────────────────────────────
  if(secbar){
    secbar.innerHTML = "";
    const secDefs=[
      {key:"all",   label:"ALL"},
      {key:"tasks", label:"📋 TASKS"},
      {key:"inbox", label:"📧 INBOX"},
      {key:"cal",   label:"📅 CALENDAR"},
      {key:"drive", label:"🗂 DRIVE"},
    ];
    for(const sd of secDefs){
      const sp = document.createElement("button");
      sp.className = "section-pill"+(MYDAY_SECTION===sd.key?" active":"");
      sp.textContent = sd.label;
      sp.addEventListener("click",()=>switchSection(sd.key));
      secbar.appendChild(sp);
    }
  }

  // ── Filter items by person ────────────────────────────────────────────────
  function ownerFirst(name){ return (name||"").split(" ")[0]; }
  const filtered = MYDAY_PERSON==="all" ? items
    : MYDAY_PERSON==="me" && myName ? items.filter(it=>ownerFirst(it.owner)===myName)
    : items.filter(it=>ownerFirst(it.owner)===MYDAY_PERSON);

  // Determine display name for greeting
  const viewName = MYDAY_PERSON==="all" ? null
    : MYDAY_PERSON==="me" ? myName
    : MYDAY_PERSON;

  // ── Group by urgency ──────────────────────────────────────────────────────
  const buckets = { overdue:[], today:[], week:[], later:[] };
  for(const it of filtered){
    const dd = it.end ? daysDiff(it.end) : null;
    const od = it.end && isActive(it.status) && it.end < today;
    if(od)                          buckets.overdue.push(it);
    else if(dd===0)                 buckets.today.push(it);
    else if(dd!==null && dd<=7)     buckets.week.push(it);
    else                            buckets.later.push(it);
  }

  // ── Stats bar ─────────────────────────────────────────────────────────────
  const totalOpen = filtered.length;
  const odCount   = buckets.overdue.length;
  const todayCount= buckets.today.length;
  const weekCount = buckets.week.length;
  const linearCount = filtered.filter(i=>i.source==="linear").length;
  const hubspotCount= filtered.filter(i=>i.source==="hubspot").length;
  // ── Stats bar: section-aware + clickable chips ────────────────────────────
  sbar.innerHTML = "";
  (function buildStatsBar(){
    function mkChip(num, label, numCls, opts){
      const el = document.createElement("div");
      el.className = "myday-stat";
      if(opts&&opts.ml)  el.style.marginLeft = "auto";
      if(opts&&opts.dim) el.style.opacity = ".7";
      const sp = document.createElement("span");
      sp.className = "myday-stat-num"+(numCls?" "+numCls:"");
      sp.textContent = num;
      el.appendChild(sp);
      el.appendChild(document.createTextNode(" "+label));
      if(opts&&opts.active){
        el.style.background="rgba(255,255,255,.14)";
        el.style.borderRadius="4px";
        el.style.padding="0 4px";
      }
      if(opts&&opts.onClick){
        el.style.cursor="pointer";
        el.style.borderRadius="4px";
        el.style.transition="background .15s";
        el.style.padding="0 4px";
        if(opts.title) el.title=opts.title;
        el.addEventListener("click", opts.onClick);
        if(!(opts&&opts.active)){
          el.addEventListener("mouseenter",()=>el.style.background="rgba(255,255,255,.07)");
          el.addEventListener("mouseleave",()=>el.style.background="");
        }
      }
      return el;
    }
    function scrollTo(id){ const e=document.getElementById(id); if(e) e.scrollIntoView({behavior:"smooth",block:"start"}); }
    const DP = new Set(JSON.parse(localStorage.getItem("supplied_done_priorities")||"[]"));

    if(MYDAY_SECTION==="all"||MYDAY_SECTION==="tasks"){
      // "X tasks" chip — click clears urgency filter if active
      sbar.appendChild(mkChip(totalOpen,"tasks","",
        MYDAY_URGENCY ? {onClick:()=>{MYDAY_URGENCY="";localStorage.removeItem("myday_urgency");renderMyDay();},title:"Clear filter — show all"} : null));
      // Urgency filter chips
      const uchips=[
        {key:"overdue", label:"overdue",   cls:odCount>0?"red":"",   num:odCount},
        {key:"today",   label:"due today", cls:todayCount>0?"blue":"",num:todayCount},
        {key:"week",    label:"this week", cls:weekCount>0?"amber":"",num:weekCount},
        {key:"later",   label:"later",     cls:"",                    num:buckets.later.length},
      ];
      for(const c of uchips){
        if(!c.num) continue;
        const isAct = MYDAY_URGENCY===c.key;
        sbar.appendChild(mkChip(c.num, c.label, c.cls, {
          active: isAct,
          onClick:()=>{MYDAY_URGENCY=isAct?"":c.key; localStorage.setItem("myday_urgency",MYDAY_URGENCY); renderMyDay();},
          title: isAct ? "Click to show all" : "Filter to "+c.label,
        }));
      }
      if(linearCount)  sbar.appendChild(mkChip(linearCount,  "linear",  "src-linear",  {ml:true,dim:true, onClick:()=>scrollTo("section-linear"),  title:"Jump to Linear issues"}));
      if(hubspotCount) sbar.appendChild(mkChip(hubspotCount, "hubspot", "src-hubspot", {       dim:true, onClick:()=>scrollTo("section-hubspot"), title:"Jump to HubSpot tasks"}));

    } else if(MYDAY_SECTION==="inbox"){
      const epN = (GOOGLE_DATA&&GOOGLE_DATA.email_priorities||[]).filter(p=>!DP.has(p.id)).length;
      const unrN = (GOOGLE_DATA&&GOOGLE_DATA.gmail&&GOOGLE_DATA.gmail.unreadCount)||0;
      sbar.appendChild(mkChip(epN, "priorities", epN>0?"red":"",
        epN>0 ? {onClick:()=>scrollTo("section-email-prios"), title:"Jump to email priorities"} : null));
      sbar.appendChild(mkChip(unrN, "unread", unrN>0?"blue":"",
        {onClick:()=>scrollTo("myday-inbox-section"), title:"Jump to inbox"}));

    } else if(MYDAY_SECTION==="drive"){
      const dpN = (GOOGLE_DATA&&GOOGLE_DATA.drive_priorities||[]).filter(p=>!DP.has(p.id)).length;
      const recN = (GOOGLE_DATA&&GOOGLE_DATA.drive&&GOOGLE_DATA.drive.recent||[]).slice(0,6).length;
      sbar.appendChild(mkChip(dpN, "priorities", dpN>0?"blue":"",
        dpN>0 ? {onClick:()=>scrollTo("section-drive-prios"), title:"Jump to drive priorities"} : null));
      sbar.appendChild(mkChip(recN, "recent files", "",
        {onClick:()=>scrollTo("section-drive-files"), title:"Jump to recent files"}));

    } else {
      sbar.appendChild(mkChip(totalOpen,"tasks","",null));
    }
  })();

  // ── Render main column ────────────────────────────────────────────────────
  main.innerHTML = "";

  // ── Shared priority helpers ───────────────────────────────────────────────
  const PRIORITY_ACTION_META = {
    reply:    { label:"REPLY",     color:"#ef4444", icon:"\u21A9" },
    followup: { label:"FOLLOW UP", color:"#f59e0b", icon:"\u23F0" },
    alert:    { label:"ALERT",     color:"#8b5cf6", icon:"\u26A0" },
    review:   { label:"REVIEW",    color:"#3b82f6", icon:"\uD83D\uDC41" },
    read:     { label:"READ",      color:"#10b981", icon:"\uD83D\uDCCC" },
    task:     { label:"TASK",      color:"#6366f1", icon:"\u2713" },
  };
  const DONE_PRIO_KEY = "supplied_done_priorities";
  const DONE_PRIOS = new Set(JSON.parse(localStorage.getItem(DONE_PRIO_KEY)||"[]"));
  function saveDonePrios(){ localStorage.setItem(DONE_PRIO_KEY, JSON.stringify([...DONE_PRIOS])); }
  function getSuggestedAction(action){
    const m = {
      reply:    { icon:"\uD83D\uDCAC", hint:"Draft a direct response addressing the point raised" },
      followup: { icon:"\u23F0",    hint:"Send a short, friendly nudge to keep this moving" },
      alert:    { icon:"\u26A0\uFE0F", hint:"Investigate and resolve \u2014 loop in the right person if needed" },
      review:   { icon:"\uD83D\uDC41", hint:"Open, read, and add your comment or decision" },
      read:     { icon:"\uD83D\uDCDA", hint:"Set aside 5 min to scan the key points" },
      task:     { icon:"\u2705",    hint:"Complete the task as described" },
    };
    return m[action] || { icon:"\u2705", hint:"Complete the required action" };
  }
  function makeExpandPanel(reason, action, url){
    const panel = document.createElement("div");
    panel.className = "myday-expand-panel";
    if(reason){
      const rEl = document.createElement("div");
      rEl.className = "myday-expand-reason";
      rEl.textContent = reason;
      panel.appendChild(rEl);
    }
    if(action){
      const sa = getSuggestedAction(action);
      const sEl = document.createElement("div");
      sEl.className = "myday-expand-suggestion";
      sEl.textContent = sa.icon + "  " + sa.hint;
      panel.appendChild(sEl);
    }
    if(url){
      const lEl = document.createElement("a");
      lEl.className = "myday-expand-link";
      lEl.href = "#";
      lEl.textContent = "Open →";
      lEl.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); window.open(url,"_blank"); });
      panel.appendChild(lEl);
    }
    return panel;
  }
  function addChevron(row, panel){
    const chev = document.createElement("span");
    chev.className = "myday-expand-chevron";
    chev.textContent = "▶";
    chev.addEventListener("click", e => {
      e.stopPropagation();
      const open = panel.classList.toggle("open");
      chev.classList.toggle("open", open);
    });
    row.appendChild(chev);
  }

  // Auto-action checklist: resets each calendar day
  // TODAY_STR already declared at module level
  const AUTO_DONE_KEY = "supplied_auto_done_" + TODAY_STR;
  const AUTO_DONE = new Set(JSON.parse(localStorage.getItem(AUTO_DONE_KEY)||"[]"));
  function saveAutoDone(){ localStorage.setItem(AUTO_DONE_KEY, JSON.stringify([...AUTO_DONE])); }

  function renderPrioritySection(title, items){
    if(!items || !items.length) return null;
    const active = items.filter(p => !DONE_PRIOS.has(p.id));
    if(!active.length) return null;
    const sec = document.createElement("div");
    sec.className = "myday-section";
    const hdr = document.createElement("div");
    hdr.className = "myday-section-hdr";
    const countSpan = document.createElement("span");
    countSpan.className = "myday-section-count";
    countSpan.textContent = active.length;
    hdr.innerHTML = \`<span>\${title}</span>\`;
    hdr.appendChild(countSpan);
    sec.appendChild(hdr);
    for(const p of active){
      const m = PRIORITY_ACTION_META[p.action] || PRIORITY_ACTION_META.task;
      const row = document.createElement("div");
      row.className = "myday-item";
      row.style.cssText = "gap:6px;";
      if(p.url){ row.style.cursor="pointer"; row.addEventListener("click",()=>window.open(p.url,"_blank")); }
      const badge = document.createElement("span");
      badge.className = "myday-source";
      badge.style.cssText = \`background:\${m.color};color:#fff;min-width:56px;text-align:center;font-size:9px;flex-shrink:0;\`;
      badge.textContent = m.icon+" "+m.label;
      const title_ = document.createElement("span");
      title_.className = "myday-item-title";
      title_.textContent = p.subject;
      const reason = document.createElement("span");
      reason.className = "myday-item-status";
      reason.style.cssText = "font-style:italic;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:240px;";
      reason.textContent = p.reason;
      const doneBtn = document.createElement("button");
      doneBtn.title = "Mark done";
      doneBtn.style.cssText = "flex-shrink:0;width:20px;height:20px;border-radius:50%;border:1.5px solid #22c55e;background:transparent;color:#22c55e;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;line-height:1;";
      doneBtn.textContent = "\u2713";
      doneBtn.addEventListener("click", e => {
        e.stopPropagation();
        DONE_PRIOS.add(p.id);
        saveDonePrios();
        row.style.transition = "opacity 0.25s";
        row.style.opacity = "0";
        setTimeout(() => {
          row.remove();
          const remaining = sec.querySelectorAll(".myday-item").length;
          countSpan.textContent = remaining;
          if(!remaining) sec.remove();
        }, 260);
      });
      row.appendChild(badge);
      row.appendChild(title_);
      row.appendChild(reason);
      row.appendChild(doneBtn);
      // Expand panel
      const expPanel = makeExpandPanel(p.reason, p.action, p.url);
      addChevron(row, expPanel);
      sec.appendChild(row);
      sec.appendChild(expPanel);
      // When marked done, also remove panel
      const origDoneClick = doneBtn.onclick;
      doneBtn.addEventListener("click", () => {
        setTimeout(() => { expPanel.remove(); }, 270);
      });
    }
    return sec;
  }

  function srcLabel(s){
    if(s==="linear")  return {cls:"src-linear",  txt:"LIN"};
    if(s==="hubspot") return {cls:"src-hubspot",  txt:"HS"};
    if(s==="gcal")    return {cls:"src-gcal",     txt:"CAL"};
    if(s==="gmail")   return {cls:"src-gmail",    txt:"ML"};
    return {cls:"",txt:s};
  }

  function makeItemRow(it){
    const row = document.createElement("div");
    row.className = "myday-item";
    if(it.url){ row.style.cursor="pointer"; row.addEventListener("click",()=>window.open(it.url,"_blank")); }
    const {cls,txt} = srcLabel(it.source);
    const dd = it.end ? daysDiff(it.end) : null;
    const dateLabel = it.end ? (dd===0?"Today":dd<0?Math.abs(dd)+"d ago":fmtDate(it.end)) : "";
    const dateCls   = dd!==null && dd<0 ? "overdue" : dd===0 ? "today" : "";
    row.innerHTML = \`
      <span class="myday-source \${cls}">\${txt}</span>
      <span class="myday-item-title">\${it.title}</span>
      \${it.owner&&MYDAY_PERSON==="all"?'<span class="myday-item-owner">'+ownerFirst(it.owner)+'</span>':""}
      \${it.status?'<span class="myday-item-status">'+it.status.toUpperCase()+'</span>':""}
      \${dateLabel?'<span class="myday-item-date '+dateCls+'">'+dateLabel+'</span>':""}
    \`;
    if(it.body){
      const expPanel = makeExpandPanel(it.body, null, it.url);
      addChevron(row, expPanel);
      const frag = document.createDocumentFragment();
      frag.appendChild(row);
      frag.appendChild(expPanel);
      return frag;
    }
    return row;
  }

  // ── Checklist builder (inner fn — accesses AUTO_DONE, viewName) ────────────
  function buildChecklistItems(){
    const todayStr=TODAY_STR;
    const todayMs=new Date().setHours(0,0,0,0);
    const items=[];
    // 1. Email replies first
    if(GOOGLE_DATA){
      for(const e of (GOOGLE_DATA.email_priorities||[])){
        if(DONE_PRIOS.has(e.id)) continue;
        items.push({id:"ep-"+e.id,title:e.subject,source:"gmail",src:"ML",srcCls:"src-gmail",meta:e.action.toUpperCase(),url:e.url,prio:e.action==="reply"?1:e.action==="followup"?4:5});
      }
    }
    // 2. Linear issues (blocked → overdue → due today → this week → high/urgent)
    if(GANTT_DATA){
      const myKey=(MYDAY_PERSON==="me"?(viewName||""):MYDAY_PERSON||"").toLowerCase();
      for(const ini of (GANTT_DATA.initiatives||[])){
        if(DONE_STATES.has(ini.status||"")) continue;
        for(const proj of (ini.projects||[])){
          if(DONE_STATES.has(proj.status||"")) continue;
          for(const iss of (proj.issues||[])){
            if(!isActive(iss.status)) continue;
            const mine=!myKey||MYDAY_PERSON==="all"||(iss.assignee||"").toLowerCase().includes(myKey);
            let prio=99;
            if(iss.status==="Blocked") prio=2;
            else if(iss.end&&iss.end<todayStr) prio=mine?3:6;
            else if(iss.end===todayStr) prio=mine?4:7;
            else if(iss.end&&iss.end<=new Date(Date.now()+7*864e5).toISOString().slice(0,10)) prio=mine?8:14;
            else if(mine&&iss.priority==="urgent") prio=9;
            else if(mine&&iss.priority==="high") prio=10;
            else continue;
            const meta=iss.end?(iss.end<todayStr?Math.ceil((new Date(todayStr)-new Date(iss.end))/864e5)+"d ago":iss.end===todayStr?"Today":fmtDate(iss.end)):(iss.status||"");
            items.push({id:"lin-"+iss.id,title:(iss.identifier?iss.identifier+" ":"")+iss.title,source:"linear",src:"LIN",srcCls:"src-linear",meta,url:iss.url,prio});
          }
        }
      }
    }
    // 3. Deals closing soon
    if(HS_DATA){
      for(const d of (HS_DATA.deals||[])){
        if(!d.closeDate||DONE_STATES.has(d.stageLabel||"")) continue;
        const diff=Math.ceil((new Date(d.closeDate)-todayMs)/864e5);
        if(diff>14) continue;
        const prio=diff<=0?2:diff<=3?5:11;
        const meta=diff<0?Math.abs(diff)+"d ago":diff===0?"Today":"in "+diff+"d";
        const url=HS_DATA.portalId?"https://app.hubspot.com/contacts/"+HS_DATA.portalId+"/deal/"+d.id:null;
        items.push({id:"deal-"+d.id,title:d.name+(d.amount?" \u2014 \u20AC"+Number(d.amount).toLocaleString():""),source:"hubspot",src:"HS",srcCls:"src-hubspot",meta,url,prio});
      }
      for(const t of (HS_DATA.tasks||[])){
        if(!isActive(t.status)) continue;
        const prio=t.dueDate&&t.dueDate<todayStr?6:t.dueDate===todayStr?7:99;
        if(prio===99) continue;
        items.push({id:"hs-"+t.id,title:t.title,source:"hubspot",src:"HS",srcCls:"src-hubspot",meta:t.dueDate<todayStr?"Overdue":"Today",url:t.url,prio});
      }
    }
    // 4. Drive + task priorities
    if(GOOGLE_DATA){
      for(const d of (GOOGLE_DATA.drive_priorities||[])){
        if(DONE_PRIOS.has(d.id)) continue;
        items.push({id:"dp-"+d.id,title:d.subject,source:"drive",src:"DR",srcCls:"src-drive",meta:d.action.toUpperCase(),url:d.url,prio:8});
      }
      for(const t of (GOOGLE_DATA.task_priorities||[])){
        if(DONE_PRIOS.has(t.id)) continue;
        items.push({id:"tp-"+t.id,title:t.subject,source:"task",src:"TASK",srcCls:"src-linear",meta:t.action.toUpperCase(),url:t.url,prio:9});
      }
    }
    items.sort((a,b)=>a.prio-b.prio);
    const seen=new Set();
    return items.filter(i=>{if(seen.has(i.id))return false;seen.add(i.id);return true;});
  }

  function renderSimpleChecklist(container){
    const SHOW_INIT=12;
    const items=buildChecklistItems();
    const wrap=document.createElement("div"); wrap.className="checklist-wrap";
    const hdr=document.createElement("div"); hdr.className="checklist-hdr";
    const lbl=document.createElement("span"); lbl.textContent="\u2611\uFE0F  TODAY\u2019S ACTIONS";
    const cnt=document.createElement("span"); cnt.style.cssText="margin-left:auto;background:var(--accent);color:#fff;border-radius:10px;padding:1px 7px;font-size:9px;";
    cnt.textContent=items.filter(i=>!AUTO_DONE.has(i.id)).length;
    hdr.appendChild(lbl); hdr.appendChild(cnt); wrap.appendChild(hdr);
    const listEl=document.createElement("div"); listEl.id="cl-list"; wrap.appendChild(listEl);
    if(!items.length){
      const emp=document.createElement("div"); emp.style.cssText="padding:20px;text-align:center;color:var(--text-dim);font-size:11px;";
      emp.textContent="All clear \u2014 nothing urgent right now."; listEl.appendChild(emp);
      container.appendChild(wrap); return;
    }
    function draw(showAll){
      listEl.innerHTML="";
      const visible=showAll?items:items.slice(0,SHOW_INIT);
      for(const item of visible){
        const done=AUTO_DONE.has(item.id);
        const row=document.createElement("div"); row.className="cl-item"+(done?" cl-done":"");
        const cb=document.createElement("div"); cb.className="cl-cb"; if(done) cb.textContent="\u2713";
        row.onclick=function(e){
          if(e.target===cb||cb.contains(e.target)){
            if(AUTO_DONE.has(item.id)) AUTO_DONE.delete(item.id); else AUTO_DONE.add(item.id);
            saveAutoDone(); draw(listEl.dataset.showAll==="1");
            cnt.textContent=items.filter(i=>!AUTO_DONE.has(i.id)).length;
          } else if(item.url){ window.open(item.url,"_blank"); }
        };
        const srcEl=document.createElement("span"); srcEl.className="cl-src "+item.srcCls; srcEl.textContent=item.src;
        const titleEl=document.createElement("span"); titleEl.className="cl-title"; titleEl.textContent=item.title;
        const metaEl=document.createElement("span"); metaEl.className="cl-meta"; metaEl.textContent=item.meta||"";
        row.appendChild(cb); row.appendChild(srcEl); row.appendChild(titleEl); row.appendChild(metaEl);
        listEl.appendChild(row);
      }
      if(items.length>SHOW_INIT){
        const btn=document.createElement("button"); btn.className="cl-more-btn";
        if(!showAll){ btn.textContent="Show "+(items.length-SHOW_INIT)+" more \u25BE"; btn.onclick=function(){ listEl.dataset.showAll="1"; draw(true); }; }
        else { btn.textContent="Show less \u25B4"; btn.onclick=function(){ listEl.dataset.showAll="0"; draw(false); }; }
        listEl.appendChild(btn);
      }
    }
    draw(false);
    container.appendChild(wrap);
  }

  // ── Main content ─────────────────────────────────────────────────────────────
  const showAll   = MYDAY_SECTION==="all"||MYDAY_SECTION==="tasks";
  const showInbox = MYDAY_SECTION==="inbox";
  const showDrive = MYDAY_SECTION==="drive";

  if(MYDAY_SECTION==="all"){
    renderClaudeBrief(main, viewName);
  }
  if(showAll){
    renderSimpleChecklist(main);
  }

  // ── INBOX tab ───────────────────────────────────────────────────────
  if(showInbox){
  // ── Email priorities section ──────────────────────────────────────────────
  { const s = renderPrioritySection("\uD83D\uDEA8 EMAIL PRIORITIES", GOOGLE_DATA&&GOOGLE_DATA.email_priorities);
    if(s){
      s.id="section-email-prios";
      // Summary line inside section, right below header
      if(GOOGLE_DATA&&GOOGLE_DATA.email_priorities){
        const eps = GOOGLE_DATA.email_priorities.filter(p=>!DONE_PRIOS.has(p.id));
        if(eps.length){
          const counts = {};
          for(const p of eps) counts[p.action]=(counts[p.action]||0)+1;
          const parts=[];
          if(counts.reply)    parts.push(counts.reply+" repl"+(counts.reply>1?"ies":"y"));
          if(counts.followup) parts.push(counts.followup+" follow-up"+(counts.followup>1?"s":""));
          if(counts.alert)    parts.push(counts.alert+" alert"+(counts.alert>1?"s":""));
          if(counts.review)   parts.push(counts.review+" review"+(counts.review>1?"s":""));
          const brief = document.createElement("div");
          brief.style.cssText = "padding:4px 12px 2px;font-size:10px;color:var(--text-muted);font-style:italic;letter-spacing:.3px;";
          brief.textContent = "\uD83D\uDCEC Inbox: "+parts.join(" \xB7")+" \u2014 needs attention";
          s.insertBefore(brief, s.children[1]);
        }
      }
      main.appendChild(s);
    } }

  // ── Gmail inbox section ───────────────────────────────────────────────────
  const gmailSec = document.createElement("div");
  gmailSec.className = "myday-section";
  gmailSec.id = "myday-inbox-section";
  if(GOOGLE_DATA && GOOGLE_DATA.gmail && GOOGLE_DATA.gmail.threads && GOOGLE_DATA.gmail.threads.length){
    const threads = GOOGLE_DATA.gmail.threads.slice(0,8);
    gmailSec.innerHTML = \`<div class="myday-section-hdr"><span>📧 INBOX</span><span class="myday-section-count">\${GOOGLE_DATA.gmail.unreadCount||threads.length} unread</span></div>\`;
    for(const t of threads){
      const row = document.createElement("div");
      row.className = "myday-item";
      const gmailUrl = t.url || (t.id?\`https://mail.google.com/mail/u/0/#inbox/\${t.id}\`:null);
      if(gmailUrl){ row.style.cursor="pointer"; row.addEventListener("click",()=>window.open(gmailUrl,"_blank")); }
      const d = t.date ? new Date(t.date) : null;
      const dateStr = d ? d.toLocaleDateString("en-GB",{day:"2-digit",month:"short"}) : "";
      const senderName = (t.from||"").replace(/<.*>/,"").trim().split(" ")[0];
      row.innerHTML = \`
        <span class="myday-source src-gmail">ML</span>
        <span class="myday-item-title">\${t.subject||"(no subject)"}</span>
        <span class="myday-item-owner">\${senderName}</span>
        \${t.snippet?'<span class="myday-item-status" style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:italic;opacity:.7">'+t.snippet.slice(0,50)+'</span>':""}
        \${dateStr?'<span class="myday-item-date">'+dateStr+'</span>':""}
      \`;
      // Expand panel with full snippet + from
      if(t.snippet||t.from){
        const gmailExpPanel = makeExpandPanel(
          (t.from ? t.from+" | " : "") + (t.snippet||""),
          null,
          gmailUrl
        );
        addChevron(row, gmailExpPanel);
        gmailSec.appendChild(row);
        gmailSec.appendChild(gmailExpPanel);
      } else {
        gmailSec.appendChild(row);
      }
    }
  } else {
    gmailSec.innerHTML = \`
      <div class="myday-section-hdr"><span>📧 INBOX</span></div>
      <div class="myday-coming-card">
        <span class="myday-coming-icon">📧</span>
        <div class="myday-coming-text">
          <div class="myday-coming-title">GMAIL</div>
          <div class="myday-coming-desc">Run "Morning Brief" task to populate</div>
        </div>
      </div>\`;
  }
  main.appendChild(gmailSec);

  } // end showInbox

  // ── DRIVE tab ───────────────────────────────────────────────────────
  if(showDrive){


  // ── Drive priorities section ──────────────────────────────────────────────
  { const s = renderPrioritySection("\uD83D\uDEA8 DRIVE PRIORITIES", GOOGLE_DATA&&GOOGLE_DATA.drive_priorities);
    if(s){
      s.id="section-drive-prios";
      // Summary line inside section, right below header
      if(GOOGLE_DATA&&GOOGLE_DATA.drive_priorities){
        const dps = GOOGLE_DATA.drive_priorities.filter(p=>!DONE_PRIOS.has(p.id));
        if(dps.length){
          const dcounts = {};
          for(const p of dps) dcounts[p.action]=(dcounts[p.action]||0)+1;
          const dparts=[];
          if(dcounts.review) dparts.push(dcounts.review+" doc"+(dcounts.review>1?"s":"")+" to review");
          if(dcounts.read)   dparts.push(dcounts.read+" doc"+(dcounts.read>1?"s":"")+" to read");
          if(dcounts.task)   dparts.push(dcounts.task+" task"+(dcounts.task>1?"s":""));
          const dbrief = document.createElement("div");
          dbrief.style.cssText = "padding:4px 12px 2px;font-size:10px;color:var(--text-muted);font-style:italic;letter-spacing:.3px;";
          dbrief.textContent = "\uD83D\uDCC2 Drive: "+dparts.join(" \xB7");
          s.insertBefore(dbrief, s.children[1]);
        }
      }
      main.appendChild(s);
    } }

  // ── Google Drive section ──────────────────────────────────────────────────
  const driveSec = document.createElement("div");
  driveSec.className = "myday-section";
  driveSec.id = "section-drive-files";
  if(GOOGLE_DATA && GOOGLE_DATA.drive && GOOGLE_DATA.drive.recent && GOOGLE_DATA.drive.recent.length){
    const files = GOOGLE_DATA.drive.recent.slice(0,6);
    driveSec.innerHTML = \`<div class="myday-section-hdr"><span>📄 DRIVE — RECENT</span><span class="myday-section-count">\${files.length}</span></div>\`;
    for(const f of files){
      const row = document.createElement("div");
      row.className = "myday-item";
      if(f.url){ row.style.cursor="pointer"; row.addEventListener("click",()=>window.open(f.url,"_blank")); }
      const icon = f.mimeType&&f.mimeType.includes("spreadsheet")?"📊":f.mimeType&&f.mimeType.includes("presentation")?"📑":"📄";
      const d = f.modifiedAt ? new Date(f.modifiedAt) : null;
      const dateStr = d ? d.toLocaleDateString("en-GB",{day:"2-digit",month:"short"}) : "";
      row.innerHTML = \`
        <span class="myday-source src-drive">DR</span>
        <span class="myday-item-title">\${icon} \${f.name||"(untitled)"}</span>
        \${dateStr?'<span class="myday-item-date">'+dateStr+'</span>':""}
      \`;
      driveSec.appendChild(row);
    }
  } else {
    driveSec.innerHTML = \`
      <div class="myday-section-hdr"><span>📄 DRIVE — RECENT</span></div>
      <div class="myday-coming-card">
        <span class="myday-coming-icon">📄</span>
        <div class="myday-coming-text">
          <div class="myday-coming-title">GOOGLE DRIVE</div>
          <div class="myday-coming-desc">Run "Morning Brief" task to populate</div>
        </div>
      </div>\`;
  }
  main.appendChild(driveSec);


  } // end showDrive

    // ── Sidebar ───────────────────────────────────────────────────────────────
  sidebar.innerHTML = "";
  const showPipeline = MYDAY_SECTION==="all"||MYDAY_SECTION==="tasks"||MYDAY_SECTION==="inbox";
  const showCal      = MYDAY_SECTION==="all"||MYDAY_SECTION==="cal"||MYDAY_SECTION==="tasks";

  if(showPipeline && HS_DATA && HS_DATA.deals && HS_DATA.deals.length){
    const soonDeals = HS_DATA.deals
      .filter(d=>!DONE_STATES.has(d.stage||"") && d.closeDate)
      .sort((a,b)=>new Date(a.closeDate)-new Date(b.closeDate))
      .slice(0,10);
    if(soonDeals.length){
      const sideHdr = document.createElement("div");
      sideHdr.className = "myday-sidebar-hdr";
      sideHdr.textContent = "🏆 PIPELINE CLOSING SOON";
      sidebar.appendChild(sideHdr);
      for(const d of soonDeals){
        const dr = document.createElement("div");
        dr.className = "myday-deal-row";
        const dd2 = daysDiff(d.closeDate);
        const dCls = dd2<0?"overdue":dd2<=14?"soon":"";
        const amt = d.amount ? (HS_DATA.currency||"€")+Number(d.amount).toLocaleString("en") : "";
        if(HS_DATA.portalId){ dr.style.cursor="pointer"; dr.addEventListener("click",()=>window.open(\`https://app.hubspot.com/contacts/\${HS_DATA.portalId}/deal/\${d.id}\`,"_blank")); }
        dr.innerHTML = \`
          <span class="myday-deal-name">\${d.name||"(untitled)"}</span>
          \${amt?'<span class="myday-deal-amt">'+amt+'</span>':""}
          <span class="myday-deal-date \${dCls}">\${dd2===0?"Today":dd2<0?Math.abs(dd2)+"d ago":fmtDate(d.closeDate)}</span>
        \`;
        sidebar.appendChild(dr);
      }
    }
  }

  // ── Calendar sidebar ──────────────────────────────────────────────────────
  if(showCal){
    const calHdr = document.createElement("div");
    calHdr.className = "myday-sidebar-hdr";
    calHdr.style.marginTop = showPipeline?"12px":"0";
    calHdr.textContent = "📅 TODAY'S SCHEDULE";
    sidebar.appendChild(calHdr);

    if(GOOGLE_DATA && GOOGLE_DATA.calendar && GOOGLE_DATA.calendar.today && GOOGLE_DATA.calendar.today.length){
      for(const ev of GOOGLE_DATA.calendar.today){
        const er = document.createElement("div");
        er.className = "myday-deal-row";
        if(er.style) er.style.cursor="default";
        const st = ev.start ? new Date("1970-01-01T"+(ev.start.includes("T")?ev.start.split("T")[1]:ev.start)).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}) : ev.start||"";
        const en = ev.end   ? new Date("1970-01-01T"+(ev.end.includes("T")?ev.end.split("T")[1]:ev.end)).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}) : ev.end||"";
        const ppl = ev.numAttendees>1 ? \`\${ev.numAttendees} people\` : "";
        const loc = ev.location ? \`<span class="myday-deal-date" style="color:var(--text-dim);font-style:italic">\${ev.location.slice(0,30)}</span>\`:"";
        er.innerHTML = \`
          <span class="myday-deal-name">\${ev.title||"(untitled)"}</span>
          \${ppl?'<span class="myday-deal-date">'+ppl+'</span>':""}
          \${loc}
          <span class="myday-deal-date">\${st}\${en&&en!==st?" – "+en:""}</span>
        \`;
        sidebar.appendChild(er);
      }
    } else {
      const noCal = document.createElement("div");
      noCal.className = "myday-coming-card";
      noCal.innerHTML = \`<span class="myday-coming-icon">📅</span><div class="myday-coming-text"><div class="myday-coming-title">GOOGLE CALENDAR</div><div class="myday-coming-desc">Run "Morning Brief" task to populate</div></div>\`;
      sidebar.appendChild(noCal);
    }

    // ── Upcoming events ─────────────────────────────────────────────────────
    if(GOOGLE_DATA && GOOGLE_DATA.calendar && GOOGLE_DATA.calendar.upcoming && GOOGLE_DATA.calendar.upcoming.length){
      const upHdr = document.createElement("div");
      upHdr.className = "myday-sidebar-hdr";
      upHdr.style.marginTop = "12px";
      upHdr.textContent = "📆 COMING UP";
      sidebar.appendChild(upHdr);
      for(const ev of GOOGLE_DATA.calendar.upcoming.slice(0,5)){
        const er = document.createElement("div");
        er.className = "myday-deal-row";
        const d = ev.date ? new Date(ev.date) : (ev.start ? new Date(ev.start) : null);
        const dateStr = d ? d.toLocaleDateString("en-GB",{weekday:"short",day:"2-digit",month:"short"}) : "";
        const st = ev.start||"";
        er.innerHTML = \`
          <span class="myday-deal-name">\${ev.title||"(untitled)"}</span>
          <span class="myday-deal-date">\${dateStr}\${st?" · "+st:""}</span>
        \`;
        sidebar.appendChild(er);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// CLAUDE AI DAILY BRIEF
// ═══════════════════════════════════════════════════════════════════════════
const CLAUDE_KEY_STORAGE = "anthropic_api_key_supplied";
let CLAUDE_HISTORY = [];
let CLAUDE_VIEW_NAME = null;

function getClaudeKey(){ return localStorage.getItem(CLAUDE_KEY_STORAGE)||""; }
function setClaudeKey(k){ if(k) localStorage.setItem(CLAUDE_KEY_STORAGE,k); else localStorage.removeItem(CLAUDE_KEY_STORAGE); }
function openClaudeKeyModal(){
  const ov=document.getElementById("claude-key-overlay");
  const inp=document.getElementById("claude-key-input");
  if(ov) ov.classList.add("open"); if(inp){ inp.value=getClaudeKey(); inp.focus(); }
}
function closeClaudeKeyModal(){ const ov=document.getElementById("claude-key-overlay"); if(ov) ov.classList.remove("open"); }
function saveClaudeKey(){
  const inp=document.getElementById("claude-key-input");
  const st=document.getElementById("claude-key-status");
  const k=(inp&&inp.value||"").trim();
  if(!k){ if(st) st.textContent="Please enter a key."; return; }
  setClaudeKey(k); closeClaudeKeyModal(); CLAUDE_HISTORY=[];
  if(currentTab==="myday") renderMyDay();
}
function buildDataContext(){
  const lines=[];
  lines.push("TODAY: "+new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}));
  if(GANTT_DATA){
    const allIss=[];
    for(const ini of (GANTT_DATA.initiatives||[])){
      if(DONE_STATES.has(ini.status||"")) continue;
      for(const proj of (ini.projects||[])){
        if(DONE_STATES.has(proj.status||"")) continue;
        for(const iss of (proj.issues||[])){ if(isActive(iss.status)) allIss.push(iss); }
      }
    }
    const blocked=allIss.filter(i=>i.status==="Blocked");
    const overdue=allIss.filter(i=>i.end&&i.end<TODAY_STR);
    const dueToday=allIss.filter(i=>i.end===TODAY_STR);
    lines.push("\nLINEAR: "+allIss.length+" open issues");
    if(blocked.length) lines.push("BLOCKED ("+blocked.length+"): "+blocked.slice(0,3).map(i=>i.title).join("; "));
    if(overdue.length) lines.push("OVERDUE ("+overdue.length+"): "+overdue.slice(0,5).map(i=>(i.assignee?i.assignee+": ":"")+i.title).join("; "));
    if(dueToday.length) lines.push("DUE TODAY: "+dueToday.map(i=>i.title).join("; "));
  }
  if(HS_DATA){
    const todayMs=new Date().setHours(0,0,0,0);
    const closing=(HS_DATA.deals||[]).filter(d=>d.closeDate&&!DONE_STATES.has(d.stageLabel||"")).map(d=>({...d,diff:Math.ceil((new Date(d.closeDate)-todayMs)/864e5)})).filter(d=>d.diff<=14).sort((a,b)=>a.diff-b.diff).slice(0,5);
    if(closing.length){
      lines.push("\nDEALS CLOSING SOON:");
      for(const d of closing) lines.push("  "+d.name+(d.amount?" (\u20AC"+Number(d.amount).toLocaleString()+")")+" - "+(d.diff<0?Math.abs(d.diff)+"d overdue":d.diff===0?"TODAY":"in "+d.diff+"d")+" ["+d.stageLabel+"]");
    }
  }
  if(GOOGLE_DATA){
    const ep=(GOOGLE_DATA.email_priorities||[]).slice(0,5);
    if(ep.length){ lines.push("\nEMAILS TO ACTION:"); for(const e of ep) lines.push("  ["+e.action.toUpperCase()+"] "+e.subject+" - "+e.reason); }
    const cal=GOOGLE_DATA.calendar;
    if(cal&&(cal.today||[]).length){ lines.push("\nMEETINGS TODAY:"); for(const ev of cal.today) lines.push("  "+ev.title+(ev.start?" @ "+ev.start:"")); }
    else lines.push("\nMEETINGS: None today");
    const dp=(GOOGLE_DATA.drive_priorities||[]).slice(0,3);
    if(dp.length){ lines.push("\nDRIVE PRIORITIES:"); for(const d of dp) lines.push("  ["+d.action.toUpperCase()+"] "+d.subject); }
  }
  return lines.join("\n");
}
function buildSystemPrompt(){
  const name=CLAUDE_VIEW_NAME||"the user";
  return "You are a direct, sharp personal productivity assistant for "+name+" at Supplied.eu (B2B SaaS company).\n\nCurrent work data:\n"+buildDataContext()+"\n\nStyle rules: max 120 words unless asked for more. No flattery. Plain text only, no markdown, no bullet points unless specifically asked. Focus on the 3-4 most critical actions. Never repeat context already mentioned in the conversation.";
}
async function callClaudeStream(messages,onChunk,onDone,onError){
  const key=getClaudeKey();
  if(!key){ openClaudeKeyModal(); return; }
  try{
    const res=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"x-api-key":key,"anthropic-version":"2023-06-01","content-type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model:"claude-opus-4-5-20251101",max_tokens:600,system:buildSystemPrompt(),messages,stream:true}),
    });
    if(res.status===401){ setClaudeKey(""); openClaudeKeyModal(); onError("Invalid API key \u2014 please re-enter."); return; }
    if(!res.ok){ onError("API error "+res.status); return; }
    const reader=res.body.getReader(); const dec=new TextDecoder(); let buf="";
    while(true){
      const {done,value}=await reader.read(); if(done) break;
      buf+=dec.decode(value,{stream:true});
      const lines=buf.split("\n"); buf=lines.pop();
      for(const line of lines){
        if(!line.startsWith("data: ")) continue;
        const data=line.slice(6).trim(); if(data==="[DONE]") continue;
        try{ const ev=JSON.parse(data); if(ev.type==="content_block_delta"&&ev.delta&&ev.delta.text) onChunk(ev.delta.text); }catch(_){}
      }
    }
    onDone();
  }catch(e){ onError("Connection error: "+e.message); }
}
function appendClaudeMsg(role,text){
  const el=document.getElementById("claude-msgs"); if(!el) return;
  const wrap=document.createElement("div"); if(role==="user") wrap.className="claude-msg-user";
  const txt=document.createElement("div"); txt.className="claude-msg-text"; txt.textContent=text;
  wrap.appendChild(txt); el.appendChild(wrap); el.scrollTop=el.scrollHeight;
}
function streamClaudeReply(userMsg,silent){
  const msgsEl=document.getElementById("claude-msgs");
  const sendBtn=document.getElementById("claude-send-btn");
  if(sendBtn) sendBtn.disabled=true;
  CLAUDE_HISTORY.push({role:"user",content:userMsg});
  if(!silent) appendClaudeMsg("user",userMsg);
  const think=document.createElement("div"); think.className="claude-msg-thinking"; think.textContent="Thinking\u2026";
  if(msgsEl){ msgsEl.appendChild(think); msgsEl.scrollTop=msgsEl.scrollHeight; }
  let full=""; let textEl=null;
  callClaudeStream(CLAUDE_HISTORY,
    (chunk)=>{
      if(!textEl){
        if(think.parentNode) think.remove();
        const wrap=document.createElement("div");
        textEl=document.createElement("div"); textEl.className="claude-msg-text";
        wrap.appendChild(textEl); if(msgsEl) msgsEl.appendChild(wrap);
      }
      full+=chunk; textEl.textContent=full; if(msgsEl) msgsEl.scrollTop=msgsEl.scrollHeight;
    },
    ()=>{ CLAUDE_HISTORY.push({role:"assistant",content:full}); if(sendBtn) sendBtn.disabled=false; },
    (err)=>{ if(think.parentNode) think.remove(); appendClaudeMsg("assistant","\u26A0\uFE0F "+err); if(sendBtn) sendBtn.disabled=false; }
  );
}
function sendClaudeMsg(){
  const inp=document.getElementById("claude-inp");
  const msg=(inp&&inp.value||"").trim(); if(!msg) return;
  if(inp) inp.value="";
  if(!getClaudeKey()){ openClaudeKeyModal(); return; }
  streamClaudeReply(msg,false);
}
function renderClaudeBrief(container,personName){
  CLAUDE_VIEW_NAME=personName;
  const panel=document.createElement("div"); panel.className="claude-panel"; panel.id="claude-panel";
  const hdr=document.createElement("div"); hdr.className="claude-panel-hdr";
  const lbl=document.createElement("span"); lbl.textContent="\uD83E\uDD16  CLAUDE \u00B7 DAILY BRIEF";
  const keyBtn=document.createElement("button"); keyBtn.className="cpanel-key-btn"; keyBtn.textContent="\u2699 API KEY"; keyBtn.onclick=openClaudeKeyModal;
  hdr.appendChild(lbl); hdr.appendChild(keyBtn); panel.appendChild(hdr);
  const msgs=document.createElement("div"); msgs.className="claude-msgs"; msgs.id="claude-msgs"; panel.appendChild(msgs);
  const inRow=document.createElement("div"); inRow.className="claude-input-row";
  const inp=document.createElement("input"); inp.type="text"; inp.id="claude-inp"; inp.placeholder="Ask me anything about your day\u2026";
  inp.addEventListener("keydown",e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendClaudeMsg(); } });
  const btn=document.createElement("button"); btn.className="claude-send-btn"; btn.id="claude-send-btn"; btn.textContent="SEND"; btn.onclick=sendClaudeMsg;
  inRow.appendChild(inp); inRow.appendChild(btn); panel.appendChild(inRow);
  container.appendChild(panel);
  const key=getClaudeKey();
  if(!key){
    const noKey=document.createElement("div"); noKey.className="claude-msg-text"; noKey.style.cssText="color:var(--text-dim);font-size:11.5px;";
    noKey.textContent="Connect your Anthropic API key (\u2699 above) to get a personalised daily brief and ask follow-up questions about your day.";
    msgs.appendChild(noKey);
  } else if(CLAUDE_HISTORY.length===0){
    streamClaudeReply("Give me a sharp daily brief \u2014 what are my top 3-4 most important actions right now? Be direct and specific.",true);
  } else {
    for(const m of CLAUDE_HISTORY){ if(m.role==="assistant") appendClaudeMsg("assistant",m.content); }
  }
}

// INIT / REFRESH
// ═══════════════════════════════════════════════════════════════════════════
async function init(){
  const btn=document.getElementById("refresh-btn");
  if(btn) btn.classList.add("loading");
  renderGantt();
  try {
    // Load Linear gantt data
    const gr=await fetch('./gantt-data.json?t='+Date.now());
    if(!gr.ok) throw new Error('HTTP '+gr.status);
    GANTT_DATA=await gr.json();
    const el=document.getElementById("refresh-time");
    if(el&&GANTT_DATA.refreshedAt) el.textContent="UPDATED "+new Date(GANTT_DATA.refreshedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    populateGanttAlertBar(ganttComputeStats(GANTT_DATA));
    renderGantt();
  } catch(err){
    console.error("Failed to load gantt-data.json",err);
    ganttBody.innerHTML='<div style="padding:40px;text-align:center;color:#ef4444;font-size:11px;letter-spacing:0.5px">Failed to load Linear data — check console.</div>';
    const el=document.getElementById("refresh-time"); if(el) el.textContent="ERROR";
  }

  // Load HubSpot data (optional — won't fail the page if missing)
  try {
    const hr=await fetch('./hubspot-data.json?t='+Date.now());
    if(hr.ok){
      HS_DATA=await hr.json();
      if(HS_DATA&&(HS_DATA.tasks||HS_DATA.deals)){
        populateSalesAlertBar(opsComputeStats(HS_DATA));
        populateOwnerStrip(HS_DATA);
        renderOps();
      } else { renderOpsEmpty(); }
    } else { renderOpsEmpty(); }
  } catch(e){ renderOpsEmpty(); }

  // Load Google data for current person (google-data-{name}.json → fallback google-data.json)
  // detectMyName() may return null if data not loaded yet — loadGoogleDataFor handles that
  const myPersonKey = MYDAY_PERSON==="all" ? null
    : MYDAY_PERSON==="me" ? detectMyName()
    : MYDAY_PERSON;
  await loadGoogleDataFor(myPersonKey);

  // Always render My Day (works with whatever data has loaded)
  renderMyDay();

  if(btn) btn.classList.remove("loading");
}

// ═══════════════════════════════════════════════════════════════════════════
// ON-DEMAND REFRESH — triggers GitHub Actions workflow via PAT
// ═══════════════════════════════════════════════════════════════════════════
const GH_OWNER    = "jjrozario";
const GH_REPO     = "roadmap";
const GH_WORKFLOW = "refresh.yml";
const PAT_KEY     = "gh_pat_supplied_dashboard";

function getStoredPat(){ return localStorage.getItem(PAT_KEY)||""; }
function setStoredPat(t){ if(t) localStorage.setItem(PAT_KEY,t); else localStorage.removeItem(PAT_KEY); }

function openPatModal(){
  const ov=document.getElementById("pat-overlay");
  const inp=document.getElementById("pat-input");
  if(ov) ov.classList.add("open");
  if(inp){ inp.value=getStoredPat(); inp.focus(); }
}
function closePatModal(){
  const ov=document.getElementById("pat-overlay");
  if(ov) ov.classList.remove("open");
}
function savePat(){
  const inp=document.getElementById("pat-input");
  const st=document.getElementById("pat-status");
  const token=(inp&&inp.value||"").trim();
  if(!token){ if(st) st.textContent="Please enter a token."; return; }
  setStoredPat(token);
  closePatModal();
  doRefresh();
}

async function triggerWorkflow(token){
  const url=\`https://api.github.com/repos/\${GH_OWNER}/\${GH_REPO}/actions/workflows/\${GH_WORKFLOW}/dispatches\`;
  const res=await fetch(url,{
    method:"POST",
    headers:{"Authorization":"token "+token,"Accept":"application/vnd.github+json","Content-Type":"application/json"},
    body:JSON.stringify({ref:"main",inputs:{reason:"Dashboard on-demand refresh"}}),
  });
  return res.status===204; // 204 = accepted
}

async function pollWorkflowDone(token, maxWaitMs=120000){
  const url=\`https://api.github.com/repos/\${GH_OWNER}/\${GH_REPO}/actions/workflows/\${GH_WORKFLOW}/runs?per_page=1&branch=main\`;
  const deadline=Date.now()+maxWaitMs;
  await new Promise(r=>setTimeout(r,5000)); // give GitHub 5s to register the run
  while(Date.now()<deadline){
    try{
      const res=await fetch(url,{headers:{"Authorization":"token "+token,"Accept":"application/vnd.github+json"}});
      if(res.ok){
        const data=await res.json();
        const run=data.workflow_runs&&data.workflow_runs[0];
        if(run&&(run.status==="completed"||run.conclusion==="success")) return true;
        if(run&&run.conclusion==="failure") return false;
      }
    }catch(e){ /* keep polling */ }
    await new Promise(r=>setTimeout(r,5000));
  }
  return false; // timed out — reload anyway
}

function setRefreshLabel(text, cls){
  const btn=document.getElementById("refresh-btn");
  if(!btn) return;
  btn.classList.remove("loading","running","done");
  if(cls) btn.classList.add(cls);
  btn.innerHTML=\`<span class="spin">↻</span> \${text}\`;
}

async function doRefresh(){
  const token=getStoredPat();
  if(!token){ openPatModal(); return; }

  setRefreshLabel("TRIGGERING…","loading");
  let triggered=false;
  try{ triggered=await triggerWorkflow(token); } catch(e){}

  if(!triggered){
    // Token might be invalid/expired — clear it and ask again
    setStoredPat("");
    setRefreshLabel("REFRESH","");
    openPatModal();
    return;
  }

  setRefreshLabel("RUNNING…","running");
  const done=await pollWorkflowDone(token);
  setRefreshLabel(done?"DONE — RELOADING…":"RELOADING…","done");
  await new Promise(r=>setTimeout(r,1000));
  // Re-fetch all data and re-render (no full page reload needed)
  GANTT_DATA=null; HS_DATA=null; GOOGLE_DATA=null;
  setRefreshLabel("REFRESH","");
  init();
}
init();
</script>
</body>
</html>`;

fs.writeFileSync(outPath, html);
console.log(`✅ Built index.html (${Math.round(html.length/1024)}KB)`);
