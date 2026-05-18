// ─────────────────────────────────────────────────────────
// PHOTOS — Upload, thumbnails, drag & drop, wisselen
// ─────────────────────────────────────────────────────────
function addFiles(files) {
  Array.from(files).forEach(function(f) {
    var r = new FileReader();
    r.onload = function(e) {
      photos.push({name:f.name, src:e.target.result});
      cropState.push({ox:0, oy:0, zoom:1});
      renderThumbs();
      checkMaxPhotos();
    };
    r.readAsDataURL(f);
  });
}

function checkMaxPhotos() {
  var warn = document.getElementById('foto-max-warn');
  if (!warn) return;
  if (photos.length > MAX_PHOTOS) {
    warn.textContent = 'Je hebt ' + photos.length + ' fotos geselecteerd. Verwijder ' + (photos.length - MAX_PHOTOS) + ' foto(s) om verder te gaan (max ' + MAX_PHOTOS + ').';
    warn.style.display = 'block';
    document.getElementById('btn2').disabled = true;
  } else {
    warn.style.display = 'none';
    document.getElementById('btn2').disabled = photos.length === 0;
  }
}

function showFotoErr(msg) {
  var warn = document.getElementById('foto-max-warn');
  if (warn) { warn.textContent = msg; warn.style.display = 'block'; }
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

function removePhoto(i){
  photos.splice(i,1);
  cropState.splice(i,1);
  renderThumbs();
  checkMaxPhotos();
  var warn = document.getElementById('foto-max-warn');
  if(warn && photos.length < MAX_PHOTOS) warn.style.display='none';
}
function onDragOver(e){e.preventDefault();document.getElementById('dz').classList.add('drag');}
function onDragLeave(){document.getElementById('dz').classList.remove('drag');}
function onDrop(e){e.preventDefault();onDragLeave();addFiles(e.dataTransfer.files);}

function wisselFoto() {
  var vanInput = document.getElementById('wissel-van');
  var naarInput = document.getElementById('wissel-naar');
  var van = parseInt(vanInput.value) - 1;
  var naar = parseInt(naarInput.value) - 1;
  var maxIdx = Math.min(photos.length, getPhotoCells().length) - 1;

  if(!vanInput.value.trim() || !naarInput.value.trim() || isNaN(van) || isNaN(naar)) {
    alert('Vul twee framenummers in.'); return; }
  if(van < 0 || van > maxIdx || naar < 0 || naar > maxIdx) {
    alert('Framenummers moeten tussen 1 en ' + (maxIdx+1) + ' liggen.'); return; }
  if(van === naar) { alert('Kies twee verschillende frames.'); return; }

  var tmpPhoto = photos[van]; photos[van] = photos[naar]; photos[naar] = tmpPhoto;
  var tmpCrop = cropState[van]; cropState[van] = cropState[naar]; cropState[naar] = tmpCrop;

  imgs = [];
  var pending = photos.length;
  photos.forEach(function(p, i) {
    var im = new Image();
    im.onload = function() { imgs[i] = im; pending--; if(!pending) render(); };
    im.src = p.src;
  });

  vanInput.value = '';
  naarInput.value = '';
}
