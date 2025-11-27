import { supabase } from './supabase.js';
import { state } from './state.js';
import { renderAll } from './ui.js';
import { registrarAccion } from './auditoria.js';

export async function login(username, password){
  // simple lookup in users table (plain-text password like original)
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('pass', password)
    .limit(1)
    .single();

  if(error || !data) return { ok:false, error: error ? error.message : 'Usuario no encontrado' };
  state.currentUser = data;
  await loadAll();
  registrarAccion('login', { username: data.username });
  return { ok:true, user: data };
}

export function logout(){
  state.currentUser = null;
  // no server logout since we're using anon key/public DB
}

export async function loadAll(){
  // load minimal sets
  const [{ data: users }, { data: foundations }, { data: items }, { data: packs }, { data: drivers }, { data: plates }, { data: pedidos }, { data: audit }, { data: roles }] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('foundations').select('*'),
    supabase.from('items').select('*'),
    supabase.from('packs').select('*'),
    supabase.from('drivers').select('*'),
    supabase.from('plates').select('*'),
    supabase.from('pedidos').select('*'),
    supabase.from('audit').select('*'),
    supabase.from('roles').select('*')
  ]);

  state.users = users || [];
  state.foundations = foundations || [];
  state.items = items || [];
  state.packs = (packs || []).map(p=>p.name);
  state.drivers = drivers || [];
  state.plates = plates || [];
  state.pedidos = pedidos || [];
  state.audit = audit || [];
  state.roles = {};
  (roles||[]).forEach(r=> state.roles[r.name] = r.permisos || {});
}
