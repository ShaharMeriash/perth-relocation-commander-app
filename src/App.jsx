import React, { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#f5f7fc;--s0:#ffffff;--s1:#f0f3fa;--s2:#e8edf7;--s3:#dce3f0;
  --bd:#cdd5e8;--bd2:#bbc5db;
  --g:#00b896;--g2:rgba(0,184,150,.12);--g3:rgba(0,184,150,.06);
  --b:#3b82f6;--b2:rgba(59,130,246,.12);
  --am:#f59e0b;--am2:rgba(245,158,11,.12);
  --re:#ef4444;--re2:rgba(239,68,68,.12);
  --t0:#1a2540;--t1:#4a5e7a;--t2:#8096b4;--t3:#c0cfe0;
  --fd:'Plus Jakarta Sans',sans-serif;--fb:'Inter',sans-serif;
  --r:10px;--rl:16px;
}
html,body,#root{height:100%;background:var(--bg);color:var(--t0);font-family:var(--fb);}

/* ── LAYOUT ── */
.app{display:flex;height:100vh;height:100dvh;overflow:hidden;}
.sidebar{width:200px;min-width:200px;background:var(--s0);border-right:1px solid var(--bd);display:flex;flex-direction:column;overflow:hidden;}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--bg);}
.page-body{flex:1;overflow-y:auto;padding:24px 28px;padding-left:max(28px,env(safe-area-inset-left));padding-right:max(28px,env(safe-area-inset-right));}

/* ── SIDEBAR ── */
.logo-area{padding:20px 16px 14px;border-bottom:1px solid var(--bd);}
.logo-name{font-family:var(--fd);font-size:13px;font-weight:800;color:var(--g);line-height:1.3;}
.logo-sub{font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:2px;margin-top:3px;}
.nav-group{padding:14px 10px 6px;}
.nav-label{font-size:9px;text-transform:uppercase;letter-spacing:2px;color:var(--t3);padding:0 8px;margin-bottom:5px;}
.nav-item{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:9px;cursor:pointer;font-size:13px;font-weight:500;color:var(--t1);transition:all .13s;margin-bottom:2px;position:relative;}
.nav-item:hover{background:var(--s1);color:var(--t0);}
.nav-item.active{background:var(--g2);color:var(--g);}
.nav-item .ni{font-size:15px;width:18px;text-align:center;flex-shrink:0;}
.nav-badge{position:absolute;right:10px;background:var(--re);color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:10px;}
.nav-bottom{margin-top:auto;padding:14px 10px;border-top:1px solid var(--bd);}

/* ── PAGE HEADER ── */
.page-header{padding:20px 28px 0;background:var(--s0);border-bottom:1px solid var(--bd);flex-shrink:0;}
.page-title{font-family:var(--fd);font-size:22px;font-weight:800;color:var(--t0);}
.page-sub{font-size:12px;color:var(--t1);margin-top:3px;padding-bottom:16px;}
.tabs{display:flex;gap:0;border-bottom:none;margin-top:14px;}
.tab{padding:10px 16px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:none;color:var(--t2);border-bottom:2px solid transparent;font-family:var(--fb);transition:all .13s;letter-spacing:.2px;}
.tab.on{color:var(--g);border-bottom-color:var(--g);}
.tab:hover:not(.on){color:var(--t1);}

/* ── CURRENCY TOGGLE ── */
.cur-toggle{display:flex;gap:3px;}
.cur-btn{padding:5px 10px;border-radius:7px;font-size:10px;font-weight:700;cursor:pointer;border:1px solid var(--bd);background:none;color:var(--t2);font-family:var(--fb);transition:all .1s;}
.cur-btn.on{background:var(--g);color:#080d1a;border-color:var(--g);}

/* ── CARDS ── */
.card{background:var(--s0);border:1px solid var(--bd);border-radius:var(--rl);padding:16px;margin-bottom:12px;}
.card-title{font-family:var(--fd);font-size:13px;font-weight:700;color:var(--t0);margin-bottom:12px;}
.stat-card{background:var(--s0);border:1px solid var(--bd);border-radius:var(--rl);padding:18px;}
.stat-label{font-size:10px;text-transform:uppercase;letter-spacing:1.2px;color:var(--t2);}
.stat-val{font-family:var(--fd);font-size:26px;font-weight:800;margin-top:4px;line-height:1;}
.stat-sub{font-size:11px;color:var(--t1);margin-top:5px;}
.vg{color:var(--g);}.vb{color:var(--b);}.vam{color:var(--am);}.vr{color:var(--re);}

/* ── GRID ── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.gc2{grid-column:span 2;}
.gc3{grid-column:span 3;}

/* ── PROGRESS BAR ── */
.pbar{height:4px;background:var(--s3);border-radius:2px;overflow:hidden;margin-top:8px;}
.pfill{height:100%;border-radius:2px;transition:width .6s ease;}
.pfill.g{background:var(--g);}
.pfill.b{background:var(--b);}
.pfill.am{background:var(--am);}

/* ── TAGS ── */
.tag{display:inline-flex;align-items:center;padding:2px 7px;border-radius:20px;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;cursor:default;}
.tg{background:var(--g2);color:var(--g);}
.tb{background:var(--b2);color:var(--b);}
.tam{background:var(--am2);color:var(--am);}
.tr{background:var(--re2);color:#f87171;}
.t3{background:rgba(74,96,128,.2);color:var(--t2);}
.tbd{background:rgba(74,96,128,.2);color:var(--t2);}
.tprog{background:var(--b2);color:var(--b);}
.tdone{background:var(--g2);color:var(--g);}
.tirr{background:rgba(44,56,80,.4);color:var(--t3);text-decoration:line-through;}

/* ── OWNER AVATAR ── */
.ava{width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0;}
.ava-R{background:rgba(0,212,170,.18);color:var(--g);}
.ava-S{background:rgba(59,130,246,.18);color:var(--b);}
.ava-K{background:rgba(245,158,11,.18);color:var(--am);}
.ava-B{background:rgba(139,92,246,.18);color:#a78bfa;}
.ava-E{background:rgba(74,96,128,.2);color:var(--t2);}

/* ── ACTION CARDS ── */
.acard{background:var(--s1);border:1px solid var(--bd);border-radius:var(--r);padding:12px 14px;margin-bottom:8px;transition:all .13s;}
.acard:hover{border-color:var(--bd2);background:var(--s2);}
.acard.done-card{opacity:.5;}
.acard-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.acard-title{font-weight:600;font-size:13px;color:var(--t0);line-height:1.4;flex:1;}
.acard-meta{display:flex;gap:5px;margin-top:7px;flex-wrap:wrap;align-items:center;}
.acard-actions{display:flex;gap:5px;flex-shrink:0;align-items:center;}

/* inline status toggle */
.status-tog{cursor:pointer;transition:all .1s;}
.status-tog:hover{opacity:.75;transform:scale(1.05);}

/* ── PBAR MINI ── */
.mini-bar{height:3px;background:var(--s3);border-radius:2px;overflow:hidden;margin-top:5px;max-width:140px;}
.mini-fill{height:100%;background:var(--g);border-radius:2px;}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:none;font-family:var(--fb);transition:all .13s;white-space:nowrap;}
.btn-g{background:var(--g);color:#080d1a;}
.btn-g:hover{background:#00c49a;transform:translateY(-1px);}
.btn-s{background:var(--s2);border:1px solid var(--bd);color:var(--t0);}
.btn-s:hover{background:var(--s3);border-color:var(--bd2);}
.btn-d{background:var(--re2);border:1px solid rgba(239,68,68,.25);color:#f87171;}
.btn-d:hover{background:rgba(239,68,68,.25);}
.btn-fl{background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:white;border:none;}
.btn-fl:hover{background:linear-gradient(135deg,#1e40af,#2563eb);}
.btn-sm{padding:5px 10px;font-size:11px;}
.btn-xs{padding:3px 8px;font-size:10px;}

/* ── MODAL ── */
.overlay{position:fixed;inset:0;background:rgba(30,40,80,.4);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);}
.modal{background:var(--s0);border:1px solid var(--bd);border-radius:20px;padding:24px;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;box-shadow:0 20px 60px rgba(30,40,80,.15);}
.modal-title{font-family:var(--fd);font-size:18px;font-weight:800;margin-bottom:18px;}
.modal-section{font-family:var(--fd);font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:1px;margin:16px 0 10px;}
.modal-footer{display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:16px;border-top:1px solid var(--bd);}
.expand-toggle{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--t2);cursor:pointer;padding:6px 0;user-select:none;}
.expand-toggle:hover{color:var(--t1);}

/* ── FORM ── */
.fg{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.fg1{display:grid;grid-template-columns:1fr;gap:10px;}
.fcol{display:flex;flex-direction:column;gap:4px;}
.fcol.span2{grid-column:span 2;}
.flabel{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--t2);font-weight:600;}
.finput,.fselect,.ftextarea{background:var(--s2);border:1px solid var(--bd);color:var(--t0);padding:8px 10px;border-radius:8px;font-size:12px;font-family:var(--fb);transition:border-color .13s;width:100%;}
.finput:focus,.fselect:focus,.ftextarea:focus{outline:none;border-color:var(--g);}
.ftextarea{resize:vertical;min-height:58px;}
.fselect option{background:var(--s1);}

/* ── SUBTASKS ── */
.sub-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--bd);}
.sub-row:last-child{border-bottom:none;}
.sub-check{width:15px;height:15px;accent-color:var(--g);cursor:pointer;flex-shrink:0;}

/* ── ALERTS ── */
.alert{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:9px;margin-bottom:7px;font-size:12px;}
.alert-w{background:var(--am2);border:1px solid rgba(245,158,11,.25);color:#fbbf24;}
.alert-r{background:var(--re2);border:1px solid rgba(239,68,68,.25);color:#f87171;}
.alert-g{background:var(--g2);border:1px solid rgba(0,212,170,.25);color:var(--g);}
.alert-b{background:var(--b2);border:1px solid rgba(59,130,246,.25);color:#93c5fd;}

/* ── TOAST ── */
.toast{position:fixed;bottom:20px;right:20px;z-index:300;background:var(--s1);border:1px solid var(--bd);border-radius:var(--r);padding:12px 16px;max-width:300px;box-shadow:0 8px 32px rgba(0,0,0,.4);animation:tslide .2s ease;font-size:12px;}
.toast.ok{border-color:rgba(0,212,170,.4);}
.toast.err{border-color:rgba(239,68,68,.4);}
.toast.inf{border-color:rgba(59,130,246,.4);}
@keyframes tslide{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}

/* ── RATES PANEL ── */
.rates-bar{display:flex;align-items:center;gap:16px;padding:10px 28px;background:var(--s0);border-top:1px solid var(--bd);font-size:11px;flex-shrink:0;}
.rate-item{display:flex;align-items:center;gap:6px;color:var(--t2);}
.rate-val{color:var(--g);font-weight:700;font-family:var(--fd);}
.rate-updated{font-size:10px;color:var(--t3);margin-left:4px;}

/* ── PhD GATE ── */
.phd-gate{background:linear-gradient(135deg,rgba(245,158,11,.08),rgba(245,158,11,.03));border:1px solid rgba(245,158,11,.3);border-radius:var(--rl);padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px;}
.phd-gate.unlocked{background:linear-gradient(135deg,rgba(0,184,150,.08),rgba(59,130,246,.06));border-color:rgba(0,184,150,.3);}
.phd-pill{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--am);font-weight:700;}
.phd-gate.unlocked .phd-pill{color:var(--g);}
.phd-name{font-family:var(--fd);font-size:14px;font-weight:700;margin-top:2px;}
.phd-hint{font-size:11px;color:var(--t1);margin-top:2px;}

/* ── COUNTDOWN ── */
.countdown{background:linear-gradient(135deg,rgba(0,184,150,.07),rgba(59,130,246,.05));border:1px solid rgba(0,184,150,.2);border-radius:var(--rl);padding:20px;box-shadow:0 4px 24px rgba(0,184,150,.08);}
.cd-label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:var(--g);}
.cd-title{font-family:var(--fd);font-size:16px;font-weight:800;margin-top:4px;}
.cd-units{display:flex;gap:8px;margin-top:14px;}
.cd-unit{flex:1;text-align:center;background:var(--s1);border:1px solid var(--bd);border-radius:10px;padding:10px 6px;}
.cd-num{font-family:var(--fd);font-size:28px;font-weight:800;color:var(--g);line-height:1;}
.cd-ulabel{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--t2);margin-top:3px;}

/* ── TODAY PAGE COLUMNS ── */
.today-cols{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px;}
.owner-col{background:var(--s0);border:1px solid var(--bd);border-radius:var(--rl);padding:14px;}
.owner-col-header{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
.owner-col-name{font-family:var(--fd);font-size:13px;font-weight:700;}

/* ── URGENT CARD ── */
.urgent-card{background:linear-gradient(135deg,var(--s1),var(--s2));border:1px solid var(--bd2);border-radius:var(--rl);padding:16px 18px;margin-bottom:14px;}
.urgent-label{font-size:9px;text-transform:uppercase;letter-spacing:2px;color:var(--am);margin-bottom:6px;}
.urgent-title{font-family:var(--fd);font-size:16px;font-weight:700;}
.urgent-meta{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;align-items:center;}
.urgent-actions{display:flex;gap:7px;margin-top:12px;}

/* ── BUDGET PULSE ── */
.budget-row{display:flex;gap:12px;margin-bottom:14px;}
.bpulse{flex:1;background:var(--s0);border:1px solid var(--bd);border-radius:var(--rl);padding:14px;}

/* ── PHASE STRIP ── */
.phase-strip{display:flex;gap:4px;margin-bottom:18px;}
.phase-block{flex:1;padding:9px 8px;border-radius:9px;border:1px solid var(--bd);background:var(--s1);text-align:center;}
.phase-block.cur{border-color:var(--g);background:var(--g3);}
.phase-name{font-weight:700;font-size:11px;}
.phase-date{font-size:10px;color:var(--t2);margin-top:1px;}
.phase-count{font-size:10px;color:var(--g);font-weight:700;margin-top:4px;}

/* ── STEP ── */
.step-row{display:flex;gap:14px;padding:13px 0;border-bottom:1px solid var(--bd);}
.step-num{width:30px;height:30px;border-radius:50%;background:var(--s2);border:2px solid var(--bd);display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-weight:800;font-size:12px;flex-shrink:0;}
.step-num.done{background:var(--g);border-color:var(--g);color:#080d1a;}

/* ── EXPENSE TABLE ── */
.exp-table{width:100%;}
.exp-hdr{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:8px;padding:8px 12px;font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:var(--t2);font-weight:700;}
.exp-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:8px;padding:9px 12px;border-top:1px solid var(--bd);font-size:12px;transition:background .1s;}
.exp-row:hover{background:var(--s1);}

/* ── DOCUMENTS ── */
.doc-row{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-bottom:1px solid var(--bd);transition:background .1s;}
.doc-row:hover{background:var(--s1);}
.doc-row:last-child{border-bottom:none;}

/* ── DOCS CATEGORY GRID ── */
.doc-cat-section{margin-bottom:20px;}
.doc-cat-header{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.doc-cat-title{font-family:var(--fd);font-size:13px;font-weight:700;color:var(--t0);}
.doc-cat-count{font-size:10px;color:var(--t2);background:var(--s2);border:1px solid var(--bd);border-radius:20px;padding:1px 8px;font-weight:600;}
.doc-cat-add{background:none;border:1px dashed var(--bd2);border-radius:7px;color:var(--t2);font-size:11px;padding:2px 9px;cursor:pointer;font-family:var(--fb);transition:all .13s;}
.doc-cat-add:hover{border-color:var(--g);color:var(--g);}
.doc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;}
.doc-cube{background:var(--s0);border:1px solid var(--bd);border-radius:var(--r);padding:12px 12px 10px;display:flex;flex-direction:column;gap:6px;transition:all .13s;position:relative;cursor:default;}
.doc-cube:hover{border-color:var(--bd2);box-shadow:0 2px 8px rgba(0,0,0,.06);}
.doc-cube.has-file{border-color:rgba(0,184,150,.3);background:var(--g3);}
.doc-cube-name{font-size:12px;font-weight:700;color:var(--t0);line-height:1.3;word-break:break-word;}
.doc-cube-meta{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:1px;}
.doc-cube-actions{display:flex;gap:4px;margin-top:4px;}
.doc-cube-file{font-size:10px;color:var(--g);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.doc-cube-nofile{font-size:10px;color:var(--t3);}
.doc-cube-exp{font-size:10px;color:var(--am);margin-top:1px;}
.doc-cube-link{font-size:10px;color:var(--t2);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
@media(max-width:580px){.doc-grid{grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;}}
.drive-btn{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:6px;font-size:10px;font-weight:700;background:#1a73e8;color:#fff;text-decoration:none;border:none;cursor:pointer;transition:opacity .13s;white-space:nowrap;}
.drive-btn:hover{opacity:.85;}
.upload-zone{border:2px dashed var(--bd2);border-radius:10px;padding:18px;text-align:center;cursor:pointer;transition:all .15s;background:var(--s2);}
.upload-zone:hover,.upload-zone.drag{border-color:var(--g);background:var(--g3);}
.upload-zone input{display:none;}
.upload-prog{height:6px;background:var(--s3);border-radius:3px;overflow:hidden;margin-top:8px;}
.upload-prog-fill{height:100%;background:var(--g);border-radius:3px;transition:width .2s;}
.drive-connect{display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--s1);border:1px solid var(--bd);border-radius:var(--r);margin-bottom:14px;}

/* ── SHOPPING ── */
.shop-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--bd);}
.shop-row:last-child{border-bottom:none;}

/* ── FLIGHT PANEL ── */
.flight-panel{background:linear-gradient(135deg,var(--s1),var(--s2));border:1px solid rgba(59,130,246,.2);border-radius:var(--rl);padding:16px 18px;margin-top:12px;}
.flight-panel-title{font-family:var(--fd);font-size:13px;font-weight:800;color:var(--t0);margin-bottom:4px;}
.flight-panel-meta{font-size:11px;color:var(--t2);margin-bottom:14px;line-height:1.7;}
.flight-panel-meta strong{color:var(--t1);}
.flight-btns{display:flex;gap:8px;flex-wrap:wrap;}
.flight-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid transparent;font-family:var(--fb);transition:all .15s;text-decoration:none;white-space:nowrap;}
.flight-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.35);}
.flight-btn-ico{font-size:15px;}
.flight-btn-name{font-weight:700;}
.flight-btn-arrow{opacity:.6;font-size:11px;}

/* ── FINANCE DASHBOARD ── */
.fin-kpi-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;}
.fin-kpi{background:var(--s0);border:1px solid var(--bd);border-radius:var(--rl);padding:14px;}
.fin-kpi-label{font-size:9px;text-transform:uppercase;letter-spacing:1.2px;color:var(--t2);}
.fin-kpi-val{font-family:var(--fd);font-size:22px;font-weight:800;margin-top:4px;line-height:1;}
.fin-kpi-sub{font-size:10px;color:var(--t1);margin-top:4px;}
.bar-chart{display:flex;flex-direction:column;gap:8px;}
.bar-row{display:flex;align-items:center;gap:8px;}
.bar-label{font-size:11px;color:var(--t1);width:130px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.bar-track{flex:1;height:10px;background:var(--s3);border-radius:5px;overflow:hidden;}
.bar-fill{height:100%;border-radius:5px;transition:width .5s ease;}
.bar-val{font-size:11px;font-weight:700;color:var(--t0);width:80px;text-align:right;flex-shrink:0;}
.timeline-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;}
.month-col{background:var(--s1);border:1px solid var(--bd);border-radius:10px;padding:10px 8px;text-align:center;}
.month-col.active{border-color:var(--g);background:var(--g3);}
.month-name{font-size:10px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px;}
.month-bar-wrap{height:60px;display:flex;align-items:flex-end;justify-content:center;margin:6px 0;}
.month-bar{width:28px;border-radius:4px 4px 0 0;transition:height .5s ease;min-height:2px;}
.month-amt{font-size:10px;font-weight:700;color:var(--g);}
.month-count{font-size:9px;color:var(--t2);margin-top:2px;}
.settled-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--bd);}
.settled-row:last-child{border-bottom:none;}
.upcoming-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--bd);}
.upcoming-row:last-child{border-bottom:none;}
@media(max-width:580px){
  .fin-kpi-row{grid-template-columns:1fr 1fr;}
  .bar-label{width:90px;}
  .bar-val{width:60px;font-size:10px;}
}

/* ── AI ADVISOR ── */
.chat-wrap{display:flex;flex-direction:column;height:100%;overflow:hidden;}
.chat-messages{flex:1;overflow-y:auto;padding:16px 16px 8px;display:flex;flex-direction:column;gap:12px;}
.chat-input-bar{padding:10px 14px;background:var(--s0);border-top:1px solid var(--bd);display:flex;gap:8px;align-items:flex-end;flex-shrink:0;}
.chat-textarea{flex:1;background:var(--s2);border:1px solid var(--bd);color:var(--t0);padding:10px 12px;border-radius:12px;font-size:13px;font-family:var(--fb);resize:none;max-height:100px;min-height:42px;transition:border-color .13s;line-height:1.4;}
.chat-textarea:focus{outline:none;border-color:var(--g);}
.chat-textarea::placeholder{color:var(--t3);}
.chat-send{background:var(--g);color:#080d1a;border:none;border-radius:10px;width:42px;height:42px;font-size:18px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .13s;}
.chat-send:disabled{background:var(--s3);color:var(--t3);cursor:not-allowed;}
.chat-send:not(:disabled):hover{background:#00c49a;}
.msg{display:flex;flex-direction:column;gap:4px;max-width:88%;}
.msg.user{align-self:flex-end;align-items:flex-end;}
.msg.ai{align-self:flex-start;align-items:flex-start;}
.msg-bubble{padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.55;white-space:pre-wrap;}
.msg.user .msg-bubble{background:var(--g);color:#080d1a;border-radius:16px 16px 4px 16px;}
.msg.ai .msg-bubble{background:var(--s1);border:1px solid var(--bd);color:var(--t0);border-radius:16px 16px 16px 4px;}
.msg-time{font-size:9px;color:var(--t3);}
.suggestions-wrap{display:flex;flex-direction:column;gap:6px;margin-top:8px;max-width:360px;}
.suggestion-card{background:var(--s2);border:1px solid var(--bd2);border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:10px;transition:all .13s;}
.suggestion-card:hover{border-color:var(--g);background:var(--g3);}
.suggestion-card-info{flex:1;}
.suggestion-card-title{font-size:12px;font-weight:600;color:var(--t0);}
.suggestion-card-meta{font-size:10px;color:var(--t2);margin-top:2px;}
.suggestion-add-btn{background:var(--g);color:#080d1a;border:none;border-radius:7px;padding:5px 11px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;}
.suggestion-add-btn:disabled{background:var(--s3);color:var(--t3);cursor:default;}
.chat-thinking{display:flex;gap:4px;align-items:center;padding:10px 14px;background:var(--s1);border:1px solid var(--bd);border-radius:16px;width:fit-content;}
.chat-dot{width:6px;height:6px;border-radius:50%;background:var(--t2);animation:dotpulse 1.2s infinite;}
.chat-dot:nth-child(2){animation-delay:.2s;}
.chat-dot:nth-child(3){animation-delay:.4s;}
@keyframes dotpulse{0%,80%,100%{opacity:.3;transform:scale(.8);}40%{opacity:1;transform:scale(1);}}

.divider{height:1px;background:var(--bd);margin:12px 0;}

/* ── FILTER BAR ── */
.filter-bar{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-bottom:14px;}
.search-in{background:var(--s1);border:1px solid var(--bd);color:var(--t0);padding:7px 12px;border-radius:8px;font-size:12px;font-family:var(--fb);flex:1;min-width:160px;}
.search-in:focus{outline:none;border-color:var(--g);}
.search-in::placeholder{color:var(--t3);}
.fsel{background:var(--s1);border:1px solid var(--bd);color:var(--t0);padding:7px 10px;border-radius:8px;font-size:11px;font-family:var(--fb);cursor:pointer;}
.fsel:focus{outline:none;border-color:var(--g);}
.fsel option{background:var(--s1);}

/* ── DONE COLLAPSE ── */
.done-toggle{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--t2);cursor:pointer;padding:6px 0;user-select:none;}
.done-toggle:hover{color:var(--t1);}

/* ── RESPONSIVE ── */
@media(max-width:820px){
  .sidebar{display:none;}
  .app{flex-direction:column;}
  .main{padding-bottom:58px;}
  .page-body{padding:14px 14px 20px;}
  .page-header{padding:14px 14px 0;}
  .page-title{font-size:19px;}
  .page-sub{font-size:11px;padding-bottom:12px;}
  .tabs{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
  .tabs::-webkit-scrollbar{display:none;}
  .tab{padding:8px 13px;font-size:11px;white-space:nowrap;}
  .g3{grid-template-columns:1fr 1fr;}
  .gc2,.gc3{grid-column:span 2;}
  .today-cols{grid-template-columns:1fr;}
  .exp-hdr,.exp-row{grid-template-columns:2fr 1fr 1fr 1fr;}
  .rates-bar{flex-wrap:wrap;gap:8px;padding:8px 14px;}
  .filter-bar{gap:6px;}
  .filter-bar .search-in{min-width:100%;}
  .modal{padding:18px;border-radius:18px;max-height:92vh;}
  .stat-val{font-size:22px;}
  .cd-num{font-size:24px;}
  .urgent-card{padding:14px;}
  .countdown{padding:14px;}
  .acard{padding:11px 12px;}
}
@media(max-width:580px){
  .page-body{padding:12px 12px 20px;}
  .g2,.g3{grid-template-columns:1fr;}
  .gc2,.gc3{grid-column:span 1;}
  .budget-row{flex-direction:column;}
  .flight-btns{flex-direction:column;}
  .flight-btn{justify-content:center;}
  .fg{grid-template-columns:1fr;}
  .fcol.span2{grid-column:span 1;}
  .exp-hdr{display:none;}
  .exp-row{grid-template-columns:1fr 1fr;gap:4px;}
  .cost-row{flex-direction:column;gap:6px;}
}

/* ── MOBILE BOTTOM NAV ── */
.mobile-nav{
  display:none;
  position:fixed;bottom:0;left:0;right:0;
  background:var(--s0);
  border-top:1px solid var(--bd);
  height:58px;
  padding-bottom:env(safe-area-inset-bottom);
  z-index:100;
  box-shadow:0 -4px 20px rgba(0,0,0,.3);
}
.mobile-nav-inner{
  display:flex;
  height:58px;
  align-items:center;
  justify-content:space-around;
  padding:0 2px;
}
.mob-nav-item{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:2px;padding:4px 8px;border-radius:10px;cursor:pointer;
  min-width:44px;flex:1;position:relative;transition:all .13s;
  -webkit-tap-highlight-color:transparent;
}
.mob-nav-item.active{background:var(--g2);}
.mob-nav-item .mob-ic{font-size:17px;line-height:1;}
.mob-nav-item .mob-lbl{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;color:var(--t2);}
.mob-nav-item.active .mob-lbl{color:var(--g);}
.mob-nav-badge{position:absolute;top:2px;right:4px;background:var(--re);color:#fff;font-size:8px;font-weight:700;padding:1px 4px;border-radius:10px;}
@media(max-width:820px){
  .mobile-nav{display:block;}
  .main{padding-bottom:58px;}
}

/* ── MOBILE CURRENCY BAR ── */
.mob-cur-bar{
  display:none;
  align-items:center;gap:8px;
  padding:8px 14px;
  background:var(--s0);
  border-bottom:1px solid var(--bd);
  flex-shrink:0;
}
.mob-cur-label{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--t3);}
@media(max-width:820px){
  .mob-cur-bar{display:flex;}
}
`;

// ─── FLIGHT DEEP LINKS ────────────────────────────────────────────────────────
// One-way TLV→PER · 2 adults · 2 children · 1 stop · June 20 2026 · ±5 days
const FLIGHT_LINKS = [
  {
    id: "google",
    name: "Google Flights",
    icon: "🔍",
    color: "#4285F4",
    colorDim: "rgba(66,133,244,.13)",
    label: "Google",
    // Google Flights: /search?tfs encodes badly, so use clean query URL
    // adults=2 children=2 via query string approach — Google reads pax from URL
    url: "https://www.google.com/travel/flights/search?tfs=CBwQARoeEgoyMDI2LTA2LTIwagcIARIDVExWcgcIARIDUEVSGAIgASoECAIQAg%3D%3D&hl=en&curr=USD",
    note: "2 adults · 2 children · Economy",
  },
  {
    id: "skyscanner",
    name: "Skyscanner",
    icon: "🌐",
    color: "#00B2EE",
    colorDim: "rgba(0,178,238,.13)",
    label: "Skyscanner",
    // Format: /transport/flights/{from}/{to}/{outbound-YYMMDD}/
    // adults, children(age), rtn=0 one-way, cabinclass, stops max
    url: "https://www.skyscanner.com/transport/flights/tlv/per/260620/?adults=2&children=2&infants=0&cabinclass=economy&rtn=0&preferdirects=false&outboundaltsenabled=true&ref=home",
    note: "Flexible dates · 1 stop filter on results page",
  },
  {
    id: "kayak",
    name: "Kayak",
    icon: "🛶",
    color: "#FF690F",
    colorDim: "rgba(255,105,15,.13)",
    label: "Kayak",
    // Format: /flights/{FROM}-{TO}/{date}/{pax}
    // children specified as c{age}, flexible=5 days around date
    url: "https://www.kayak.com/flights/TLV-PER/2026-06-20/2adults/children-c8-c6?sort=bestflight_a&fs=stops=1&flex=5",
    note: "±5 days flex · 1 stop · Best flights sort",
  },
];

// ─── DATA ─────────────────────────────────────────────────────────────────────
const ARRIVAL = new Date("2026-07-20T00:00:00");
const PHASES = [
  {name:"Month -6",label:"Oct–Dec 2025",date:new Date("2025-10-01")},
  {name:"Month -4",label:"Feb 2026",date:new Date("2026-02-01")},
  {name:"Month -3",label:"Mar 2026",date:new Date("2026-03-01")},
  {name:"Month -2",label:"Apr 2026",date:new Date("2026-04-01")},
  {name:"Month -1",label:"May 2026",date:new Date("2026-05-01")},
  {name:"Month 0 Arrival",label:"Jun 2026",date:new Date("2026-06-01")},
];
const JOURNEY_STEPS = [
  {id:"j1",n:1,title:"Prepare Passports",desc:"All family passports valid 2+ years past arrival",aid:"a2"},
  {id:"j2",n:2,title:"PhD Acceptance – UWA",desc:"Receive official UWA acceptance letter",aid:"a1"},
  {id:"j3",n:3,title:"Apostille Documents",desc:"Notarise & apostille key civil documents",aid:"a3"},
  {id:"j4",n:4,title:"OSHC & Visa Application",desc:"Pay health insurance and submit subclass 500",aid:"a6"},
  {id:"j5",n:5,title:"Medical Exams & Biometrics",desc:"Health checks required for visa",aid:"a7"},
  {id:"j6",n:6,title:"Book Flights TLV → PER",desc:"Purchase one-way flights for family of 4",aid:"a9"},
  {id:"j7",n:7,title:"Find Accommodation",desc:"Secure rental housing near UWA in Perth",aid:"a13"},
  {id:"j8",n:8,title:"Enrol Kids in School",desc:"TIWA placement + fee waiver",aid:"a10"},
  {id:"j9",n:9,title:"Setup AU Bank & Wise",desc:"Transfer settlement funds to AUD",aid:"a16"},
  {id:"j10",n:10,title:"PhD Starts at UWA 🎓",desc:"July 20, 2026 — begin new chapter!",aid:""},
];

// ─── PLANS & ITEMS ────────────────────────────────────────────────────────────
const SEED_PLANS = [
  {id:"p1", title:"PhD & University",    icon:"🎓", color:"#00d4aa", desc:"UWA acceptance, enrollment, student ID"},
  {id:"p2", title:"Visa & Immigration",  icon:"🛂", color:"#3b82f6", desc:"Passports, documents, apostille, visa application"},
  {id:"p3", title:"Travel",              icon:"✈️",  color:"#8b5cf6", desc:"Flight booking and transport on arrival"},
  {id:"p4", title:"Housing",             icon:"🏠", color:"#f59e0b", desc:"Temporary stay and finding permanent rental"},
  {id:"p5", title:"Kids & Schools",      icon:"📚", color:"#ec4899", desc:"School enrollment, fee waiver, uniforms"},
  {id:"p6", title:"Finance & Admin",     icon:"💰", color:"#10b981", desc:"Bank, TFN, MyGov, utilities, contracts"},
  {id:"p7", title:"Vehicle",             icon:"🚗", color:"#f97316", desc:"Car purchase, license conversion, car seats"},
  {id:"p8", title:"Health & Medical",    icon:"🏥", color:"#ef4444", desc:"OSHC, Medicare, immunisation records"},
];

const SEED_ITEMS = [
  // ── P1: PhD & University ──
  {id:"a1", planId:"p1", title:"Getting accepted to PhD by UWA", desc:"PhD acceptance is the foundational milestone that enables all other relocation activities.", owner:"Shahar", priority:"High", status:"in progress", phase:"Month -6", ddate:"2026-03-01", cost:"", cur:"ILS", cost2:"", cur2:"AUD", vendor:"University of Western Australia", comments:"", subs:[{id:"s1",t:"Submit application",done:true},{id:"s2",t:"Receive confirmation email",done:false}]},
  {id:"a12",planId:"p1", title:"Apply for USI (Unique Student ID)", desc:"Mandatory for all students in Australia. Do online after landing.", owner:"Shahar", priority:"High", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-07-20", cost:"", cur:"AUD", cost2:"", cur2:"ILS", vendor:"Australian Government", comments:"", subs:[]},
  {id:"a29",planId:"p1", title:"UWA Student Services Fee (SSAF)", desc:"Mandatory student services fee at UWA.", owner:"Shahar", priority:"Medium", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-07-20", cost:"351", cur:"AUD", cost2:"", cur2:"ILS", vendor:"UWA", comments:"", subs:[]},

  // ── P2: Visa & Immigration ──
  {id:"a2", planId:"p2", title:"Passport Renewal", desc:"Ensure all passports have 2+ years validity past arrival date.", owner:"Raz", priority:"High", status:"tbd", phase:"Month -6", ddate:"2026-01-15", cost:"", cur:"ILS", cost2:"", cur2:"AUD", vendor:"", comments:"", subs:[]},
  {id:"a3", planId:"p2", title:"Apostille Documents", desc:"Get marriage & birth certificates translated and apostilled.", owner:"Shahar", priority:"Medium", status:"in progress", phase:"Month -6", ddate:"2026-02-01", cost:"1500", cur:"ILS", cost2:"400", cur2:"ILS", vendor:"Notary / Israeli Foreign Affairs", comments:"ILS 1500 translations + ILS 400 apostille fee", subs:[]},
  {id:"a4", planId:"p2", title:"Request Entry/Exit Records (10 years)", desc:"Get 'Ishur Knisot VeYitziot' from Population Authority for visa GTE statement.", owner:"Raz", priority:"High", status:"tbd", phase:"Month -6", ddate:"2026-02-01", cost:"", cur:"ILS", cost2:"", cur2:"AUD", vendor:"Israeli Population Authority", comments:"", subs:[]},
  {id:"a8", planId:"p2", title:"Verify UWA Medibank Waiver", desc:"Confirm UWA's deal with Medibank waives the 12-month waiting period.", owner:"Shahar", priority:"Medium", status:"tbd", phase:"Month -4", ddate:"2026-03-01", cost:"", cur:"AUD", cost2:"", cur2:"ILS", vendor:"Medibank", comments:"", subs:[]},
  {id:"a6", planId:"p2", title:"OSHC & Visa Application", desc:"Pay health insurance and submit subclass 500 student visa.", owner:"Shahar", priority:"High", status:"tbd", phase:"Month -4", ddate:"2026-03-01", cost:"37000", cur:"AUD", cost2:"3590", cur2:"AUD", vendor:"Home Affairs AU / Medibank", comments:"OSHC Family 4yr: A$37,000 + Student+Spouse+Kids visas: A$3,590", subs:[]},
  {id:"a7", planId:"p2", title:"Medical Exams & Biometrics", desc:"Health examinations required for visa application.", owner:"Both", priority:"High", status:"tbd", phase:"Month -3", ddate:"2026-04-01", cost:"2400", cur:"ILS", cost2:"", cur2:"AUD", vendor:"Assuta / IOM Israel", comments:"", subs:[]},
  {id:"a5", planId:"p2", title:"Confirm 100-Point ID Check", desc:"Gather Passport, AU Bank Statement, Rental Lease for local ID score.", owner:"Both", priority:"High", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-07-25", cost:"", cur:"AUD", cost2:"", cur2:"ILS", vendor:"", comments:"", subs:[]},

  // ── P3: Travel ──
  {id:"a9", planId:"p3", title:"Book Flight TLV → PER", desc:"One-way flights for family of 4. This date anchors all time-sensitive tasks.", owner:"Shahar", priority:"High", status:"tbd", phase:"Month -3", ddate:"2026-04-01", cost:"18500", cur:"ILS", cost2:"", cur2:"AUD", vendor:"Airline", comments:"", subs:[]},
  {id:"a31",planId:"p3", title:"SmartRider & Interim Car Rental", desc:"Public transport cards + 7-day rental car until SUV purchase.", owner:"Both", priority:"High", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-07-22", cost:"100", cur:"AUD", cost2:"600", cur2:"AUD", vendor:"Transperth / Hertz / Sixt", comments:"SmartRider: A$100 + Car rental 7 days: A$600", subs:[]},
  {id:"a26",planId:"p3", title:"Ship Personal Belongings", desc:"Arrange sea or air freight container for personal items.", owner:"Raz", priority:"Medium", status:"tbd", phase:"Month -1", ddate:"2026-05-20", cost:"8000", cur:"USD", cost2:"", cur2:"ILS", vendor:"", comments:"", subs:[]},

  // ── P4: Housing ──
  {id:"a14",planId:"p4", title:"Temporary Airbnb (14 days)", desc:"Short-term accommodation on arrival while finding permanent rental.", owner:"Both", priority:"High", status:"tbd", phase:"Month -2", ddate:"2026-05-01", cost:"8500", cur:"ILS", cost2:"", cur2:"AUD", vendor:"Airbnb", comments:"", subs:[]},
  {id:"a13",planId:"p4", title:"Find Rental Accommodation in Perth", desc:"Secure housing near UWA — Nedlands / Subiaco area.", owner:"Both", priority:"High", status:"tbd", phase:"Month -3", ddate:"2026-04-15", cost:"", cur:"AUD", cost2:"", cur2:"ILS", vendor:"", comments:"", subs:[]},
  {id:"a15",planId:"p4", title:"Rental Bond + First 2 Weeks Upfront", desc:"Attend at least 5 viewings in first week after arrival.", owner:"Both", priority:"High", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-07-27", cost:"3400", cur:"AUD", cost2:"1700", cur2:"AUD", vendor:"Real Estate Agent", comments:"Bond 4wk: A$3,400 + 2wk upfront: A$1,700", subs:[]},
  {id:"a27",planId:"p4", title:"Utility Connection Fees", desc:"Connect electricity, gas, internet at new Perth rental.", owner:"Both", priority:"Medium", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-07-31", cost:"300", cur:"AUD", cost2:"", cur2:"ILS", vendor:"Synergy / Alinta", comments:"", subs:[]},

  // ── P5: Kids & Schools ──
  {id:"a10",planId:"p5", title:"Enrol Kids in School (TIWA)", desc:"Contact TIWA for placement confirmation.", owner:"Shahar", priority:"High", status:"tbd", phase:"Month -3", ddate:"2026-05-01", cost:"", cur:"AUD", cost2:"", cur2:"ILS", vendor:"TIWA / WA Dept of Education", comments:"", subs:[]},
  {id:"a11",planId:"p5", title:"Apply for TIWA Fee Waiver", desc:"Submit PhD CoE to WA Education to waive $15k/year school fees per child.", owner:"Shahar", priority:"High", status:"tbd", phase:"Month -2", ddate:"2026-05-01", cost:"", cur:"AUD", cost2:"", cur2:"ILS", vendor:"WA Department of Education", comments:"Critical — saves ~$30k/year", subs:[]},
  {id:"a30",planId:"p5", title:"School Admin Fees + Uniforms", desc:"Admin fees x2 children + winter/summer uniform sets.", owner:"Shahar", priority:"Medium", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-08-01", cost:"600", cur:"AUD", cost2:"800", cur2:"AUD", vendor:"WA Dept of Education / School Shop", comments:"Admin: A$600 + Uniforms & Books: A$800", subs:[]},
  {id:"a24",planId:"p5", title:"Working with Children Check (WWCC)", desc:"Both parents need this for volunteering at kids' schools.", owner:"Both", priority:"Medium", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-08-01", cost:"11", cur:"AUD", cost2:"", cur2:"ILS", vendor:"WA Government", comments:"", subs:[]},

  // ── P6: Finance & Admin ──
  {id:"a16",planId:"p6", title:"Setup Wise / AU Bank Account", desc:"Transfer initial settlement funds to AUD before arrival.", owner:"Raz", priority:"High", status:"tbd", phase:"Month -1", ddate:"2026-06-01", cost:"", cur:"AUD", cost2:"", cur2:"ILS", vendor:"Commonwealth Bank / ANZ / Wise", comments:"", subs:[]},
  {id:"a17",planId:"p6", title:"Apply for TFN", desc:"Tax File Number application for both parents.", owner:"Both", priority:"Medium", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-07-25", cost:"", cur:"AUD", cost2:"", cur2:"ILS", vendor:"ATO", comments:"", subs:[]},
  {id:"a18",planId:"p6", title:"Setup MyGov & MyGovID", desc:"Link Visa, ATO, and Health records for digital management.", owner:"Both", priority:"High", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-07-25", cost:"", cur:"AUD", cost2:"", cur2:"ILS", vendor:"Australian Government", comments:"", subs:[]},
  {id:"a25",planId:"p6", title:"Terminate Israeli Contracts", desc:"Cancel Arnona, Electricity, Water, Internet before departure.", owner:"Raz", priority:"Medium", status:"tbd", phase:"Month -1", ddate:"2026-06-15", cost:"", cur:"ILS", cost2:"", cur2:"AUD", vendor:"", comments:"", subs:[]},
  {id:"a23",planId:"p6", title:"Join 'Israelis in Perth' FB Group", desc:"Local networking for 'Buy Nothing' furniture and community advice.", owner:"Both", priority:"Low", status:"tbd", phase:"Month -2", ddate:"", cost:"", cur:"AUD", cost2:"", cur2:"ILS", vendor:"Facebook", comments:"", subs:[]},
  {id:"a28",planId:"p6", title:"Initial Grocery Stockup", desc:"First big grocery shop after arrival.", owner:"Shahar", priority:"Medium", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-07-22", cost:"700", cur:"AUD", cost2:"", cur2:"ILS", vendor:"Coles / Woolworths", comments:"", subs:[]},

  // ── P7: Vehicle ──
  {id:"a19",planId:"p7", title:"Buy Family Car", desc:"Visit Osborne Park/Canning Vale for SUV. Toyota RAV4 or similar (2018-20).", owner:"Raz", priority:"High", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-07-31", cost:"22000", cur:"AUD", cost2:"1400", cur2:"AUD", vendor:"Private/Dealer", comments:"Car: A$22,000 + Rego & Insurance: A$1,400", subs:[]},
  {id:"a20",planId:"p7", title:"WA Driver's License Conversion", desc:"Driving instructor + theory test + PDA. Mandatory for Israeli license holders.", owner:"Raz", priority:"High", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-08-15", cost:"235", cur:"AUD", cost2:"", cur2:"ILS", vendor:"Transport WA", comments:"Theory: A$25 + PDA: A$150 + License: A$60", subs:[]},

  // ── P8: Health & Medical ──
  {id:"a21",planId:"p8", title:"Register with Medicare", desc:"Check if any temporary Medicare access applies. Verify OSHC card covers gaps.", owner:"Shahar", priority:"Medium", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-07-31", cost:"100", cur:"AUD", cost2:"", cur2:"ILS", vendor:"St John WA / Medicare", comments:"Ambulance cover extra: A$100", subs:[]},
  {id:"a22",planId:"p8", title:"Update AIR (Immunisation Register)", desc:"Translate kids' Pink Book and give to GP to upload to Medicare/AIR.", owner:"Shahar", priority:"High", status:"tbd", phase:"Month 0 Arrival", ddate:"2026-08-01", cost:"", cur:"AUD", cost2:"", cur2:"ILS", vendor:"Local GP", comments:"", subs:[]},
];
const SEED_DOCS = [
  {id:"d1",type:"Passport – Raz",category:"Identity",exp:"2030-05-12",aid:"a2",notes:"Renew if <2yr validity past Jul 2026"},
  {id:"d2",type:"Passport – Shahar",category:"Identity",exp:"2029-11-08",aid:"a2",notes:""},
  {id:"d3",type:"Passport – Child 1",category:"Identity",exp:"2028-03-15",aid:"a2",notes:""},
  {id:"d4",type:"Passport – Child 2",category:"Identity",exp:"2027-09-22",aid:"a2",notes:""},
  {id:"d5",type:"Marriage Certificate (Apostilled)",category:"Legal",exp:"",aid:"a3",notes:""},
  {id:"d6",type:"Birth Certificates x2 (Apostilled)",category:"Legal",exp:"",aid:"a3",notes:""},
  {id:"d7",type:"OSHC Insurance Certificate",category:"Visa",exp:"",aid:"a6",notes:""},
  {id:"d8",type:"Student Visa – Shahar (500)",category:"Visa",exp:"",aid:"a6",notes:""},
  {id:"d9",type:"Dependent Visa – Raz",category:"Visa",exp:"",aid:"a6",notes:""},
  {id:"d10",type:"Dependent Visas – Children x2",category:"Visa",exp:"",aid:"a6",notes:""},
  {id:"d11",type:"Entry/Exit Records (10 years)",category:"Legal",exp:"",aid:"a4",notes:"From Israeli Population Authority"},
  {id:"d12",type:"UWA Acceptance / CoE Letter",category:"Education",exp:"",aid:"a1",notes:"Required for TIWA fee waiver & visa"},
  {id:"d13",type:"Hebrew–English Translations",category:"Legal",exp:"",aid:"a3",notes:"NAATI certified translator"},
];
const SEED_SHOP = [
  // Appliances
  {id:"sh1",name:"Fridge (400L+ Used)",store:"Facebook Marketplace",cost:450,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:"Buy secondhand to save cost"},
  {id:"sh2",name:"Washing Machine (Front Load)",store:"Facebook Marketplace",cost:350,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:""},
  {id:"sh3",name:"Microwave & Kettle",store:"Kmart",cost:120,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:""},
  {id:"sh4",name:"Portable Reverse Cycle Heaters x2",store:"Kmart",cost:200,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:"Perth rentals are cold in June — essential for kids' rooms"},
  {id:"sh5",name:"Laundry Airer (Clothes Horse)",store:"IKEA",cost:30,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:"Dryers are expensive to run in AU"},
  // Furniture
  {id:"sh6",name:"Queen Bed & Mattress",store:"IKEA",cost:850,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:""},
  {id:"sh7",name:"Kids Single Beds x2",store:"IKEA",cost:600,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:""},
  {id:"sh8",name:"Sofa (3 Seater)",store:"IKEA / Kmart",cost:650,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:""},
  {id:"sh9",name:"Dining Table + 4 Chairs",store:"IKEA",cost:300,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:""},
  {id:"sh10",name:"Study Desk & Chair",store:"IKEA",cost:250,owner:"Raz",phase:"Month 0 Arrival",done:false,notes:"For PhD study"},
  {id:"sh11",name:"Camping Chairs (Initial Seating)",store:"BCF / Kmart",cost:40,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:"Cheap seating while waiting for sofa delivery"},
  // Bedding
  {id:"sh12",name:"Bedding & Towels",store:"Kmart",cost:300,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:""},
  {id:"sh13",name:"Electric Blankets",store:"Target / Kmart",cost:100,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:"June is coldest month — rentals lack central heating"},
  // Electronics
  {id:"sh14",name:"55-inch Smart TV",store:"JB Hi-Fi",cost:450,owner:"Raz",phase:"Month 0 Arrival",done:false,notes:""},
  {id:"sh15",name:"AU Power Board & Adapters",store:"Kmart",cost:40,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:"To use Israeli laptops/chargers"},
  // Kitchen
  {id:"sh16",name:"Kitchen Starter Kit",store:"Kmart",cost:200,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:"Pots, pans, utensils"},
  // Vehicle
  {id:"sh17",name:"Child Car Seats x2",store:"Baby Bunting / Marketplace",cost:500,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:"Must meet AU safety standards — Israeli seats are often illegal here"},
  // Other
  {id:"sh18",name:"Raincoats & Wellies (Family)",store:"Kmart",cost:150,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:"June is peak rainy season in Perth"},
  {id:"sh19",name:"Sunscreen & Hats (Bulk)",store:"Chemist Warehouse",cost:50,owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:"UV in WA is extreme even in winter"},
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getCountdown(){
  const d = ARRIVAL - new Date();
  if(d<=0) return {D:0,H:0,M:0,S:0};
  return {D:Math.floor(d/86400000),H:Math.floor(d%86400000/3600000),M:Math.floor(d%3600000/60000),S:Math.floor(d%60000/1000)};
}
function conv(v,from,rates,to){
  if(!v||isNaN(+v)) return 0;
  let ils=+v;
  if(from==="AUD") ils*=rates.AUD;
  else if(from==="USD") ils*=rates.USD;
  if(to==="ILS") return ils;
  if(to==="AUD") return ils/rates.AUD;
  if(to==="USD") return ils/rates.USD;
  return ils;
}
function fmt(v,cur){
  const sym={ILS:"₪",AUD:"A$",USD:"$"}[cur]||"₪";
  return sym+Math.round(v).toLocaleString();
}
function totalCostILS(a, rates){
  // If cost2 is in ILS, use it directly (most accurate)
  if(a.cost2&&+a.cost2>0&&(a.cur2||"AUD")==="ILS") return +a.cost2;
  // If cost1 is in ILS, use it directly
  if(a.cost&&+a.cost>0&&a.cur==="ILS") return +a.cost;
  // Otherwise convert cost1 to ILS (ignore cost2 — same transaction different currency)
  return conv(a.cost, a.cur, rates, "ILS");
}
function totalIncomeILS(a, rates){
  if(!a.income||!+a.income) return 0;
  return conv(a.income, a.incomeCur||"ILS", rates, "ILS");
}
function stCls(s){return s==="in progress"?"tprog":s==="done"?"tdone":s==="irrelevant"?"tirr":"tbd";}
function prCls(p){return p==="High"?"tr":p==="Medium"?"tam":"t3";}
function ownerInit(o){return(o||"?")[0];}
function ownerCls(o){return "ava-"+(o||"E")[0];}
function csvDl(data,name){
  if(!data.length)return;
  const keys=Object.keys(data[0]).filter(k=>k!=="subs");
  const rows=[keys.join(","),...data.map(r=>keys.map(k=>JSON.stringify(r[k]??"")).join(","))];
  const a=Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([rows.join("\n")],{type:"text/csv"})),download:name});
  a.click();
}
const STATUS_CYCLE = {tbd:"in progress","in progress":"done",done:"tbd",irrelevant:"tbd"};

// ─── GOOGLE DRIVE ─────────────────────────────────────────────────────────────
const DRIVE_ROOT = "1EHKk_Umg2xqxIDsgrGo9txE1p0kS93pT";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";

function loadGIS(){
  return new Promise(resolve=>{
    if(window.google?.accounts?.oauth2) return resolve();
    const s=document.createElement("script");
    s.src="https://accounts.google.com/gsi/client";
    s.onload=resolve;
    document.head.appendChild(s);
  });
}
async function driveReq(token,path,opts={}){
  const res=await fetch(`https://www.googleapis.com/drive/v3/${path}`,{
    ...opts,
    headers:{Authorization:`Bearer ${token}`,..."Content-Type" in(opts.headers||{})?{}:{"Content-Type":"application/json"},...(opts.headers||{})}
  });
  if(!res.ok){const t=await res.text();throw new Error(`Drive ${res.status}: ${t}`);}
  return res.json();
}
async function driveFindFolder(token,name,parentId){
  const q=`name='${name.replace(/'/g,"\\'")}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
  const d=await driveReq(token,`files?q=${encodeURIComponent(q)}&fields=files(id,name)`);
  return d.files?.[0]||null;
}
async function driveCreateFolder(token,name,parentId){
  return driveReq(token,"files",{method:"POST",body:JSON.stringify({name,mimeType:"application/vnd.google-apps.folder",parents:[parentId]})});
}
async function driveEnsureFolder(token,name,parentId){
  const ex=await driveFindFolder(token,name,parentId);
  return ex||driveCreateFolder(token,name,parentId);
}
function driveUploadFile(token,file,folderId,onProgress){
  return new Promise((resolve,reject)=>{
    const boundary="prc_bound_9f3a";
    const meta=JSON.stringify({name:file.name,parents:[folderId]});
    const pre=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${file.type||"application/octet-stream"}\r\n\r\n`;
    const post=`\r\n--${boundary}--`;
    const body=new Blob([pre,file,post]);
    const xhr=new XMLHttpRequest();
    xhr.open("POST","https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink");
    xhr.setRequestHeader("Authorization",`Bearer ${token}`);
    xhr.setRequestHeader("Content-Type",`multipart/related; boundary=${boundary}`);
    xhr.upload.onprogress=e=>{if(e.lengthComputable)onProgress(Math.round(e.loaded/e.total*100));};
    xhr.onload=()=>xhr.status<300?resolve(JSON.parse(xhr.responseText)):reject(new Error(`Upload ${xhr.status}: ${xhr.responseText}`));
    xhr.onerror=()=>reject(new Error("Network error"));
    xhr.send(body);
  });
}

// ─── LOCALSTORAGE HOOK ────────────────────────────────────────────────────────
function useLS(key, def){
  const [val,setVal] = useState(()=>{
    try{ const s=window.localStorage.getItem(key); return s?JSON.parse(s):def; }catch{ return def; }
  });
  const set = v => {
    const next = typeof v==="function"?v(val):v;
    setVal(next);
    try{ window.localStorage.setItem(key,JSON.stringify(next)); }catch{}
  };
  return [val,set];
}

// ─── GOOGLE DRIVE HOOK ────────────────────────────────────────────────────────
function useGoogleDrive(){
  const [token,setToken] = useState(null);
  const [expiry,setExpiry] = useState(0);
  const [authLoading,setAuthLoading] = useState(false);
  const clientRef = useRef(null);
  const isAuthed = !!token && Date.now()<expiry;

  const signIn = async () => {
    setAuthLoading(true);
    try{
      await loadGIS();
      const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if(!CLIENT_ID) throw new Error("VITE_GOOGLE_CLIENT_ID not set");
      if(!clientRef.current){
        clientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id:CLIENT_ID,
          scope:DRIVE_SCOPE,
          callback:resp=>{
            setAuthLoading(false);
            if(resp.access_token){
              setToken(resp.access_token);
              setExpiry(Date.now()+(resp.expires_in-60)*1000);
            } else setToken(null);
          },
          error_callback:()=>setAuthLoading(false)
        });
      }
      clientRef.current.requestAccessToken({prompt:""});
    }catch(e){
      setAuthLoading(false);
      throw e;
    }
  };

  const signOut = () => {
    if(token) window.google?.accounts?.oauth2?.revoke(token,()=>{});
    setToken(null); setExpiry(0); clientRef.current=null;
  };

  return {token:isAuthed?token:null,isAuthed,signIn,signOut,authLoading};
}

// ─── FIRESTORE SYNC ───────────────────────────────────────────────────────────
const FB_CFG = {
  apiKey:    import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:"perth-relocation.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId:     import.meta.env.VITE_FIREBASE_APP_ID,
};

function useFirestoreSync(state, setters) {
  const [syncStatus, setSyncStatus] = useState("off"); // off | connecting | live | error
  const [syncErr,   setSyncErr]    = useState("");
  const refRef   = useRef(null);
  const skipRef  = useRef(false);
  const timerRef = useRef(null);

  // Init + subscribe
  useEffect(() => {
    if(!FB_CFG.apiKey || !FB_CFG.projectId || !FB_CFG.appId) return;
    setSyncStatus("connecting");
    try {
      const fbApp = getApps().length ? getApps()[0] : initializeApp(FB_CFG);
      const db    = getFirestore(fbApp);
      const ref   = doc(db, "prc", "state");
      refRef.current = ref;

      const unsub = onSnapshot(ref, snap => {
        if(skipRef.current) return;
        if(!snap.exists()) { setSyncStatus("live"); return; }
        const d = snap.data();
        if(d.plans) setters.setPlans(d.plans);
        if(d.items) setters.setItems(d.items);
        if(d.docs)  setters.setDocs(d.docs);
        if(d.shop)  setters.setShop(d.shop);
        if(d.rates) setters.setRates(d.rates);
        if(d.cur)   setters.setCur(d.cur);
        setSyncStatus("live");
      }, (e) => { setSyncStatus("error"); setSyncErr(e?.code||e?.message||"unknown"); });

      return () => unsub();
    } catch(e) { setSyncStatus("error"); setSyncErr(e?.code||e?.message||"init"); }
  }, []);

  // Debounced write
  const save = useCallback(() => {
    if(!refRef.current) return;
    skipRef.current = true;
    setDoc(refRef.current, {
      plans: state.plans, items: state.items, docs: state.docs,
      shop: state.shop, rates: state.rates, cur: state.cur, _t: Date.now()
    }).then(() => setTimeout(() => { skipRef.current = false; }, 600))
      .catch(() => { skipRef.current = false; });
  }, [state.plans, state.items, state.docs, state.shop, state.rates, state.cur]);

  useEffect(() => {
    if(syncStatus !== "live") return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, 1200);
    return () => clearTimeout(timerRef.current);
  }, [state.plans, state.items, state.docs, state.shop, state.rates, state.cur, syncStatus]);

  return {status: syncStatus, err: syncErr};
}

// ─── PIE CHART ────────────────────────────────────────────────────────────────
function Pie({data}){
  const COLS=["#00d4aa","#3b82f6","#f59e0b","#ef4444","#8b5cf6"];
  const total=data.reduce((s,d)=>s+d.v,0);
  if(!total) return <div style={{color:"var(--t2)",fontSize:12,padding:"10px 0"}}>No data</div>;
  let cum=0;
  const R=38,cx=50,cy=50;
  const slices=data.map((d,i)=>{
    const pct=d.v/total,st=cum*2*Math.PI; cum+=pct;
    const en=cum*2*Math.PI;
    const x1=cx+R*Math.sin(st),y1=cy-R*Math.cos(st);
    const x2=cx+R*Math.sin(en),y2=cy-R*Math.cos(en);
    return{path:`M${cx},${cy}L${x1},${y1}A${R},${R} 0 ${pct>.5?1:0} 1 ${x2},${y2}Z`,col:COLS[i%COLS.length],...d};
  });
  return(
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      <svg width="80" height="80" style={{transform:"rotate(-90deg)",flexShrink:0}} viewBox="0 0 100 100">
        {slices.map((s,i)=><path key={i} d={s.path} fill={s.col} opacity={.9}/>)}
      </svg>
      <div style={{flex:1}}>
        {slices.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,fontSize:11}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:s.col,flexShrink:0}}/>
            <span style={{color:"var(--t1)",flex:1}}>{s.lbl}</span>
            <span style={{fontWeight:700,color:"var(--t0)"}}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App(){
  const [page,setPage] = useLS("prc_page","today");
  const [plans,setPlans] = useLS("prc_plans",SEED_PLANS);
  const [items,setItems] = useLS("prc_items",SEED_ITEMS);
  const [docs,setDocs] = useLS("prc_docs",SEED_DOCS);
  const [shop,setShop] = useLS("prc_shop",SEED_SHOP);
  const [rates,setRates] = useLS("prc_rates",{AUD:2.17,USD:3.08,upd:"Manual",fetching:false});
  const [cur,setCur] = useLS("prc_cur","ILS");
  const [toast,setToast] = useState(null);
  const [modal,setModal] = useState(null);
  const [tick,setTick] = useState(getCountdown());
  const drive = useGoogleDrive();
  const isNative = !!(typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.());

  useEffect(()=>{ const t=setInterval(()=>setTick(getCountdown()),1000); return()=>clearInterval(t); },[]);

  const {status:syncStatus, err:syncErr} = useFirestoreSync(
    {plans,items,docs,shop,rates,cur},
    {setPlans,setItems,setDocs,setShop,setRates,setCur}
  );

  const T=(msg,type="ok")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const phdDone = items.find(a=>a.id==="a1")?.status==="done";
  const overdue = items.filter(a=>a.ddate&&new Date(a.ddate)<new Date()&&a.status!=="done").length;

  const saveItem = a => {
    if(!a.title?.trim()){ T("Title is required","err"); return false; }
    setItems(prev => a.id&&prev.find(x=>x.id===a.id) ? prev.map(x=>x.id===a.id?a:x) : [...prev,{...a,id:"a"+Date.now(),subs:a.subs||[]}]);
    T("Saved ✓"); return true;
  };
  const deleteItem = id => { setItems(prev=>prev.filter(a=>a.id!==id)); T("Deleted"); };
  const cycleStatus = id => {
    setItems(prev=>prev.map(a=>a.id===id?{...a,status:STATUS_CYCLE[a.status]||"tbd"}:a));
  };

  const fetchRates = async () => {
    setRates(r=>({...r,fetching:true}));
    T("Fetching live rates…","inf");
    try{
      // exchangerate-api.com — free, no key needed for basic endpoint
      const [ilsRes, audRes] = await Promise.all([
        fetch("https://open.er-api.com/v6/latest/ILS"),
        fetch("https://open.er-api.com/v6/latest/AUD")
      ]);
      if(!ilsRes.ok||!audRes.ok) throw new Error("API error");
      const ilsData = await ilsRes.json();
      const audData = await audRes.json();
      // 1 USD in ILS = how many ILS per 1 USD
      const usdToIls = +parseFloat(ilsData.rates.USD ? 1/ilsData.rates.USD : 0).toFixed(4);
      // 1 AUD in ILS
      const audToIls = +parseFloat(audData.rates.ILS).toFixed(4);
      if(!usdToIls||!audToIls||isNaN(usdToIls)||isNaN(audToIls)) throw new Error("Bad values");
      setRates({AUD:audToIls,USD:usdToIls,upd:new Date().toLocaleDateString("en-AU"),fetching:false,ts:Date.now()});
      sessionStorage.setItem("prc_rates_fetched","1");
      T(`Rates updated ✓  A$1 = ₪${audToIls}  $1 = ₪${usdToIls}`,"ok");
    }catch(e){
      setRates(r=>({...r,fetching:false}));
      T("Could not fetch — using saved rates","err");
    }
  };

  // Auto-fetch rates: new session OR last fetch > 24h ago
  useEffect(()=>{
    const newSession = !sessionStorage.getItem("prc_rates_fetched");
    const stale = !rates.ts || (Date.now() - rates.ts > 86400000);
    if(newSession || stale) fetchRates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const fmtC = v => fmt(v,cur);

  const totEstILS = items.reduce((s,a)=>s+totalCostILS(a,rates),0);
  const totPaidILS = items.filter(a=>a.status==="done").reduce((s,a)=>s+totalCostILS(a,rates),0);
  const totEst = conv(totEstILS,"ILS",rates,cur);
  const totPaid = conv(totPaidILS,"ILS",rates,cur);
  const shopTot = shop.reduce((s,i)=>s+conv(i.cost,"AUD",rates,cur),0);

  const NAV=[
    {id:"today",ic:"🏠",lbl:"Today"},
    {id:"plan",ic:"⚡",lbl:"Plan"},
    {id:"finance",ic:"💰",lbl:"Finance"},
    {id:"advisor",ic:"🤖",lbl:"Advisor"},
    {id:"docs",ic:"📂",lbl:"Docs"},
    {id:"vault",ic:"🗂️",lbl:"Vault"},
    {id:"settings",ic:"⚙️",lbl:"Settings"},
  ];

  return(
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* SIDEBAR */}
        <nav className="sidebar">
          <div className="logo-area">
            <div className="logo-name">Perth Relocation Commander</div>
            <div className="logo-sub">Relocation OS 2026</div>
          </div>
          <div className="nav-group">
            <div className="nav-label">Navigation</div>
            {NAV.map(n=>(
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                <span className="ni">{n.ic}</span>
                <span>{n.lbl}</span>
                {n.id==="today"&&overdue>0&&<span className="nav-badge">{overdue}</span>}
              </div>
            ))}
          </div>
          <div className="nav-bottom">
            <div style={{fontSize:10,color:syncStatus==="live"?"var(--g)":syncStatus==="connecting"?"var(--am)":syncStatus==="error"?"var(--re)":"var(--t3)",display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
              <span style={{fontSize:7}}>●</span>
              {syncStatus==="live"?"Synced":syncStatus==="connecting"?"Syncing…":syncStatus==="error"?`Sync error${syncErr?" · "+syncErr:""}`:FB_CFG.apiKey?"Local only":"No Firebase"}
            </div>
          </div>
        </nav>

        {/* MAIN */}
        <div className="main">
          {page==="today" && <TodayPage items={items} plans={plans} phdDone={phdDone} tick={tick} cur={cur} rates={rates} fmtC={fmtC} totEst={totEst} totPaid={totPaid} overdue={overdue} onEdit={a=>setModal({type:"item",a})} onNew={planId=>setModal({type:"item",a:null,planId})} cycleStatus={cycleStatus} setPage={setPage}/>}
          {page==="plan"  && <PlanPage items={items} plans={plans} setPlans={setPlans} rates={rates} cur={cur} fmtC={fmtC} phdDone={phdDone} onEdit={a=>setModal({type:"item",a})} onNew={planId=>setModal({type:"item",a:null,planId})} onDelete={deleteItem} cycleStatus={cycleStatus} T={T}/>}
          {page==="finance" && <FinancePage items={items} plans={plans} rates={rates} onEdit={a=>setModal({type:"item",a})} setItems={setItems} T={T}/>}
          {page==="advisor" && <AdvisorPage items={items} plans={plans} rates={rates} onAddItem={a=>{setItems(prev=>[...prev,{...a,id:"a"+Date.now(),subs:[]}]);T("Item added to "+plans.find(p=>p.id===a.planId)?.title+" ✓");}}/>}
          {page==="docs" && <DocsPage docs={docs} setDocs={setDocs} items={items} T={T} drive={drive} isNative={isNative}/>}
          {page==="vault" && <VaultPage items={items} shop={shop} setShop={setShop} rates={rates} cur={cur} fmtC={fmtC} shopTot={shopTot} T={T}/>}
          {page==="settings" && <SettingsPage rates={rates} setRates={setRates} fetchRates={fetchRates} items={items} setItems={setItems} plans={plans} setPlans={setPlans} syncStatus={syncStatus} syncErr={syncErr}/>}

          {/* RATES BAR */}
          <div className="rates-bar">
            <div className="cur-toggle">
              {["ILS","AUD","USD"].map(c=><button key={c} className={`cur-btn ${cur===c?"on":""}`} onClick={()=>setCur(c)}>{c}</button>)}
            </div>
            <div className="rate-item">
              <span style={{color:"var(--t2)"}}>A$=₪</span>
              <span className="rate-val">{rates.AUD}</span>
            </div>
            <div className="rate-item">
              <span style={{color:"var(--t2)"}}>$=₪</span>
              <span className="rate-val">{rates.USD}</span>
            </div>
            <span className="rate-updated">Updated: {rates.upd}</span>
            <button className="btn btn-s btn-sm" style={{marginLeft:"auto"}} onClick={fetchRates} disabled={rates.fetching}>
              {rates.fetching?"⏳ Fetching…":"↻ Update Rates"}
            </button>
          </div>
        </div>
      </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className="mobile-nav">
          <div className="mobile-nav-inner">
            {NAV.map(n=>(
              <div key={n.id} className={`mob-nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                <span className="mob-ic">{n.ic}</span>
                <span className="mob-lbl">{n.lbl}</span>
                {n.id==="today"&&overdue>0&&<span className="mob-nav-badge">{overdue}</span>}
              </div>
            ))}
          </div>
        </nav>

      {/* ACTION MODAL */}
      {modal?.type==="item" && <ItemModal a={modal.a} defaultPlanId={modal.planId} plans={plans} docs={docs} setDocs={setDocs} drive={isNative?null:drive} onSave={a=>{if(saveItem(a))setModal(null);}} onClose={()=>setModal(null)}/>}
      {toast && <div className={`toast ${toast.type}`}>{toast.type==="err"?"⚠️":toast.type==="inf"?"ℹ️":"✅"} {toast.msg}</div>}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN STATUS HELPER
// ─────────────────────────────────────────────────────────────────────────────
function planStatus(planItems){
  if(!planItems.length) return "tbd";
  const nonIrr = planItems.filter(i=>i.status!=="irrelevant");
  if(!nonIrr.length) return "irrelevant";
  if(nonIrr.every(i=>i.status==="done")) return "done";
  if(nonIrr.some(i=>i.status==="in progress"||i.status==="done")) return "in progress";
  return "tbd";
}

// ─────────────────────────────────────────────────────────────────────────────
// TODAY PAGE
// ─────────────────────────────────────────────────────────────────────────────
function TodayPage({items,plans,phdDone,tick,cur,rates,fmtC,totEst,totPaid,overdue,onEdit,onNew,cycleStatus,setPage}){
  const active = items.filter(a=>a.status!=="done"&&a.status!=="irrelevant");
  const urgent = [...active].sort((a,b)=>{
    const pd={High:0,Medium:1,Low:2};
    if(a.ddate&&b.ddate) return new Date(a.ddate)-new Date(b.ddate);
    if(a.ddate) return -1; if(b.ddate) return 1;
    return pd[a.priority]-pd[b.priority];
  })[0];

  const byOwner = owner => active.filter(a=>a.owner===owner||a.owner==="Both")
    .sort((a,b)=>({High:0,Medium:1,Low:2}[a.priority]||1)-({High:0,Medium:1,Low:2}[b.priority]||1))
    .slice(0,4);

  const pct = totEst>0 ? Math.min(100,Math.round(totPaid/totEst*100)) : 0;
  const done = items.filter(a=>a.status==="done").length;
  const stCounts = ["tbd","in progress","done","irrelevant"].map(s=>({lbl:s==="in progress"?"In Progress":s[0].toUpperCase()+s.slice(1),v:items.filter(a=>a.status===s).length}));

  return(
    <>
      <div className="page-header">
        <div className="page-title">Today 🏠</div>
        <div className="page-sub">Tel Aviv → Perth · PhD starts July 20, 2026</div>
      </div>
      <div className="page-body">
        {/* PhD Gate */}
        <div className={`phd-gate ${phdDone?"unlocked":""}`}>
          <div>
            <div className="phd-pill">{phdDone?"✅ Gate Unlocked":"⚠️ Critical Gate — Pending"}</div>
            <div className="phd-name">PhD Acceptance – University of Western Australia</div>
            <div className="phd-hint">{phdDone?"Timeline active · countdown running":"Timeline is paused until acceptance is confirmed"}</div>
          </div>
          <button className="btn btn-s btn-sm" onClick={()=>onEdit(items.find(a=>a.id==="a1"))}>{phdDone?"View":"Update Status"}</button>
        </div>

        {/* Urgent + Countdown */}
        <div className="g2" style={{marginBottom:14}}>
          {urgent ? (
            <div className="urgent-card">
              <div className="urgent-label">🔥 Do This Now</div>
              <div className="urgent-title">{urgent.title}</div>
              <div className="urgent-meta">
                <span className={`tag ${stCls(urgent.status)}`}>{urgent.status}</span>
                <span className={`tag ${prCls(urgent.priority)}`}>{urgent.priority}</span>
                <div className={`ava ${ownerCls(urgent.owner)}`}>{ownerInit(urgent.owner)}</div>
                {urgent.ddate&&<span style={{fontSize:10,color:new Date(urgent.ddate)<new Date()?"var(--re)":"var(--t2)"}}>Due {urgent.ddate}</span>}
              </div>
              <div className="urgent-actions">
                <button className="btn btn-g btn-sm" onClick={()=>cycleStatus(urgent.id)}>{urgent.status==="tbd"?"▶ Start":"✓ Mark Done"}</button>
                <button className="btn btn-s btn-sm" onClick={()=>onEdit(urgent)}>Edit</button>
              </div>
              {urgent.id==="a9"&&<FlightPanel/>}
            </div>
          ) : (
            <div className="urgent-card">
              <div className="urgent-label">✅ All Clear</div>
              <div className="urgent-title">No urgent items pending</div>
              <div style={{marginTop:10}}><button className="btn btn-g btn-sm" onClick={()=>onNew(plans[0]?.id)}>+ Add Item</button></div>
            </div>
          )}
          <div className="countdown">
            <div className="cd-label">🎓 Countdown to PhD Start</div>
            <div className="cd-title">{phdDone?"Days Until July 20":"Activate after PhD ⏳"}</div>
            {phdDone ? (
              <div className="cd-units">
                {[["D",tick.D],["H",tick.H],["M",tick.M],["S",tick.S]].map(([l,v])=>(
                  <div key={l} className="cd-unit">
                    <div className="cd-num">{String(v).padStart(2,"0")}</div>
                    <div className="cd-ulabel">{l}</div>
                  </div>
                ))}
              </div>
            ):(
              <div style={{marginTop:12,color:"var(--t2)",fontSize:13}}>Mark PhD as <strong style={{color:"var(--g)"}}>Done</strong> to activate</div>
            )}
          </div>
        </div>

        {/* Budget Pulse */}
        <div className="budget-row">
          <div className="bpulse">
            <div className="stat-label">Total Estimated</div>
            <div style={{fontFamily:"var(--fd)",fontSize:22,fontWeight:800,color:"var(--g)",marginTop:3}}>{fmtC(totEst)}</div>
            <div className="pbar" style={{marginTop:8}}><div className="pfill b" style={{width:pct+"%"}}/></div>
            <div className="stat-sub">{fmtC(totPaid)} paid · {pct}% used</div>
          </div>
          <div className="bpulse">
            <div className="stat-label">Progress</div>
            <div style={{fontFamily:"var(--fd)",fontSize:22,fontWeight:800,color:"var(--b)",marginTop:3}}>{done}/{items.length}</div>
            <div className="pbar" style={{marginTop:8}}><div className="pfill g" style={{width:items.length?Math.round(done/items.length*100)+"%":"0%"}}/></div>
            <div className="stat-sub">items complete</div>
          </div>
          <div className="bpulse" style={{maxWidth:220}}>
            <div className="stat-label">Alerts</div>
            {overdue>0&&<div style={{marginTop:6}}><span className="tag tr">{overdue} overdue</span></div>}
            {!phdDone&&<div style={{marginTop:6}}><span className="tag tam">PhD pending</span></div>}
            {overdue===0&&phdDone&&<div style={{marginTop:6}}><span className="tag tg">All clear ✓</span></div>}
            <div style={{marginTop:8,fontSize:11,color:"var(--t2)"}}>{active.length} active items</div>
          </div>
        </div>

        {/* Owner Columns */}
        <div className="today-cols">
          {["Raz","Shahar"].map(owner=>(
            <div key={owner} className="owner-col">
              <div className="owner-col-header">
                <div className={`ava ${ownerCls(owner)}`} style={{width:28,height:28,fontSize:12}}>{ownerInit(owner)}</div>
                <div className="owner-col-name">{owner}'s Items</div>
                <button className="btn btn-s btn-sm" style={{marginLeft:"auto",fontSize:10}} onClick={()=>setPage("plan")}>See all →</button>
              </div>
              {byOwner(owner).map(a=>(
                <div key={a.id} className="acard" style={{marginBottom:7}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:12,color:"var(--t0)"}}>{a.title}</div>
                      <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap",alignItems:"center"}}>
                        <span className={`tag ${stCls(a.status)} status-tog`} onClick={()=>cycleStatus(a.id)}>{a.status}</span>
                        <span className={`tag ${prCls(a.priority)}`}>{a.priority}</span>
                        {a.ddate&&<span style={{fontSize:10,color:new Date(a.ddate)<new Date()&&a.status!=="done"?"var(--re)":"var(--t2)"}}>Due {a.ddate}</span>}
                      </div>
                    </div>
                    <button className="btn btn-s btn-xs" onClick={()=>onEdit(a)}>Edit</button>
                  </div>
                </div>
              ))}
              {byOwner(owner).length===0&&<div style={{color:"var(--t2)",fontSize:12,padding:"10px 0"}}>Nothing active 🎉</div>}
            </div>
          ))}
        </div>

        {/* Status chart */}
        <div className="card" style={{marginTop:14}}>
          <div className="card-title">Overall Progress</div>
          <Pie data={stCounts}/>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function PlanPage({items,plans,setPlans,rates,cur,fmtC,phdDone,onEdit,onNew,onDelete,cycleStatus,T}){
  const [tab,setTab] = useState("plans");
  return(
    <>
      <div className="page-header">
        <div className="page-title">Plan ⚡</div>
        <div className="page-sub">{plans.length} plans · {items.length} items · {items.filter(a=>a.status==="done").length} done</div>
        <div className="tabs">
          {[["plans","Plans"],["all","All Items"],["phases","By Phase"],["journey","Journey"]].map(([id,lbl])=>(
            <button key={id} className={`tab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{lbl}</button>
          ))}
        </div>
      </div>
      <div className="page-body">
        {tab==="plans"   && <PlansTab items={items} plans={plans} rates={rates} fmtC={fmtC} onEdit={onEdit} onNew={onNew} onDelete={onDelete} cycleStatus={cycleStatus} T={T}/>}
        {tab==="all"     && <AllItemsTab items={items} plans={plans} onEdit={onEdit} onNew={()=>onNew(plans[0]?.id)} onDelete={onDelete} cycleStatus={cycleStatus} rates={rates} fmtC={fmtC} T={T}/>}
        {tab==="phases"  && <PhasesTab items={items} onEdit={onEdit}/>}
        {tab==="journey" && <JourneyTab items={items} phdDone={phdDone}/>}
      </div>
    </>
  );
}

// ── PLANS TAB — shows plan cards with aggregated data ──
function PlansTab({items,plans,rates,fmtC,onEdit,onNew,onDelete,cycleStatus,T}){
  const [expanded,setExpanded] = useState({});
  const toggle = id => setExpanded(e=>({...e,[id]:!e[id]}));

  return(
    <>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <button className="btn btn-g" onClick={()=>onNew(plans[0]?.id)}>+ New Item</button>
      </div>
      {plans.map(plan=>{
        const pi = items.filter(i=>i.planId===plan.id);
        const ps = planStatus(pi);
        const total = pi.reduce((s,i)=>s+totalCostILS(i,rates),0);
        const done = pi.filter(i=>i.status==="done").length;
        const pct = pi.length ? Math.round(done/pi.length*100) : 0;
        const isOpen = expanded[plan.id];
        const phases = [...new Set(pi.map(i=>i.phase).filter(Boolean))];
        return(
          <div key={plan.id} className="card" style={{marginBottom:10,borderLeft:`3px solid ${plan.color}`}}>
            {/* Plan Header */}
            <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>toggle(plan.id)}>
              <span style={{fontSize:20}}>{plan.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:14,color:"var(--t0)"}}>{plan.title}</div>
                <div style={{fontSize:11,color:"var(--t2)",marginTop:1}}>{plan.desc}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <span className={`tag ${stCls(ps)}`}>{ps}</span>
                <span style={{fontSize:10,color:"var(--t2)"}}>{done}/{pi.length} items</span>
              </div>
              <span style={{fontSize:16,color:"var(--t2)",marginLeft:4}}>{isOpen?"▾":"▸"}</span>
            </div>

            {/* Plan Stats */}
            <div style={{display:"flex",gap:12,marginTop:10,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:120}}>
                <div className="pbar"><div className="pfill" style={{width:pct+"%",background:plan.color}}/></div>
                <div style={{fontSize:10,color:"var(--t2)",marginTop:3}}>{pct}% complete</div>
              </div>
              {total>0&&<span style={{fontSize:12,fontWeight:700,color:plan.color}}>₪{Math.round(total).toLocaleString()}</span>}
              {phases.length>0&&<span style={{fontSize:10,color:"var(--t2)"}}>{phases.join(" · ")}</span>}
            </div>

            {/* Items List (expanded) */}
            {isOpen&&(
              <div style={{marginTop:12,borderTop:"1px solid var(--bd)",paddingTop:10}}>
                {pi.map(a=>(
                  <div key={a.id} className={`acard ${a.status==="done"||a.status==="irrelevant"?"done-card":""}`} style={{marginBottom:6}}>
                    <div className="acard-top">
                      <div style={{flex:1}}>
                        <div className="acard-title">{a.title}</div>
                        {a.desc&&<div style={{fontSize:11,color:"var(--t1)",marginTop:2}}>{a.desc}</div>}
                        <div className="acard-meta">
                          <span className={`tag ${stCls(a.status)} status-tog`} onClick={()=>cycleStatus(a.id)}>{a.status}</span>
                          <span className={`tag ${prCls(a.priority)}`}>{a.priority}</span>
                          <div className={`ava ${ownerCls(a.owner)}`}>{ownerInit(a.owner)}</div>
                          {a.ddate&&<span style={{fontSize:10,color:new Date(a.ddate)<new Date()&&a.status!=="done"?"var(--re)":"var(--t2)"}}>Due {a.ddate}</span>}
                          {(a.cost||a.cost2)&&<span style={{fontSize:11,color:"var(--g)",fontWeight:600}}>₪{Math.round(totalCostILS(a,rates)).toLocaleString()}</span>}
                        </div>
                        {a.subs?.length>0&&<div style={{marginTop:5}}><div className="mini-bar"><div className="mini-fill" style={{width:`${a.subs.filter(s=>s.done).length/a.subs.length*100}%`}}/></div><div style={{fontSize:10,color:"var(--t2)",marginTop:2}}>{a.subs.filter(s=>s.done).length}/{a.subs.length} subtasks</div></div>}
                      </div>
                      <div className="acard-actions">
                        <button className="btn btn-s btn-sm" onClick={()=>onEdit(a)}>Edit</button>
                        <button className="btn btn-d btn-sm" onClick={()=>onDelete(a.id)}>✕</button>
                      </div>
                    </div>
                    {a.id==="a9"&&<FlightPanel/>}
                  </div>
                ))}
                <button className="btn btn-s btn-sm" style={{marginTop:6,width:"100%",justifyContent:"center"}} onClick={()=>onNew(plan.id)}>+ Add Item to {plan.title}</button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ── ALL ITEMS TAB ──
function AllItemsTab({items,plans,onEdit,onNew,onDelete,cycleStatus,rates,fmtC,T}){
  const [fSt,setFSt] = useState("all");
  const [fOw,setFOw] = useState("all");
  const [fPr,setFPr] = useState("all");
  const [fPl,setFPl] = useState("all");
  const [q,setQ] = useState("");
  const [showDone,setShowDone] = useState(false);

  const filtered = items.filter(a=>{
    if(!showDone&&(a.status==="done"||a.status==="irrelevant")) return false;
    if(fSt!=="all"&&a.status!==fSt) return false;
    if(fOw!=="all"&&a.owner!==fOw) return false;
    if(fPr!=="all"&&a.priority!==fPr) return false;
    if(fPl!=="all"&&a.planId!==fPl) return false;
    if(q&&!a.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const doneCount = items.filter(a=>a.status==="done"||a.status==="irrelevant").length;

  return(
    <>
      <div className="filter-bar">
        <input className="search-in" placeholder="🔍 Search items..." value={q} onChange={e=>setQ(e.target.value)}/>
        <select className="fsel" value={fSt} onChange={e=>setFSt(e.target.value)}>
          <option value="all">All Status</option>
          {["tbd","in progress","done","irrelevant"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select className="fsel" value={fOw} onChange={e=>setFOw(e.target.value)}>
          <option value="all">All Owners</option>
          {["Raz","Shahar","Both","Kids","External"].map(o=><option key={o} value={o}>{o}</option>)}
        </select>
        <select className="fsel" value={fPr} onChange={e=>setFPr(e.target.value)}>
          <option value="all">All Priority</option>
          {["High","Medium","Low"].map(p=><option key={p} value={p}>{p}</option>)}
        </select>
        <select className="fsel" value={fPl} onChange={e=>setFPl(e.target.value)}>
          <option value="all">All Plans</option>
          {plans.map(p=><option key={p.id} value={p.id}>{p.icon} {p.title}</option>)}
        </select>
        <button className="btn btn-s btn-sm" onClick={()=>{csvDl(items.map(a=>({plan:plans.find(p=>p.id===a.planId)?.title,title:a.title,owner:a.owner,priority:a.priority,status:a.status,phase:a.phase,cost:a.cost,cur:a.cur,cost2:a.cost2,cur2:a.cur2,ddate:a.ddate})),"items.csv");T("Exported ✓");}}>↓ CSV</button>
        <button className="btn btn-g" onClick={onNew}>+ New Item</button>
      </div>
      {filtered.length===0&&<div style={{color:"var(--t2)",textAlign:"center",padding:"32px 0"}}>No items match filters</div>}
      {filtered.map(a=>{
        const plan = plans.find(p=>p.id===a.planId);
        return(
          <div key={a.id} className={`acard ${a.status==="done"||a.status==="irrelevant"?"done-card":""}`}>
            <div className="acard-top">
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                  {plan&&<span style={{fontSize:9,color:plan.color,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px"}}>{plan.icon} {plan.title}</span>}
                </div>
                <div className="acard-title">{a.title}</div>
                {a.desc&&<div style={{fontSize:11,color:"var(--t1)",marginTop:2}}>{a.desc}</div>}
                <div className="acard-meta">
                  <span className={`tag ${stCls(a.status)} status-tog`} onClick={()=>cycleStatus(a.id)}>{a.status}</span>
                  <span className={`tag ${prCls(a.priority)}`}>{a.priority}</span>
                  <div className={`ava ${ownerCls(a.owner)}`}>{ownerInit(a.owner)}</div>
                  {a.phase&&<span style={{fontSize:10,color:"var(--t2)"}}>📅 {a.phase}</span>}
                  {a.ddate&&<span style={{fontSize:10,color:new Date(a.ddate)<new Date()&&a.status!=="done"?"var(--re)":"var(--t2)"}}>Due {a.ddate}</span>}
                  {(a.cost||a.cost2)&&<span style={{fontSize:11,color:"var(--g)",fontWeight:600}}>{a.cost?`${a.cur} ${a.cost}`:""}{a.cost&&a.cost2?" + ":""}{a.cost2?`${a.cur2||"AUD"} ${a.cost2}`:""}</span>}
                </div>
                {a.subs?.length>0&&<div style={{marginTop:5}}><div className="mini-bar"><div className="mini-fill" style={{width:`${a.subs.filter(s=>s.done).length/a.subs.length*100}%`}}/></div><div style={{fontSize:10,color:"var(--t2)",marginTop:2}}>{a.subs.filter(s=>s.done).length}/{a.subs.length} subtasks</div></div>}
              </div>
              <div className="acard-actions">
                <button className="btn btn-s btn-sm" onClick={()=>onEdit(a)}>Edit</button>
                <button className="btn btn-d btn-sm" onClick={()=>onDelete(a.id)}>✕</button>
              </div>
            </div>
            {a.id==="a9"&&<FlightPanel/>}
          </div>
        );
      })}
      <div className="done-toggle" onClick={()=>setShowDone(s=>!s)}>
        <span>{showDone?"▾":"▸"}</span>
        <span>{showDone?`Hide completed/irrelevant`:`Show ${doneCount} completed / irrelevant`}</span>
      </div>
    </>
  );
}

function PhasesTab({items,onEdit}){
  const now=new Date();
  const curPhaseIdx = PHASES.reduce((b,p,i)=>now>=p.date?i:b,0);
  return(
    <>
      <div className="phase-strip">
        {PHASES.map((p,i)=>(
          <div key={p.name} className={`phase-block ${i===curPhaseIdx?"cur":""}`}>
            <div className="phase-name">{p.name}</div>
            <div className="phase-date">{p.label}</div>
            <div className="phase-count">{items.filter(a=>a.phase===p.name).length}</div>
          </div>
        ))}
      </div>
      {PHASES.map(p=>{
        const pa=items.filter(a=>a.phase===p.name);
        if(!pa.length) return null;
        return(
          <div key={p.name} className="card" style={{marginBottom:10}}>
            <div className="card-title">{p.name} <span style={{color:"var(--t2)",fontWeight:400,fontSize:12}}>— {p.label}</span></div>
            {pa.map(a=>(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid var(--bd)",cursor:"pointer"}} onClick={()=>onEdit(a)}>
                <span style={{flex:1,fontSize:12,fontWeight:500}}>{a.title}</span>
                <div className={`ava ${ownerCls(a.owner)}`}>{ownerInit(a.owner)}</div>
                <span className={`tag ${stCls(a.status)}`}>{a.status}</span>
                {a.ddate&&<span style={{fontSize:10,color:"var(--t2)",minWidth:78}}>{a.ddate}</span>}
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

function JourneyTab({items,phdDone}){
  return(
    <>
      {!phdDone&&<div className="alert alert-w" style={{marginBottom:14}}>🔒 Complete PhD acceptance at UWA to unlock the full journey</div>}
      <div className="card">
        {JOURNEY_STEPS.map((step,i)=>{
          const linked=items.find(a=>a.id===step.aid);
          const isDone=linked?linked.status==="done":false;
          const locked=!phdDone&&i>0;
          return(
            <div key={step.id} className="step-row" style={{opacity:locked?.38:1}}>
              <div className={`step-num ${isDone?"done":""}`}>{isDone?"✓":step.n}</div>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{step.title}{locked?" 🔒":""}</div>
                <div style={{fontSize:11,color:"var(--t1)",marginTop:2}}>{step.desc}</div>
                {linked&&<div style={{marginTop:5}}><span className={`tag ${stCls(linked.status)}`}>{linked.status}</span></div>}
                {step.id==="j6"&&<FlightPanel/>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VAULT PAGE
// ─────────────────────────────────────────────────────────────────────────────
function DocsPage({docs,setDocs,items,T,drive,isNative}){
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Auto-trigger Drive connect when page opens (requires user gesture on first visit,
  // but GIS will skip the popup silently on subsequent visits if already consented)
  const connectRef = useRef(false);
  useEffect(()=>{
    if(!isNative && CLIENT_ID && drive && !drive.isAuthed && !drive.authLoading && !connectRef.current){
      connectRef.current = true;
      // Small delay so the page renders first — keeps it feeling responsive
      setTimeout(()=>drive.signIn().catch(()=>{ connectRef.current=false; }), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return(
    <>
      <div className="page-header">
        <div className="page-title">Documents 📂</div>
        <div className="page-sub">Upload files directly to Google Drive · organised by category</div>
      </div>
      <div className="page-body">
        {isNative?(
          <div className="alert alert-b" style={{marginBottom:14}}>
            🖥️ Drive upload is available on the <strong>web app</strong>. Files linked via web are viewable here.
          </div>
        ):(
          <>
            {!CLIENT_ID&&(
              <div className="alert alert-w" style={{marginBottom:14}}>
                ⚙️ Set <code>VITE_GOOGLE_CLIENT_ID</code> in Netlify environment variables to enable Drive uploads.
              </div>
            )}
            {CLIENT_ID&&!drive.isAuthed&&(
              <div className="drive-connect">
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13}}>
                    {drive.authLoading?"Connecting to Google Drive…":"Connect Google Drive"}
                  </div>
                  <div style={{fontSize:11,color:"var(--t2)",marginTop:2}}>
                    {drive.authLoading?"":"One click per session to enable file uploads"}
                  </div>
                </div>
                {!drive.authLoading&&(
                  <button className="btn btn-g btn-sm" onClick={()=>drive.signIn().catch(e=>T(e.message,"err"))}>
                    Connect Drive
                  </button>
                )}
                {drive.authLoading&&<span style={{fontSize:12,color:"var(--am)"}}>⏳</span>}
              </div>
            )}
            {CLIENT_ID&&drive.isAuthed&&(
              <div className="drive-connect" style={{background:"var(--g3)",borderColor:"rgba(0,212,170,.25)"}}>
                <span style={{color:"var(--g)",fontSize:13}}>✓ Google Drive connected</span>
                <button className="btn btn-s btn-xs" style={{marginLeft:"auto"}} onClick={drive.signOut}>Disconnect</button>
              </div>
            )}
          </>
        )}
        <DocumentsTab docs={docs} setDocs={setDocs} items={items} T={T} drive={isNative?null:drive}/>
      </div>
    </>
  );
}

function VaultPage({items,shop,setShop,rates,cur,fmtC,shopTot,T}){
  const [tab,setTab] = useState("budget");
  return(
    <>
      <div className="page-header">
        <div className="page-title">Vault 🗂️</div>
        <div className="page-sub">Budget · Shopping</div>
        <div className="tabs">
          {[["budget","Budget"],["shopping","Shopping"]].map(([id,lbl])=>(
            <button key={id} className={`tab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{lbl}</button>
          ))}
        </div>
      </div>
      <div className="page-body">
        {tab==="budget"   && <BudgetTab items={items} rates={rates} cur={cur} fmtC={fmtC} shopTot={shopTot} T={T}/>}
        {tab==="shopping" && <ShoppingTab shop={shop} setShop={setShop} rates={rates} cur={cur} fmtC={fmtC} T={T}/>}
      </div>
    </>
  );
}

function BudgetTab({items,rates,cur,fmtC,shopTot,T}){
  const ea=items.filter(a=>a.cost||a.cost2);
  const tot=conv(ea.reduce((s,a)=>s+totalCostILS(a,rates),0),"ILS",rates,cur);
  const paid=conv(ea.filter(a=>a.status==="done").reduce((s,a)=>s+totalCostILS(a,rates),0),"ILS",rates,cur);  const grand=tot+shopTot;
  return(
    <>
      <div className="g3" style={{marginBottom:16}}>
        <div className="stat-card">
          <div className="stat-label">Actions Budget</div>
          <div className="stat-val vg">{fmtC(tot)}</div>
          <div className="pbar"><div className="pfill b" style={{width:tot>0?Math.round(paid/tot*100)+"%":"0%"}}/></div>
          <div className="stat-sub">{fmtC(paid)} paid</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Shopping Budget</div>
          <div className="stat-val vb">{fmtC(shopTot)}</div>
          <div className="stat-sub">Post-arrival purchases</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Grand Total</div>
          <div className="stat-val vam">{fmtC(grand)}</div>
          <div className="stat-sub">All costs combined</div>
        </div>
      </div>
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div className="card-title" style={{marginBottom:0}}>All Action Costs</div>
          <button className="btn btn-s btn-sm" onClick={()=>{csvDl(ea.map(a=>({title:a.title,cost:a.cost,currency:a.cur,status:a.status,owner:a.owner})),"budget.csv");T("Exported ✓");}}>↓ CSV</button>
        </div>
        <div className="exp-table">
          <div className="exp-hdr"><span>Name</span><span>Cost 1</span><span>Cost 2</span><span>₪ Total</span><span>Status</span></div>
          {ea.map(a=>(
            <div key={a.id} className="exp-row">
              <span style={{fontWeight:500}}>{a.title}</span>
              <span style={{color:"var(--t1)"}}>{a.cost?`${a.cost} ${a.cur}`:"-"}</span>
              <span style={{color:"var(--t1)"}}>{a.cost2?`${a.cost2} ${a.cur2||"AUD"}`:"-"}</span>
              <span style={{color:"var(--g)",fontWeight:600}}>{fmt(totalCostILS(a,rates),"ILS")}</span>
              <span className={`tag ${stCls(a.status)}`}>{a.status}</span>
            </div>
          ))}
          {!ea.length&&<div style={{color:"var(--t2)",textAlign:"center",padding:"20px 0"}}>No costs added yet</div>}
        </div>
      </div>
    </>
  );
}

const DOC_STATUSES = ["pending","collected","submitted","approved","expired"];
const DOC_STATUS_CLS = {pending:"tam",collected:"tg",submitted:"tb",approved:"tg",expired:"tr"};
const DOC_STATUS_LABEL = {pending:"Pending",collected:"Collected",submitted:"Submitted",approved:"Approved",expired:"Expired"};

// Returns unified file list — handles both legacy single-file and new multi-file shape
function docAllFiles(d){
  if(d.files?.length) return d.files;
  if(d.driveFileId) return [{id:"leg",driveFileId:d.driveFileId,driveFileName:d.driveFileName,driveUrl:d.driveUrl}];
  return [];
}
function docHasFile(d){ return docAllFiles(d).length>0; }

function sortDocsList(docs,sortBy){
  const s=[...docs];
  if(sortBy==="newest") return s.sort((a,b)=>b.id.localeCompare(a.id));
  if(sortBy==="oldest") return s.sort((a,b)=>a.id.localeCompare(b.id));
  if(sortBy==="alpha")  return s.sort((a,b)=>(a.type||"").localeCompare(b.type||""));
  if(sortBy==="status"){
    const ord={pending:0,collected:1,submitted:2,approved:3,expired:4};
    return s.sort((a,b)=>(ord[a.status||"pending"]||0)-(ord[b.status||"pending"]||0));
  }
  if(sortBy==="hasfile") return s.sort((a,b)=>(docHasFile(b)?1:0)-(docHasFile(a)?1:0));
  if(sortBy==="expiry")  return s.sort((a,b)=>{
    if(!a.exp&&!b.exp) return 0;
    if(!a.exp) return 1; if(!b.exp) return -1;
    return new Date(a.exp)-new Date(b.exp);
  });
  return s;
}

function DocumentsTab({docs,setDocs,items,T,drive}){
  const BLANK = {id:"",type:"",category:"",status:"pending",exp:"",aid:"",files:[],driveFileId:"",driveFileName:"",driveUrl:"",notes:""};
  const [mo,setMo] = useState(false);
  const [f,setF] = useState(BLANK);
  const [pendingFiles,setPendingFiles] = useState([]);
  const [uploadProg,setUploadProg] = useState(0);
  const [uploading,setUploading] = useState(false);
  const [drag,setDrag] = useState(false);
  const fileRef = useRef();

  // sort + filter
  const [sortBy,setSortBy]         = useState("newest");
  const [search,setSearch]         = useState("");
  const [filterCat,setFilterCat]   = useState("");
  const [filterSt,setFilterSt]     = useState("");
  const [filterFile,setFilterFile] = useState(false);
  const [filterAid,setFilterAid]   = useState("");

  // inline upload
  const [inlineId,setInlineId]     = useState(null);
  const [inlineUploading,setInlineUploading] = useState(false);
  const inlineRef = useRef();

  const sf=(k,v)=>setF(p=>({...p,[k]:v}));
  const reset=()=>{setF(BLANK);setPendingFiles([]);setUploadProg(0);};

  const DOC_STATUS_CYCLE = {pending:"collected",collected:"submitted",submitted:"approved",approved:"expired",expired:"pending"};
  const cycleDocStatus = id => setDocs(prev=>prev.map(d=>d.id===id?{...d,status:DOC_STATUS_CYCLE[d.status||"pending"]}:d));

  const handleInlineFile = async file => {
    if(!file||!inlineId) return;
    const d = docs.find(x=>x.id===inlineId);
    if(!d) return;
    if(!drive?.isAuthed){T("Connect Google Drive first","err");setInlineId(null);return;}
    setInlineUploading(true);
    T("Uploading…","inf");
    try{
      const folder = await driveEnsureFolder(drive.token,d.category||"General",DRIVE_ROOT);
      const uploaded = await driveUploadFile(drive.token,file,folder.id,()=>{});
      const newFile = {id:"f"+Date.now(),driveFileId:uploaded.id,driveFileName:uploaded.name,driveUrl:uploaded.webViewLink};
      setDocs(prev=>prev.map(x=>x.id===d.id?{...x,files:[...(x.files||[]),newFile],driveFileId:"",driveFileName:"",driveUrl:""}:x));
      T("Uploaded ✓");
    }catch(e){ T("Upload failed: "+e.message,"err"); }
    setInlineUploading(false);
    setInlineId(null);
  };

  const existingCats=[...new Set(docs.map(d=>d.category).filter(Boolean))];
  const linkedAids=[...new Set(docs.map(d=>d.aid).filter(Boolean))];

  const openEdit=d=>{
    // Migrate legacy single file into files array on open
    let data={...BLANK,...d,files:d.files?[...d.files]:[]};
    if(!data.files.length&&data.driveFileId){
      data={...data,files:[{id:"leg_"+d.id,driveFileId:d.driveFileId,driveFileName:d.driveFileName,driveUrl:d.driveUrl}]};
    }
    setF(data);setPendingFiles([]);setMo(true);
  };

  const duplicate=d=>{
    const {id,files,driveFileId,driveFileName,driveUrl,...rest}=d;
    setDocs(prev=>[...prev,{...BLANK,...rest,files:[],driveFileId:"",driveFileName:"",driveUrl:"",id:"d"+Date.now()}]);
    T("Duplicated ✓");
  };

  const save=async()=>{
    if(!f.type.trim()){T("Document type required","err");return;}
    let doc={...f};
    if(pendingFiles.length){
      if(!drive?.isAuthed){T("Connect Google Drive first","err");return;}
      setUploading(true);
      try{
        const catName=f.category.trim()||"General";
        const folder=await driveEnsureFolder(drive.token,catName,DRIVE_ROOT);
        const newFiles=[];
        for(let i=0;i<pendingFiles.length;i++){
          setUploadProg(Math.round(i/pendingFiles.length*100));
          const uploaded=await driveUploadFile(drive.token,pendingFiles[i],folder.id,()=>{});
          newFiles.push({id:"f"+Date.now()+i,driveFileId:uploaded.id,driveFileName:uploaded.name,driveUrl:uploaded.webViewLink});
        }
        doc={...doc,files:[...(doc.files||[]),...newFiles]};
        setUploadProg(100);
        T(newFiles.length>1?`${newFiles.length} files uploaded ✓`:"Uploaded to Drive ✓");
      }catch(e){
        T("Upload failed: "+e.message,"err");
        setUploading(false);return;
      }
      setUploading(false);
    }
    if(doc.files?.length) doc={...doc,driveFileId:"",driveFileName:"",driveUrl:""};
    setDocs(prev=>f.id?prev.map(d=>d.id===f.id?doc:d):[...prev,{...doc,id:"d"+Date.now()}]);
    setMo(false);
    if(!pendingFiles.length) T("Saved ✓");
    reset();
  };

  const onDrop=e=>{
    e.preventDefault();setDrag(false);
    const files=Array.from(e.dataTransfer.files);
    if(files.length) setPendingFiles(prev=>[...prev,...files]);
  };

  // Apply filters + sort
  let visible=docs;
  if(search.trim()){const q=search.toLowerCase();visible=visible.filter(d=>(d.type||"").toLowerCase().includes(q)||(d.notes||"").toLowerCase().includes(q)||(d.category||"").toLowerCase().includes(q));}
  if(filterCat)  visible=visible.filter(d=>d.category===filterCat);
  if(filterSt)   visible=visible.filter(d=>(d.status||"pending")===filterSt);
  if(filterFile) visible=visible.filter(d=>docHasFile(d));
  if(filterAid)  visible=visible.filter(d=>d.aid===filterAid);
  visible=sortDocsList(visible,sortBy);

  const soonDate=new Date(Date.now()+365*86400000);
  const collected=docs.filter(d=>d.status==="collected"||d.status==="submitted"||d.status==="approved").length;
  const pending=docs.filter(d=>!d.status||d.status==="pending").length;
  const hasFilters=search||filterCat||filterSt||filterFile||filterAid;

  // Group visible docs by category
  const CAT_UNCATEGORIZED = "Uncategorized";
  const catOrder = [...existingCats.filter(Boolean), CAT_UNCATEGORIZED];
  const byCategory = catOrder.reduce((acc,cat)=>{
    const catDocs = visible.filter(d=>(d.category||CAT_UNCATEGORIZED)===cat);
    if(catDocs.length) acc[cat]=catDocs;
    return acc;
  },{});
  // Catch any cats in visible that weren't in existingCats
  visible.forEach(d=>{
    const cat=d.category||CAT_UNCATEGORIZED;
    if(!byCategory[cat]) byCategory[cat]=[d];
    else if(!byCategory[cat].includes(d)) byCategory[cat].push(d);
  });

  return(
    <>
      {/* Hidden inline file input */}
      <input ref={inlineRef} type="file" style={{display:"none"}} onChange={e=>{handleInlineFile(e.target.files[0]||null);e.target.value="";}}/>

      {/* Header row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:12,color:"var(--t1)"}}><strong>{docs.length}</strong> docs</span>
          <span style={{fontSize:12,color:"var(--g)"}}>✓ {collected} ready</span>
          <span style={{fontSize:12,color:"var(--am)"}}>{pending} pending</span>
          {docs.filter(d=>d.exp&&new Date(d.exp)<soonDate).length>0&&
            <span style={{fontSize:12,color:"var(--am)"}}>⚠️ {docs.filter(d=>d.exp&&new Date(d.exp)<soonDate).length} expiring</span>}
        </div>
        <button className="btn btn-g btn-sm" onClick={()=>{reset();setMo(true);}}>+ Add Doc</button>
      </div>

      {/* Search bar (slim) */}
      <div style={{display:"flex",gap:7,marginBottom:16,alignItems:"center"}}>
        <input className="search-in" placeholder="🔍 Search docs…" value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1}}/>
        {search&&<button className="btn btn-s btn-sm" onClick={()=>setSearch("")}>✕</button>}
      </div>

      {/* Category sections */}
      {Object.keys(byCategory).length===0&&(
        <div style={{color:"var(--t2)",textAlign:"center",padding:"40px 0",fontSize:13}}>
          {search?"No documents match your search":"No documents yet — tap + Add Doc to get started"}
        </div>
      )}
      {Object.entries(byCategory).map(([cat,catDocs])=>(
        <div key={cat} className="doc-cat-section">
          <div className="doc-cat-header">
            <span className="doc-cat-title">📁 {cat}</span>
            <span className="doc-cat-count">{catDocs.length}</span>
            <button className="doc-cat-add" onClick={()=>{reset();setF(p=>({...p,category:cat===CAT_UNCATEGORIZED?"":cat}));setMo(true);}}>+ Add</button>
          </div>
          <div className="doc-grid">
            {catDocs.map(d=>{
              const expiring=d.exp&&new Date(d.exp)<soonDate;
              const sc=DOC_STATUS_CLS[d.status||"pending"]||"tam";
              const sl=DOC_STATUS_LABEL[d.status||"pending"]||"Pending";
              const allFiles=docAllFiles(d);
              const hasFile=allFiles.length>0;
              const isInlineUploading=inlineUploading&&inlineId===d.id;
              const linkedItem=d.aid?items.find(a=>a.id===d.aid):null;
              return(
                <div key={d.id} className={`doc-cube${hasFile?" has-file":""}`}>
                  {/* Name */}
                  <div className="doc-cube-name">{d.type||"Document"}</div>

                  {/* Status badge — click to cycle */}
                  <div className="doc-cube-meta">
                    <span
                      className={"tag "+sc+" status-tog"}
                      title={"Click to change → "+DOC_STATUS_LABEL[DOC_STATUS_CYCLE[d.status||"pending"]]}
                      onClick={()=>cycleDocStatus(d.id)}
                    >{sl}</span>
                  </div>

                  {/* File link(s) or placeholder */}
                  {hasFile?(
                    <div style={{display:"flex",flexDirection:"column",gap:2}}>
                      {allFiles.map((file,fi)=>(
                        <a key={fi} href={file.driveUrl} target="_blank" rel="noopener noreferrer" className="doc-cube-file">
                          📂 {file.driveFileName||(allFiles.length>1?`File ${fi+1}`:"File")}
                        </a>
                      ))}
                    </div>
                  ):(
                    <div className="doc-cube-nofile">No file yet</div>
                  )}

                  {/* Expiry */}
                  {d.exp&&<div className="doc-cube-exp">{expiring?"⚠️ ":""}Exp {d.exp}</div>}

                  {/* Linked item */}
                  {linkedItem&&<div className="doc-cube-link">🔗 {linkedItem.title}</div>}

                  {/* Actions */}
                  <div className="doc-cube-actions">
                    {drive!==null&&(
                      <button className="btn btn-s btn-xs" title={drive?.isAuthed?"Upload file":"Connect Drive first"} disabled={isInlineUploading}
                        onClick={()=>{setInlineId(d.id);setTimeout(()=>inlineRef.current?.click(),0);}}>
                        {isInlineUploading?"⏳":"📎"}
                      </button>
                    )}
                    <button className="btn btn-s btn-xs" onClick={()=>openEdit(d)}>Edit</button>
                    <button className="btn btn-d btn-xs" onClick={()=>setDocs(p=>p.filter(x=>x.id!==d.id))}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modal */}
      {mo&&<div className="overlay" onClick={e=>e.target===e.currentTarget&&(setMo(false),reset())}>
        <div className="modal">
          <div className="modal-title">{f.id?"Edit":"Add"} Document</div>
          <div className="fg1">
            <div className="fg">
              <div className="fcol span2">
                <div className="flabel">Document Type *</div>
                <input className="finput" value={f.type} onChange={e=>sf("type",e.target.value)} placeholder="e.g. Passport – Shahar"/>
              </div>
              <div className="fcol">
                <div className="flabel">Category (Drive folder)</div>
                <input className="finput" list="doc-cat-list" value={f.category} onChange={e=>sf("category",e.target.value)} placeholder="e.g. Visa, Legal…"/>
                <datalist id="doc-cat-list">{existingCats.map(c=><option key={c} value={c}/>)}</datalist>
              </div>
              <div className="fcol">
                <div className="flabel">Status</div>
                <select className="fselect" value={f.status||"pending"} onChange={e=>sf("status",e.target.value)}>
                  {DOC_STATUSES.map(s=><option key={s} value={s}>{DOC_STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div className="fcol"><div className="flabel">Expiry Date</div><input type="date" className="finput" value={f.exp} onChange={e=>sf("exp",e.target.value)}/></div>
              <div className="fcol"><div className="flabel">Linked Action Item</div>
                <select className="fselect" value={f.aid} onChange={e=>sf("aid",e.target.value)}>
                  <option value="">None</option>{items.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </div>
            </div>

            {/* Files — web (Drive connected or not) */}
            {drive!==null&&(
              <>
                <div className="flabel" style={{marginTop:12,marginBottom:6}}>
                  Files · Google Drive
                  {(f.files||[]).length>0&&<span style={{fontWeight:400,color:"var(--t2)",marginLeft:6,textTransform:"none"}}>{(f.files||[]).length} uploaded</span>}
                </div>
                {(f.files||[]).map((file,fi)=>(
                  <div key={fi} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"var(--g3)",border:"1px solid rgba(0,212,170,.25)",borderRadius:8,fontSize:12,marginBottom:5}}>
                    <span style={{color:"var(--g)"}}>📂</span>
                    <a href={file.driveUrl} target="_blank" rel="noopener noreferrer" style={{color:"var(--g)",textDecoration:"none",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{file.driveFileName}</a>
                    <button className="btn btn-d btn-xs" onClick={()=>sf("files",(f.files||[]).filter((_,i)=>i!==fi))}>Remove</button>
                  </div>
                ))}
                <div
                  className={"upload-zone"+(drag?" drag":"")}
                  onDragOver={e=>{e.preventDefault();setDrag(true);}}
                  onDragLeave={()=>setDrag(false)}
                  onDrop={onDrop}
                  onClick={()=>!uploading&&fileRef.current?.click()}
                  style={{marginTop:(f.files||[]).length?4:0}}
                >
                  <input ref={fileRef} type="file" multiple onChange={e=>{setPendingFiles(prev=>[...prev,...Array.from(e.target.files)]);e.target.value="";}}/>
                  {pendingFiles.length>0
                    ?<div style={{fontSize:12,color:"var(--g)"}}>
                      {pendingFiles.length} file{pendingFiles.length>1?"s":""} selected
                      <span style={{color:"var(--t2)",marginLeft:6}}>({(pendingFiles.reduce((s,f)=>s+f.size,0)/1024).toFixed(0)} KB total)</span>
                      <span style={{marginLeft:8,color:"var(--t2)",cursor:"pointer"}} onClick={e=>{e.stopPropagation();setPendingFiles([]);}}>✕ clear</span>
                     </div>
                    :<div style={{fontSize:12,color:"var(--t2)"}}>
                      {(f.files||[]).length?"+ Add more files — drop here or ":"Drop files here or "}
                      <span style={{color:"var(--g)"}}>click to browse</span>
                    </div>
                  }
                  {uploading&&<div className="upload-prog"><div className="upload-prog-fill" style={{width:`${uploadProg}%`}}/></div>}
                </div>
                {pendingFiles.length>0&&!drive?.isAuthed&&(
                  <div style={{fontSize:11,color:"var(--am)",marginTop:4}}>⚠️ Connect Google Drive (top of page) to upload</div>
                )}
              </>
            )}
            {/* Files — native (read-only links) */}
            {drive===null&&(
              <div style={{marginTop:10}}>
                <div className="flabel" style={{marginBottom:6}}>Files</div>
                {docAllFiles(f).length>0?(
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {docAllFiles(f).map((file,fi)=>(
                      <a key={fi} href={file.driveUrl} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:"var(--g)",textDecoration:"none"}}>📂 {file.driveFileName||"File "+(fi+1)}</a>
                    ))}
                  </div>
                ):(
                  <div style={{fontSize:11,color:"var(--t2)",padding:"10px 12px",background:"var(--s2)",borderRadius:8}}>📎 File upload available on the web app</div>
                )}
              </div>
            )}

            <div className="fcol" style={{marginTop:8}}>
              <div className="flabel">Notes</div>
              <textarea className="ftextarea" value={f.notes} onChange={e=>sf("notes",e.target.value)} rows={2}/>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-s" onClick={()=>{setMo(false);reset();}}>Cancel</button>
            <button className="btn btn-g" onClick={save} disabled={uploading}>
              {uploading?`Uploading ${uploadProg}%… (${pendingFiles.length} files)`:"Save"}
            </button>
          </div>
        </div>
      </div>}
    </>
  );
}

function ShoppingTab({shop,setShop,rates,cur,fmtC,T}){
  const [mo,setMo] = useState(false);
  const [f,setF] = useState({id:"",name:"",store:"",cost:"",owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:""});
  const sf=(k,v)=>setF(p=>({...p,[k]:v}));
  const totAUD=shop.reduce((s,i)=>s+(+i.cost||0),0);
  const save=()=>{
    if(!f.name.trim()){T("Name required","err");return;}
    setShop(prev=>f.id?prev.map(i=>i.id===f.id?f:i):[...prev,{...f,id:"sh"+Date.now()}]);
    setMo(false);T("Saved ✓");
  };
  return(
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",gap:20}}>
          <div><div className="stat-label">Total (AUD)</div><div style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:20,color:"var(--g)",marginTop:2}}>A${totAUD.toLocaleString()}</div></div>
          <div><div className="stat-label">In {cur}</div><div style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:20,color:"var(--b)",marginTop:2}}>{fmtC(conv(totAUD,"AUD",rates,cur))}</div></div>
          <div><div className="stat-label">Remaining</div><div style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:20,color:"var(--am)",marginTop:2}}>{shop.filter(i=>!i.done).length} items</div></div>
        </div>
        <button className="btn btn-g btn-sm" onClick={()=>{setF({id:"",name:"",store:"",cost:"",owner:"Shahar",phase:"Month 0 Arrival",done:false,notes:""});setMo(true);}}>+ Add Item</button>
      </div>
      <div className="card">
        {shop.map(item=>(
          <div key={item.id} className="shop-row">
            <input type="checkbox" style={{width:16,height:16,accentColor:"var(--g)",cursor:"pointer",flexShrink:0}} checked={item.done} onChange={()=>setShop(p=>p.map(i=>i.id===item.id?{...i,done:!i.done}:i))}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:13,textDecoration:item.done?"line-through":"none",color:item.done?"var(--t2)":"var(--t0)"}}>{item.name}</div>
              <div style={{display:"flex",gap:10,marginTop:2,flexWrap:"wrap"}}>
                {item.store&&<span style={{fontSize:11,color:"var(--t2)"}}>🏬 {item.store}</span>}
                <div className={`ava ${ownerCls(item.owner)}`}>{ownerInit(item.owner)}</div>
                <span style={{fontSize:11,color:"var(--t2)"}}>📅 {item.phase}</span>
                {item.notes&&<span style={{fontSize:11,color:"var(--t1)"}}>{item.notes}</span>}
              </div>
            </div>
            <div style={{fontWeight:700,color:"var(--g)",fontSize:13,marginRight:8}}>A${(+item.cost||0).toLocaleString()}</div>
            <button className="btn btn-s btn-sm" onClick={()=>{setF(item);setMo(true);}}>Edit</button>
            <button className="btn btn-d btn-sm" onClick={()=>setShop(p=>p.filter(i=>i.id!==item.id))}>✕</button>
          </div>
        ))}
        {!shop.length&&<div style={{color:"var(--t2)",textAlign:"center",padding:"20px 0"}}>No items yet</div>}
      </div>
      {mo&&<div className="overlay" onClick={e=>e.target===e.currentTarget&&setMo(false)}>
        <div className="modal">
          <div className="modal-title">{f.id?"Edit":"Add"} Item</div>
          <div className="fg">
            <div className="fcol span2"><div className="flabel">Item Name *</div><input className="finput" value={f.name} onChange={e=>sf("name",e.target.value)}/></div>
            <div className="fcol"><div className="flabel">Store</div><input className="finput" value={f.store} onChange={e=>sf("store",e.target.value)}/></div>
            <div className="fcol"><div className="flabel">Cost (AUD)</div><input type="number" className="finput" value={f.cost} onChange={e=>sf("cost",e.target.value)}/></div>
            <div className="fcol"><div className="flabel">Owner</div><select className="fselect" value={f.owner} onChange={e=>sf("owner",e.target.value)}>{["Raz","Shahar","Kids","External"].map(o=><option key={o}>{o}</option>)}</select></div>
            <div className="fcol"><div className="flabel">Phase</div><select className="fselect" value={f.phase} onChange={e=>sf("phase",e.target.value)}>{PHASES.map(p=><option key={p.name}>{p.name}</option>)}</select></div>
            <div className="fcol span2"><div className="flabel">Notes</div><input className="finput" value={f.notes} onChange={e=>sf("notes",e.target.value)}/></div>
          </div>
          <div className="modal-footer"><button className="btn btn-s" onClick={()=>setMo(false)}>Cancel</button><button className="btn btn-g" onClick={save}>Save</button></div>
        </div>
      </div>}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS PAGE
// ─────────────────────────────────────────────────────────────────────────────
function SettingsPage({rates,setRates,fetchRates,syncStatus,syncErr}){
  const [audV,setAudV] = useState(String(rates.AUD));
  const [usdV,setUsdV] = useState(String(rates.USD));
  const save=()=>{
    const a=parseFloat(audV),u=parseFloat(usdV);
    if(isNaN(a)||isNaN(u)){alert("Invalid values");return;}
    setRates(r=>({...r,AUD:a,USD:u,upd:"Manual"}));
  };
  const INFO=[["App","Perth Relocation Commander 2026"],["Origin","🇮🇱 Tel Aviv, Israel"],["Destination","🇦🇺 Perth, Australia"],["PhD Start","July 20, 2026"],["Family","4 · 2 adults · 2 children"],["Pets","No"],["Primary Currency","ILS (₪)"],["Secondary","AUD (A$)"]];
  return(
    <>
      <div className="page-header">
        <div className="page-title">Settings ⚙️</div>
        <div className="page-sub">Profile · Currency · Data</div>
      </div>
      <div className="page-body">
        <div className="g2" style={{alignItems:"start"}}>
          <div className="card">
            <div className="card-title">Relocation Profile</div>
            {INFO.map(([k,v])=>(
              <div key={k} style={{display:"flex",gap:12,padding:"7px 0",borderBottom:"1px solid var(--bd)",fontSize:12}}>
                <span style={{color:"var(--t2)",width:130,flexShrink:0}}>{k}</span>
                <span style={{fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="card">
              <div className="card-title">Exchange Rates (to ILS)</div>
              <div style={{display:"grid",gap:10,marginBottom:14}}>
                <div className="fcol"><div className="flabel">1 AUD = ? ILS</div><input type="number" step="0.01" className="finput" value={audV} onChange={e=>setAudV(e.target.value)}/></div>
                <div className="fcol"><div className="flabel">1 USD = ? ILS</div><input type="number" step="0.01" className="finput" value={usdV} onChange={e=>setUsdV(e.target.value)}/></div>
              </div>
              <div style={{fontSize:11,color:"var(--t2)",marginBottom:12}}>Last updated: <strong style={{color:"var(--t1)"}}>{rates.upd}</strong></div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-g" onClick={save}>Save Manual Rates</button>
                <button className="btn btn-s" onClick={fetchRates} disabled={rates.fetching}>{rates.fetching?"⏳ Fetching…":"↻ Fetch Live Rates"}</button>
              </div>
              <div style={{marginTop:12,padding:"10px 12px",background:"var(--s2)",borderRadius:8,fontSize:11,color:"var(--t1)"}}>
                <strong>API:</strong> Claude AI · live web search · rates fetched in real-time
              </div>
            </div>
            <div className="card" style={{marginTop:0}}>
              <div className="card-title">Firebase Sync</div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <span style={{fontSize:22,color:syncStatus==="live"?"var(--g)":syncStatus==="connecting"?"var(--am)":syncStatus==="error"?"var(--re)":"var(--t3)"}}>●</span>
                <div>
                  <div style={{fontWeight:600,fontSize:13,color:syncStatus==="live"?"var(--g)":syncStatus==="connecting"?"var(--am)":syncStatus==="error"?"var(--re)":"var(--t1)"}}>
                    {syncStatus==="live"?"Synced with Firebase":syncStatus==="connecting"?"Connecting…":syncStatus==="error"?"Sync Error":"Local Only"}
                  </div>
                  {syncStatus==="error"&&syncErr&&<div style={{fontSize:11,color:"var(--re)",marginTop:2}}>{syncErr}</div>}
                  {syncStatus==="off"&&<div style={{fontSize:11,color:"var(--t2)",marginTop:2}}>Firebase env vars not detected in this build</div>}
                  {syncStatus==="live"&&<div style={{fontSize:11,color:"var(--t2)",marginTop:2}}>Data syncs across web and mobile in real-time</div>}
                </div>
              </div>
            </div>
            <div className="card" style={{marginTop:0}}>
              <div className="card-title">Data Management</div>
              <div style={{fontSize:12,color:"var(--t1)",marginBottom:12}}>All data is stored in your browser's localStorage. It persists between sessions automatically.</div>
              <button className="btn btn-d btn-sm" onClick={()=>{if(window.confirm("Reset all data to defaults? This cannot be undone.")){["prc_plans","prc_items","prc_docs","prc_shop","prc_rates","prc_cur","prc_page"].forEach(k=>localStorage.removeItem(k));window.location.reload();}}}>⚠ Reset All Data</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE PAGE
// ─────────────────────────────────────────────────────────────────────────────
function FinancePage({items,plans,rates,onEdit,setItems,T}){
  const [tab,setTab] = useState("dashboard");

  // Expenses — items with a cost
  const costItems = items.filter(a=>a.cost||a.cost2);
  const settled = costItems.filter(a=>a.settled&&a.settledDate);
  const pending = costItems.filter(a=>!a.settled);

  // Expense totals in ILS
  const totalEstILS = costItems.reduce((s,a)=>s+totalCostILS(a,rates),0);
  const totalSettledILS = settled.reduce((s,a)=>s+totalCostILS(a,rates),0);
  const totalPendingILS = pending.reduce((s,a)=>s+totalCostILS(a,rates),0);

  // Income — items with an income field
  const incomeItems = items.filter(a=>a.income&&+a.income>0);
  const incomeReceived = incomeItems.filter(a=>a.incomeDate);
  const incomePending = incomeItems.filter(a=>!a.incomeDate);
  const totalIncomeReceivedILS = incomeReceived.reduce((s,a)=>s+totalIncomeILS(a,rates),0);
  const totalIncomePendingILS = incomePending.reduce((s,a)=>s+totalIncomeILS(a,rates),0);
  const totalIncomeEstILS = incomeItems.reduce((s,a)=>s+totalIncomeILS(a,rates),0);

  // Upcoming expenses = not settled, has ddate, within 60 days
  const now = new Date();
  const in60 = new Date(now.getTime()+60*86400000);
  const upcoming = pending
    .filter(a=>a.ddate&&new Date(a.ddate)<=in60)
    .sort((a,b)=>new Date(a.ddate)-new Date(b.ddate));

  // By plan breakdown (expenses)
  const byPlan = plans.map(p=>{
    const pi = settled.filter(a=>a.planId===p.id);
    return {plan:p, ils:pi.reduce((s,a)=>s+totalCostILS(a,rates),0), count:pi.length};
  }).filter(x=>x.ils>0).sort((a,b)=>b.ils-a.ils);
  const maxPlanILS = byPlan[0]?.ils||1;

  // Monthly timeline — settled expenses by settledDate
  const months = {};
  settled.forEach(a=>{
    const d = new Date(a.settledDate);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = d.toLocaleString("en-AU",{month:"short",year:"2-digit"});
    if(!months[key]) months[key]={key,label,ils:0,count:0};
    months[key].ils += totalCostILS(a,rates);
    months[key].count++;
  });
  const monthList = Object.values(months).sort((a,b)=>a.key.localeCompare(b.key));
  const maxMonthILS = Math.max(...monthList.map(m=>m.ils),1);

  const ils = v => fmt(v,"ILS");
  const pct = totalEstILS>0?Math.round(totalSettledILS/totalEstILS*100):0;

  return(
    <>
      <div className="page-header">
        <div className="page-title">Finance 💰</div>
        <div className="page-sub">All amounts in ILS · {settled.length} expenses settled · {incomeReceived.length} income received</div>
        <div className="tabs">
          {[["dashboard","Dashboard"],["settled","Expenses"],["income","Income"],["upcoming","Upcoming"]].map(([id,lbl])=>(
            <button key={id} className={`tab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{lbl}</button>
          ))}
        </div>
      </div>
      <div className="page-body">

        {tab==="dashboard" && <>
          {/* Expenses KPI Row */}
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"1.5px",color:"var(--t2)",marginBottom:6,fontWeight:700}}>💸 Expenses</div>
          <div className="fin-kpi-row">
            <div className="fin-kpi">
              <div className="fin-kpi-label">Total Estimated</div>
              <div className="fin-kpi-val vg">{ils(totalEstILS)}</div>
              <div className="fin-kpi-sub">{costItems.length} items with cost</div>
            </div>
            <div className="fin-kpi">
              <div className="fin-kpi-label">Settled</div>
              <div className="fin-kpi-val" style={{color:"var(--b)"}}>{ils(totalSettledILS)}</div>
              <div className="fin-kpi-sub">{pct}% of total · {settled.length} items</div>
            </div>
            <div className="fin-kpi">
              <div className="fin-kpi-label">Still Pending</div>
              <div className="fin-kpi-val vam">{ils(totalPendingILS)}</div>
              <div className="fin-kpi-sub">{pending.length} items outstanding</div>
            </div>
          </div>

          {/* Income KPI Row */}
          {incomeItems.length>0&&<>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"1.5px",color:"var(--t2)",margin:"14px 0 6px",fontWeight:700}}>💵 Income</div>
            <div className="fin-kpi-row">
              <div className="fin-kpi">
                <div className="fin-kpi-label">Total Expected</div>
                <div className="fin-kpi-val vg">{ils(totalIncomeEstILS)}</div>
                <div className="fin-kpi-sub">{incomeItems.length} items with income</div>
              </div>
              <div className="fin-kpi">
                <div className="fin-kpi-label">Received</div>
                <div className="fin-kpi-val" style={{color:"var(--g)"}}>{ils(totalIncomeReceivedILS)}</div>
                <div className="fin-kpi-sub">{incomeReceived.length} items received</div>
              </div>
              <div className="fin-kpi">
                <div className="fin-kpi-label">Still Expected</div>
                <div className="fin-kpi-val vam">{ils(totalIncomePendingILS)}</div>
                <div className="fin-kpi-sub">{incomePending.length} items pending</div>
              </div>
            </div>
          </>}

          {/* Progress bar */}
          <div className="card" style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div className="card-title" style={{marginBottom:0}}>Budget Progress</div>
              <span style={{fontSize:11,color:"var(--t2)"}}>{pct}% settled</span>
            </div>
            <div className="pbar" style={{height:8}}><div className="pfill b" style={{width:pct+"%"}}/></div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10,color:"var(--t2)"}}>
              <span>₪0</span>
              <span>{ils(totalSettledILS)} settled</span>
              <span>{ils(totalEstILS)}</span>
            </div>
          </div>

          {/* By Plan bar chart */}
          {byPlan.length>0 && <div className="card" style={{marginBottom:12}}>
            <div className="card-title">Settled by Plan</div>
            <div className="bar-chart">
              {byPlan.map(({plan,ils:amount,count})=>(
                <div key={plan.id} className="bar-row">
                  <div className="bar-label">{plan.icon} {plan.title}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{width:`${amount/maxPlanILS*100}%`,background:plan.color}}/>
                  </div>
                  <div className="bar-val">{fmt(amount,"ILS")}</div>
                </div>
              ))}
            </div>
          </div>}

          {/* Pending by Plan */}
          {(() => {
            const pendByPlan = plans.map(p=>{
              const pi = pending.filter(a=>a.planId===p.id);
              return {plan:p, ils:pi.reduce((s,a)=>s+totalCostILS(a,rates),0), count:pi.length};
            }).filter(x=>x.ils>0).sort((a,b)=>b.ils-a.ils);
            const maxPend = pendByPlan[0]?.ils||1;
            return pendByPlan.length>0 ? (
              <div className="card" style={{marginBottom:12}}>
                <div className="card-title">Pending by Plan</div>
                <div className="bar-chart">
                  {pendByPlan.map(({plan,ils:amount})=>(
                    <div key={plan.id} className="bar-row">
                      <div className="bar-label">{plan.icon} {plan.title}</div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{width:`${amount/maxPend*100}%`,background:"var(--am)"}}/>
                      </div>
                      <div className="bar-val">{fmt(amount,"ILS")}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* Monthly timeline */}
          {monthList.length>0 ? (
            <div className="card">
              <div className="card-title">Monthly Spend Timeline</div>
              <div className="timeline-grid">
                {monthList.map(m=>{
                  const h = Math.max(4,Math.round(m.ils/maxMonthILS*56));
                  const isNow = m.key===`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
                  return(
                    <div key={m.key} className={`month-col ${isNow?"active":""}`}>
                      <div className="month-name">{m.label}</div>
                      <div className="month-bar-wrap">
                        <div className="month-bar" style={{height:h,background:isNow?"var(--g)":"var(--b)"}}/>
                      </div>
                      <div className="month-amt">{fmt(m.ils,"ILS")}</div>
                      <div className="month-count">{m.count} item{m.count!==1?"s":""}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card" style={{textAlign:"center",padding:"24px",color:"var(--t2)"}}>
              <div style={{fontSize:24,marginBottom:8}}>📊</div>
              <div style={{fontSize:13,fontWeight:600}}>No settled expenses yet</div>
              <div style={{fontSize:11,marginTop:4}}>Mark items as Settled with a date to see your spending timeline</div>
            </div>
          )}
        </>}

        {tab==="settled" && <>
          <div style={{marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:12,color:"var(--t1)"}}>{settled.length} settled · {ils(totalSettledILS)} total</div>
          </div>
          {settled.length===0 && <div style={{color:"var(--t2)",textAlign:"center",padding:"32px 0"}}>No settled expenses yet</div>}
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            {settled.sort((a,b)=>new Date(b.settledDate)-new Date(a.settledDate)).map(a=>{
              const plan = plans.find(p=>p.id===a.planId);
              return(
                <div key={a.id} className="settled-row" style={{padding:"10px 14px"}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:13}}>{a.title}</div>
                    <div style={{display:"flex",gap:8,marginTop:3,flexWrap:"wrap",alignItems:"center"}}>
                      {plan&&<span style={{fontSize:9,color:plan.color,fontWeight:700,textTransform:"uppercase"}}>{plan.icon} {plan.title}</span>}
                      <span style={{fontSize:11,color:"var(--t2)"}}>📅 {a.settledDate}</span>
                      {a.vendor&&<span style={{fontSize:11,color:"var(--t2)"}}>🏢 {a.vendor}</span>}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:14,color:"var(--g)"}}>{ils(totalCostILS(a,rates))}</div>
                    <button className="btn btn-s btn-xs" style={{marginTop:4}} onClick={()=>onEdit(a)}>Edit</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>}

        {tab==="income" && <>
          <div style={{marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:12,color:"var(--t1)"}}>{incomeItems.length} items · {ils(totalIncomeReceivedILS)} received · {ils(totalIncomePendingILS)} expected</div>
          </div>
          {incomeItems.length===0 && <div style={{color:"var(--t2)",textAlign:"center",padding:"32px 0"}}>No income items yet — open any item and toggle "Income from this item"</div>}
          {incomeItems.length>0&&(
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              {[...incomeReceived,...incomePending].map(a=>{
                const plan = plans.find(p=>p.id===a.planId);
                const received = !!a.incomeDate;
                return(
                  <div key={a.id} className="settled-row" style={{padding:"10px 14px"}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13}}>{a.title}</div>
                      <div style={{display:"flex",gap:8,marginTop:3,flexWrap:"wrap",alignItems:"center"}}>
                        {plan&&<span style={{fontSize:9,color:plan.color,fontWeight:700,textTransform:"uppercase"}}>{plan.icon} {plan.title}</span>}
                        {received?<span style={{fontSize:11,color:"var(--g)"}}>✓ Received {a.incomeDate}</span>:<span style={{fontSize:11,color:"var(--am)"}}>⏳ Not yet received</span>}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:14,color:"var(--g)"}}>{ils(totalIncomeILS(a,rates))}</div>
                      <div style={{fontSize:10,color:"var(--t2)"}}>{a.incomeCur||"ILS"} {a.income}</div>
                      <button className="btn btn-s btn-xs" style={{marginTop:4}} onClick={()=>onEdit(a)}>Edit</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>}

        {tab==="upcoming" && <>
          <div style={{marginBottom:12,fontSize:12,color:"var(--t1)"}}>
            {upcoming.length} expenses due in next 60 days · {ils(upcoming.reduce((s,a)=>s+totalCostILS(a,rates),0))} total
          </div>
          {upcoming.length===0 && <div style={{color:"var(--t2)",textAlign:"center",padding:"32px 0"}}>No upcoming expenses in the next 60 days 🎉</div>}
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            {upcoming.map(a=>{
              const plan = plans.find(p=>p.id===a.planId);
              const daysLeft = Math.ceil((new Date(a.ddate)-now)/86400000);
              const urgent = daysLeft<=14;
              return(
                <div key={a.id} className="upcoming-row" style={{padding:"10px 14px"}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:13}}>{a.title}</div>
                    <div style={{display:"flex",gap:8,marginTop:3,flexWrap:"wrap",alignItems:"center"}}>
                      {plan&&<span style={{fontSize:9,color:plan.color,fontWeight:700,textTransform:"uppercase"}}>{plan.icon} {plan.title}</span>}
                      <span style={{fontSize:11,color:urgent?"var(--re)":"var(--t2)"}}>📅 {a.ddate} {urgent?`(${daysLeft}d)`:""}</span>
                      <span className={`tag ${prCls(a.priority)}`}>{a.priority}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:14,color:"var(--am)"}}>{ils(totalCostILS(a,rates))}</div>
                    <button className="btn btn-g btn-xs" style={{marginTop:4}} onClick={()=>onEdit(a)}>Settle</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>}

      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI ADVISOR PAGE
// ─────────────────────────────────────────────────────────────────────────────
function AdvisorPage({items,plans,rates,onAddItem}){
  const [messages,setMessages] = useState([
    {role:"ai",text:"Hi! I'm your Perth Relocation Advisor 🇦🇺\n\nI have full context of your plans, items, budget and timeline. Ask me anything — from visa questions to Perth suburb recommendations to what you should be doing right now.\n\nI can also suggest new items to add directly to your plan.",time:new Date().toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"}),suggestions:[]}
  ]);
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const [added,setAdded] = useState({});
  const bottomRef = useRef(null);

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages,loading]);

  const buildContext = () => {
    const now = new Date();
    const phdStart = new Date("2026-07-20");
    const daysLeft = Math.ceil((phdStart-now)/86400000);
    const overdue = items.filter(a=>a.ddate&&new Date(a.ddate)<now&&a.status!=="done");
    const inProgress = items.filter(a=>a.status==="in progress");
    const done = items.filter(a=>a.status==="done");
    const tbd = items.filter(a=>a.status==="tbd");
    const totalILS = items.reduce((s,a)=>s+totalCostILS(a,rates),0);
    const settledILS = items.filter(a=>a.settled).reduce((s,a)=>s+totalCostILS(a,rates),0);

    const planSummary = plans.map(p=>{
      const pi = items.filter(i=>i.planId===p.id);
      const doneC = pi.filter(i=>i.status==="done").length;
      return `  ${p.icon} ${p.title}: ${doneC}/${pi.length} done`;
    }).join("\n");

    const overdueList = overdue.map(a=>`  - ${a.title} (due ${a.ddate})`).join("\n")||"  None";
    const inProgressList = inProgress.map(a=>`  - ${a.title}`).join("\n")||"  None";

    return `You are a relocation advisor for an Israeli family moving from Tel Aviv to Perth, Australia.

FAMILY PROFILE:
- Raz (Dad) + Shahar (Mom) + 2 kids
- Moving for Raz's PhD at University of Western Australia (UWA)
- PhD starts: July 20, 2026 (${daysLeft} days from today)
- Today: ${now.toLocaleDateString("en-AU",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}

CURRENT STATUS:
- Items: ${items.length} total — ${done.length} done, ${inProgress.length} in progress, ${tbd.length} tbd
- Overdue: ${overdue.length}
- Budget: ₪${Math.round(totalILS).toLocaleString()} estimated, ₪${Math.round(settledILS).toLocaleString()} settled
- Rates: 1 AUD = ₪${rates.AUD}, 1 USD = ₪${rates.USD}

PLAN PROGRESS:
${planSummary}

OVERDUE:
${overdueList}

IN PROGRESS:
${inProgressList}

ALL ITEMS:
${items.map(a=>{
  const p=plans.find(pl=>pl.id===a.planId);
  const cost=totalCostILS(a,rates);
  return `  [${a.id}] ${p?.title||"?"} | ${a.title} | ${a.status} | ${a.priority} | due:${a.ddate||"-"} | ${cost>0?"₪"+Math.round(cost).toLocaleString():""}`;
}).join("\n")}

AVAILABLE PLANS (for suggestions):
${plans.map(p=>`  ${p.id}: ${p.icon} ${p.title}`).join("\n")}

INSTRUCTIONS:
- Give specific, actionable advice referencing their actual data
- Use web_search for current info (visa times, rental prices, flights, etc.)
- At the end of your response, if there are 1-3 genuinely useful items to add, include exactly this on its own line:
SUGGESTIONS:{"items":[{"planId":"p2","title":"Task title","desc":"Why this matters","priority":"High","phase":"Month -3","owner":"Raz"}]}
- Only suggest items not already in the plan
- Be warm, direct, concise — like a trusted advisor`;
  };

  const send = async () => {
    const text = input.trim();
    if(!text||loading) return;
    setInput("");
    const userMsg = {role:"user",text,time:new Date().toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"})};
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try{
      const apiMessages = history
        .filter((m,i)=>i>0)
        .map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));

      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:buildContext(),
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:apiMessages
        })
      });

      if(!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();

      const fullText = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");

      let suggestions=[], displayText=fullText;
      const sugMatch = fullText.match(/SUGGESTIONS:(\{[\s\S]*?\})\s*$/);
      if(sugMatch){
        try{
          suggestions = JSON.parse(sugMatch[1]).items||[];
          displayText = fullText.replace(/SUGGESTIONS:[\s\S]*$/,"").trim();
        }catch(e){}
      }

      setMessages(prev=>[...prev,{role:"ai",text:displayText,time:new Date().toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"}),suggestions}]);
    }catch(e){
      setMessages(prev=>[...prev,{role:"ai",text:"Sorry, couldn't connect. Please try again.",time:new Date().toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"}),suggestions:[]}]);
    }
    setLoading(false);
  };

  const PROMPTS=["What should I focus on this week?","Am I on track for July 20?","What's the visa timeline?","Best suburbs near UWA?","How much should I budget for Perth?"];

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden",minHeight:0}}>
      <div className="page-header" style={{flexShrink:0}}>
        <div className="page-title">AI Advisor 🤖</div>
        <div className="page-sub">Knows your full plan · searches the web · suggests items</div>
      </div>

      <div className="chat-messages" style={{flex:1,minHeight:0}}>
        {messages.length===1&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:6,paddingBottom:4}}>
            {PROMPTS.map(p=>(
              <button key={p} onClick={()=>setInput(p)} style={{background:"var(--s2)",border:"1px solid var(--bd)",color:"var(--t1)",padding:"6px 12px",borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:"var(--fb)"}}>
                {p}
              </button>
            ))}
          </div>
        )}

        {messages.map((m,i)=>(
          <div key={i} className={`msg ${m.role}`}>
            <div className="msg-bubble">{m.text}</div>
            {m.suggestions?.length>0&&(
              <div className="suggestions-wrap">
                <div style={{fontSize:10,color:"var(--t2)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>💡 Suggested items</div>
                {m.suggestions.map((s,si)=>{
                  const key=`${i}-${si}`;
                  const plan=plans.find(p=>p.id===s.planId);
                  return(
                    <div key={si} className="suggestion-card">
                      <div className="suggestion-card-info">
                        <div className="suggestion-card-title">{s.title}</div>
                        <div className="suggestion-card-meta">{plan&&`${plan.icon} ${plan.title}`}{s.priority&&` · ${s.priority}`}{s.phase&&` · ${s.phase}`}</div>
                        {s.desc&&<div style={{fontSize:10,color:"var(--t1)",marginTop:3}}>{s.desc}</div>}
                      </div>
                      <button className="suggestion-add-btn" disabled={!!added[key]} onClick={()=>{
                        onAddItem({planId:s.planId||plans[0]?.id,title:s.title,desc:s.desc||"",owner:s.owner||"Both",priority:s.priority||"Medium",status:"tbd",phase:s.phase||"Month -3",ddate:"",cost:"",cur:"ILS",cost2:"",cur2:"AUD",vendor:"",comments:"",subs:[]});
                        setAdded(a=>({...a,[key]:true}));
                      }}>
                        {added[key]?"✓ Added":"+ Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="msg-time">{m.time}</div>
          </div>
        ))}

        {loading&&(
          <div className="msg ai">
            <div className="chat-thinking">
              <div className="chat-dot"/><div className="chat-dot"/><div className="chat-dot"/>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div className="chat-input-bar">
        <textarea className="chat-textarea" placeholder="Ask anything about your relocation…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} rows={1}/>
        <button className="chat-send" onClick={send} disabled={!input.trim()||loading}>{loading?"⏳":"➤"}</button>
      </div>
    </div>
  );
}

function FlightPanel(){
  return(
    <div className="flight-panel">
      <div className="flight-panel-title">✈️ Book Your Flight — TLV → PER</div>
      <div className="flight-panel-meta">
        <strong>One-way</strong> · <strong>Jun 20, 2026</strong> · <strong>±5 days flexible</strong> · 2 adults · 2 children · 1 stop · Economy
      </div>
      <div className="flight-btns">
        {FLIGHT_LINKS.map(p=>(
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flight-btn"
            style={{background:p.colorDim, borderColor:`${p.color}55`, color:p.color}}
            title={p.note}
          >
            <span className="flight-btn-ico">{p.icon}</span>
            <span className="flight-btn-name">{p.name}</span>
            <span className="flight-btn-arrow">↗</span>
          </a>
        ))}
      </div>
      <div style={{marginTop:10,fontSize:10,color:"var(--t3)"}}>
        Opens in new tab · Filters pre-applied where supported · Verify pax count on landing page
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ITEM MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ItemModal({a,defaultPlanId,plans,docs,setDocs,drive,onSave,onClose}){
  const blank={id:"",planId:defaultPlanId||plans[0]?.id||"p1",title:"",desc:"",owner:"Raz",priority:"High",status:"tbd",phase:"Month -3",ddate:"",cost:"",cur:"ILS",cost2:"",cur2:"AUD",vendor:"",comments:"",subs:[],income:"",incomeCur:"ILS",incomeDate:""};
  const [f,setF] = useState(a||blank);
  const [adv,setAdv] = useState(!!a?.id);
  const [ns,setNs] = useState("");
  // finType: "expense" | "income" | "" (no financial value)
  const initFinType = () => { if(a?.income&&+a.income>0) return "income"; if(a?.cost||a?.cost2) return "expense"; return ""; };
  const [finType,setFinType] = useState(initFinType);
  const [pendingDocFiles,setPendingDocFiles] = useState([]);
  const [docUploading,setDocUploading] = useState(false);
  const docFileRef = useRef();
  const sf=(k,v)=>setF(p=>({...p,[k]:v}));

  useEffect(()=>{
    if(f.subs?.some(s=>s.done)&&f.status==="tbd") sf("status","in progress");
  },[f.subs]);

  const switchFinType = type => {
    setFinType(type);
    // clear the fields that belong to the other type
    if(type==="income") setF(p=>({...p,cost:"",cur:"ILS",cost2:"",cur2:"AUD",settled:false,settledDate:""}));
    if(type==="expense") setF(p=>({...p,income:"",incomeCur:"ILS",incomeDate:""}));
    if(type==="") setF(p=>({...p,cost:"",cur:"ILS",cost2:"",cur2:"AUD",settled:false,settledDate:"",income:"",incomeCur:"ILS",incomeDate:""}));
  };

  const handleDocFiles = e => {
    const files = Array.from(e.target.files||[]);
    setPendingDocFiles(prev=>[...prev,...files]);
    e.target.value="";
  };

  const removeDocFile = idx => setPendingDocFiles(prev=>prev.filter((_,i)=>i!==idx));

  const handleSave = async () => {
    if(finType==="expense"&&f.settled&&!f.settledDate){alert("Please enter a settlement date");return;}
    const itemId = f.id || ("a"+Date.now());
    const savedItem = {...f, id:itemId};

    if(pendingDocFiles.length>0 && setDocs){
      setDocUploading(true);
      for(let i=0;i<pendingDocFiles.length;i++){
        const file = pendingDocFiles[i];
        let files=[];
        if(drive?.isAuthed){
          try{
            const folder = await driveEnsureFolder(drive.token,"General",DRIVE_ROOT);
            const uploaded = await driveUploadFile(drive.token,file,folder.id,()=>{});
            files=[{id:"f"+Date.now()+i,driveFileId:uploaded.id,driveFileName:uploaded.name,driveUrl:uploaded.webViewLink}];
          }catch(e){/* drive failed, doc still created without file */}
        }
        setDocs(prev=>[...prev,{id:"d"+Date.now()+i,type:file.name.replace(/\.[^.]+$/,""),category:"General",status:"collected",exp:"",aid:itemId,files,notes:""}]);
      }
      setDocUploading(false);
    }
    onSave(savedItem);
  };

  const linkedDocs = (docs||[]).filter(d=>d.aid===f.id&&f.id);

  return(
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">{a?.id?"Edit Item":"New Item"}</div>

        {/* QUICK FIELDS */}
        <div className="fg">
          <div className="fcol span2">
            <div className="flabel">Plan</div>
            <select className="fselect" value={f.planId} onChange={e=>sf("planId",e.target.value)}>
              {plans.map(p=><option key={p.id} value={p.id}>{p.icon} {p.title}</option>)}
            </select>
          </div>
          <div className="fcol span2">
            <div className="flabel">Title *</div>
            <input className="finput" value={f.title} onChange={e=>sf("title",e.target.value)} placeholder="What needs to be done?" autoFocus/>
          </div>
          <div className="fcol">
            <div className="flabel">Owner</div>
            <select className="fselect" value={f.owner} onChange={e=>sf("owner",e.target.value)}>
              {["Raz","Shahar","Both","Kids","External"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="fcol">
            <div className="flabel">Priority</div>
            <select className="fselect" value={f.priority} onChange={e=>sf("priority",e.target.value)}>
              {["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="fcol">
            <div className="flabel">Due Date</div>
            <input type="date" className="finput" value={f.ddate} onChange={e=>sf("ddate",e.target.value)}/>
          </div>
          <div className="fcol">
            <div className="flabel">Status</div>
            <select className="fselect" value={f.status} onChange={e=>sf("status",e.target.value)}>
              {["tbd","in progress","irrelevant","done"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* ADVANCED EXPAND */}
        <div className="expand-toggle" onClick={()=>setAdv(v=>!v)}>
          <span style={{fontSize:13}}>{adv?"▾":"▸"}</span>
          <span>{adv?"Hide advanced fields":"More options (cost, phase, subtasks…)"}</span>
        </div>

        {adv&&(
          <>
            <div className="fg">
              <div className="fcol">
                <div className="flabel">Phase</div>
                <select className="fselect" value={f.phase} onChange={e=>sf("phase",e.target.value)}>
                  {PHASES.map(p=><option key={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div className="fcol">
                <div className="flabel">Vendor / Party</div>
                <input className="finput" value={f.vendor} onChange={e=>sf("vendor",e.target.value)}/>
              </div>

              {/* FINANCIAL VALUE — single section, toggled type */}
              <div className="fcol span2">
                <div className="flabel">Financial value</div>
                <div style={{display:"flex",gap:6,marginBottom:8}}>
                  {[["","None"],["expense","💸 Expense"],["income","💵 Income"]].map(([v,lbl])=>(
                    <button key={v} type="button"
                      className={"btn btn-sm "+(finType===v?"btn-g":"btn-s")}
                      style={{flex:1,fontSize:11}}
                      onClick={()=>switchFinType(v)}
                    >{lbl}</button>
                  ))}
                </div>

                {finType==="expense"&&(
                  <>
                    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr auto",gap:6,alignItems:"center"}}>
                      <input type="number" className="finput" value={f.cost} onChange={e=>sf("cost",e.target.value)} placeholder="Amount"/>
                      <select className="fselect" value={f.cur} onChange={e=>sf("cur",e.target.value)} style={{width:72}}>
                        {["ILS","AUD","USD"].map(c=><option key={c}>{c}</option>)}
                      </select>
                      <input type="number" className="finput" value={f.cost2||""} onChange={e=>sf("cost2",e.target.value)} placeholder="Alt amount (optional)"/>
                      <select className="fselect" value={f.cur2||"AUD"} onChange={e=>sf("cur2",e.target.value)} style={{width:72}}>
                        {["ILS","AUD","USD"].map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{display:"flex",gap:10,marginTop:8,alignItems:"center"}}>
                      <input type="checkbox" id="settled-cb" style={{width:16,height:16,accentColor:"var(--g)",cursor:"pointer"}} checked={!!f.settled} onChange={e=>sf("settled",e.target.checked)}/>
                      <label htmlFor="settled-cb" style={{fontSize:12,fontWeight:600,color:f.settled?"var(--g)":"var(--t1)",cursor:"pointer"}}>✅ Settled (paid)</label>
                      {f.settled&&(
                        <input type="date" className="finput" value={f.settledDate||""} onChange={e=>sf("settledDate",e.target.value)} style={{flex:1,borderColor:!f.settledDate?"var(--re)":""}}/>
                      )}
                    </div>
                  </>
                )}

                {finType==="income"&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:6,alignItems:"center"}}>
                    <input type="number" className="finput" value={f.income||""} onChange={e=>sf("income",e.target.value)} placeholder="Amount received"/>
                    <select className="fselect" value={f.incomeCur||"ILS"} onChange={e=>sf("incomeCur",e.target.value)} style={{width:72}}>
                      {["ILS","AUD","USD"].map(c=><option key={c}>{c}</option>)}
                    </select>
                    <input type="date" className="finput" value={f.incomeDate||""} onChange={e=>sf("incomeDate",e.target.value)} title="Date received (optional)"/>
                  </div>
                )}
              </div>

              <div className="fcol span2">
                <div className="flabel">Description</div>
                <textarea className="ftextarea" value={f.desc} onChange={e=>sf("desc",e.target.value)} rows={2}/>
              </div>
              <div className="fcol span2">
                <div className="flabel">Comments</div>
                <textarea className="ftextarea" value={f.comments} onChange={e=>sf("comments",e.target.value)} rows={2}/>
              </div>
            </div>

            {/* SUBTASKS */}
            <div className="modal-section">Subtasks</div>
            {(f.subs||[]).map(sub=>(
              <div key={sub.id} className="sub-row">
                <input type="checkbox" className="sub-check" checked={sub.done} onChange={()=>sf("subs",f.subs.map(x=>x.id===sub.id?{...x,done:!x.done}:x))}/>
                <span style={{flex:1,fontSize:12,textDecoration:sub.done?"line-through":"none",color:sub.done?"var(--t2)":"var(--t0)"}}>{sub.t}</span>
                <button style={{background:"none",border:"none",color:"var(--t2)",cursor:"pointer",fontSize:12,padding:"0 4px"}} onClick={()=>sf("subs",f.subs.filter(x=>x.id!==sub.id))}>✕</button>
              </div>
            ))}
            <div style={{display:"flex",gap:7,marginTop:9}}>
              <input className="finput" style={{flex:1}} placeholder="Add subtask…" value={ns} onChange={e=>setNs(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&ns.trim()){sf("subs",[...(f.subs||[]),{id:"s"+Date.now(),t:ns,done:false}]);setNs("");}}}/>
              <button className="btn btn-s btn-sm" onClick={()=>{if(ns.trim()){sf("subs",[...(f.subs||[]),{id:"s"+Date.now(),t:ns,done:false}]);setNs("");}}}>+ Add</button>
            </div>

            {/* DOCUMENTS */}
            <div className="modal-section">Documents</div>
            {linkedDocs.length>0&&(
              <div style={{marginBottom:8}}>
                {linkedDocs.map(d=>(
                  <div key={d.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid var(--bd)"}}>
                    <span style={{fontSize:12,flex:1,color:"var(--t0)"}}>{d.type||"Document"}</span>
                    <span className={`tag ${DOC_STATUS_CLS[d.status||"pending"]}`}>{DOC_STATUS_LABEL[d.status||"pending"]}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <input type="file" ref={docFileRef} style={{display:"none"}} multiple onChange={handleDocFiles}/>
              <button className="btn btn-s btn-sm" onClick={()=>docFileRef.current?.click()}>📎 Attach file</button>
              {pendingDocFiles.length>0&&<span style={{fontSize:11,color:"var(--t2)"}}>{pendingDocFiles.length} file{pendingDocFiles.length>1?"s":""} queued</span>}
            </div>
            {pendingDocFiles.length>0&&(
              <div style={{marginTop:8}}>
                {pendingDocFiles.map((file,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",fontSize:12}}>
                    <span style={{flex:1,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📄 {file.name}</span>
                    <button style={{background:"none",border:"none",color:"var(--t2)",cursor:"pointer",fontSize:12,padding:"0 4px"}} onClick={()=>removeDocFile(i)}>✕</button>
                  </div>
                ))}
                <div style={{fontSize:11,color:"var(--t2)",marginTop:4}}>
                  {drive?.isAuthed?"Will upload to Google Drive on save.":"Files linked to this item · upload to Drive from the Docs tab."}
                </div>
              </div>
            )}
          </>
        )}

        <div className="modal-footer">
          <button className="btn btn-s" onClick={onClose}>Cancel</button>
          <button className="btn btn-g" onClick={handleSave} disabled={docUploading}>
            {docUploading?"Uploading…":"Save Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
