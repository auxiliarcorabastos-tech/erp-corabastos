import { state, saveState } from './state.js';

/* -----------------------------
   SIDEBAR TOGGLE SEGURO
----------------------------- */
export function setupSidebarToggle(){
  const btn = document.getElementById('btnMenu');
  const sidebar = document.getElementById('sidebar');

  // 🔥 FIX: tu contenedor principal no es "main", es "#content"
  const main = document.getElementById('content') || document.querySelector('main');

  if(!btn || !sidebar || !main){
    console.warn('Sidebar toggle: faltan elementos');
    return;
  }

  btn.addEventListener('click', ()=>{
    const isMobile = window.innerWidth <= 900;

    if(isMobile){
      // 🔥 móvil: aparece flotante SIN overlay
      sidebar.classList.toggle('open');
    } else {
      // 🔥 escritorio: cambia width, NO bloquea clics
      const hidden = sidebar.classList.toggle('sidebar-hidden');
      main.classList.toggle('expanded', hidden);

      // persistencia
      try{
        localStorage.setItem('erp_sidebar_hidden', hidden ? '1' : '0');
      }catch(e){}
    }
  });

  // Cargar estado guardado SOLO desktop
  try{
    const saved = localStorage.getItem('erp_sidebar_hidden') === '1';
    if(window.innerWidth > 900 && saved){
      sidebar.classList.add('sidebar-hidden');
      main.classList.add('expanded');
    }
  }catch(e){}
}

/* ======================================================
      🔥 EXCEL: IMPORTAR PLACAS
====================================================== */
export function importPlatesFromExcelFile(file){
  if(!file) return alert('Seleccione un archivo');
  const reader = new FileReader();
  reader.onload = (e) => {
    try{
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, {type:'array'});
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, {header:1});
      let added = 0;

      rows.forEach((r,i)=>{
        if(i===0) return;
        const plate = String(r[0]||'').trim();
        const tipo  = String(r[1]||'').trim();
        if(!plate) return;

        if(!state.plates.some(p=>p.plate===plate)){
          state.plates.push({plate, type: tipo});
          added++;
        }
      });

      saveState();
      alert('Placas importadas: '+added);
      renderPlates();

    }catch(err){
      console.error(err);
      alert('Error leyendo excel');
    }
  };
  reader.readAsArrayBuffer(file);
}

/* ======================================================
      RENDERS LISTAS
====================================================== */
export function renderDrivers(){
  const ul = document.getElementById('driversList');
  if(!ul) return;
  ul.innerHTML = '';
  state.drivers.forEach(d=>{
    const li = document.createElement('li');
    li.textContent = `${d.name} — ${d.document||''}`;
    ul.appendChild(li);
  });
}

export function renderPlates(){
  const ul = document.getElementById('platesList');
  if(!ul) return;
  ul.innerHTML = '';
  state.plates.forEach(p=>{
    const li = document.createElement('li');
    li.textContent = `${p.plate} (${p.type||''})`;
    ul.appendChild(li);
  });
}

/* ======================================================
   AUTO-IMPORT DESDE assets/BASE DE DATOS.xlsx
====================================================== */
export async function initFromExcelAssets(){
  try{
    const res = await fetch('assets/BASE DE DATOS.xlsx');
    if(!res.ok) return;

    const ab = await res.arrayBuffer();
    const wb = XLSX.read(new Uint8Array(ab), {type:'array'});

    // 🔥 hoja 0 -> fundaciones
    if(wb.SheetNames.length>0){
      const s0 = wb.Sheets[wb.SheetNames[0]];
      const rows0 = XLSX.utils.sheet_to_json(s0,{header:1});
      rows0.forEach((r,i)=>{
        if(i===0) return;
        const nit  = String(r[0]||'').trim();
        const name = String(r[1]||'').trim();
        if(!nit || !name) return;

        if(!state.foundations.some(f=>f.nit===nit)){
          state.foundations.push({nit, name, points:[]});
        }
      });
    }

    // 🔥 hoja 1 -> items
    if(wb.SheetNames.length>1){
      const s1 = wb.Sheets[wb.SheetNames[1]];
      const rows1 = XLSX.utils.sheet_to_json(s1,{header:1});
      rows1.forEach((r,i)=>{
        if(i===0) return;
        const ref   = String(r[0]||'').trim();
        const name  = String(r[1]||'').trim();
        const price = Number(r[2]||0);
        const desc  = String(r[3]||'').trim();
        if(!ref || !name) return;

        if(!state.items.some(it=>it.ref===ref)){
          state.items.push({ref, name, price, desc});
        }
      });
    }

    // 🔥 hoja 2 -> placas
    if(wb.SheetNames.length>2){
      const s2 = wb.Sheets[wb.SheetNames[2]];
      const rows2 = XLSX.utils.sheet_to_json(s2,{header:1});
      rows2.forEach((r,i)=>{
        if(i===0) return;
        const plate = String(r[0]||'').trim();
        const tipo  = String(r[1]||'').trim();
        if(!plate) return;

        if(!state.plates.some(p=>p.plate===plate)){
          state.plates.push({plate, type: tipo});
        }
      });
    }

    saveState();
    renderDrivers();
    renderPlates();
    console.log('✔ Auto import desde assets/BASE DE DATOS.xlsx finalizado');

  }catch(e){
    console.warn('⚠ No se pudo importar desde assets', e);
  }
}

/* ======================================================
   🔥 FIX A NIVEL GLOBAL (opcional pero recomendado)
====================================================== */

// Evita overlays invisibles
document.body.style.pointerEvents = 'auto';
