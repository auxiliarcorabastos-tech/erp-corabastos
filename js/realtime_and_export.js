// Realtime + Export CSV / PDF para ERP Corabastos
// Asume que en app.js exportaste `supabase`:
// export const supabase = createClient(...);
// y que `supabase` está disponible globalmente (por import) o window.supabase

// --- UTIL: asegúrate de que `supabase` exista ---
if (typeof supabase === "undefined") {
  console.error("Supabase no encontrado. Asegúrate de importar supabase en app.js y exportarlo.");
}

// -----------------------------
// 1) SUBSCRIPCIONES REALTIME
// -----------------------------
// Tablas a suscribir — modifícalas según tus tablas reales
const TABLES_REALTIME = [
  "fundaciones",
  "puntos_envio",
  "items",
  "packs",
  "conductores",
  "placas",
  "pedidos",
  "pedido_items",
];

// Contenedor para canales (por si quieres desconectar)
const realtimeChannels = {};

// Manejar evento genérico (puedes adaptarlo para cada tabla)
function handleRealtimeEvent(payload) {
  // payload ejemplo: { eventType: 'INSERT'|'UPDATE'|'DELETE', table: 'fundaciones', new: {...}, old: {...}}
  console.log("Realtime event:", payload);

  // Actualizaciones UI por tabla
  const table = payload.table;
  const event = payload.eventType;

  // Ejemplos: cuando llega un insert/ update borrar/recargar listados.
  if (["fundaciones", "puntos_envio"].includes(table)) {
    // recargar fundaciones
    if (typeof loadFundaciones === "function") loadFundaciones();
  }
  if (["items", "packs"].includes(table)) {
    if (typeof loadItems === "function") loadItems();
    if (typeof loadEmbalajes === "function") loadEmbalajes();
  }
  if (["conductores"].includes(table)) {
    if (typeof loadDrivers === "function") loadDrivers();
  }
  if (["placas"].includes(table)) {
    if (typeof loadPlates === "function") loadPlates();
  }
  if (table === "pedidos" || table === "pedido_items") {
    // recargar vista de pedidos
    if (typeof loadPedidos === "function") loadPedidos();
  }

  // También podrías mostrar una notificación en pantalla
  // showToast(`${table} ${event}`);
}

// Función para conectar todas las suscripciones
export function subscribeAllRealtime() {
  if (!supabase || !supabase.channel) {
    console.warn("Realtime no disponible en esta versión de supabase-js.");
    return;
  }

  // Limpiar canales previos
  Object.values(realtimeChannels).forEach(ch => {
    try { ch.unsubscribe(); } catch (e) {}
  });

  TABLES_REALTIME.forEach(table => {
    // Crear canal para la tabla
    const ch = supabase.channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        // payload: { commit_timestamp, eventType, schema, table, new, old }
        handleRealtimeEvent({
          eventType: payload.eventType,
          table: payload.table,
          new: payload.new,
          old: payload.old
        });
      })
      .subscribe(status => {
        console.log(`Channel ${table} status:`, status);
      });

    realtimeChannels[table] = ch;
  });

  console.log("Subscripciones Realtime activadas para:", TABLES_REALTIME.join(", "));
}

// Función para desconectar todo
export function unsubscribeAllRealtime() {
  Object.values(realtimeChannels).forEach(ch => {
    try { ch.unsubscribe(); } catch (e) {}
  });
  console.log("Desconectadas subscripciones Realtime");
}


// -----------------------------
// 2) EXPORTAR A CSV (genérico)
// -----------------------------
/**
 * Convierte un array de objetos a CSV y fuerza descarga en navegador.
 * @param {Array} rows array de objetos homogéneos
 * @param {String} filename nombre archivo .csv
 */
export function exportRowsToCSV(rows, filename = "export.csv") {
  if (!rows || rows.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  // Cabeceras (keys del primer objeto)
  const headers = Object.keys(rows[0]);
  const csvRows = [];
  csvRows.push(headers.join(","));

  for (const row of rows) {
    const values = headers.map(h => {
      let val = row[h] === null || row[h] === undefined ? "" : String(row[h]);
      // escapar comillas dobles
      val = val.replace(/"/g, '""');
      // si contiene coma o salto, envolver en comillas
      if (val.search(/,|\n|"/) >= 0) val = `"${val}"`;
      return val;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


// -----------------------------
// 3) EXPORTAR A PDF (usando jsPDF)
// -----------------------------
// Usaremos jsPDF desde esm.sh para importarlo dinámicamente
async function loadJsPDF() {
  // Carga jsPDF (versión estable). Si ya la tienes en tu proyecto, omitir.
  if (window.jspdf) return window.jspdf;
  const mod = await import("https://esm.sh/jspdf@2.5.1");
  window.jspdf = mod.jsPDF;
  return window.jspdf;
}

/**
 * Exporta una tabla simple (array de objetos) a PDF.
 * @param {Array} rows 
 * @param {String} title 
 * @param {String} filename 
 */
export async function exportRowsToPDF(rows, title = "Reporte", filename = "export.pdf") {
  if (!rows || rows.length === 0) return alert("No hay datos para exportar.");

  const jsPDFCtor = await loadJsPDF();
  const doc = new jsPDFCtor({ unit: "pt", format: "a4" });

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableW = pageWidth - margin * 2;

  // Título
  doc.setFontSize(14);
  doc.text(title, margin, 60);

  // Simple render: crear tabla de texto. Para tablas bonitas se puede usar autotable plugin.
  const headers = Object.keys(rows[0]);
  const startY = 80;
  let y = startY;
  const rowHeight = 16;
  const colWidth = usableW / headers.length;

  // Cabeceras
  doc.setFontSize(10);
  headers.forEach((h, i) => {
    doc.text(String(h).toUpperCase(), margin + i * colWidth + 2, y);
  });
  y += rowHeight;

  // Filas
  for (const row of rows) {
    headers.forEach((h, i) => {
      const text = row[h] === null || row[h] === undefined ? "" : String(row[h]);
      // recortar texto largo (simple)
      const t = text.length > 60 ? text.slice(0, 57) + "..." : text;
      doc.text(String(t), margin + i * colWidth + 2, y);
    });
    y += rowHeight;

    // Nueva página si se excede
    if (y + rowHeight > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = margin;
    }
  }

  doc.save(filename);
}


// -----------------------------
// 4) FUNCIONES PRÁCTICAS PARA EXPORTAR DESDE SUPABASE
// -----------------------------
/**
 * Exporta cualquier tabla pública directamente desde supabase a CSV.
 * @param {String} tableName 
 * @param {String} filename 
 */
export async function exportTableToCSV(tableName, filename = null) {
  if (!tableName) return;
  filename = filename || `${tableName}.csv`;
  const { data, error } = await supabase.from(tableName).select("*");
  if (error) return alert("Error al leer tabla: " + error.message);
  exportRowsToCSV(data, filename);
}

/**
 * Exporta la vista pedidos_view a CSV
 */
export async function exportPedidosViewToCSV() {
  const { data, error } = await supabase.from("pedidos_view").select("*");
  if (error) return alert("Error al leer pedidos_view: " + error.message);
  exportRowsToCSV(data, "pedidos_view.csv");
}

/**
 * Exporta la vista pedidos_view a PDF
 */
export async function exportPedidosViewToPDF() {
  const { data, error } = await supabase.from("pedidos_view").select("*");
  if (error) return alert("Error al leer pedidos_view: " + error.message);
  await exportRowsToPDF(data, "Pedidos - Corabastos", "pedidos.pdf");
}


// -----------------------------
// 5) BOTONES UI (opcional)
// -----------------------------
// Puedes llamar estas funciones desde botones de tu UI.
// Ejemplo: crea botones en tu HTML y asócialos:
// <button id="btnExportPedidosCSV">Exportar Pedidos CSV</button>

document.addEventListener("DOMContentLoaded", () => {
  const bCSV = document.getElementById("btnExportSegCSV"); // ya existe en tu HTML
  if (bCSV) {
    bCSV.addEventListener("click", async () => {
      // Exporta la tabla de seguimiento (según filtros) - aquí usamos la vista pedidos_view
      await exportPedidosViewToCSV();
    });
  }

  // Si quieres otro botón para PDF, crea en HTML: <button id="btnExportPedidosPDF">Exportar PDF</button>
  const bPDF = document.getElementById("btnExportPedidosPDF");
  if (bPDF) {
    bPDF.addEventListener("click", async () => {
      await exportPedidosViewToPDF();
    });
  }
});

// -----------------------------
// 6) Iniciar Realtime automáticamente (opcional)
// -----------------------------
window.addEventListener("load", () => {
  // Inicia la suscripción en cuanto la app cargue.
  try {
    subscribeAllRealtime();
  } catch (e) {
    console.warn("No se pudo iniciar Realtime automáticamente:", e.message);
  }
});
