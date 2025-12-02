
// simple state
(function(){
  const KEY='erp_state_v1';
  let s = JSON.parse(localStorage.getItem(KEY) || 'null') || {};
  s.foundations = s.foundations || [];
  s.items = s.items || [];
  s.packs = s.packs || ['Atado','Bulto','Caja','Unidad'];
  s.drivers = s.drivers || [];
  s.plates = s.plates || [];
  s.pedidos = s.pedidos || [];
  window.erpState = { state: s, save: ()=> localStorage.setItem(KEY, JSON.stringify(s)) };
})();
