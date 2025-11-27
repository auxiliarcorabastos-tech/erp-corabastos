import { supabase } from './supabase.js';
import { state } from './state.js';
import { renderAll } from './ui.js';
import { registrarAccion } from './auditoria.js';

export async function createDriver(d){
  const { data, error } = await supabase.from('drivers').insert(d).select().single();
  if(error) throw error;
  registrarAccion('crear_conductor', d);
  await renderAll();
  return data;
}

export async function createPlate(p){
  const { data, error } = await supabase.from('plates').insert(p).select().single();
  if(error) throw error;
  registrarAccion('crear_placa', p);
  await renderAll();
  return data;
}

export async function listDrivers(){
  const { data, error } = await supabase.from('drivers').select('*');
  if(error) throw error;
  state.drivers = data || [];
  return state.drivers;
}
