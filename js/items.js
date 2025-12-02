
function initItemsModule(){
  if(!window.erpState) return;
  const { state, save } = window.erpState;
  function render(){
    const tbody = document.querySelector('#itemsTable tbody');
    tbody.innerHTML = '';
    state.items.forEach(it=> {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>'+it.ref+'</td><td>'+it.name+'</td><td>$'+(it.price||0)+'</td>';
      tbody.appendChild(tr);
    });
    const sel = document.getElementById('pd_item_sel'); sel.innerHTML=''; state.items.forEach((it,i)=> sel.appendChild(new Option(it.name+' ('+it.ref+')', i)));
  }
  document.getElementById('btnCreateItem').addEventListener('click', ()=>{
    const ref=document.getElementById('item_ref').value.trim();
    const name=document.getElementById('item_name').value.trim();
    const price=Number(document.getElementById('item_price').value)||0;
    if(!ref||!name) return alert('Referencia y nombre requeridos');
    if(state.items.some(x=>x.ref===ref)) return alert('Ref existe');
    state.items.push({ref,name,price}); save(); render();
    document.getElementById('item_ref').value=''; document.getElementById('item_name').value=''; document.getElementById('item_price').value='';
  });
  render();
  window.renderItems = render;
}
initItemsModule();
