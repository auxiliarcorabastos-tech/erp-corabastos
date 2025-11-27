import './supabase.js';
import { state } from './state.js';
import { login, logout, loadAll } from './auth.js';
import { createFoundation, createPoint, listFoundations } from './fundaciones.js';
import { createItem, listItems } from './items.js';
import { createDriver, createPlate } from './conductores.js';
import { createPedido } from './pedidos.js';
import { registrarAccion } from './auditoria.js';
import { showSection, renderAll, $id, applyRoleUI, renderFundSelectors, renderPacks } from './ui.js';

// wire navigation
document.querySelectorAll('#sidebar button').forEach(b=> b.addEventListener('click', ()=> showSection(b.dataset.sec) ));
$id('btnMenu').addEventListener('click', ()=> document.getElementById('sidebar').classList.toggle('open'));

// login modal
async function showLogin(){
  const box = document.createElement('div');
  box.id='loginBox';
  box.style.cssText='position:fixed;inset:0;background:rgba(11,18,32,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
  box.innerHTML = `
    <div style="background:#fff;padding:20px;border-radius:10px;width:340px;box-shadow:0 8px 30px rgba(2,6,23,0.3)">
      <h3 style="margin-top:0;text-align:center">Iniciar Sesión</h3>
      <label>Usuario</label><input id="lg_user" style="width:100%;margin-bottom:8px">
      <label>Contraseña</label><input id="lg_pass" type="password" style="width:100%">
      <div style="margin-top:12px"><button id="lg_btn" class="primary" style="width:100%">Ingresar</button></div>
      <div id="lg_load" class="small" style="text-align:center;margin-top:8px;display:none">Iniciando sesión...</div>
    </div>
  `;
  document.body.appendChild(box);
  const inpUser = $id('lg_user'), inpPass = $id('lg_pass'), btn = $id('lg_btn');
  btn.addEventListener('click', async ()=>{
    const u = inpUser.value.trim(), p = inpPass.value.trim();
    if(!u||!p){ alert('Usuario y contraseña requeridos'); return; }
    btn.disabled = true;
    const res = await login(u,p);
    btn.disabled = false;
    if(!res.ok){ alert('Error: ' + (res.error || 'Login failed')); return; }
    box.remove();
    await renderAll();
    showSection('dashboard');
  });
}

// initial
(async function init(){
  await renderAll();
  // if no user, show login
  if(!state.currentUser) await showLogin();
  else { applyRoleUI(); showSection('dashboard'); }

  // handlers
  $id('btnFundCreate')?.addEventListener('click', async ()=>{
    const nit = $id('f_nit').value.trim(), name = $id('f_name').value.trim();
    if(!nit||!name) return alert('Complete NIT y Nombre');
    try{
      await createFoundation(nit,name);
      $id('f_nit').value=''; $id('f_name').value='';
      alert('Fundación creada');
    }catch(e){ alert('Error: '+e.message); }
  });

  $id('btnPointCreate')?.addEventListener('click', async ()=>{
    const fid = Number($id('selFund').value);
    if(!fid) return alert('Seleccione fundación');
    const p = {
      barrio: $id('p_barrio').value.trim(),
      localidad: $id('p_localidad').value.trim(),
      ciudad: $id('p_ciudad').value.trim(),
      tel1: $id('p_tel1').value.trim(),
      tel2: $id('p_tel2').value.trim(),
      encargada: $id('p_encargada').value.trim()
    };
    try{
      await createPoint(fid, p);
      $id('p_barrio').value=''; $id('p_localidad').value=''; $id('p_ciudad').value=''; $id('p_tel1').value=''; $id('p_tel2').value=''; $id('p_encargada').value='';
      alert('Punto agregado');
    }catch(e){ alert('Error: '+e.message); }
  });

  $id('btnCreateItem')?.addEventListener('click', async ()=>{
    const name = $id('item_name').value.trim();
    if(!name) return alert('Nombre requerido');
    const desc = $id('item_desc').value.trim(), price = Number($id('item_price').value)||0;
    try{
      await createItem(name, desc, price);
      $id('item_name').value=''; $id('item_desc').value=''; $id('item_price').value='';
      alert('Item creado');
    }catch(e){ alert('Error: '+e.message); }
  });

  $id('btnAddPack')?.addEventListener('click', ()=>{
    const v = $id('new_pack').value.trim();
    if(!v) return alert('Ingrese nombre');
    // store client-side pack and re-render
    state.packs = state.packs || [];
    state.packs.push(v);
    $id('new_pack').value='';
    renderPacks();
  });

  $id('btnAddDriver')?.addEventListener('click', async ()=>{
    const d = { name: $id('drv_name').value.trim(), document: $id('drv_doc').value.trim(), phone: $id('drv_tel').value.trim(), company: $id('drv_cmp').value.trim() };
    if(!d.name) return alert('Nombre requerido');
    try{
      await createDriver(d);
      $id('drv_name').value=''; $id('drv_doc').value=''; $id('drv_tel').value=''; $id('drv_cmp').value='';
      alert('Conductor agregado');
    }catch(e){ alert('Error: '+e.message); }
  });

  $id('btnAddPlate')?.addEventListener('click', async ()=>{
    const p = { plate: $id('pl_plate').value.trim(), type: $id('pl_type').value.trim() };
    if(!p.plate) return alert('Placa requerida');
    try{
      await createPlate(p);
      $id('pl_plate').value=''; $id('pl_type').value='';
      alert('Placa agregada');
    }catch(e){ alert('Error: '+e.message); }
  });

  // pedidos
  let currentPedidoItems = [];
  function refreshPdItems(){
    const ul = $id('pd_items_list'); if(!ul) return; ul.innerHTML='';
    currentPedidoItems.forEach((it,idx)=>{ const li=document.createElement('li'); li.style.marginBottom='6px'; li.textContent = it.name + ' x' + (it.qty||1) + ' — ' + (it.kgs? it.kgs+'kg':'' ) + ' — $'+(it.price||0); const del=document.createElement('button'); del.textContent='Eliminar'; del.style.marginLeft='8px'; del.onclick=()=>{ currentPedidoItems.splice(idx,1); refreshPdItems(); }; li.appendChild(del); ul.appendChild(li); });
  }
  $id('pd_add_item')?.addEventListener('click', ()=>{
    const idx = Number($id('pd_item_sel').value);
    if(isNaN(idx)) return alert('Seleccione item');
    const item = state.items.find(x=>x.id==idx);
    if(!item) return alert('Item no válido');
    const pack = $id('pd_pack_sel').value || '';
    const packQty = Number($id('pd_pack_qty').value)||1;
    const kgs = Number($id('pd_kilos').value) || 0;
    const qty = packQty || 1;
    currentPedidoItems.push({ name: item.name, price: item.price, qty, pack, kgs });
    refreshPdItems();
  });

  $id('btnAddPedido')?.addEventListener('click', async ()=>{
    if(!state.currentUser) return alert('Inicie sesión');
    const fid = Number($id('pd_fund').value);
    const f = state.foundations.find(x=>x.id==fid);
    if(!f) return alert('Seleccione fundación');
    const pi = Number($id('pd_point').value);
    // points stored separately; to simplify, user selects point id from select value (we'll fill it with point ids)
    const point_id = Number($id('pd_point').value);
    if(!point_id) return alert('Seleccione punto');
    if(currentPedidoItems.length===0) return alert('Agregue items');
    const peaje = Number($id('pd_peaje').value)||0; const trans = Number($id('pd_trans').value)||0;
    const subtotal = currentPedidoItems.reduce((s,it)=> s + (it.price||0)*(it.qty||1), 0);
    const total = subtotal + peaje + trans;
    const drvId = Number($id('pd_driver').value) || null;
    const plateId = Number($id('pd_plate').value) || null;
    try{
      await createPedido({ foundation_id: fid, point_id: point_id, driver_id: drvId, plate_id: plateId, peaje, trans, total, items: currentPedidoItems });
      currentPedidoItems = [];
      refreshPdItems();
      alert('Pedido creado');
    }catch(e){ alert('Error: '+e.message); }
  });

  // logout
  $id('btnLogout').addEventListener('click', ()=>{ if(confirm('¿Cerrar sesión?')){ logout(); location.reload(); } });

  // initial show
  showSection('dashboard');

})();
