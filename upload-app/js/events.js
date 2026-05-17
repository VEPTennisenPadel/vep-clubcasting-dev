// ─────────────────────────────────────────────────────────
// EVENTS — Laden en selecteren van events
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
      c.onclick=function(){
        document.querySelectorAll('#ec .chip').forEach(function(x){x.classList.remove('sel');});
        c.classList.add('sel');
        selectedEvent=ev.Title;
        document.getElementById('custom-event-wrap').style.display='none';
        document.getElementById('in-custom-event').value='';
      };
      row.appendChild(c);
      if(i===0) selectedEvent=ev.Title;
    });
    // Ander event optie
    var cOther=document.createElement('div'); cOther.className='chip';
    cOther.textContent='✏️ Ander event';
    cOther.onclick=function(){
      document.querySelectorAll('#ec .chip').forEach(function(x){x.classList.remove('sel');});
      cOther.classList.add('sel');
      selectedEvent='';
      document.getElementById('custom-event-wrap').style.display='block';
      document.getElementById('in-custom-event').focus();
    };
    row.appendChild(cOther);
  }).catch(function(){a.innerHTML='<div class="events-error">Events konden niet geladen worden.</div>';});
}
