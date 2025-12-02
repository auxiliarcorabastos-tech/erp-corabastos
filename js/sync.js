
// simple sync stub using provided script endpoint
const SYNC_URL = "https://script.google.com/macros/s/AKfycby-tt7UY_tChKNxfYY6OLTiDqOiDNnIr5wvnnkpksPzXUx970S_dL2QKELnSOCWi_i9/exec";
function pushStateToServer(){
  try{
    const payload = JSON.parse(JSON.stringify(window.erpState.state));
    fetch(SYNC_URL, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'push', data: payload})}).then(r=>r.json()).then(()=>{}).catch(()=>{});
  }catch(e){}
}
function pullStateFromServer(){
  fetch(SYNC_URL + '?action=pull').then(r=>r.json()).then(remote=>{ if(!remote||!remote.data) return; const local = window.erpState.state; const remoteState = remote.data;
    ['foundations','items','drivers','plates','pedidos'].forEach(key=>{ remoteState[key] = remoteState[key] || []; local[key] = local[key] || []; remoteState[key].forEach(r=>{ const exists = local[key].some(l=> { if(key==='foundations') return l.nit===r.nit; if(key==='items') return l.ref===r.ref; if(key==='drivers') return l.name===r.name && l.document===r.document; if(key==='plates') return l.plate===r.plate; if(key==='pedidos') return l.id===r.id; return false; }); if(!exists) local[key].push(r); }); });
    window.erpState.save();
    if(window.renderFundaciones) window.renderFundaciones(); if(window.renderItems) window.renderItems(); if(window.renderDrivers) window.renderDrivers(); if(window.renderPedidos) window.renderPedidos();
  }).catch(()=>{});
}
function startAutoSync(){ setInterval(()=>{ pushStateToServer(); pullStateFromServer(); }, 10000); }
window.startAutoSync = startAutoSync;
