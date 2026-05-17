// ─────────────────────────────────────────────────────────
// EDITOR — Canvas setup, render, titelbalk, framenummers
// ─────────────────────────────────────────────────────────
function initEditor() {
  canvas = document.getElementById('C');
  ctx = canvas.getContext('2d');
  canvas.width = CW; canvas.height = CH;
  tbEditing = true;
  tbSelected = false;

  TB.opacity = 0.88;
  document.getElementById('tb-op').value = 88;
  TB.w = Math.round(CW * 0.5);
  TB.h = parseInt(document.getElementById('tb-h').value)||160;
  TB.y = CH - TB.h;
  TB.x = (CW - TB.w) / 2;
  document.getElementById('tb-w').value = TB.w;

  var wisselWrap = document.getElementById('wissel-wrap');
  if(wisselWrap) wisselWrap.style.display = photos.length > 1 ? 'flex' : 'none';

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

function hexToRgba(hex,a){
  var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return 'rgba('+r+','+g+','+b+','+a+')';
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
  var th=parseInt(document.getElementById('tb-h').value)||160;
  var top=parseInt(document.getElementById('tb-op').value); if(isNaN(top)||top===0) top=88;
  var trot=parseFloat(document.getElementById('tb-rot').value)||0;
  TB.w=Math.min(tw,CW); TB.h=th;
  TB.opacity=top/100; TB.rot=trot*Math.PI/180;
  TB.color=document.getElementById('tb-color').value;
  TB.textColor=document.getElementById('tb-textcolor').value;
  if(TB.y===null || TB.y > CH || TB.y < -TB.h) TB.y = CH - TB.h;
  if(TB.x===null || TB.x > CW) TB.x = Math.round((CW - TB.w) / 2);

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
  var nameInBar=document.getElementById('cb-name')?document.getElementById('cb-name').checked:true;
  var memberName=nameInBar&&document.getElementById('in-name')?document.getElementById('in-name').value:'';
  var titleText=caption?selectedEvent+' — '+caption:selectedEvent;
  var styles={elegant:{italic:true,bold:false},bold:{italic:false,bold:true},minimal:{italic:false,bold:false},playful:{italic:false,bold:true}};
  var st=styles[selectedStyle]||styles.elegant;

  var marginX=20, marginY=14;

  function wrapText(text, maxW, font) {
    ctx.font=font;
    var words=text.split(' '), lines=[], line='';
    words.forEach(function(w){
      var test=line?line+' '+w:w;
      if(ctx.measureText(test).width>maxW&&line){lines.push(line);line=w;}
      else line=test;
    });
    if(line) lines.push(line);
    return lines;
  }

  var nameFontSize=Math.min(TB.h*0.2,28);
  var nameLineH=nameFontSize*1.3;
  var nameReserved=memberName?nameLineH+marginY:0;
  var maxTextW=TB.w-marginX*2;
  var availH=TB.h-marginY*2-nameReserved;

  var fs=Math.min(availH*0.7,72);
  var lines, font;
  do {
    font=(st.bold?'bold ':'')+( st.italic?'italic ':'')+fs+'px -apple-system,sans-serif';
    lines=wrapText(titleText,maxTextW,font);
    var totalH=lines.length*fs*1.2;
    if(totalH<=availH&&ctx.measureText(lines[0]||'').width<=maxTextW) break;
    fs-=1;
  } while(fs>8);

  ctx.fillStyle=TB.textColor; ctx.font=font;
  ctx.textBaseline='middle'; ctx.textAlign='left';
  var lineH=fs*1.2, totalH=lines.length*lineH;
  var textAreaTop=-TB.h/2+marginY;
  var textAreaH=TB.h-marginY*2-nameReserved;
  var startY=textAreaTop+(textAreaH-totalH)/2+lineH/2;
  lines.forEach(function(line,i){ ctx.fillText(line,-TB.w/2+marginX,startY+i*lineH); });

  if(memberName){
    ctx.textAlign='right'; ctx.textBaseline='bottom';
    ctx.font='italic '+nameFontSize+'px -apple-system,sans-serif';
    ctx.fillStyle=TB.textColor+'AA';
    ctx.fillText(memberName,TB.w/2-marginX,TB.h/2-marginY);
  }
  ctx.restore();

  // Framenummers
  if(photos.length > 1) {
    var fcells=getPhotoCells();
    var count=Math.min(photos.length,fcells.length);
    for(var fi=0;fi<count;fi++){
      var cell=fcells[fi], nr=fi+1, r=30;
      var cx2=cell.x+r+12, cy2=cell.y+r+12;
      ctx.shadowColor='rgba(0,0,0,0.5)'; ctx.shadowBlur=6;
      ctx.beginPath(); ctx.arc(cx2,cy2,r,0,Math.PI*2);
      ctx.fillStyle='rgba(34,111,183,0.92)'; ctx.fill();
      ctx.shadowBlur=0;
      ctx.fillStyle='#ffffff';
      ctx.font='bold 28px -apple-system,sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(nr,cx2,cy2);
    }
    ctx.shadowBlur=0;
  }
}

// Kleur functies
function selSC(el,style){
  selectedStyle=style;
  document.querySelectorAll('.sc').forEach(function(c){c.classList.remove('sel');});
  el.classList.add('sel'); render();
}
function setBgColor(el){
  document.querySelectorAll('#bg-swatches .swatch').forEach(function(s){s.classList.remove('sel');});
  el.classList.add('sel'); TB.color=el.dataset.color;
  document.getElementById('tb-color').value=el.dataset.color; render();
}
function setBgColorCustom(v){
  document.querySelectorAll('#bg-swatches .swatch').forEach(function(s){s.classList.remove('sel');});
  TB.color=v; render();
}
function setTextColor(el){
  document.querySelectorAll('#text-swatches .swatch').forEach(function(s){s.classList.remove('sel');});
  el.classList.add('sel'); TB.textColor=el.dataset.color;
  document.getElementById('tb-textcolor').value=el.dataset.color; render();
}
function setTextColorCustom(v){
  document.querySelectorAll('#text-swatches .swatch').forEach(function(s){s.classList.remove('sel');});
  TB.textColor=v; render();
}
