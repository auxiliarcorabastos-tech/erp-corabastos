// fundaciones.js with sorting & search placeholder
export function sortPoints(f) {
  f.points.sort((a,b)=> a.barrio.localeCompare(b.barrio));
}
