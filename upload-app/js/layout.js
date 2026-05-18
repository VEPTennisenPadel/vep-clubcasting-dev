// ─────────────────────────────────────────────────────────
// LAYOUT — Lay-out selectie, cel berekening, oriëntatie
// Elke layout gebruikt exact het opgegeven aantal cellen
// ─────────────────────────────────────────────────────────

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
  if(!selectedLayout) {
    var opties = getLayoutOpties(Math.min(photos.length, MAX_PHOTOS));
    return opties.length > 0 ? opties[0].key : 'full';
  }
  return selectedLayout;
}

// ── CELLEN PER LAYOUT ──────────────────────────────────
function getPhotoCells() {
  var L = getLayout();
  var h = CH;
  var cells = [];

  // 1 foto
  if(L === 'full')           cells = [{x:0,y:0,w:CW,h:CH}];
  else if(L === 'cinematic') cells = [{x:0,y:0,w:CW,h:CH}];

  // 2 fotos
  else if(L === 'duo')
    cells = [{x:0,y:0,w:CW/2-2,h:h},{x:CW/2+2,y:0,w:CW/2-2,h:h}];
  else if(L === 'boven-onder')
    cells = [{x:0,y:0,w:CW,h:h/2-2},{x:0,y:h/2+2,w:CW,h:h/2-2}];
  else if(L === 'speels-overlap') {
    // foto 1 vult achtergrond, foto 2 groot gecentreerd ervoor
    cells = [{x:0,y:0,w:CW,h:h},{x:CW*0.25,y:h*0.1,w:CW*0.5,h:h*0.8}];
  }

  // 3 fotos
  else if(L === 'featured') {
    var mw = CW*0.62;
    cells = [{x:0,y:0,w:mw-2,h:h},{x:mw+2,y:0,w:CW-mw-2,h:h/2-2},{x:mw+2,y:h/2+2,w:CW-mw-2,h:h/2-2}];
  }
  else if(L === 'strip') {
    var tw = CW/3;
    cells = [{x:0,y:0,w:tw-2,h:h},{x:tw+2,y:0,w:tw-2,h:h},{x:tw*2+4,y:0,w:tw-4,h:h}];
  }
  else if(L === 'mosaic') {
    var th = h*0.55, bh = h-th-4;
    cells = [{x:0,y:0,w:CW,h:th},{x:0,y:th+4,w:CW/2-2,h:bh},{x:CW/2+2,y:th+4,w:CW/2-2,h:bh}];
  }
  else if(L === 'speels-cirkel') {
    // 2 fotos naast elkaar, derde als cirkel gecentreerd ervoor
    cells = [
      {x:0,y:0,w:CW/2-2,h:h},
      {x:CW/2+2,y:0,w:CW/2-2,h:h},
      {x:CW/2-200,y:h/2-200,w:400,h:400,clip:'circle'}
    ];
  }
  else if(L === 'onder-duo') {
    // 1 breed boven + 2 naast elkaar onder
    var th = h*0.5;
    cells = [{x:0,y:0,w:CW,h:th-2},{x:0,y:th+2,w:CW/2-2,h:h-th-2},{x:CW/2+2,y:th+2,w:CW/2-2,h:h-th-2}];
  }
  else if(L === 'featured-r') {
    // gespiegeld featured: 2 klein links, 1 groot rechts
    var mw = CW*0.38;
    cells = [{x:0,y:0,w:mw-2,h:h/2-2},{x:0,y:h/2+2,w:mw-2,h:h/2-2},{x:mw+2,y:0,w:CW-mw-2,h:h}];
  }

  // 4 fotos
  else if(L === 'grid4') {
    var hw=CW/2,hh=h/2;
    cells = [{x:0,y:0,w:hw-2,h:hh-2},{x:hw+2,y:0,w:hw-2,h:hh-2},{x:0,y:hh+2,w:hw-2,h:hh-2},{x:hw+2,y:hh+2,w:hw-2,h:hh-2}];
  }
  else if(L === 'featured3') {
    var mw=CW*0.6,rw=CW-mw-4,rh=h/3;
    cells = [{x:0,y:0,w:mw-2,h:h},{x:mw+2,y:0,w:rw,h:rh-2},{x:mw+2,y:rh+2,w:rw,h:rh-2},{x:mw+2,y:rh*2+4,w:rw,h:rh-4}];
  }
  else if(L === 'speels-schuin') {
    var hw=CW/2,hh=h/2;
    cells = [
      {x:0,y:0,w:hw-2,h:hh-2,rot:-2},
      {x:hw+2,y:0,w:hw-2,h:hh-2,rot:2},
      {x:0,y:hh+2,w:hw-2,h:hh-2,rot:2},
      {x:hw+2,y:hh+2,w:hw-2,h:hh-2,rot:-2}
    ];
  }
  else if(L === 'drie-een') {
    // 3 klein boven + 1 groot onder
    var tw=CW/3,th=h*0.45,bh=h-th-4;
    cells = [{x:0,y:0,w:tw-2,h:th},{x:tw+2,y:0,w:tw-2,h:th},{x:tw*2+4,y:0,w:tw-4,h:th},{x:0,y:th+4,w:CW,h:bh}];
  }
  else if(L === 'een-drie') {
    // 1 groot boven + 3 klein onder
    var tw=CW/3,th=h*0.55,bh=h-th-4;
    cells = [{x:0,y:0,w:CW,h:th-2},{x:0,y:th+2,w:tw-2,h:bh},{x:tw+2,y:th+2,w:tw-2,h:bh},{x:tw*2+4,y:th+2,w:tw-4,h:bh}];
  }

  // 5 fotos
  else if(L === 'grid23') {
    var hw=CW/2,th=h*0.45,bh=h-th-4,tw=CW/3;
    cells = [{x:0,y:0,w:hw-2,h:th-2},{x:hw+2,y:0,w:hw-2,h:th-2},{x:0,y:th+2,w:tw-2,h:bh},{x:tw+2,y:th+2,w:tw-2,h:bh},{x:tw*2+4,y:th+2,w:tw-4,h:bh}];
  }
  else if(L === 'featured4') {
    var mw=CW*0.58,rw=CW-mw-4,rh=h/4;
    cells = [{x:0,y:0,w:mw-2,h:h},{x:mw+2,y:0,w:rw,h:rh-2},{x:mw+2,y:rh+2,w:rw,h:rh-2},{x:mw+2,y:rh*2+4,w:rw,h:rh-2},{x:mw+2,y:rh*3+6,w:rw,h:rh-4}];
  }
  else if(L === 'speels-focus') {
    // 4 hoeken + cirkel centraal
    var hw=CW/2,hh=h/2;
    cells = [{x:0,y:0,w:hw-2,h:hh-2},{x:hw+2,y:0,w:hw-2,h:hh-2},{x:0,y:hh+2,w:hw-2,h:hh-2},{x:hw+2,y:hh+2,w:hw-2,h:hh-2},{x:CW/2-240,y:h/2-240,w:480,h:480,clip:'circle'}];
  }
  else if(L === 'grid32-5') {
    // 3 boven + 2 groot onder
    var tw=CW/3,th=h*0.45,bh=h-th-4;
    cells = [{x:0,y:0,w:tw-2,h:th},{x:tw+2,y:0,w:tw-2,h:th},{x:tw*2+4,y:0,w:tw-4,h:th},{x:0,y:th+4,w:CW/2-2,h:bh},{x:CW/2+2,y:th+4,w:CW/2-2,h:bh}];
  }
  else if(L === 'kruis-5') {
    // kruis/plus vorm: midden + 4 zijden
    var cw=CW/3,ch=h/3;
    cells = [{x:cw,y:0,w:cw-2,h:ch-2},{x:0,y:ch+2,w:cw-2,h:ch-2},{x:cw+2,y:ch+2,w:cw-2,h:ch-2},{x:cw*2+4,y:ch+2,w:cw-2,h:ch-2},{x:cw,y:ch*2+4,w:cw-2,h:ch-2}];
  }

  // 6 fotos
  else if(L === 'grid32') {
    var tw=CW/3,hh=h/2;
    cells = [{x:0,y:0,w:tw-2,h:hh-2},{x:tw+2,y:0,w:tw-2,h:hh-2},{x:tw*2+4,y:0,w:tw-4,h:hh-2},{x:0,y:hh+2,w:tw-2,h:hh-2},{x:tw+2,y:hh+2,w:tw-2,h:hh-2},{x:tw*2+4,y:hh+2,w:tw-4,h:hh-2}];
  }
  else if(L === 'grid23-6') {
    var hw=CW/2,th=h*0.45,bh=h-th-4,tw=CW/4;
    cells = [{x:0,y:0,w:hw-2,h:th-2},{x:hw+2,y:0,w:hw-2,h:th-2},{x:0,y:th+2,w:tw-2,h:bh},{x:tw+2,y:th+2,w:tw-2,h:bh},{x:tw*2+4,y:th+2,w:tw-2,h:bh},{x:tw*3+6,y:th+2,w:tw-4,h:bh}];
  }
  else if(L === 'filmstrip') {
    var tw=CW/3,rh=h/2,gap=6;
    cells = [{x:0,y:0,w:tw-gap,h:rh-gap},{x:tw+gap/2,y:0,w:tw-gap,h:rh-gap},{x:tw*2+gap,y:0,w:tw-gap,h:rh-gap},{x:0,y:rh+gap/2,w:tw-gap,h:rh-gap},{x:tw+gap/2,y:rh+gap/2,w:tw-gap,h:rh-gap},{x:tw*2+gap,y:rh+gap/2,w:tw-gap,h:rh-gap}];
  }
  else if(L === 'featured5') {
    // 1 groot links + 5 klein rechts
    var mw=CW*0.55,rw=CW-mw-4,rh=h/5;
    cells = [{x:0,y:0,w:mw-2,h:h}];
    for(var i=0;i<5;i++) cells.push({x:mw+2,y:i*rh+(i>0?i*2:0),w:rw,h:rh-2});
  }
  else if(L === 'twee-twee-twee') {
    // 3 rijen van 2
    var hw=CW/2,rh=h/3;
    cells = [{x:0,y:0,w:hw-2,h:rh-2},{x:hw+2,y:0,w:hw-2,h:rh-2},{x:0,y:rh+2,w:hw-2,h:rh-2},{x:hw+2,y:rh+2,w:hw-2,h:rh-2},{x:0,y:rh*2+4,w:hw-2,h:rh-2},{x:hw+2,y:rh*2+4,w:hw-2,h:rh-2}];
  }
  else if(L === 'focus-6') {
    // 5 hoeken + cirkel centraal
    var tw=CW/3,hh=h/2;
    cells = [{x:0,y:0,w:tw-2,h:hh-2},{x:tw+2,y:0,w:tw-2,h:hh-2},{x:tw*2+4,y:0,w:tw-4,h:hh-2},{x:0,y:hh+2,w:tw-2,h:hh-2},{x:tw*2+4,y:hh+2,w:tw-4,h:hh-2},{x:CW/2-200,y:h/2-200,w:400,h:400,clip:'circle'}];
  }

  return cells;
}

// ── LAYOUT OPTIES PER AANTAL ─────────────────────────
function getLayoutOpties(n) {
  n = Math.min(n, MAX_PHOTOS);
  if(n === 0) return [];

  if(n === 1) return [
    {key:'full',         label:'Fullscreen'},
    {key:'cinematic',    label:'Cinematic'},
    {key:'full',         label:'Portret',      speels:true},
    {key:'cinematic',    label:'Film',         speels:true},
    {key:'full',         label:'Vierkant',     speels:true},
    {key:'cinematic',    label:'Breed',        speels:true}
  ];

  if(n === 2) return [
    {key:'duo',            label:'Duo'},
    {key:'boven-onder',    label:'Boven/Onder'},
    {key:'speels-overlap', label:'Overlap',      speels:true},
    {key:'duo',            label:'Smal duo',     speels:true},
    {key:'boven-onder',    label:'Panorama',     speels:true},
    {key:'speels-overlap', label:'Groot/Klein',  speels:true}
  ];

  if(n === 3) return [
    {key:'featured',     label:'Featured'},
    {key:'strip',        label:'Strip'},
    {key:'mosaic',       label:'Mozaiek'},
    {key:'onder-duo',    label:'Breed+2'},
    {key:'speels-cirkel',label:'Cirkel',        speels:true},
    {key:'featured-r',   label:'Gespiegeld',    speels:true}
  ];

  if(n === 4) return [
    {key:'grid4',        label:'Grid 2x2'},
    {key:'featured3',    label:'Featured+3'},
    {key:'een-drie',     label:'Groot+3'},
    {key:'drie-een',     label:'3+Groot'},
    {key:'speels-schuin',label:'Schuin',        speels:true},
    {key:'featured3',    label:'Rechts groot',  speels:true}
  ];

  if(n === 5) return [
    {key:'grid23',       label:'Grid 2+3'},
    {key:'featured4',    label:'Featured+4'},
    {key:'grid32-5',     label:'Grid 3+2'},
    {key:'kruis-5',      label:'Kruis'},
    {key:'speels-focus', label:'Focus',         speels:true},
    {key:'grid23',       label:'Boven+3',       speels:true}
  ];

  // n === 6
  return [
    {key:'grid32',         label:'Grid 3x2'},
    {key:'filmstrip',      label:'Filmstrip'},
    {key:'grid23-6',       label:'Grid 2+4'},
    {key:'twee-twee-twee', label:'Rijen van 2'},
    {key:'featured5',      label:'Featured+5',  speels:true},
    {key:'focus-6',        label:'Focus',        speels:true}
  ];
}

function selLayout(el, key) {
  selectedLayout = key;
  document.querySelectorAll('.lo').forEach(function(o){o.classList.remove('sel');});
  el.classList.add('sel');
  if(imgs.length) render();
}

// ── PREVIEW HTML ──────────────────────────────────────
function getLayoutPreviewHTML(key) {
  var s = {fill:'#3a3a6a', bg:'#1a1a2e'};
  var rects = '';
  var r = s.fill;

  if(key==='full'||key==='cinematic')
    rects = '<rect x="1" y="1" width="98%" height="98%" rx="2" fill="'+r+'"/>';
  else if(key==='duo')
    rects = '<rect x="1" y="1" width="47%" height="98%" rx="2" fill="'+r+'"/><rect x="52%" y="1" width="47%" height="98%" rx="2" fill="'+r+'"/>';
  else if(key==='boven-onder')
    rects = '<rect x="1" y="1" width="98%" height="46%" rx="2" fill="'+r+'"/><rect x="1" y="52%" width="98%" height="46%" rx="2" fill="'+r+'"/>';
  else if(key==='speels-overlap')
    rects = '<rect x="1" y="1" width="98%" height="98%" rx="2" fill="'+r+'"/><rect x="25%" y="8%" width="50%" height="84%" rx="2" fill="#226FB7" opacity="0.9"/>';
  else if(key==='featured')
    rects = '<rect x="1" y="1" width="58%" height="98%" rx="2" fill="'+r+'"/><rect x="62%" y="1" width="37%" height="47%" rx="2" fill="'+r+'"/><rect x="62%" y="52%" width="37%" height="47%" rx="2" fill="'+r+'"/>';
  else if(key==='featured-r')
    rects = '<rect x="1" y="1" width="35%" height="47%" rx="2" fill="'+r+'"/><rect x="1" y="52%" width="35%" height="47%" rx="2" fill="'+r+'"/><rect x="39%" y="1" width="60%" height="98%" rx="2" fill="'+r+'"/>';
  else if(key==='strip')
    rects = '<rect x="1" y="1" width="30%" height="98%" rx="2" fill="'+r+'"/><rect x="34%" y="1" width="30%" height="98%" rx="2" fill="'+r+'"/><rect x="68%" y="1" width="31%" height="98%" rx="2" fill="'+r+'"/>';
  else if(key==='mosaic')
    rects = '<rect x="1" y="1" width="98%" height="52%" rx="2" fill="'+r+'"/><rect x="1" y="56%" width="47%" height="43%" rx="2" fill="'+r+'"/><rect x="52%" y="56%" width="47%" height="43%" rx="2" fill="'+r+'"/>';
  else if(key==='onder-duo')
    rects = '<rect x="1" y="1" width="98%" height="46%" rx="2" fill="'+r+'"/><rect x="1" y="52%" width="47%" height="46%" rx="2" fill="'+r+'"/><rect x="52%" y="52%" width="47%" height="46%" rx="2" fill="'+r+'"/>';
  else if(key==='speels-cirkel')
    rects = '<rect x="1" y="1" width="47%" height="98%" rx="2" fill="'+r+'"/><rect x="52%" y="1" width="47%" height="98%" rx="2" fill="'+r+'"/><circle cx="50%" cy="50%" r="26%" fill="#226FB7"/>';
  else if(key==='grid4')
    rects = '<rect x="1" y="1" width="47%" height="47%" rx="2" fill="'+r+'"/><rect x="52%" y="1" width="47%" height="47%" rx="2" fill="'+r+'"/><rect x="1" y="52%" width="47%" height="47%" rx="2" fill="'+r+'"/><rect x="52%" y="52%" width="47%" height="47%" rx="2" fill="'+r+'"/>';
  else if(key==='featured3')
    rects = '<rect x="1" y="1" width="56%" height="98%" rx="2" fill="'+r+'"/><rect x="60%" y="1" width="39%" height="30%" rx="2" fill="'+r+'"/><rect x="60%" y="35%" width="39%" height="30%" rx="2" fill="'+r+'"/><rect x="60%" y="69%" width="39%" height="30%" rx="2" fill="'+r+'"/>';
  else if(key==='een-drie')
    rects = '<rect x="1" y="1" width="98%" height="50%" rx="2" fill="'+r+'"/><rect x="1" y="55%" width="30%" height="44%" rx="2" fill="'+r+'"/><rect x="34%" y="55%" width="30%" height="44%" rx="2" fill="'+r+'"/><rect x="68%" y="55%" width="31%" height="44%" rx="2" fill="'+r+'"/>';
  else if(key==='drie-een')
    rects = '<rect x="1" y="1" width="30%" height="44%" rx="2" fill="'+r+'"/><rect x="34%" y="1" width="30%" height="44%" rx="2" fill="'+r+'"/><rect x="68%" y="1" width="31%" height="44%" rx="2" fill="'+r+'"/><rect x="1" y="49%" width="98%" height="50%" rx="2" fill="'+r+'"/>';
  else if(key==='speels-schuin')
    rects = '<rect x="1" y="1" width="47%" height="47%" rx="2" fill="'+r+'" transform="rotate(-2 25 25)"/><rect x="52%" y="1" width="47%" height="47%" rx="2" fill="'+r+'" transform="rotate(2 75 25)"/><rect x="1" y="52%" width="47%" height="47%" rx="2" fill="'+r+'" transform="rotate(2 25 75)"/><rect x="52%" y="52%" width="47%" height="47%" rx="2" fill="'+r+'" transform="rotate(-2 75 75)"/>';
  else if(key==='grid23')
    rects = '<rect x="1" y="1" width="47%" height="43%" rx="2" fill="'+r+'"/><rect x="52%" y="1" width="47%" height="43%" rx="2" fill="'+r+'"/><rect x="1" y="48%" width="30%" height="51%" rx="2" fill="'+r+'"/><rect x="34%" y="48%" width="30%" height="51%" rx="2" fill="'+r+'"/><rect x="68%" y="48%" width="31%" height="51%" rx="2" fill="'+r+'"/>';
  else if(key==='featured4')
    rects = '<rect x="1" y="1" width="54%" height="98%" rx="2" fill="'+r+'"/><rect x="58%" y="1" width="41%" height="22%" rx="2" fill="'+r+'"/><rect x="58%" y="26%" width="41%" height="22%" rx="2" fill="'+r+'"/><rect x="58%" y="51%" width="41%" height="22%" rx="2" fill="'+r+'"/><rect x="58%" y="76%" width="41%" height="23%" rx="2" fill="'+r+'"/>';
  else if(key==='speels-focus')
    rects = '<rect x="1" y="1" width="47%" height="47%" rx="2" fill="'+r+'"/><rect x="52%" y="1" width="47%" height="47%" rx="2" fill="'+r+'"/><rect x="1" y="52%" width="47%" height="47%" rx="2" fill="'+r+'"/><rect x="52%" y="52%" width="47%" height="47%" rx="2" fill="'+r+'"/><circle cx="50%" cy="50%" r="26%" fill="#226FB7"/>';
  else if(key==='grid32-5')
    rects = '<rect x="1" y="1" width="30%" height="44%" rx="2" fill="'+r+'"/><rect x="34%" y="1" width="30%" height="44%" rx="2" fill="'+r+'"/><rect x="68%" y="1" width="31%" height="44%" rx="2" fill="'+r+'"/><rect x="1" y="49%" width="47%" height="50%" rx="2" fill="'+r+'"/><rect x="52%" y="49%" width="47%" height="50%" rx="2" fill="'+r+'"/>';
  else if(key==='kruis-5')
    rects = '<rect x="34%" y="1" width="30%" height="30%" rx="2" fill="'+r+'"/><rect x="1" y="35%" width="30%" height="30%" rx="2" fill="'+r+'"/><rect x="34%" y="35%" width="30%" height="30%" rx="2" fill="'+r+'"/><rect x="68%" y="35%" width="31%" height="30%" rx="2" fill="'+r+'"/><rect x="34%" y="69%" width="30%" height="30%" rx="2" fill="'+r+'"/>';
  else if(key==='grid32')
    rects = '<rect x="1" y="1" width="30%" height="47%" rx="2" fill="'+r+'"/><rect x="34%" y="1" width="30%" height="47%" rx="2" fill="'+r+'"/><rect x="68%" y="1" width="31%" height="47%" rx="2" fill="'+r+'"/><rect x="1" y="52%" width="30%" height="47%" rx="2" fill="'+r+'"/><rect x="34%" y="52%" width="30%" height="47%" rx="2" fill="'+r+'"/><rect x="68%" y="52%" width="31%" height="47%" rx="2" fill="'+r+'"/>';
  else if(key==='filmstrip')
    rects = '<rect x="1" y="1" width="30%" height="47%" rx="2" fill="'+r+'"/><rect x="34%" y="1" width="30%" height="47%" rx="2" fill="'+r+'"/><rect x="68%" y="1" width="31%" height="47%" rx="2" fill="'+r+'"/><rect x="1" y="52%" width="30%" height="47%" rx="2" fill="'+r+'"/><rect x="34%" y="52%" width="30%" height="47%" rx="2" fill="'+r+'"/><rect x="68%" y="52%" width="31%" height="47%" rx="2" fill="'+r+'"/>';
  else if(key==='grid23-6')
    rects = '<rect x="1" y="1" width="47%" height="43%" rx="2" fill="'+r+'"/><rect x="52%" y="1" width="47%" height="43%" rx="2" fill="'+r+'"/><rect x="1" y="48%" width="22%" height="51%" rx="2" fill="'+r+'"/><rect x="26%" y="48%" width="22%" height="51%" rx="2" fill="'+r+'"/><rect x="51%" y="48%" width="22%" height="51%" rx="2" fill="'+r+'"/><rect x="76%" y="48%" width="23%" height="51%" rx="2" fill="'+r+'"/>';
  else if(key==='twee-twee-twee')
    rects = '<rect x="1" y="1" width="47%" height="30%" rx="2" fill="'+r+'"/><rect x="52%" y="1" width="47%" height="30%" rx="2" fill="'+r+'"/><rect x="1" y="35%" width="47%" height="30%" rx="2" fill="'+r+'"/><rect x="52%" y="35%" width="47%" height="30%" rx="2" fill="'+r+'"/><rect x="1" y="69%" width="47%" height="30%" rx="2" fill="'+r+'"/><rect x="52%" y="69%" width="47%" height="30%" rx="2" fill="'+r+'"/>';
  else if(key==='featured5')
    rects = '<rect x="1" y="1" width="52%" height="98%" rx="2" fill="'+r+'"/><rect x="56%" y="1" width="43%" height="18%" rx="2" fill="'+r+'"/><rect x="56%" y="21%" width="43%" height="18%" rx="2" fill="'+r+'"/><rect x="56%" y="42%" width="43%" height="18%" rx="2" fill="'+r+'"/><rect x="56%" y="62%" width="43%" height="18%" rx="2" fill="'+r+'"/><rect x="56%" y="81%" width="43%" height="18%" rx="2" fill="'+r+'"/>';
  else if(key==='focus-6')
    rects = '<rect x="1" y="1" width="30%" height="47%" rx="2" fill="'+r+'"/><rect x="34%" y="1" width="30%" height="47%" rx="2" fill="'+r+'"/><rect x="68%" y="1" width="31%" height="47%" rx="2" fill="'+r+'"/><rect x="1" y="52%" width="30%" height="47%" rx="2" fill="'+r+'"/><rect x="68%" y="52%" width="31%" height="47%" rx="2" fill="'+r+'"/><circle cx="50%" cy="75%" r="22%" fill="#226FB7"/>';

  return '<svg viewBox="0 0 100 56" style="width:100%;height:100%" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="'+s.bg+'"/>'+rects+'</svg>';
}

// ── GRID BOUWEN ───────────────────────────────────────
function buildLayoutGrid() {
  var n = Math.min(photos.length, MAX_PHOTOS);
  var grid = document.getElementById('layout-grid');
  if(!grid) return;
  grid.innerHTML = '';
  if(n === 0) return;

  var opties = getLayoutOpties(n);

  var geldigeKeys = opties.map(function(o){ return o.key; });
  if(geldigeKeys.indexOf(selectedLayout) < 0) {
    selectedLayout = opties[0].key;
  }

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
