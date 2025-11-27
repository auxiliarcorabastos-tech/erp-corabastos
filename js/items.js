import { supabase } from './supabase.js';
import { state } from './state.js';
import { renderAll } from './ui.js';
import { registrarAccion } from './auditoria.js';

export async function createItem(name, description, price){
  const { data, error } = await supabase.from('items').insert({ name, description, price }).select().single();
  if(error) throw error;
  registrarAccion('crear_item', { name });
  await renderAll();
  return data;
}

export async function listItems(){
  const { data, error } = await supabase.from('items').select('*');
  if(error) throw error;
  state.items = data || [];
  return state.items;
}
