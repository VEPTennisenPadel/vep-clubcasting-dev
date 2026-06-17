// ─────────────────────────────────────────────────────────
// EVENTS — Laden en selecteren van events
// ─────────────────────────────────────────────────────────

// Events blijven na hun einddatum nog GRACE_DAYS dagen kiesbaar.
var GRACE_DAYS = 7;

// Geeft de ondergrens-datum (YYYY-MM-DD): vandaag minus GRACE_DAYS dagen.
function eventCutoffDate() {
  var d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - GRACE_DAYS);
  var m = ('0' + (d.getMonth() + 1)).slice(-2);
  var day = ('0' + d.getDate()).slice(-2);
  return d.getFullYear() + '-' + m + '-' + day;
}

function loadEvents() {
  var a = document.getElementById('events-area');
  a.innerHTML = '<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--m)"><span class="spinner"></span> Laden...</div>';
  getToken().then(function(tok) {
    return fetch(LIST_API+'?expand=fields(select=Title,DateFrom,DateTo,Category,Emoji)', {headers:{'Authorization':'Bearer '+tok,'Accept':'application/json'}});
  }).then(function(r){return r.json();})
  .then(function(d) {
    var cutoff = eventCutoffDate();
    var evts = (d.value||[]).map(function(i){
      var df = (i.fields.DateFrom||'').split('T')[0];
      var dt = (i.fields.DateTo||'').split('T')[0];
      return {Title:i.fields.Title,Emoji:i.fields.Emoji||'📅',DateFrom:df,DateTo:dt};
    })
    // Toon events waarvan de einddatum (of begindatum als einddatum ontbreekt)
    // niet langer dan GRACE_DAYS dagen geleden is.
    .filter(function(ev){
      var end = ev.DateTo || ev.DateFrom;
      if (!end) return true;
      return end >= cutoff;
    })
    .sort(function(a,b){return a.DateFrom>b.DateFrom?1:-1;});
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
    addOtherChip(row);
  }).catch(function(){a.innerHTML='<div class="events-error">Events konden niet geladen worden.</div>';});
}

// Voegt de "✏️ Ander event" chip toe aan de rij.
function addOtherChip(row) {
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
}

// Slaat een via "Ander event" opgevoerd event op in VEPEvents zodat het
// een week lang als chip beschikbaar is voor alle leden. Bestaat het event
// al (zelfde Title), dan wordt niets toegevoegd. Fouten worden stil genegeerd
// zodat het uploaden altijd doorgaat.
function saveCustomEvent(title) {
  title = (title||'').trim();
  if (!title) return Promise.resolve();
  var today = new Date();
  today.setHours(0,0,0,0);
  var m = ('0'+(today.getMonth()+1)).slice(-2);
  var day = ('0'+today.getDate()).slice(-2);
  var iso = today.getFullYear()+'-'+m+'-'+day;
  return getToken().then(function(tok){
    // Eerst checken of het event (op Title) al bestaat.
    return fetch(LIST_API+'?expand=fields(select=Title)', {headers:{'Authorization':'Bearer '+tok,'Accept':'application/json'}})
      .then(function(r){return r.json();})
      .then(function(d){
        var exists = (d.value||[]).some(function(i){
          return i.fields && i.fields.Title && i.fields.Title.toLowerCase() === title.toLowerCase();
        });
        if (exists) return;
        return fetch(LIST_API, {
          method:'POST',
          headers:{'Authorization':'Bearer '+tok,'Content-Type':'application/json','Accept':'application/json'},
          body: JSON.stringify({ fields: { Title:title, DateFrom:iso, DateTo:iso, Category:'Anders', Emoji:'📅' } })
        });
      });
  }).catch(function(){ /* stil negeren — upload mag niet blokkeren */ });
}
