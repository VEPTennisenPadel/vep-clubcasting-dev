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
  if(editorMode==='titlebar'){
    startTBInteraction(pos);
    return;
  }
  var idx=hitTestPhoto(pos.x,pos.y);
  if(idx>=0){
    interaction={type:'photo',idx:idx,startX:pos.x,startY:pos.y,
      startOx:cropState[idx].ox||0,startOy:cropState[idx].oy||0};
  }
}

// Start een titelbalk-interactie op basis van wat er geraakt wordt.
function startTBInteraction(pos){
  var hit=tbHitTest(pos.x,pos.y);
  if(!hit) return;
  if(hit==='move'){
    interaction={type:'tb-move',startX:pos.x,startY:pos.y,startTBx:TB.x,startTBy:TB.y};
  } else if(hit==='rotate'){
    var cx=TB.x+TB.w/2, cy=TB.y+TB.h/2;
    interaction={type:'tb-rotate',cx:cx,cy:cy,
      startAngle:Math.atan2(pos.y-cy,pos.x-cx),startRot:TB.rot};
  } else {
    // hoek: schalen. Tegenoverliggende hoek blijft vast (in lokale ruimte → wereld).
    interaction={type:'tb-resize',corner:hit,startX:pos.x,startY:pos.y,
      startW:TB.w,startH:TB.h,startTBx:TB.x,startTBy:TB.y};
  }
  tbMoved=true;
}

// Verwerk beweging van een titelbalk-interactie.
function moveTBInteraction(pos){
  if(interaction.type==='tb-move'){
    TB.x=interaction.startTBx+(pos.x-interaction.startX);
    TB.y=interaction.startTBy+(pos.y-interaction.startY);
  } else if(interaction.type==='tb-rotate'){
    var ang=Math.atan2(pos.y-interaction.cy,pos.x-interaction.cx);
    TB.rot=interaction.startRot+(ang-interaction.startAngle);
  } else if(interaction.type==='tb-resize'){
    // verschil projecteren op de (geroteerde) breedte- en hoogte-assen
    var dx=pos.x-interaction.startX, dy=pos.y-interaction.startY;
    var cos=Math.cos(TB.rot), sin=Math.sin(TB.rot);
    var dW=dx*cos+dy*sin;       // langs breedte-as
    var dH=-dx*sin+dy*cos;      // langs hoogte-as
    var sgnW=(interaction.corner==='ne'||interaction.corner==='se')?1:-1;
    var sgnH=(interaction.corner==='sw'||interaction.corner==='se')?1:-1;
    var newW=Math.max(200,Math.min(1920,interaction.startW+sgnW*dW));
    var newH=Math.max(30,Math.min(300,interaction.startH+sgnH*dH));
    // verschuif positie zodat de tegenoverliggende hoek op zijn plek blijft
    var ddW=newW-interaction.startW, ddH=newH-interaction.startH;
    var shiftX=(sgnW<0?-ddW:0), shiftY=(sgnH<0?-ddH:0);
    // shift in lokale ruimte terugbrengen naar wereld-as voor x/y-hoek
    TB.x=interaction.startTBx + shiftX*cos - shiftY*sin;
    TB.y=interaction.startTBy + shiftX*sin + shiftY*cos;
    TB.w=newW; TB.h=newH;
  }
  syncTBFields();
  render();
}

function onMouseMove(e) {
  var pos=canvasXY(e);
  if(editorMode==='titlebar'){
    if(interaction && interaction.type && interaction.type.indexOf('tb-')===0){
      moveTBInteraction(pos);
      return;
    }
    // cursor-hint op basis van wat er onder de muis ligt
    var hit=tbHitTest(pos.x,pos.y);
    var cur='default';
    if(hit==='rotate') cur='grab';
    else if(hit==='nw'||hit==='se') cur='nwse-resize';
    else if(hit==='ne'||hit==='sw') cur='nesw-resize';
    else if(hit==='move') cur='move';
    canvas.style.cursor=cur;
    return;
  }
  if(!interaction) return;
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
  if(editorMode!=='photos') return;
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
    if(editorMode==='titlebar'){
      if(e.touches.length===1){
        var tt=e.touches[0];
        startTBInteraction(canvasXY({clientX:tt.clientX,clientY:tt.clientY}));
      }
      pinchStartDist=null;
      return;
    }
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
    if(editorMode==='titlebar'){
      if(e.touches.length===1 && interaction && interaction.type && interaction.type.indexOf('tb-')===0){
        var tt=e.touches[0];
        moveTBInteraction(canvasXY({clientX:tt.clientX,clientY:tt.clientY}));
      }
      return;
    }
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
