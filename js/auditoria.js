import { supabase } from './supabase.js';
import { state } from './state.js';

export async function registrarAccion(tipo, detalle){
  const usuario = state.currentUser ? state.currentUser.username : '?';
  await supabase.from('audit').insert({ usuario, accion: tipo, detalle });
}
export async function listAudit(){
  const { data } = await supabase.from('audit').select('*').order('fecha', { ascending: false }).limit(200);
  state.audit = data || [];
  return state.audit;
}
