// ─────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────
var CFG = {
  CLIENT_ID:       'b2e58045-5ea5-41e5-ae2d-7546465fd54d',
  TENANT_ID:       '1a3d504f-05a9-466a-bb8d-ba2e3f9e8dca',
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzXBA4HllGITD6rM-di97Y0JGQLVGI6DCRxpiflkv9gHOjlMG7leGe6zXIRka8zC2rS/exec',
  PRESENTATION_ID: '1YSUwZy3GoCJhdMs-av0yxakayyvg4SrnoeoAHpPIl6k',
  SHAREPOINT_SITE: 'https://veptennis.sharepoint.com/sites/VooralleVEPSharepoint-gebruikers',
  LIST_NAME:       'VEPEvents',
};

// ─────────────────────────────────────────────────────────
// MSAL
// ─────────────────────────────────────────────────────────
var msalApp = null;
var loginReq = { scopes: ['Sites.ReadWrite.All','User.Read'] };
var LIST_API = 'https://graph.microsoft.com/v1.0/sites/' + encodeURIComponent('veptennis.sharepoint.com:/sites/VooralleVEPSharepoint-gebruikers:') + '/lists/' + CFG.LIST_NAME + '/items';

(function loadMSAL() {
  var s = document.createElement('script');
  s.src = window.location.href.replace(/[^/]*$/,'') + '../shared/msal-browser.min.js';
  s.onload = initMSAL;
  s.onerror = function() {
    var s2 = document.createElement('script');
    s2.src = 'https://cdn.jsdelivr.net/npm/@azure/msal-browser@2.38.3/lib/msal-browser.min.js';
    s2.onload = initMSAL;
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
})();

function initMSAL() {
  msalApp = new msal.PublicClientApplication({
    auth:{ clientId:CFG.CLIENT_ID, authority:'https://login.microsoftonline.com/'+CFG.TENANT_ID, redirectUri:location.href.split('?')[0].split('#')[0] },
    cache:{ cacheLocation:'sessionStorage' }
  });
  msalApp.initialize().then(function() {
    msalApp.handleRedirectPromise().then(function() {
      if (!msalApp.getAllAccounts().length) msalApp.loginRedirect(loginReq);
      else loadEvents();
    });
  });
}

function getToken() {
  var accs = msalApp ? msalApp.getAllAccounts() : [];
  if (!accs.length) return Promise.reject('Niet ingelogd');
  return msalApp.acquireTokenSilent({scopes:loginReq.scopes,account:accs[0]})
    .then(function(r){return r.accessToken;})
    .catch(function(){return msalApp.acquireTokenPopup(loginReq).then(function(r){return r.accessToken;});});
}

// ─────────────────────────────────────────────────────────
// UPLOAD INSTELLINGEN
// ─────────────────────────────────────────────────────────
var uploadSettings = { width: 1920, height: 1080, quality: 0.92 };
var settingsLoaded = false;

function loadSettings() {
  var SAPI = 'https://graph.microsoft.com/v1.0/sites/' + encodeURIComponent('veptennis.sharepoint.com:/sites/VooralleVEPSharepoint-gebruikers:') + '/lists/VEPSettings/items?expand=fields(select=Title,SettingValue)';
  return getToken().then(function(tok) {
    return fetch(SAPI, { headers: { 'Authorization': 'Bearer ' + tok, 'Accept': 'application/json' } });
  }).then(function(r) { return r.json(); })
  .then(function(d) {
    var items = (d.value||[]).filter(function(i){ return i.fields && i.fields.Title === 'upload_settings'; });
    if (items.length > 0 && items[0].fields.SettingValue) {
      var s = JSON.parse(items[0].fields.SettingValue);
      if (s.quality) { uploadSettings.quality = s.quality / 100; }
    }
    settingsLoaded = true;
    return fetchSlideInfo();
  }).then(function() {
    settingsLoaded = true;
  }).catch(function() {
    try {
      var stored = localStorage.getItem('vep_upload_settings');
      if (stored) { var s = JSON.parse(stored); if (s.quality) { uploadSettings.quality = s.quality / 100; } }
    } catch(e) {}
    fetchSlideInfo().catch(function(){});
    settingsLoaded = true;
  });
}

function fetchSlideInfo() {
  return fetch(CFG.APPS_SCRIPT_URL + '?action=slideinfo')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.success && d.widthPx && d.heightPx) {
        CW = d.widthPx; CH = d.heightPx;
        TB.y = null; TB.x = null;
      }
    }).catch(function() {});
}

// ─────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────
var photos = [];
var imgs = [];
var cropState = [];
var selectedEvent = '';
var selectedLayout = 'full';
var selectedStyle = 'elegant';

// Titelbalk state (in canvas-pixels)
var TB = { x:0, y:null, w:1920, h:80, rot:0, opacity:0.88, color:'#050514', textColor:'#ffffff' };

// tbEditing: true = in stap 3 (toon handvatten), false = in stap 4 (geen handvatten)
var tbEditing = true;

// ─────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────
function loadEvents() {
  var a = document.getElementById('events-area');
  a.innerHTML = '<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--m)"><span class="spinner"></span> Laden...</div>';
  getToken().then(function(tok) {
    return fetch(LIST_API+'?expand=fields(select=Title,DateFrom,DateTo,Category,Emoji)', {headers:{'Authorization':'Bearer '+tok,'Accept':'application/json'}});
  }).then(function(r){return r.json();})
  .then(function(d) {
    var evts = (d.value||[]).map(function(i){return{Title:i.fields.Title,Emoji:i.fields.Emoji||'📅',DateFrom:(i.fields.DateFrom||'').split('T')[0]};})
      .sort(function(a,b){return a.DateFrom>b.DateFrom?1:-1;});
    if (!evts.length){a.innerHTML='<div class="events-error">Geen events gevonden.</div>';return;}
    a.innerHTML='<div class="chip-row" id="ec"></div>';
    var row=document.getElementById('ec');
    evts.forEach(function(ev,i){
      var c=document.createElement('div'); c.className='chip'+(i===0?' sel':'');
      c.textContent=ev.Emoji+' '+ev.Title;
      c.onclick=function(){document.querySelectorAll('#ec .chip').forEach(function(x){x.classList.remove('sel');});c.classList.add('sel');selectedEvent=ev.Title;};
      row.appendChild(c);
      if(i===0) selectedEvent=ev.Title;
    });
  }).catch(function(){a.innerHTML='<div class="events-error">Events konden niet geladen worden.</div>';});
}

// ─────────────────────────────────────────────────────────
// FILES
// ─────────────────────────────────────────────────────────
function addFiles(files) {
  Array.from(files).forEach(function(f) {
    if (photos.length >= 20) return;
    var r = new FileReader();
    r.onload = function(e) {
      photos.push({name:f.name, src:e.target.result});
      cropState.push({ox:0, oy:0, zoom:1});
      renderThumbs();
    };
    r.readAsDataURL(f);
  });
}

function renderThumbs() {
  var g=document.getElementById('pg'); g.innerHTML='';
  photos.forEach(function(p,i){
    var d=document.createElement('div'); d.className='thumb';
    d.innerHTML='<img src="'+p.src+'"><button class="rm" onclick="removePhoto('+i+')">✕</button>';
    g.appendChild(d);
  });
  var n=photos.length;
  document.getElementById('pinfo').style.display=n?'flex':'none';
  document.getElementById('pcount').textContent=n+" foto"+(n!==1?"'s":'')+" geselecteerd";
  document.getElementById('btn2').disabled=n===0;
}

function removePhoto(i){photos.splice(i,1);cropState.splice(i,1);renderThumbs();}
function onDragOver(e){e.preventDefault();document.getElementById('dz').classList.add('drag');}
function onDragLeave(){document.getElementById('dz').classList.remove('drag');}
function onDrop(e){e.preventDefault();onDragLeave();addFiles(e.dataTransfer.files);}

// ─────────────────────────────────────────────────────────
// NAVIGATIE
// ─────────────────────────────────────────────────────────
function goStep(n) {
  if(n===2&&!document.getElementById('in-name').value.trim()){showErr('Vul je naam in.');return;}
  if(n===2&&!selectedEvent){showErr('Kies een event.');return;}
  clearErr();

  // Bij navigeren naar stap 4: deselect titelbalk en stop interactie
  if(n===4) {
    interaction = null;
    tbEditing = false;
    if(canvas) render();
  } else {
    tbEditing = true;
  }

  [1,2,3,4].forEach(function(i){
    document.getElementById('p'+i).classList.toggle('active',i===n);
    var s=document.getElementById('s'+i); s.classList.remove('active','done');
    if(i<n){s.classList.add('done');s.querySelector('.step-num').textContent='✓';}
    if(i===n) s.classList.add('active');
    if(i>=n&&s.querySelector('.step-num').textContent==='✓') s.querySelector('.step-num').textContent=i;
  });

  if(n===3) {
    tbEditing = true;
    if (!settingsLoaded) {
      loadSettings().then(function() { initEditor(); });
    } else {
      initEditor();
    }
  }
  if(n===4) startCompile();
}

function showErr(m){var b=document.getElementById('err');b.textContent=m;b.style.display='block';}
function clearErr(){document.getElementById('err').style.display='none';}

// ─────────────────────────────────────────────────────────
// LAYOUT & STIJL
// ─────────────────────────────────────────────────────────
function selLayout(el,key){
  selectedLayout=key;
  document.querySelectorAll('.lo').forEach(function(o){o.classList.remove('sel');});
  el.classList.add('sel');
  if(imgs.length) render();
}

function selSC(el,style){
  selectedStyle=style;
  document.querySelectorAll('.sc').forEach(function(c){c.classList.remove('sel');});
  el.classList.add('sel');
  render();
}

// ─────────────────────────────────────────────────────────
// CANVAS SETUP
// ─────────────────────────────────────────────────────────
var CW=1920, CH=1080;
var canvas, ctx;
var interaction = null;

function initEditor() {
  canvas = document.getElementById('C');
  ctx = canvas.getContext('2d');
  canvas.width = CW; canvas.height = CH;
  tbEditing = true;

  TB.opacity = 0.88;
  document.getElementById('tb-op').value = 88;
  TB.w = parseInt(document.getElementById('tb-w').value)||1920;
  TB.h = parseInt(document.getElementById('tb-h').value)||80;
  TB.y = CH - TB.h;
  TB.x = (CW - TB.w) / 2;

  imgs = [];
  var pending = photos.length;
  if (!pending) { render(); return; }
  photos.forEach(function(p,i) {
    var im = new Image();
    im.onload = function() { imgs[i]=im; pending--; if(!pending){initCropState();render();} };
    im.src = p.src;
  });
}

function initCropState() {
  photos.forEach(function(_,i) {
    if (!cropState[i]) cropState[i]={ox:0,oy:0,zoom:1};
  });
}

// ─────────────────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────────────────
function getLayout() { return selectedLayout==='auto'?autoLayout():selectedLayout; }
function autoLayout(){var n=photos.length;if(n<=1)return'full';if(n===2)return'duo';if(n===3)return'featured';return'grid4';}

function getPhotoCells() {
  var L=getLayout(), h=CH;
  var cells=[];
  if(L==='full')      cells=[{x:0,y:0,w:CW,h:CH}];
  else if(L==='duo')  cells=[{x:0,y:0,w:CW/2-2,h:h},{x:CW/2+2,y:0,w:CW/2-2,h:h}];
  else if(L==='featured'){var mw=CW*0.62;cells=[{x:0,y:0,w:mw-2,h:h},{x:mw+2,y:0,w:CW-mw-2,h:h/2-2},{x:mw+2,y:h/2+2,w:CW-mw-2,h:h/2-2}];}
  else if(L==='grid4'){var hw=CW/2,hh=h/2;cells=[{x:0,y:0,w:hw-2,h:hh-2},{x:hw+2,y:0,w:hw-2,h:hh-2},{x:0,y:hh+2,w:hw-2,h:hh-2},{x:hw+2,y:hh+2,w:hw-2,h:hh-2}];}
  else if(L==='strip'){var tw=CW/3;cells=[{x:0,y:0,w:tw-2,h:h},{x:tw+2,y:0,w:tw-2,h:h},{x:tw*2+4,y:0,w:tw-4,h:h}];}
  else if(L==='mosaic'){var th=h*0.55,bh=h-th-4;cells=[{x:0,y:0,w:CW,h:th},{x:0,y:th+4,w:CW/2-2,h:bh},{x:CW/2+2,y:th+4,w:CW/2-2,h:bh}];}
  else if(L==='cinematic') cells=[{x:0,y:0,w:CW,h:CH}];
  return cells;
}

function drawPhoto(img, crop, cell) {
  var x=cell.x,y=cell.y,w=cell.w,h=cell.h;
  if(!img){
    ctx.fillStyle='#1a1a3a'; ctx.fillRect(x,y,w,h);
    ctx.fillStyle='#333366'; ctx.font='60px sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('📷',x+w/2,y+h/2);
    return;
  }
  var zoom=crop.zoom||1;
  var scale=Math.max(w/img.width,h/img.height)*zoom;
  var sw=img.width*scale, sh=img.height*scale;
  var ox=crop.ox||0, oy=crop.oy||0;
  var minX=w-sw, maxX=0, minY=h-sh, maxY=0;
  ox=Math.max(minX,Math.min(maxX,ox));
  oy=Math.max(minY,Math.min(maxY,oy));
  crop.ox=ox; crop.oy=oy;
  ctx.save();
  ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
  ctx.drawImage(img,x+ox,y+oy,sw,sh);
  ctx.restore();
}

function render() {
  if(!canvas) return;
  if(canvas.width !== CW || canvas.height !== CH) {
    canvas.width = CW; canvas.height = CH;
    TB.y = null; TB.x = null;
  }
  var tw=parseInt(document.getElementById('tb-w').value)||CW;
  var th=parseInt(document.getElementById('tb-h').value)||80;
  var top=parseInt(document.getElementById('tb-op').value); if(isNaN(top)||top===0) top=88;
  var trot=parseFloat(document.getElementById('tb-rot').value)||0;
  TB.w=Math.min(tw,CW); TB.h=th;
  TB.opacity=top/100;
  TB.rot=trot*Math.PI/180;
  TB.color=document.getElementById('tb-color').value;
  TB.textColor=document.getElementById('tb-textcolor').value;
  TB.w = Math.min(TB.w, CW);
  if(TB.y===null || TB.y > CH || TB.y < -TB.h) TB.y = CH - TB.h;
  if(TB.x===null || TB.x > CW) TB.x = (CW - TB.w) / 2;

  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle='#0A0A14'; ctx.fillRect(0,0,CW,CH);

  var cells=getPhotoCells();
  cells.forEach(function(cell,i){drawPhoto(imgs[i]||null,cropState[i]||{ox:0,oy:0,zoom:1},cell);});

  // Titelbalk
  ctx.save();
  var cx=TB.x+TB.w/2, cy=TB.y+TB.h/2;
  ctx.translate(cx,cy); ctx.rotate(TB.rot);
  ctx.fillStyle=hexToRgba(TB.color,TB.opacity);
  ctx.fillRect(-TB.w/2,-TB.h/2,TB.w,TB.h);

  var caption=document.getElementById('in-caption')?document.getElementById('in-caption').value:'';
  var memberName=document.getElementById('in-name')?document.getElementById('in-name').value:'';
  var titleText=caption?selectedEvent+' — '+caption:selectedEvent;
  var styles={elegant:{italic:true,bold:false},bold:{italic:false,bold:true},minimal:{italic:false,bold:false},playful:{italic:false,bold:true}};
  var st=styles[selectedStyle]||styles.elegant;

  var marginX=12;
  var nameW=memberName?Math.min(TB.w*0.2,240):0;
  var maxTextW=TB.w-nameW-marginX*3;

  function wrapText(text, maxW, font) {
    ctx.font=font;
    var words=text.split(' ');
    var lines=[], line='';
    words.forEach(function(w){
      var test=line?line+' '+w:w;
      if(ctx.measureText(test).width>maxW && line){lines.push(line);line=w;}
      else line=test;
    });
    if(line) lines.push(line);
    return lines;
  }

  var fs=Math.min(TB.h*0.55, 72);
  var lines, font;
  do {
    font=(st.bold?'bold ':'')+( st.italic?'italic ':'')+fs+'px -apple-system,sans-serif';
    lines=wrapText(titleText, maxTextW, font);
    var totalH=lines.length*fs*1.2;
    if(totalH<=TB.h-8 && ctx.measureText(lines[0]||'').width<=maxTextW) break;
    fs-=1;
  } while(fs>8);

  ctx.fillStyle=TB.textColor;
  ctx.font=font;
  ctx.textBaseline='middle';
  ctx.textAlign='left';

  var lineH=fs*1.2;
  var totalH=lines.length*lineH;
  var startY=-totalH/2+lineH/2;
  lines.forEach(function(line,i){
    ctx.fillText(line,-TB.w/2+marginX,startY+i*lineH);
  });

  if(memberName){
    ctx.textAlign='right';
    ctx.font='italic '+(fs*0.6)+'px -apple-system,sans-serif';
    ctx.fillStyle=TB.textColor+'AA';
    ctx.fillText(memberName,TB.w/2-marginX,0);
  }

  // Handvatten alleen tonen in stap 3
  if(tbEditing) {
    ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=2; ctx.setLineDash([6,6]);
    ctx.strokeRect(-TB.w/2,-TB.h/2,TB.w,TB.h); ctx.setLineDash([]);
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){
      ctx.fillStyle='rgba(255,255,255,0.75)';
      ctx.fillRect(c[0]*(TB.w/2)-6,c[1]*(TB.h/2)-6,12,12);
    });
  }

  ctx.restore();
}

function hexToRgba(hex,a){
  var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return 'rgba('+r+','+g+','+b+','+a+')';
}

// ─────────────────────────────────────────────────────────
// CANVAS INTERACTIE
// ─────────────────────────────────────────────────────────
function canvasXY(e) {
  var rect=canvas.getBoundingClientRect();
  var sx=CW/rect.width, sy=CH/rect.height;
  var cx=e.clientX||e.touches&&e.touches[0].clientX;
  var cy=e.clientY||e.touches&&e.touches[0].clientY;
  return {x:(cx-rect.left)*sx, y:(cy-rect.top)*sy};
}

function getTBRect() {
  return {x:TB.x, y:TB.y, w:TB.w, h:TB.h};
}

function getResizeHandle(px,py) {
  var R=getTBRect(), m=20;
  var corners=[
    {name:'nw',x:R.x,y:R.y},{name:'ne',x:R.x+R.w,y:R.y},
    {name:'se',x:R.x+R.w,y:R.y+R.h},{name:'sw',x:R.x,y:R.y+R.h}
  ];
  for(var i=0;i<corners.length;i++){
    if(Math.abs(px-corners[i].x)<m && Math.abs(py-corners[i].y)<m) return corners[i].name;
  }
  return null;
}

function hitTestTB(px,py){
  var R=getTBRect();
  return px>=R.x&&px<=R.x+R.w&&py>=R.y&&py<=R.y+R.h;
}

function hitTestPhoto(px,py){
  var cells=getPhotoCells();
  for(var i=0;i<cells.length;i++){
    var c=cells[i];
    if(px>=c.x&&px<=c.x+c.w&&py>=c.y&&py<=c.y+c.h) return i;
  }
  return -1;
}

function onMouseDown(e) {
  if(e.button===2) return;
  var pos=canvasXY(e);
  var handle=getResizeHandle(pos.x,pos.y);
  if(handle){
    interaction={type:'tb-resize',handle:handle,startX:pos.x,startY:pos.y,startTBx:TB.x,startTBy:TB.y,startTBw:TB.w,startTBh:TB.h};
    return;
  }
  if(hitTestTB(pos.x,pos.y)){
    interaction={type:'tb',startX:pos.x,startY:pos.y,startTBx:TB.x,startTBy:TB.y};
    return;
  }
  var idx=hitTestPhoto(pos.x,pos.y);
  if(idx>=0){
    interaction={type:'photo',idx:idx,startX:pos.x,startY:pos.y,startOx:cropState[idx].ox||0,startOy:cropState[idx].oy||0};
    return;
  }
}

function onMouseMove(e) {
  if(!interaction) return;
  var pos=canvasXY(e);
  var dx=pos.x-interaction.startX, dy=pos.y-interaction.startY;

  if(interaction.type==='photo'){
    cropState[interaction.idx].ox=interaction.startOx+dx;
    cropState[interaction.idx].oy=interaction.startOy+dy;
    render();
  } else if(interaction.type==='tb'){
    TB.x=interaction.startTBx+dx;
    TB.y=interaction.startTBy+dy;
    render();
  } else if(interaction.type==='tb-resize'){
    var h=interaction.handle;
    var nx=interaction.startTBx, ny=interaction.startTBy, nw=interaction.startTBw, nh=interaction.startTBh;
    if(h==='se'){nw=Math.max(200,nw+dx);nh=Math.max(30,nh+dy);}
    else if(h==='sw'){nx=interaction.startTBx+dx;nw=Math.max(200,nw-dx);nh=Math.max(30,nh+dy);}
    else if(h==='ne'){nw=Math.max(200,nw+dx);ny=interaction.startTBy+dy;nh=Math.max(30,nh-dy);}
    else if(h==='nw'){nx=interaction.startTBx+dx;ny=interaction.startTBy+dy;nw=Math.max(200,nw-dx);nh=Math.max(30,nh-dy);}
    TB.x=nx;TB.y=ny;TB.w=nw;TB.h=nh;
    document.getElementById('tb-w').value=Math.round(nw);
    document.getElementById('tb-h').value=Math.round(nh);
    render();
  }

  var cur='default';
  var hh=getResizeHandle(pos.x,pos.y);
  if(hh) cur=hh==='nw'||hh==='se'?'nwse-resize':'nesw-resize';
  else if(hitTestTB(pos.x,pos.y)) cur='move';
  else if(hitTestPhoto(pos.x,pos.y)>=0) cur='grab';
  canvas.style.cursor=cur;
}

function onMouseUp() { interaction=null; }

function onWheel(e) {
  if(!e.ctrlKey) return;
  e.preventDefault();
  var pos=canvasXY(e);
  var idx=hitTestPhoto(pos.x,pos.y);
  if(idx<0) return;
  var delta=e.deltaY>0?-0.05:0.05;
  cropState[idx].zoom=Math.max(0.5,Math.min(5,(cropState[idx].zoom||1)+delta));
  render();
}

// Event listeners
document.addEventListener('DOMContentLoaded',function(){
  var c=document.getElementById('C');
  c.addEventListener('mousedown',onMouseDown);
  c.addEventListener('mousemove',onMouseMove);
  c.addEventListener('mouseup',onMouseUp);
  c.addEventListener('mouseleave',onMouseUp);
  c.addEventListener('wheel',onWheel,{passive:false});

  var lastTouchDist = null;
  var lastTouchMid  = null;

  c.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      onMouseDown({clientX:e.touches[0].clientX, clientY:e.touches[0].clientY, button:0});
      lastTouchDist = null;
    } else if (e.touches.length === 2) {
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist = Math.sqrt(dx*dx + dy*dy);
      lastTouchMid  = {
        clientX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        clientY: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      interaction = null;
    }
  }, {passive:true});

  c.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      onMouseMove({clientX:e.touches[0].clientX, clientY:e.touches[0].clientY});
    } else if (e.touches.length === 2 && lastTouchDist !== null) {
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      var newDist = Math.sqrt(dx*dx + dy*dy);
      var scale   = newDist / lastTouchDist;
      lastTouchDist = newDist;
      var pos = canvasXY(lastTouchMid);
      var idx = hitTestPhoto(pos.x, pos.y);
      if (idx >= 0) {
        cropState[idx].zoom = Math.max(0.5, Math.min(5, (cropState[idx].zoom||1) * scale));
        render();
      }
    }
  }, {passive:false});

  c.addEventListener('touchend', function(e) {
    if (e.touches.length === 0) { onMouseUp(); lastTouchDist = null; }
  });
});

// ─────────────────────────────────────────────────────────
// COMPILE & VERZENDEN
// ─────────────────────────────────────────────────────────
var STEPS=[
  {label:"Foto's verwerken",icon:'🖼️'},
  {label:'Canvas compileren',icon:'🎨'},
  {label:'Uploaden naar Google Slides',icon:'📤'},
  {label:'Presentatie bijwerken',icon:'📺'},
];

function startCompile(){
  document.getElementById('comp-card').style.display='block';
  document.getElementById('ok-card').style.display='none';
  document.getElementById('rec-card').style.display='none';
  var list=document.getElementById('prog-list'); list.innerHTML='';
  STEPS.forEach(function(s,i){list.innerHTML+='<div class="prog-item" id="pi'+i+'"><div class="prog-icon" id="pic'+i+'">'+s.icon+'</div><span style="flex:1">'+s.label+'</span><div class="prog-bar-wrap"><div class="prog-bar" id="pb'+i+'"></div></div></div>';});
  var i=0;
  function next(){
    if(i>=STEPS.length){sendSlide();return;}
    document.getElementById('pi'+i).classList.add('active');
    document.getElementById('pb'+i).style.width='100%';
    setTimeout(function(){
      document.getElementById('pi'+i).classList.remove('active');
      document.getElementById('pi'+i).classList.add('done');
      document.getElementById('pic'+i).textContent='✓';
      i++; next();
    },500+Math.random()*300);
  }
  next();
}

function sendSlide(){
  var c=document.getElementById('C');
  var img=c?c.toDataURL('image/jpeg',0.92):null;
  if(!img){showErr('Canvas niet beschikbaar.');return;}
  fetch(CFG.APPS_SCRIPT_URL,{
    method:'POST',mode:'no-cors',
    headers:{'Content-Type':'text/plain'},
    body:JSON.stringify({
      memberName:document.getElementById('in-name').value,
      eventName:selectedEvent,
      caption:document.getElementById('in-caption').value,
      layout:selectedLayout,
      titleStyle:selectedStyle,
      photos:[img],
      presentationId:CFG.PRESENTATION_ID
    })
  }).then(function(){showSuccess();}).catch(function(e){showErr('Fout: '+e.message);});
}

function showSuccess(){
  document.getElementById('comp-card').style.display='none';
  document.getElementById('ok-card').style.display='block';
  document.getElementById('rec-card').style.display='block';
  var name=document.getElementById('in-name').value||'Lid';
  var lNames={full:'Fullscreen',duo:'Duo',featured:'Featured',grid4:'Grid',strip:'Strip',mosaic:'Mozaïek',cinematic:'Cinematic',auto:'Auto'};
  document.getElementById('sm-name').textContent=name;
  document.getElementById('sm-event').textContent=selectedEvent;
  document.getElementById('sm-photos').textContent=photos.length+" foto's";
  document.getElementById('sm-layout').textContent=lNames[selectedLayout]||selectedLayout;
  document.getElementById('btn-open').onclick=function(){window.open('https://docs.google.com/presentation/d/'+CFG.PRESENTATION_ID+'/edit','_blank');};
  var init=name.split(' ').map(function(w){return w[0]||'';}).join('').toUpperCase().slice(0,2);
  var row=document.createElement('div'); row.className='recent-row';
  row.innerHTML='<div class="av">'+init+'</div><span style="flex:1">'+name+'</span><span style="font-size:11px;color:var(--m)">'+selectedEvent+'</span><span style="margin-left:8px;font-size:11px;font-weight:700;color:var(--gd);background:var(--gl);padding:2px 8px;border-radius:20px">'+photos.length+" foto's"+'</span>';
  document.getElementById('rec-list').insertBefore(row,document.getElementById('rec-list').firstChild);
}

// ─────────────────────────────────────────────────────────
// KLEUR FUNCTIES
// ─────────────────────────────────────────────────────────
function setBgColor(el){
  document.querySelectorAll('#bg-swatches .swatch').forEach(function(s){s.classList.remove('sel');});
  el.classList.add('sel');
  TB.color=el.dataset.color;
  document.getElementById('tb-color').value=el.dataset.color;
  render();
}
function setBgColorCustom(v){
  document.querySelectorAll('#bg-swatches .swatch').forEach(function(s){s.classList.remove('sel');});
  TB.color=v; render();
}
function setTextColor(el){
  document.querySelectorAll('#text-swatches .swatch').forEach(function(s){s.classList.remove('sel');});
  el.classList.add('sel');
  TB.textColor=el.dataset.color;
  document.getElementById('tb-textcolor').value=el.dataset.color;
  render();
}
function setTextColorCustom(v){
  document.querySelectorAll('#text-swatches .swatch').forEach(function(s){s.classList.remove('sel');});
  TB.textColor=v; render();
}

// ─────────────────────────────────────────────────────────
// RESET
// ─────────────────────────────────────────────────────────
function resetApp(){
  photos=[];imgs=[];cropState=[];selectedLayout='full';selectedStyle='elegant';
  TB={x:0,y:null,w:1920,h:80,rot:0,opacity:0.88,color:'#050514',textColor:'#ffffff'};
  tbEditing=true;
  document.getElementById('in-name').value='';
  document.getElementById('in-caption').value='';
  document.getElementById('pg').innerHTML='';
  document.getElementById('pinfo').style.display='none';
  document.getElementById('btn2').disabled=true;
  document.querySelectorAll('.lo').forEach(function(o,i){o.classList.toggle('sel',i===0);});
  document.querySelectorAll('.sc').forEach(function(c,i){c.classList.toggle('sel',i===0);});
  goStep(1);
}
