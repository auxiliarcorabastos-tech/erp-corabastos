
function setupSidebarToggle(){
  const btn = document.getElementById('btnMenu');
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    sidebar.classList.toggle('open');
    sidebar.classList.toggle('sidebar-hidden');
    main.classList.toggle('expanded');
  });
  // link buttons to sections
  document.querySelectorAll('#sidebar button').forEach(b=>{
    b.addEventListener('click', ()=> {
      document.querySelectorAll('main section').forEach(s=> s.classList.add('hidden'));
      const id = b.dataset.sec;
      const target = document.getElementById(id);
      if(target) target.classList.remove('hidden');
      document.querySelectorAll('#sidebar button').forEach(x=> x.classList.remove('active'));
      b.classList.add('active');
      // close on mobile
      if(window.innerWidth <= 900) sidebar.classList.remove('open');
    });
  });
}
