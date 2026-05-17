// ─────────────────────────────────────────────────────────
// LAYOUT — Lay-out selectie en foto-cel berekening
// ─────────────────────────────────────────────────────────
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
  var n = photos.length;
  if(n <= 1) return 'full';
  if(n === 2) return 'duo';
  if(n === 3) return 'featured';
  return 'grid4';
}

function getPhotoCells() {
  var L = getLayout(), h = CH;
  var cells = [];
  if(L === 'full') {
    cells = [{x:0, y:0, w:CW, h:CH}];
  } else if(L === 'duo') {
    cells = [{x:0, y:0, w:CW/2-2, h:h}, {x:CW/2+2, y:0, w:CW/2-2, h:h}];
  } else if(L === 'featured') {
    var mw = CW*0.62;
    cells = [
      {x:0, y:0, w:mw-2, h:h},
      {x:mw+2, y:0, w:CW-mw-2, h:h/2-2},
      {x:mw+2, y:h/2+2, w:CW-mw-2, h:h/2-2}
    ];
  } else if(L === 'grid4') {
    var hw = CW/2, hh = h/2;
    cells = [
      {x:0, y:0, w:hw-2, h:hh-2}, {x:hw+2, y:0, w:hw-2, h:hh-2},
      {x:0, y:hh+2, w:hw-2, h:hh-2}, {x:hw+2, y:hh+2, w:hw-2, h:hh-2}
    ];
  } else if(L === 'strip') {
    var tw = CW/3;
    cells = [
      {x:0, y:0, w:tw-2, h:h},
      {x:tw+2, y:0, w:tw-2, h:h},
      {x:tw*2+4, y:0, w:tw-4, h:h}
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
