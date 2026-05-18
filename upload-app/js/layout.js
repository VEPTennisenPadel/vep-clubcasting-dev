// ─────────────────────────────────────────────────────────
// LAYOUT — Lay-out selectie, cel berekening, oriëntatie
// ─────────────────────────────────────────────────────────

// Detecteer oriëntatie van foto's
function getOrientation() {
  var landscape = 0, portrait = 0;
  imgs.forEach(function(img) {
    if (!img) return;
    if (img.width >= img.height) landscape++;
    else portrait++;
  });
  if (portrait > landscape) return 'portrait';
  if (landscape > portrait) return 'landscape';
  return 'mixed';
}

function selLayout(el, key) {
  selectedLayout = key;
  document.querySelectorAll('.lo').forEach(function(o){o.classList.remove('sel');});
  el.classList.add('sel');
  if(imgs.length) render();
}

function getLayout() {
  return selectedLayout === 'auto' ? autoLayout() : selectedLayout;
}

function autoLayout() {
  var n = Math.min(photos.length, MAX_PHOTOS);
  var ori = getOrientation();
  if(n <= 1) return 'full';
  if(n === 2) return ori === 'portrait' ? 'duo' : 'boven-onder';
  if(n === 3) return 'featured';
  if(n === 4) return 'grid4';
  if(n === 5) return 'grid23';
  return 'grid32';
}

function getPhotoCells() {
  var L = getLayout();
  var n = Math.min(photos.length, MAX_PHOTOS);
  var h = CH;
  var cells = [];

  if(L === 'full') {
    cells = [{x:0, y:0, w:CW, h:CH}];

  } else if(L === 'duo') {
    // 2 naast elkaar
    cells = [
      {x:0, y:0, w:CW/2-2, h:h},
      {x:CW/2+2, y:0, w:CW/2-2, h:h}
    ];

  } else if(L === 'boven-onder') {
    // 2 boven/onder
    cells = [
      {x:0, y:0, w:CW, h:h/2-2},
      {x:0, y:h/2+2, w:CW, h:h/2-2}
    ];

  } else if(L === 'featured') {
    // 1 groot links + 2 klein rechts
    var mw = CW*0.62;
    cells = [
      {x:0, y:0, w:mw-2, h:h},
      {x:mw+2, y:0, w:CW-mw-2, h:h/2-2},
      {x:mw+2, y:h/2+2, w:CW-mw-2, h:h/2-2}
    ];

  } else if(L === 'strip') {
    // 3 naast elkaar
    var tw = CW/3;
    cells = [
      {x:0, y:0, w:tw-2, h:h},
      {x:tw+2, y:0, w:tw-2, h:h},
      {x:tw*2+4, y:0, w:tw-4, h:h}
    ];

  } else if(L === 'grid4') {
    // 4 in 2x2
    var hw = CW/2, hh = h/2;
    cells = [
      {x:0, y:0, w:hw-2, h:hh-2},
      {x:hw+2, y:0, w:hw-2, h:hh-2},
      {x:0, y:hh+2, w:hw-2, h:hh-2},
      {x:hw+2, y:hh+2, w:hw-2, h:hh-2}
    ];

  } else if(L === 'featured3') {
    // 1 groot links + 3 klein rechts
    var mw = CW*0.6;
    var rw = CW-mw-4;
    var rh = h/3;
    cells = [
      {x:0, y:0, w:mw-2, h:h},
      {x:mw+2, y:0, w:rw, h:rh-2},
      {x:mw+2, y:rh+2, w:rw, h:rh-2},
      {x:mw+2, y:rh*2+4, w:rw, h:rh-4}
    ];

  } else if(L === 'grid23') {
    // 2 boven + 3 onder
    var hw = CW/2, th2 = h*0.45, bh = h-th2-4;
    var tw3 = CW/3;
    cells = [
      {x:0, y:0, w:hw-2, h:th2-2},
      {x:hw+2, y:0, w:hw-2, h:th2-2},
      {x:0, y:th2+2, w:tw3-2, h:bh},
      {x:tw3+2, y:th2+2, w:tw3-2, h:bh},
      {x:tw3*2+4, y:th2+2, w:tw3-4, h:bh}
    ];

  } else if(L === 'featured4') {
    // 1 groot links + 4 klein rechts
    var mw = CW*0.58;
    var rw = CW-mw-4;
    var rh = h/4;
    cells = [
      {x:0, y:0, w:mw-2, h:h},
      {x:mw+2, y:0, w:rw, h:rh-2},
      {x:mw+2, y:rh+2, w:rw, h:rh-2},
      {x:mw+2, y:rh*2+4, w:rw, h:rh-2},
      {x:mw+2, y:rh*3+6, w:rw, h:rh-4}
    ];

  } else if(L === 'grid32') {
    // 3 boven + 3 onder
    var tw = CW/3, hh2 = h/2;
    cells = [
      {x:0, y:0, w:tw-2, h:hh2-2},
      {x:tw+2, y:0, w:tw-2, h:hh2-2},
      {x:tw*2+4, y:0, w:tw-4, h:hh2-2},
      {x:0, y:hh2+2, w:tw-2, h:hh2-2},
      {x:tw+2, y:hh2+2, w:tw-2, h:hh2-2},
      {x:tw*2+4, y:hh2+2, w:tw-4, h:hh2-2}
    ];

  } else if(L === 'grid23-6') {
    // 2 boven + 4 onder (voor 6)
    var hw = CW/2, tw4 = CW/4;
    var th2 = h*0.45, bh = h-th2-4;
    cells = [
      {x:0, y:0, w:hw-2, h:th2-2},
      {x:hw+2, y:0, w:hw-2, h:th2-2},
      {x:0, y:th2+2, w:tw4-2, h:bh},
      {x:tw4+2, y:th2+2, w:tw4-2, h:bh},
      {x:tw4*2+4, y:th2+2, w:tw4-2, h:bh},
      {x:tw4*3+6, y:th2+2, w:tw4-4, h:bh}
    ];

  // ── SPEELSE LAYOUTS ──

  } else if(L === 'speels-overlap') {
    // 2 foto's: groot-klein overlap (foto 2 over foto 1 heen)
    cells = [
      {x:0, y:0, w:CW, h:h},
      {x:CW*0.45, y:h*0.1, w:CW*0.5, h:h*0.8}
    ];

  } else if(L === 'speels-cirkel') {
    // 3 foto's: 2 naast elkaar fullscreen + cirkel overlay midden
    // Foto's als achtergrond, cirkel is een clip in render
    cells = [
      {x:0, y:0, w:CW/2-2, h:h},
      {x:CW/2+2, y:0, w:CW/2-2, h:h},
      {x:CW/2-200, y:h/2-200, w:400, h:400, clip:'circle'}
    ];

  } else if(L === 'speels-schuin') {
    // 4 foto's schuin grid
    var hw = CW/2, hh = h/2;
    cells = [
      {x:0, y:0, w:hw-2, h:hh-2, rot:-2},
      {x:hw+2, y:0, w:hw-2, h:hh-2, rot:2},
      {x:0, y:hh+2, w:hw-2, h:hh-2, rot:2},
      {x:hw+2, y:hh+2, w:hw-2, h:hh-2, rot:-2}
    ];

  } else if(L === 'speels-focus') {
    // 5 foto's: 4 hoeken fullscreen + cirkel centraal
    cells = [
      {x:0, y:0, w:CW/2-2, h:h/2-2},
      {x:CW/2+2, y:0, w:CW/2-2, h:h/2-2},
      {x:0, y:h/2+2, w:CW/2-2, h:h/2-2},
      {x:CW/2+2, y:h/2+2, w:CW/2-2, h:h/2-2},
      {x:CW/2-250, y:h/2-250, w:500, h:500, clip:'circle'}
    ];

  } else if(L === 'filmstrip') {
    // 6 foto's: 2 rijen van 3 met filmstrip look
    var tw = CW/3, rh = h/2;
    var gap = 6;
    cells = [
      {x:0, y:0, w:tw-gap, h:rh-gap},
      {x:tw+gap/2, y:0, w:tw-gap, h:rh-gap},
      {x:tw*2+gap, y:0, w:tw-gap, h:rh-gap},
      {x:0, y:rh+gap/2, w:tw-gap, h:rh-gap},
      {x:tw+gap/2, y:rh+gap/2, w:tw-gap, h:rh-gap},
      {x:tw*2+gap, y:rh+gap/2, w:tw-gap, h:rh-gap}
    ];

  } else if(L === 'mosaic') {
    var th = h*0.55, bh = h-th-4;
    cells = [
      {x:0, y:0, w:CW, h:th},
      {x:0, y:th+4, w:CW/2-2, h:bh},
      {x:CW/2+2, y:th+4, w:CW/2-2, h:bh}
    ];

  } else if(L === 'cinematic') {
    cells = [{x:0, y:0, w:CW, h:CH}];
  }

  return cells;
}

// Genereer layout opties op basis van aantal foto's
function getLayoutOpties(n) {
  n = Math.min(n, MAX_PHOTOS);
  var opties = [];
  if(n <= 1) {
    opties = [
      {key:'full', label:'Fullscreen'}
    ];
  } else if(n === 2) {
    opties = [
      {key:'duo', label:'Duo'},
      {key:'boven-onder', label:'Boven/Onder'},
      {key:'speels-overlap', label:'Overlap', speels:true}
    ];
  } else if(n === 3) {
    opties = [
      {key:'featured', label:'Featured'},
      {key:'strip', label:'Strip'},
      {key:'speels-cirkel', label:'Cirkel', speels:true}
    ];
  } else if(n === 4) {
    opties = [
      {key:'grid4', label:'Grid 2×2'},
      {key:'featured3', label:'Featured+3'},
      {key:'speels-schuin', label:'Schuin', speels:true}
    ];
  } else if(n === 5) {
    opties = [
      {key:'grid23', label:'Grid 2+3'},
      {key:'featured4', label:'Featured+4'},
      {key:'speels-focus', label:'Focus', speels:true}
    ];
  } else {
    opties = [
      {key:'grid32', label:'Grid 3×2'},
      {key:'grid23-6', label:'Grid 2+4'},
      {key:'filmstrip', label:'Filmstrip', speels:true}
    ];
  }
  return opties;
}

// Bouw layout kiezer dynamisch op basis van foto's
function buildLayoutGrid() {
  var n = Math.min(photos.length, MAX_PHOTOS);
  if(n === 0) return;
  var opties = getLayoutOpties(n);
  var grid = document.getElementById('layout-grid');
  if(!grid) return;
  grid.innerHTML = '';

  // Voeg auto altijd toe
  var autoDiv = document.createElement('div');
  autoDiv.className = 'lo' + (selectedLayout === 'auto' ? ' sel' : '');
  autoDiv.innerHTML = '<div class="lt" style="display:flex;align-items:center;justify-content:center"><span style="font-size:18px">✨</span></div><div class="ln">Auto</div>';
  autoDiv.onclick = function(){ selLayout(autoDiv, 'auto'); };
  grid.appendChild(autoDiv);

  opties.forEach(function(opt) {
    var div = document.createElement('div');
    div.className = 'lo' + (selectedLayout === opt.key ? ' sel' : '');
    var preview = getLayoutPreviewHTML(opt.key);
    var badge = opt.speels ? '<span style="position:absolute;top:2px;right:2px;font-size:8px;background:#EF9F27;color:#633806;padding:1px 4px;border-radius:4px">speels</span>' : '';
    div.innerHTML = '<div class="lt" style="position:relative">' + preview + badge + '</div><div class="ln">' + opt.label + '</div>';
    div.onclick = (function(o, d){ return function(){ selLayout(d, o.key); }; })(opt, div);
    grid.appendChild(div);
  });
}

// Simpele SVG preview per layout
function getLayoutPreviewHTML(key) {
  var s = {fill:'#3a3a6a', stroke:'#226FB7', bg:'#1a1a2e'};
  var w = '100%', h = '100%';
  var rects = '';

  if(key==='full' || key==='cinematic') {
    rects = '<rect x="1" y="1" width="98%" height="98%" rx="2" fill="'+s.fill+'"/>';
  } else if(key==='duo') {
    rects = '<rect x="1" y="1" width="47%" height="98%" rx="2" fill="'+s.fill+'"/><rect x="52%" y="1" width="47%" height="98%" rx="2" fill="'+s.fill+'"/>';
  } else if(key==='boven-onder') {
    rects = '<rect x="1" y="1" width="98%" height="46%" rx="2" fill="'+s.fill+'"/><rect x="1" y="52%" width="98%" height="46%" rx="2" fill="'+s.fill+'"/>';
  } else if(key==='featured') {
    rects = '<rect x="1" y="1" width="58%" height="98%" rx="2" fill="'+s.fill+'"/><rect x="62%" y="1" width="37%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="62%" y="52%" width="37%" height="46%" rx="2" fill="'+s.fill+'"/>';
  } else if(key==='strip') {
    rects = '<rect x="1" y="1" width="30%" height="98%" rx="2" fill="'+s.fill+'"/><rect x="34%" y="1" width="30%" height="98%" rx="2" fill="'+s.fill+'"/><rect x="68%" y="1" width="31%" height="98%" rx="2" fill="'+s.fill+'"/>';
  } else if(key==='grid4') {
    rects = '<rect x="1" y="1" width="47%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="52%" y="1" width="47%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="1" y="52%" width="47%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="52%" y="52%" width="47%" height="47%" rx="2" fill="'+s.fill+'"/>';
  } else if(key==='featured3') {
    rects = '<rect x="1" y="1" width="56%" height="98%" rx="2" fill="'+s.fill+'"/><rect x="60%" y="1" width="39%" height="30%" rx="2" fill="'+s.fill+'"/><rect x="60%" y="35%" width="39%" height="30%" rx="2" fill="'+s.fill+'"/><rect x="60%" y="69%" width="39%" height="30%" rx="2" fill="'+s.fill+'"/>';
  } else if(key==='grid23') {
    rects = '<rect x="1" y="1" width="47%" height="43%" rx="2" fill="'+s.fill+'"/><rect x="52%" y="1" width="47%" height="43%" rx="2" fill="'+s.fill+'"/><rect x="1" y="48%" width="30%" height="51%" rx="2" fill="'+s.fill+'"/><rect x="34%" y="48%" width="30%" height="51%" rx="2" fill="'+s.fill+'"/><rect x="68%" y="48%" width="31%" height="51%" rx="2" fill="'+s.fill+'"/>';
  } else if(key==='featured4') {
    rects = '<rect x="1" y="1" width="54%" height="98%" rx="2" fill="'+s.fill+'"/><rect x="58%" y="1" width="41%" height="22%" rx="2" fill="'+s.fill+'"/><rect x="58%" y="26%" width="41%" height="22%" rx="2" fill="'+s.fill+'"/><rect x="58%" y="51%" width="41%" height="22%" rx="2" fill="'+s.fill+'"/><rect x="58%" y="76%" width="41%" height="23%" rx="2" fill="'+s.fill+'"/>';
  } else if(key==='grid32') {
    rects = '<rect x="1" y="1" width="30%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="34%" y="1" width="30%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="68%" y="1" width="31%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="1" y="52%" width="30%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="34%" y="52%" width="30%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="68%" y="52%" width="31%" height="47%" rx="2" fill="'+s.fill+'"/>';
  } else if(key==='grid23-6') {
    rects = '<rect x="1" y="1" width="47%" height="43%" rx="2" fill="'+s.fill+'"/><rect x="52%" y="1" width="47%" height="43%" rx="2" fill="'+s.fill+'"/><rect x="1" y="48%" width="22%" height="51%" rx="2" fill="'+s.fill+'"/><rect x="26%" y="48%" width="22%" height="51%" rx="2" fill="'+s.fill+'"/><rect x="51%" y="48%" width="22%" height="51%" rx="2" fill="'+s.fill+'"/><rect x="76%" y="48%" width="23%" height="51%" rx="2" fill="'+s.fill+'"/>';
  } else if(key==='speels-overlap') {
    rects = '<rect x="1" y="1" width="98%" height="98%" rx="2" fill="'+s.fill+'"/><rect x="42%" y="8%" width="52%" height="84%" rx="2" fill="#226FB7" opacity="0.85"/>';
  } else if(key==='speels-cirkel') {
    rects = '<rect x="1" y="1" width="47%" height="98%" rx="2" fill="'+s.fill+'"/><rect x="52%" y="1" width="47%" height="98%" rx="2" fill="'+s.fill+'"/><circle cx="50%" cy="50%" r="28%" fill="#226FB7"/>';
  } else if(key==='speels-schuin') {
    rects = '<rect x="1" y="1" width="47%" height="47%" rx="2" fill="'+s.fill+'" transform="rotate(-2 25 25)"/><rect x="52%" y="1" width="47%" height="47%" rx="2" fill="'+s.fill+'" transform="rotate(2 75 25)"/><rect x="1" y="52%" width="47%" height="47%" rx="2" fill="'+s.fill+'" transform="rotate(2 25 75)"/><rect x="52%" y="52%" width="47%" height="47%" rx="2" fill="'+s.fill+'" transform="rotate(-2 75 75)"/>';
  } else if(key==='speels-focus') {
    rects = '<rect x="1" y="1" width="47%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="52%" y="1" width="47%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="1" y="52%" width="47%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="52%" y="52%" width="47%" height="47%" rx="2" fill="'+s.fill+'"/><circle cx="50%" cy="50%" r="28%" fill="#226FB7"/>';
  } else if(key==='filmstrip') {
    rects = '<rect x="1" y="1" width="30%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="34%" y="1" width="30%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="68%" y="1" width="31%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="1" y="52%" width="30%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="34%" y="52%" width="30%" height="47%" rx="2" fill="'+s.fill+'"/><rect x="68%" y="52%" width="31%" height="47%" rx="2" fill="'+s.fill+'"/>';
  } else if(key==='mosaic') {
    rects = '<rect x="1" y="1" width="98%" height="52%" rx="2" fill="'+s.fill+'"/><rect x="1" y="56%" width="47%" height="43%" rx="2" fill="'+s.fill+'"/><rect x="52%" y="56%" width="47%" height="43%" rx="2" fill="'+s.fill+'"/>';
  }
  return '<svg viewBox="0 0 100 56" style="width:100%;height:100%" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="'+s.bg+'"/>' + rects + '</svg>';
}
