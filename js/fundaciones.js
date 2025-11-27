import { supabase } from './supabase.js';
import { state } from './state.js';
import { renderAll } from './ui.js';
import { registrarAccion } from './auditoria.js';

export async function createFoundation(nit, name){
  const { data, error } = await supabase.from('foundations').insert({ nit, name }).select().single();
  if(error) throw error;
  await renderAll();
  registrarAccion('crear_fundacion', { nit, name });
  return data;
}

export async function createPoint(foundation_id, p){
  const { data, error } = await supabase.from('points').insert(Object.assign({ foundation_id }, p)).select().single();
  if(error) throw error;
  await renderAll();
  registrarAccion('crear_punto', { foundation_id, barrio: p.barrio });
  return data;
}

export async function listFoundations(){
  const { data, error } = await supabase.from('foundations').select('*');
  if(error) throw error;
  state.foundations = data || [];
  return state.foundations;
}
