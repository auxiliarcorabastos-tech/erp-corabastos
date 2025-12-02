
function initConductoresModule(){
  if(!window.erpState) return;
  const { state, save } = window.erpState;
  function render(){
    const ul = document.getElementById('driversList'); ul.innerHTML=''; state.drivers.forEach(d=>{ const li=document.createElement('li'); li.textContent = d.name + ' — ' + (d.document||''); ul.appendChild(li); });
    const ulp = document.getElementById('platesList'); ulp.innerHTML=''; state.plates.forEach(p=>{ const li=document.createElement('li'); li.textContent = p.plate + ' ('+(p.type||'')+')'; ulp.appendChild(li); });
    const sd = document.getElementById('pd_driver'); if(sd){ sd.innerHTML=''; state.drivers.forEach((d,i)=> sd.appendChild(new Option(d.name, i))); }
    const sp = document.getElementById('pd_plate'); if(sp){ sp.innerHTML=''; state.plates.forEach((p,i)=> sp.appendChild(new Option(p.plate, i))); }
  }
  document.getElementById('btnAddDriver').addEventListener('click', ()=>{
    const name = document.getElementById('drv_name').value.trim();
    const doc = document.getElementById('drv_doc').value.trim();
    if(!name) return alert('Nombre requerido');
    state.drivers.push({name,document:doc}); save(); render();
    document.getElementById('drv_name').value=''; document.getElementById('drv_doc').value='';
  });
  document.getElementById('btnImportPlates').addEventListener('click', ()=>{
    const file = document.getElementById('excel_plates').files[0]; if(!file) return alert('Seleccione archivo');
    const reader = new FileReader();
    reader.onload = (e)=>{ const data = new Uint8Array(e.target.result); const wb = XLSX.read(data,{type:'array'}); const sheet = wb.Sheets[wb.SheetNames[0]]; const rows = XLSX.utils.sheet_to_json(sheet,{header:1}); let added=0; rows.forEach((r,i)=>{ if(i===0) return; const plate = String(r[0]||'').trim(); const tipo = String(r[1]||'').trim(); if(!plate) return; if(!state.plates.some(p=>p.plate===plate)){ state.plates.push({plate,type:tipo}); added++; } }); save(); render(); alert('Placas importadas: '+added); };
    reader.readAsArrayBuffer(file);
  });
  render();
  window.renderDrivers = render;
}
initConductoresModule();
