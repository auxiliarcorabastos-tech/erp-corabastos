import { supabase } from './supabase.js';
import { state } from './state.js';
import { renderAll } from './ui.js';
import { registrarAccion } from './auditoria.js';

export async function createPedido(pedidoPayload){
  // pedidoPayload: { foundation_id, point_id, driver_id, plate_id, peaje, trans, total, items: [ {name, price, qty, pack, kgs} ] }
  const { data: ped, error: errPed } = await supabase.from('pedidos').insert({
    foundation_id: pedidoPayload.foundation_id,
    point_id: pedidoPayload.point_id,
    driver_id: pedidoPayload.driver_id,
    plate_id: pedidoPayload.plate_id,
    peaje: pedidoPayload.peaje,
    trans: pedidoPayload.trans,
    total: pedidoPayload.total
  }).select().single();

  if(errPed) throw errPed;

  for(const it of pedidoPayload.items){
    const { error } = await supabase.from('pedido_items').insert({
      pedido_id: ped.id,
      name: it.name,
      price: it.price,
      qty: it.qty,
      pack: it.pack,
      kgs: it.kgs
    });
    if(error) throw error;
  }

  registrarAccion('crear_pedido', { id: ped.id, foundation_id: pedidoPayload.foundation_id, total: pedidoPayload.total });
  await renderAll();
  return ped;
}

export async function listPedidos(){
  const { data, error } = await supabase.from('pedidos').select('*, pedido_items(*)');
  if(error) throw error;
  state.pedidos = data || [];
  return state.pedidos;
}
