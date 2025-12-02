
function initApp(){
  // ensure functions defined
  if(!window.erpState) return;
  const { state, save } = window.erpState;
  window.initFromExcelAssets = window.initFromExcelAssets || function(){};
  // render fund list
  function renderFund(){
    const box = document.getElementById('fundList');
    box.innerHTML='';
    state.foundations.forEach(f=>{
      const d=document.createElement('div'); d.className='card';
      d.innerHTML = '<strong>'+ (f.name||'') +'</strong><div class="small">NIT: '+(f.nit||'')+'</div>';
      box.appendChild(d);
    });
    const pf = document.getElementById('pd_fund');
    if(pf){ pf.innerHTML=''; state.foundations.forEach((f,i)=> pf.appendChild(new Option(f.name+' ('+f.nit+')', i))); fillPedidoPoints(); }
  }
  document.getElementById('btnFundCreate').addEventListener('click', ()=>{
    const nit=document.getElementById('f_nit').value.trim(); const name=document.getElementById('f_name').value.trim();
    if(!nit||!name) return alert('NIT y nombre requeridos');
    if(state.foundations.some(x=>x.nit===nit)) return alert('NIT ya existe');
    state.foundations.push({nit, name, points:[]}); save(); renderFund();
    document.getElementById('f_nit').value=''; document.getElementById('f_name').value='';
  });
  renderFund();
}
