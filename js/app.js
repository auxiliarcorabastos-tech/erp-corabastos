import { setupSidebarToggle } from './ui.js';

document.addEventListener('DOMContentLoaded', ()=>{

  // Sidebar toggle
  setupSidebarToggle();

  // Section nav
  function showSection(id){
    document.querySelectorAll('main section').forEach(sec=>{
      sec.classList.add('hidden');
    });
    const target = document.getElementById(id);
    if(target) target.classList.remove('hidden');
  }

  document.querySelectorAll('#sidebar button[data-sec]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      showSection(btn.dataset.sec);
    });
  });

  // Mostrar dashboard por defecto:
  showSection('dashboard');
});
