
// simple state module
export const state = {
  foundations: JSON.parse(localStorage.getItem('foundations')||'[]'),
  items: JSON.parse(localStorage.getItem('items')||'[]'),
  plates: JSON.parse(localStorage.getItem('plates')||'[]'),
  drivers: JSON.parse(localStorage.getItem('drivers')||'[]'),
  packs: JSON.parse(localStorage.getItem('packs')||'[]'),
  pedidos: JSON.parse(localStorage.getItem('pedidos')||'[]')
};

export function saveState(){
  localStorage.setItem('foundations', JSON.stringify(state.foundations));
  localStorage.setItem('items', JSON.stringify(state.items));
  localStorage.setItem('plates', JSON.stringify(state.plates));
  localStorage.setItem('drivers', JSON.stringify(state.drivers));
  localStorage.setItem('packs', JSON.stringify(state.packs));
  localStorage.setItem('pedidos', JSON.stringify(state.pedidos));
}
