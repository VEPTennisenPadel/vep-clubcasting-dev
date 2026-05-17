// ─────────────────────────────────────────────────────────
// AUTH — Microsoft login, token en gebruikersnaam
// ─────────────────────────────────────────────────────────
var msalApp = null;
var loginReq = { scopes: ['Sites.ReadWrite.All','User.Read'] };
var LIST_API = 'https://graph.microsoft.com/v1.0/sites/' + encodeURIComponent('veptennis.sharepoint.com:/sites/VooralleVEPSharepoint-gebruikers:') + '/lists/' + CFG.LIST_NAME + '/items';

(function loadMSAL() {
  var s = document.createElement('script');
  s.src = window.location.href.replace(/[^/]*$/,'') + '../shared/msal-browser.min.js';
  s.onload = initMSAL;
  s.onerror = function() {
    var s2 = document.createElement('script');
    s2.src = 'https://cdn.jsdelivr.net/npm/@azure/msal-browser@2.38.3/lib/msal-browser.min.js';
    s2.onload = initMSAL;
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
})();

function initMSAL() {
  msalApp = new msal.PublicClientApplication({
    auth:{ clientId:CFG.CLIENT_ID, authority:'https://login.microsoftonline.com/'+CFG.TENANT_ID, redirectUri:location.href.split('?')[0].split('#')[0] },
    cache:{ cacheLocation:'sessionStorage' }
  });
  msalApp.initialize().then(function() {
    msalApp.handleRedirectPromise().then(function() {
      if (!msalApp.getAllAccounts().length) msalApp.loginRedirect(loginReq);
      else { loadUserName(); loadEvents(); }
    });
  });
}

function getToken() {
  var accs = msalApp ? msalApp.getAllAccounts() : [];
  if (!accs.length) return Promise.reject('Niet ingelogd');
  return msalApp.acquireTokenSilent({scopes:loginReq.scopes,account:accs[0]})
    .then(function(r){return r.accessToken;})
    .catch(function(){return msalApp.acquireTokenPopup(loginReq).then(function(r){return r.accessToken;});});
}

function loadUserName() {
  var accs = msalApp ? msalApp.getAllAccounts() : [];
  if (!accs.length) return;
  var account = accs[0];
  var name = account.name || '';
  if (name) {
    setUserName(name);
  } else {
    getToken().then(function(tok) {
      return fetch('https://graph.microsoft.com/v1.0/me?$select=displayName', {
        headers: { 'Authorization': 'Bearer ' + tok, 'Accept': 'application/json' }
      });
    }).then(function(r){ return r.json(); })
    .then(function(d){ if (d.displayName) setUserName(d.displayName); })
    .catch(function(){
      if (account.username) {
        var n = account.username.split('@')[0].replace(/[._]/g, ' ');
        n = n.replace(/\b\w/g, function(c){ return c.toUpperCase(); });
        setUserName(n);
      }
    });
  }
}

function setUserName(name) {
  name = name.replace(/\s*\(.*?\)\s*/g, '').trim();
  var nameInput = document.getElementById('in-name');
  if (nameInput) nameInput.value = name;
  var badge = document.getElementById('user-badge');
  if (badge) badge.textContent = name;
}

function loadSettings() {
  var SAPI = 'https://graph.microsoft.com/v1.0/sites/' + encodeURIComponent('veptennis.sharepoint.com:/sites/VooralleVEPSharepoint-gebruikers:') + '/lists/VEPSettings/items?expand=fields(select=Title,SettingValue)';
  return getToken().then(function(tok) {
    return fetch(SAPI, { headers: { 'Authorization': 'Bearer ' + tok, 'Accept': 'application/json' } });
  }).then(function(r) { return r.json(); })
  .then(function(d) {
    var items = (d.value||[]).filter(function(i){ return i.fields && i.fields.Title === 'upload_settings'; });
    if (items.length > 0 && items[0].fields.SettingValue) {
      var s = JSON.parse(items[0].fields.SettingValue);
      if (s.quality) { uploadSettings.quality = s.quality / 100; }
    }
    settingsLoaded = true;
    return fetchSlideInfo();
  }).then(function() { settingsLoaded = true; })
  .catch(function() {
    try {
      var stored = localStorage.getItem('vep_upload_settings');
      if (stored) { var s = JSON.parse(stored); if (s.quality) { uploadSettings.quality = s.quality / 100; } }
    } catch(e) {}
    fetchSlideInfo().catch(function(){});
    settingsLoaded = true;
  });
}

function fetchSlideInfo() {
  return fetch(CFG.APPS_SCRIPT_URL + '?action=slideinfo')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.success && d.widthPx && d.heightPx) {
        CW = d.widthPx; CH = d.heightPx;
        TB.y = null; TB.x = null;
      }
    }).catch(function() {});
}
