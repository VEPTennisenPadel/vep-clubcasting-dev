// ─────────────────────────────────────────────────────────
// CONFIG — Globale configuratie en gedeelde state
// ─────────────────────────────────────────────────────────
var CFG = {
  CLIENT_ID:       'b2e58045-5ea5-41e5-ae2d-7546465fd54d',
  TENANT_ID:       '1a3d504f-05a9-466a-bb8d-ba2e3f9e8dca',
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzXBA4HllGITD6rM-di97Y0JGQLVGI6DCRxpiflkv9gHOjlMG7leGe6zXIRka8zC2rS/exec',
  PRESENTATION_ID: '1N8ZIBabKEhP0FbByH6KY57wvjC7BdCBIlSJb4qXrtZo',
  SHAREPOINT_SITE: 'https://veptennis.sharepoint.com/sites/VooralleVEPSharepoint-gebruikers',
  LIST_NAME:       'VEPEvents',
};

// ── Max foto's ──
var MAX_PHOTOS = 6;

// ── Canvas afmetingen ──
var CW = 1920, CH = 1080;

// ── Foto state ──
var photos    = [];
var imgs      = [];
var cropState = [];

// ── Selecties ──
var selectedEvent  = '';
var selectedLayout = 'auto';
var selectedStyle  = 'elegant';

// ── Titelbalk state ──
var TB = { x:0, y:null, w:Math.round(1920*0.5), h:160, rot:0, opacity:0.88, color:'#050514', textColor:'#ffffff' };
var tbMoved    = false;          // true zodra gebruiker titelbalk zelf heeft versleept/geschaald
var editorMode = 'photos';       // 'photos' | 'titlebar' — bepaalt canvas-interactie

// ── Upload instellingen ──
var uploadSettings = { width: 1920, height: 1080, quality: 0.92 };
var settingsLoaded = false;

// ── Canvas context ──
var canvas, ctx;
var interaction = null;
var swapIdx = -1;
