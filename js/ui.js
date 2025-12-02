import { state } from './state.js';
import { loadAll } from './auth.js';

export function $id(id){ return document.getElementById(id); }

export function showSection(id){
  document.querySelectorAll('main section').forEach(s=>s.classList.add('hidden'));
  const el = document.getElementById(id);
  if(el) el.classList.remove('hidden');
  document.querySelectorAll('#sidebar button').forEach(b=>b.classList.remove('active'));
  const btn = document.querySelector(`#sidebar button[data-sec="${id}"]`);
  if(btn) btn.classList.add('active');
}

export function applyRoleUI(){
  const h = $id('headerUser');
  if(state.currentUser){
    h.innerText = state.currentUser.username + ' (' + state.currentUser.role + ')';
    $id('btnLogout').style.display = 'inline-block';
  } else {
    h.innerText = '';
    $id('btnLogout').style.display = 'none';
  }
}

export function renderFundList(){
  const box = $id('fundList');
  if(!box) return;
  box.innerHTML = '';
  state.foundations.forEach(f=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.style.marginBottom = '8px';
    div.innerHTML = `<strong>${f.name}</strong><div class='small'>NIT: ${f.nit}</div>`;
    box.appendChild(div);
  });
}

export function renderFundSelectors(){
  const sel = $id('selFund');
  const pd_fund = $id('pd_fund');
  const seg_fund = $id('seg_fund');
  if(sel) { sel.innerHTML = ''; state.foundations.forEach((f,i)=> sel.appendChild(new Option(f.name + ' ('+f.nit+')', f.id))); }
  if(pd_fund) { pd_fund.innerHTML = ''; state.foundations.forEach((f,i)=> pd_fund.appendChild(new Option(f.name + ' ('+f.nit+')', f.id))); }
  if(seg_fund) { seg_fund.innerHTML = ''; seg_fund.appendChild(new Option('Todas','')); state.foundations.forEach(f=> seg_fund.appendChild(new Option(f.name+' ('+f.nit+')', f.nit))); }
}

export function renderItemsTable(){
  const tbody = $id('itemsTable').querySelector('tbody');
  if(!tbody) return;
  tbody.innerHTML = '';
  state.items.forEach(it=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${it.name}</td><td>${it.description||''}</td><td>$${it.price||0}</td><td><button data-id='${it.id}' class='delItem'>Eliminar</button></td>`;
    tbody.appendChild(tr);
  });
  document.querySelectorAll('.delItem').forEach(b=> b.onclick = async ()=> {
    const id = b.dataset.id;
    if(!state.currentUser || state.currentUser.role !== 'admin'){ alert('Solo admin puede eliminar'); return; }
    // deletion handled in items module
  });
}

export function renderDrivers(){
  const ul = $id('driversList');
  if(!ul) return;
  ul.innerHTML = '';
  state.drivers.forEach(d=>{
    const li = document.createElement('li');
    li.textContent = d.name + ' — ' + (d.document||'');
    ul.appendChild(li);
  });
}

export function renderPlates(){
  const ul = $id('platesList');
  if(!ul) return;
  ul.innerHTML = '';
  state.plates.forEach(p=>{
    const li = document.createElement('li');
    li.textContent = p.plate + ' (' + (p.type||'') + ')';
    ul.appendChild(li);
  });
}

export function renderPacks(){
  const ul = $id('packList');
  if(!ul) return;
  ul.innerHTML = '';
  state.packs.forEach((p,i)=>{
    const li = document.createElement('li');
    li.textContent = p;
    ul.appendChild(li);
  });
}

export function renderPedidosList(){
  const ul = $id('pedidosList');
  if(!ul) return;
  ul.innerHTML = '';
  state.pedidos.forEach(p=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>${p.id}</strong> — ${p.foundation_name||p.foundation} — $${p.total||0} <div class='small'>${new Date(p.created_at||p.createdAt||Date.now()).toLocaleString()}</div>`;
    ul.appendChild(li);
  });
}

export async function renderAll(){
  await loadAll();
  applyRoleUI();
  renderFundList();
  renderFundSelectors();
  renderItemsTable();
  renderDrivers();
  renderPlates();
  renderPacks();
  renderPedidosList();
  // populate audit users
  const aud = $id('audit_user_filter');
  if(aud) { aud.innerHTML = ''; aud.appendChild(new Option('Todos','')); (state.users||[]).forEach(u=> aud.appendChild(new Option(u.username,u.username))); }
}
// === TOGGLE MENU ===
const btnMenu = document.getElementById("btnMenu");
const sidebar = document.getElementById("sidebar");
const app = document.querySelector(".app");

document.addEventListener("DOMContentLoaded", () => {
  const closed = localStorage.getItem("menu_closed") === "1";
  if (closed) {
    sidebar.classList.add("closed");
    app.classList.add("expanded");
  }
});

btnMenu.addEventListener("click", () => {
  const isClosed = sidebar.classList.toggle("closed");
  app.classList.toggle("expanded", isClosed);
  localStorage.setItem("menu_closed", isClosed ? "1" : "0");
});

