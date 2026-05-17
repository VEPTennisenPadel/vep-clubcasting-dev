// ─────────────────────────────────────────────────────────
// COMPILE — Slide aanmaken, verzenden en reset
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
  STEPS.forEach(function(s,i){
    list.innerHTML+='<div class="prog-item" id="pi'+i+'"><div class="prog-icon" id="pic'+i+'">'+s.icon+'</div><span style="flex:1">'+s.label+'</span><div class="prog-bar-wrap"><div class="prog-bar" id="pb'+i+'"></div></div></div>';
  });
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
  var nameInBar=document.getElementById('cb-name')?document.getElementById('cb-name').checked:true;
  fetch(CFG.APPS_SCRIPT_URL,{
    method:'POST',mode:'no-cors',
    headers:{'Content-Type':'text/plain'},
    body:JSON.stringify({
      memberName:nameInBar?document.getElementById('in-name').value:'',
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

function resetApp(){
  photos=[];imgs=[];cropState=[];
  selectedLayout='auto';selectedStyle='elegant';
  TB={x:Math.round((CW-CW*0.5)/2),y:null,w:Math.round(CW*0.5),h:160,rot:0,opacity:0.88,color:'#050514',textColor:'#ffffff'};
  tbEditing=true;tbSelected=false;swapIdx=-1;
  document.getElementById('in-name').value='';
  document.getElementById('in-caption').value='';
  document.getElementById('cb-name').checked=true;
  if(document.getElementById('in-custom-event')) document.getElementById('in-custom-event').value='';
  if(document.getElementById('custom-event-wrap')) document.getElementById('custom-event-wrap').style.display='none';
  document.getElementById('pg').innerHTML='';
  document.getElementById('pinfo').style.display='none';
  document.getElementById('btn2').disabled=true;
  document.querySelectorAll('.lo').forEach(function(o,i){o.classList.toggle('sel',i===0);});
  document.querySelectorAll('.sc').forEach(function(c,i){c.classList.toggle('sel',i===0);});
  loadUserName();
  goStep(1);
}
