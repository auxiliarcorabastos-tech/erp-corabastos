
// pedidos module expects window.erpState present
function initPedidosModule(){
  if(!window.erpState) return;
  const { state, save } = window.erpState;
  // expose helpers
  window.fillPedidoPoints = function(){
    const pf = document.getElementById('pd_fund'); const selPoint = document.getElementById('pd_point');
    if(!pf || !selPoint) return;
    const fi = Number(pf.value||0); const f = state.foundations[fi];
    selPoint.innerHTML=''; if(f && Array.isArray(f.points)){ f.points.forEach((p,i)=> selPoint.appendChild(new Option(p.barrio+' ('+p.ciudad+')', i))); }
  };
  // fill selects
  function fillSelects(){
    const pf = document.getElementById('pd_fund'); if(pf){ pf.innerHTML=''; state.foundations.forEach((f,i)=> pf.appendChild(new Option(f.name+' ('+f.nit+')', i))); }
    const pi = document.getElementById('pd_item_sel'); if(pi){ pi.innerHTML=''; state.items.forEach((it,i)=> pi.appendChild(new Option(it.name+' ('+it.ref+')', i))); }
    const packs = document.getElementById('pd_pack_sel'); if(packs){ packs.innerHTML=''; packs.appendChild(new Option('','')); state.packs.forEach(p=> packs.appendChild(new Option(p,p))); }
    const sd = document.getElementById('pd_driver'); if(sd){ sd.innerHTML=''; state.drivers.forEach((d,i)=> sd.appendChild(new Option(d.name, i))); }
    const sp = document.getElementById('pd_plate'); if(sp){ sp.innerHTML=''; state.plates.forEach((p,i)=> sp.appendChild(new Option(p.plate, i))); }
  }
  fillSelects();

  // wire pd_nit autocomplete behavior
  document.getElementById('pd_nit').addEventListener('input', ()=>{
    const nit = document.getElementById('pd_nit').value.trim();
    const found = state.foundations.filter(f=> f.nit && f.nit.indexOf(nit) === 0);
    const info = document.getElementById('pd_fund_info');
    if(found.length===1) info.textContent = found[0].name;
    else if(found.length>1) info.textContent = found.length+' coincidencias';
    else info.textContent = '';
    fillSelects();
    window.fillPedidoPoints();
  });

  // rest of interactions provided in pedidos.js (separate file)
}
initPedidosModule();
