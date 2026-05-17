// ─────────────────────────────────────────────────────────
// INTERACTION — Muis, touch, zoom interactie op canvas
// ─────────────────────────────────────────────────────────
function canvasXY(e) {
  var rect = canvas.getBoundingClientRect();
  var sx = CW / rect.width, sy = CH / rect.height;
  var src = (e.touches && e.touches[0]) || e;
  return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
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
  var idx=hitTestPhoto(pos.x,pos.y);
  if(idx>=0){
    interaction={type:'photo',idx:idx,startX:pos.x,startY:pos.y,
      startOx:cropState[idx].ox||0,startOy:cropState[idx].oy||0};
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
  }
  var cur='default';
  if(interaction&&interaction.type==='photo') cur='grabbing';
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

document.addEventListener('DOMContentLoaded', function() {
  var c=document.getElementById('C');
  c.addEventListener('mousedown',onMouseDown);
  c.addEventListener('mousemove',onMouseMove);
  c.addEventListener('mouseup',onMouseUp);
  c.addEventListener('mouseleave',onMouseUp);
  c.addEventListener('wheel',onWheel,{passive:false});

  var pinchStartDist=null, pinchIdx=-1, pinchStartZoom=1;

  c.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      var t=e.touches[0];
      var pos=canvasXY({clientX:t.clientX, clientY:t.clientY});
      var idx=hitTestPhoto(pos.x,pos.y);
      if(idx>=0){
        interaction={type:'photo',idx:idx,startX:pos.x,startY:pos.y,
          startOx:cropState[idx].ox||0,startOy:cropState[idx].oy||0};
      }
      pinchStartDist=null;
    } else if(e.touches.length===2){
      interaction=null;
      var dx=e.touches[0].clientX-e.touches[1].clientX;
      var dy=e.touches[0].clientY-e.touches[1].clientY;
      pinchStartDist=Math.sqrt(dx*dx+dy*dy);
      pinchIdx=cropState.length>0?0:-1;
      var mid={clientX:(e.touches[0].clientX+e.touches[1].clientX)/2,
               clientY:(e.touches[0].clientY+e.touches[1].clientY)/2};
      var pos=canvasXY(mid);
      var hitIdx=hitTestPhoto(pos.x,pos.y);
      if(hitIdx>=0) pinchIdx=hitIdx;
      pinchStartZoom=pinchIdx>=0?(cropState[pinchIdx].zoom||1):1;
    }
  },{passive:false});

  c.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if(e.touches.length===1&&interaction&&interaction.type==='photo'){
      var t=e.touches[0];
      var pos=canvasXY({clientX:t.clientX,clientY:t.clientY});
      cropState[interaction.idx].ox=interaction.startOx+(pos.x-interaction.startX);
      cropState[interaction.idx].oy=interaction.startOy+(pos.y-interaction.startY);
      render();
    } else if(e.touches.length===2&&pinchStartDist!==null&&pinchIdx>=0){
      var dx=e.touches[0].clientX-e.touches[1].clientX;
      var dy=e.touches[0].clientY-e.touches[1].clientY;
      var newDist=Math.sqrt(dx*dx+dy*dy);
      cropState[pinchIdx].zoom=Math.max(0.5,Math.min(5,pinchStartZoom*(newDist/pinchStartDist)));
      render();
    }
  },{passive:false});

  c.addEventListener('touchend',function(e){
    if(e.touches.length===0){interaction=null;pinchStartDist=null;}
  });
  c.addEventListener('touchcancel',function(){interaction=null;pinchStartDist=null;});
});
