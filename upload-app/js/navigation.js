// ─────────────────────────────────────────────────────────
// NAVIGATION — Stappen, help, fullscreen
// ─────────────────────────────────────────────────────────

// ── Fullscreen ──
var isFullscreen = false;
var autoFullscreenDone = false;

function toggleFullscreen() {
  var wrap=document.getElementById('editor-wrap');
  var p3=document.getElementById('p3');
  var btn=document.getElementById('fs-btn');
  if(!isFullscreen){
    isFullscreen=true;
    wrap.classList.add('editor-fullscreen');
    p3.classList.add('editor-fullscreen-active');
    btn.textContent='✕ Sluiten'; btn.title='Sluiten';
    var el=document.documentElement;
    if(el.requestFullscreen) el.requestFullscreen();
    else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    if(screen.orientation&&screen.orientation.lock)
      screen.orientation.lock('landscape').catch(function(){});
    setTimeout(function(){if(canvas)render();},300);
  } else { exitFullscreen(); }
}

function exitFullscreen() {
  var wrap=document.getElementById('editor-wrap');
  var p3=document.getElementById('p3');
  var btn=document.getElementById('fs-btn');
  isFullscreen=false;
  wrap.classList.remove('editor-fullscreen');
  p3.classList.remove('editor-fullscreen-active');
  btn.textContent='⛶'; btn.title='Volledig scherm';
  if(document.fullscreenElement&&document.exitFullscreen) document.exitFullscreen();
  else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
  if(screen.orientation&&screen.orientation.unlock) screen.orientation.unlock();
  setTimeout(function(){if(canvas)render();},300);
}

document.addEventListener('fullscreenchange',function(){
  if(!document.fullscreenElement&&isFullscreen) exitFullscreen();
});
document.addEventListener('webkitfullscreenchange',function(){
  if(!document.webkitFullscreenElement&&isFullscreen) exitFullscreen();
});

function tryAutoFullscreen() {
  if(autoFullscreenDone||window.innerWidth>768) return;
  autoFullscreenDone=true;
  var el=document.documentElement;
  if(el.requestFullscreen) el.requestFullscreen().catch(function(){});
  else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

// ── Help ──
function toggleHelp(id) {
  var panel=document.getElementById(id);
  if(!panel) return;
  ['help1','help2','help3','help4'].forEach(function(h){
    if(h!==id){var p=document.getElementById(h);if(p)p.classList.remove('open');}
  });
  panel.classList.toggle('open');
}

// ── Stappen ──
function goStep(n) {
  tryAutoFullscreen();
  if(n===2&&!document.getElementById('in-name').value.trim()){showErr('Vul je naam in.');return;}
  var customEvent=document.getElementById('in-custom-event')?document.getElementById('in-custom-event').value.trim():'';
  if(n===2&&!selectedEvent&&!customEvent){showErr('Kies een event of vul een eventnaam in.');return;}
  if(n===2&&customEvent) selectedEvent=customEvent;
  clearErr();

  if(n===4){interaction=null;tbEditing=false;tbSelected=false;if(canvas)render();}
  else tbEditing=true;

  [1,2,3,4].forEach(function(i){
    document.getElementById('p'+i).classList.toggle('active',i===n);
    var s=document.getElementById('s'+i); s.classList.remove('active','done');
    if(i<n){s.classList.add('done');s.querySelector('.step-num').textContent='✓';}
    if(i===n) s.classList.add('active');
    if(i>=n&&s.querySelector('.step-num').textContent==='✓') s.querySelector('.step-num').textContent=i;
  });

  if(n===3){
    tbEditing=true;
    if(!settingsLoaded){ loadSettings().then(function(){initEditor();}); }
    else initEditor();
  }
  if(n===4) startCompile();
}

function showErr(m){var b=document.getElementById('err');b.textContent=m;b.style.display='block';}
function clearErr(){document.getElementById('err').style.display='none';}
