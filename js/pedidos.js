
import { state, saveState } from './state.js';
import { renderDrivers, renderPlates, importPlatesFromExcelFile, initFromExcelAssets } from './ui.js';

// setup bindings and UI actions
document.addEventListener('DOMContentLoaded', ()=>{
  // initial render
  renderDrivers();
  renderPlates();
  // init data from assets excel (if exists)
  initFromExcelAssets();

  // Import plates button
  const btnImp = document.getElementById('btnImportPlates');
  if(btnImp){
    btnImp.addEventListener('click', ()=>{
      const f = document.getElementById('excel_plates').files[0];
      if(!f) return alert('Seleccione archivo');
      importPlatesFromExcelFile(f);
    });
  }

  // Add plate manual
  const btnAddPlate = document.getElementById('btnAddPlate');
  if(btnAddPlate){
    btnAddPlate.addEventListener('click', ()=>{
      const plate = document.getElementById('pl_plate').value.trim();
      const tipo = document.getElementById('pl_type').value.trim();
      if(!plate) return alert('Placa requerida');
      if(!state.plates.some(p=>p.plate===plate)){
        state.plates.push({plate, type: tipo});
        saveState();
        renderPlates();
        document.getElementById('pl_plate').value='';
        document.getElementById('pl_type').value='';
      } else {
        alert('Placa ya existe');
      }
    });
  }

  // Drivers add
  const btnAddDrv = document.getElementById('btnAddDriver');
  if(btnAddDrv){
    btnAddDrv.addEventListener('click', ()=>{
      const name = document.getElementById('drv_name').value.trim();
      const doc = document.getElementById('drv_doc').value.trim();
      const tel = document.getElementById('drv_tel').value.trim();
      const cmp = document.getElementById('drv_cmp').value.trim();
      if(!name) return alert('Nombre requerido');
      state.drivers.push({name, document: doc, phone: tel, company: cmp});
      saveState();
      renderDrivers();
      document.getElementById('drv_name').value='';
      document.getElementById('drv_doc').value='';
      document.getElementById('drv_tel').value='';
      document.getElementById('drv_cmp').value='';
    });
  }

  // Pedido nit autocomplete: fill pd_fund with matching foundations
  const pd_nit = document.getElementById('pd_nit');
  const pd_fund = document.getElementById('pd_fund');
  const pd_point = document.getElementById('pd_point');
  if(pd_nit){
    pd_nit.addEventListener('input', ()=>{
      const q = pd_nit.value.trim();
      document.getElementById('pd_fund_info').textContent='';
      pd_fund.innerHTML='';
      if(!q) return;
      const matches = state.foundations.filter(f=> f.nit.includes(q) || f.name.toLowerCase().includes(q.toLowerCase()));
      matches.forEach((f,i)=> pd_fund.appendChild(new Option(f.name+' ('+f.nit+')', i)));
      if(matches.length===1){
        document.getElementById('pd_fund_info').textContent = matches[0].name;
      }
    });
  }

  if(pd_fund){
    pd_fund.addEventListener('change', ()=>{
      const idx = Number(pd_fund.value);
      const f = state.foundations[idx];
      pd_point.innerHTML='';
      if(!f || !f.points) return;
      f.points.forEach((p,i)=> pd_point.appendChild(new Option(p.barrio+' - '+p.ciudad, i)));
    });
  }

  // Add pedido
  document.getElementById('btnAddPedido').addEventListener('click', ()=>{
    const fi = Number(pd_fund.value);
    const f = state.foundations[fi];
    if(!f) return alert('Seleccione fundación');
    const pi = Number(pd_point.value);
    const point = f.points ? f.points[pi] : null;
    if(!point) return alert('Seleccione punto');
    // basic items gathered earlier in UI skipped for brevity; create a simple pedido
    const pedido = {
      id: 'PED-'+Date.now(),
      foundation: f.name,
      foundationNIT: f.nit,
      point,
      createdAt: new Date().toISOString()
    };
    state.pedidos.unshift(pedido);
    saveState();
    alert('Pedido guardado: '+pedido.id);
    // refresh list
    const ul = document.getElementById('pedidosList');
    if(ul) ul.prepend(new Option(pedido.id));
    renderDrivers();
    renderPlates();
  });

});
