import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  "https://drvurgbsuiwnmwgikykg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydnVyZ2JzdWl3bm13Z2lreWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjc2NzIsImV4cCI6MjA3OTg0MzY3Mn0.pMAsD8ogQWLy-GPXs5fAmFCeokThb3pU4q46pdzDeyw"
);

// ELEMENTOS UI
const loginModal = document.getElementById("loginModal");
const loginUser = document.getElementById("login_user");
const loginPass = document.getElementById("login_pass");
const btnLogin  = document.getElementById("btnLogin");
const loginError = document.getElementById("loginError");

// ===============================
//   VERIFICAR SI HAY SESIÓN
// ===============================
supabase.auth.getSession().then(({ data }) => {
  if (!data.session) {
    loginModal.style.display = "flex";
  } else {
    loginModal.style.display = "none";
    cargarInterfaz(); // función principal luego del login
  }
});

// ===============================
//   LOGIN POR USUARIO
// ===============================
btnLogin.addEventListener("click", async () => {
  const usuario = loginUser.value.trim();
  const pass = loginPass.value.trim();

  if (!usuario || !pass) {
    loginError.textContent = "Complete todos los campos.";
    return;
  }

  // 1. Buscar usuario en tabla interna
  const { data: userRow, error } = await supabase
    .from("usuarios")
    .select("email")
    .eq("username", usuario)
    .single();

  if (error || !userRow) {
    loginError.textContent = "Usuario no encontrado.";
    return;
  }

  // 2. Autenticación real con Supabase Auth
  const { error: loginErrorSupabase } =
    await supabase.auth.signInWithPassword({
      email: userRow.email,
      password: pass
    });

  if (loginErrorSupabase) {
    loginError.textContent = "Contraseña incorrecta.";
    return;
  }

  loginModal.style.display = "none";
  cargarInterfaz();
});

// ===============================
//   FUNCIÓN PRINCIPAL POST LOGIN
// ===============================
function cargarInterfaz() {
  console.log("Usuario autenticado, cargando ERP...");
  // Aquí va TODO el código que ya tienes para mostrar la app
}


// ------------------------------------------------------
// 2) Sistema de navegación entre módulos
// ------------------------------------------------------
const buttons = document.querySelectorAll("aside button");
const sections = document.querySelectorAll("main section");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const sec = btn.dataset.sec;
    sections.forEach(s => s.classList.add("hidden"));
    document.getElementById(sec).classList.remove("hidden");
  });
});


// ------------------------------------------------------
// 3) --- CRUD FUNDACIONES ---
// ------------------------------------------------------

const fundSel = document.getElementById("selFund");
const pdFundSel = document.getElementById("pd_fund");
const segFundSel = document.getElementById("seg_fund");
const fundList = document.getElementById("fundList");

// ➤ Cargar fundaciones
async function loadFundaciones() {
  const { data, error } = await supabase.from("fundaciones").select("*").order("nombre");

  if (error) return console.error(error);

  // Llenar selects
  [fundSel, pdFundSel, segFundSel].forEach(sel => {
    if (!sel) return;
    sel.innerHTML = `<option value="">Seleccione</option>`;
    data.forEach(f => {
      sel.innerHTML += `<option value="${f.id}">${f.nombre}</option>`;
    });
  });

  // Listado visual
  fundList.innerHTML = "";
  data.forEach(f => {
    fundList.innerHTML += `
      <div class="small" style="margin-bottom:8px;padding:6px;border:1px solid #333;border-radius:6px">
        <b>${f.nombre}</b><br>
        NIT: ${f.nit}
      </div>`;
  });
}


// ➤ Crear fundación
document.getElementById("btnFundCreate").addEventListener("click", async () => {
  const nit = document.getElementById("f_nit").value;
  const nombre = document.getElementById("f_name").value;

  if (!nit || !nombre) return alert("Complete los campos");

  const { error } = await supabase.from("fundaciones").insert({ nit, nombre });

  if (error) return alert("Error: " + error.message);

  alert("Fundación creada");
  loadFundaciones();
});


// ➤ Crear punto de envío
document.getElementById("btnPointCreate").addEventListener("click", async () => {
  const fund = fundSel.value;

  if (!fund) return alert("Seleccione la fundación");

  const payload = {
    fundacion_id: fund,
    barrio: p_barrio.value,
    localidad: p_localidad.value,
    ciudad: p_ciudad.value,
    telefono1: p_tel1.value,
    telefono2: p_tel2.value,
    encargada: p_encargada.value
  };

  const { error } = await supabase.from("puntos_envio").insert(payload);

  if (error) return alert("Error: " + error.message);

  alert("Punto agregado");
});


// ------------------------------------------------------
// 4) --- CRUD ITEMS ---
// ------------------------------------------------------

// ➤ Cargar embalajes
async function loadEmbalajes() {
  const { data } = await supabase.from("embalajes").select("*").order("nombre");

  const list = document.getElementById("packList");
  const sel = document.getElementById("pd_pack_sel");

  list.innerHTML = "";
  sel.innerHTML = `<option value="">Sin embalaje</option>`;

  data.forEach(e => {
    list.innerHTML += `<li>${e.nombre}</li>`;
    sel.innerHTML += `<option value="${e.id}">${e.nombre}</option>`;
  });
}

// ➤ Agregar embalaje
document.getElementById("btnAddPack").addEventListener("click", async () => {
  const name = new_pack.value;
  if (!name) return alert("Ingrese nombre");

  await supabase.from("embalajes").insert({ nombre: name });

  new_pack.value = "";
  loadEmbalajes();
});


// ➤ Cargar items
async function loadItems() {
  const { data } = await supabase.from("items").select("*").order("nombre");

  const table = document.querySelector("#itemsTable tbody");
  const sel = document.getElementById("pd_item_sel");

  table.innerHTML = "";
  sel.innerHTML = `<option value="">Seleccione</option>`;

  data.forEach(it => {
    // tabla
    table.innerHTML += `
      <tr>
        <td>${it.nombre}</td>
        <td>${it.descripcion}</td>
        <td>${it.precio}</td>
      </tr>`;

    // select para pedidos
    sel.innerHTML += `<option value="${it.id}">${it.nombre}</option>`;
  });
}

// ➤ Crear item
document.getElementById("btnCreateItem").addEventListener("click", async () => {
  const nombre = item_name.value;
  const descripcion = item_desc.value;
  const precio = item_price.value;

  if (!nombre) return;

  await supabase.from("items").insert({ nombre, descripcion, precio });

  item_name.value = "";
  item_desc.value = "";
  item_price.value = "";

  loadItems();
});


// ------------------------------------------------------
// 5) --- CRUD CONDUCTORES + PLACAS ---
// ------------------------------------------------------

// ➤ Cargar conductores
async function loadDrivers() {
  const { data } = await supabase.from("conductores").select("*").order("nombre");

  const list = document.getElementById("driversList");
  const sel = document.getElementById("pd_driver");

  list.innerHTML = "";
  sel.innerHTML = `<option value="">Seleccione</option>`;

  data.forEach(d => {
    list.innerHTML += `<li>${d.nombre} — ${d.documento}</li>`;
    sel.innerHTML += `<option value="${d.id}">${d.nombre}</option>`;
  });
}

// ➤ Agregar conductor
document.getElementById("btnAddDriver").addEventListener("click", async () => {
  const nombre = drv_name.value;
  const documento = drv_doc.value;
  const telefono = drv_tel.value;
  const empresa = drv_cmp.value;

  await supabase.from("conductores").insert({ nombre, documento, telefono, empresa });

  drv_name.value = "";
  drv_doc.value = "";
  drv_tel.value = "";
  drv_cmp.value = "";

  loadDrivers();
});


// ➤ Cargar placas
async function loadPlates() {
  const { data } = await supabase.from("placas").select("*").order("placa");

  const list = document.getElementById("platesList");
  const sel = document.getElementById("pd_plate");

  list.innerHTML = "";
  sel.innerHTML = `<option value="">Seleccione</option>`;

  data.forEach(p => {
    list.innerHTML += `<li>${p.placa} — ${p.tipo}</li>`;
    sel.innerHTML += `<option value="${p.id}">${p.placa}</option>`;
  });
}

// ➤ Agregar placa
document.getElementById("btnAddPlate").addEventListener("click", async () => {
  const placa = pl_plate.value;
  const tipo = pl_type.value;

  await supabase.from("placas").insert({ placa, tipo });

  pl_plate.value = "";
  pl_type.value = "";

  loadPlates();
});


// ------------------------------------------------------
// 6) --- INICIALIZACIÓN GENERAL ---
// ------------------------------------------------------
async function init() {
  await loadFundaciones();
  await loadEmbalajes();
  await loadItems();
  await loadDrivers();
  await loadPlates();
}

init();
