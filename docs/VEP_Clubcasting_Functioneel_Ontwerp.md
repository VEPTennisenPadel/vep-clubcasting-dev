# Functioneel Ontwerp — VEP Clubcasting Foto App
**VEP Tennis & Padel**
Versie 2.1 | Mei 2026
 
---
 
## Inleiding
 
De VEP Clubcasting Foto App stelt leden van VEP Tennis & Padel in staat om foto's van events te uploaden en samen te stellen tot een slide die automatisch verschijnt op de clubcasting (Raspberry Pi + TV in de kantine). De app bestaat uit twee onderdelen: een **upload-app** voor leden en een **beheer-app** voor beheerders.
 
---
 
## Architectuur & Infrastructuur
 
### Repositories
| Repository | Doel | URL |
|---|---|---|
| `vep-clubcasting` | Broncode (main = productie, dev = test) | github.com/veptennisenpadel/vep-clubcasting |
| `vep-clubcasting-dev` | Automatisch gevulde testomgeving | github.com/veptennisenpadel/vep-clubcasting-dev |
 
### Mappenstructuur
```
vep-clubcasting/
├── upload-app/
│   ├── index.html
│   ├── vep-upload-app.css
│   └── vep-upload-app.js
├── beheer-app/
│   └── index.html
├── shared/
│   ├── msal-browser.min.js
│   └── vep-icon.svg
└── .github/
    └── workflows/
        └── deploy.yml
```
 
### Deployment
- **Testomgeving**: automatisch bij elke push naar `dev` branch → `veptennisenpadel.github.io/vep-clubcasting-dev/upload-app/`
- **Productieomgeving**: automatisch bij merge `dev` → `main` → `veptennisenpadel.github.io/vep-clubcasting/upload-app/`
- Testomgeving toont een gele **TESTOMGEVING** banner en gebruikt de test-presentatie
- Productieomgeving gebruikt de live Google Slides presentatie
### Omgevingen
| Omgeving | URL | Presentatie |
|---|---|---|
| Productie | veptennisenpadel.github.io/vep-clubcasting/upload-app/ | KIOSK Presentatie (productie) |
| Test | veptennisenpadel.github.io/vep-clubcasting-dev/upload-app/ | TEST KIOSK Presentatie |
 
### Authenticatie
- Microsoft Azure AD (MSAL) met scopes `Sites.ReadWrite.All` en `User.Read`
- Redirect URIs geregistreerd in Azure voor beide omgevingen
- Naam ingelogde gebruiker wordt automatisch opgehaald via Microsoft Graph
---
 
## Huisstijl & Branding
 
### Kleuren
| Naam | Hex | Gebruik |
|---|---|---|
| VEP Blauw | `#226FB7` | Primaire kleur — knoppen, accenten, links |
| VEP Lichtblauw | `#E8F1F9` | Achtergrondtint — geselecteerde items, hover |
| VEP Donkerblauw | `#1a5a9a` | Hover staat knoppen |
| VEP Geel | `#EBD61F` | Accent — icoon balk, highlights |
 
### App icoon
- Bestand: `shared/vep-icon.svg` (512×512)
- Ontwerp: blauwe achtergrond met camera, gele VEP-balk onderaan
- Gebruikt als: favicon, Apple touch icon, PWA startscherm icoon
- Meta tags: `apple-mobile-web-app-capable`, `theme-color: #226FB7`
### PWA (Progressive Web App)
- App is toe te voegen aan startscherm op iOS en Android
- Op iOS: Safari → Deel → Zet op beginscherm
- Op Android: Chrome → menu → Toevoegen aan startscherm
- App titel op startscherm: "VEP Foto"
---
 
## Upload-app (v2.15)
 
### Overzicht
De upload-app is een 4-stappen wizard waarmee leden foto's kunnen uploaden en een slide kunnen samenstellen voor de clubcasting.
 
### Stap 1 — Info
- **Naam**: automatisch ingevuld vanuit het Microsoft account (niet aanpasbaar)
  - Haakjes worden verwijderd, bijv. "Hans de Rooij (TV VEP)" → "Hans de Rooij"
- **Event**: keuzelijst met events uit SharePoint (`VEPEvents` lijst)
  - Events gesorteerd op datum
  - Optie **✏️ Ander event**: vrij tekstveld voor eigen eventnaam (niet opgenomen in SharePoint lijst)
- **Bijschrift**: optioneel vrij tekstveld
### Stap 2 — Foto's
- Klik of sleep foto's (JPG, PNG, WEBP)
- Maximaal 20 foto's per upload
- Foto's direct als thumbnail weergegeven met verwijderknop
### Stap 3 — Editor
- **Layout kiezer**: Fullscreen, Duo, Featured, Grid, Strip, Mozaïek, Cinematic, Auto
- **Canvas editor** (1920×864px of afmetingen uit Google Slides):
  - Sleep op foto = uitsnede verschuiven
  - Ctrl + scroll = inzoomen op foto
  - Sleep titelbalk = verplaatsen
  - Sleep hoeken titelbalk = resizen
- **Titelbalk instellingen**:
  - Breedte, hoogte, transparantie, rotatie
  - Achtergrondkleur (VEP kleurenpalet + aangepast)
  - Tekstkleur (VEP kleurenpalet + aangepast)
  - Stijl: Elegant, Bold, Minimaal, Speels
- **Naam in titelbalk**: checkbox om naam wel/niet te tonen in de titelbalk
  - Naam staat altijd rechtsonder in de titelbalk, los van de eventtekst
  - Eventtekst gebruikt volledige breedte en mag wrappen
### Stap 4 — Verzenden
- Canvas gerenderd als JPEG en verzonden naar Google Apps Script
- Voortgangsindicator met 4 stappen
- Na succes: samenvatting met lid, event, aantal foto's en layout
- Link naar Google Slides presentatie
- Recente uploads zichtbaar in de sessie
---
 
## Epics & User Stories
 
### Epic 1 — Authenticatie & Toegang
 
#### US-101 · Microsoft login
**Als** VEP lid  
**Wil ik** automatisch inloggen met mijn Microsoft account  
**Zodat** ik de app kan gebruiken zonder apart account aan te maken
 
**Acceptatiecriteria:**
- Automatische redirect naar Microsoft login bij eerste bezoek
- Sessie blijft actief zolang browser open is
- Naam automatisch ingevuld vanuit Microsoft account
- Naam niet aanpasbaar door gebruiker
- Haakjes worden verwijderd uit de naam
#### US-102 · Gebruikersnaam weergave
**Als** VEP lid  
**Wil ik** mijn naam zichtbaar zien in de app  
**Zodat** ik weet dat ik correct ben ingelogd
 
**Acceptatiecriteria:**
- Naam zichtbaar in header badge
- Naam automatisch ingevuld in naamveld stap 1
- Fallback via Microsoft Graph API als naam niet in token zit
---
 
### Epic 2 — Event selectie
 
#### US-201 · Event kiezen uit lijst
**Als** VEP lid  
**Wil ik** een event kunnen kiezen uit de actuele lijst  
**Zodat** mijn foto's worden gekoppeld aan het juiste event
 
**Acceptatiecriteria:**
- Events geladen uit SharePoint `VEPEvents` lijst
- Events gesorteerd op datum
- Geselecteerd event visueel gemarkeerd
- Lijst verversbaar via ↻ knop
#### US-202 · Eigen eventnaam opgeven
**Als** VEP lid  
**Wil ik** een eigen eventnaam kunnen invoeren als mijn event er niet tussen staat  
**Zodat** ik toch een slide kan aanmaken
 
**Acceptatiecriteria:**
- Chip **✏️ Ander event** zichtbaar onderaan de eventlijst
- Bij klikken verschijnt vrij tekstveld
- Ingevulde naam wordt gebruikt in titelbalk en slide
- Eigen naam wordt **niet** opgenomen in de SharePoint eventlijst
---
 
### Epic 3 — Foto upload
 
#### US-301 · Foto's uploaden
**Als** VEP lid  
**Wil ik** foto's kunnen uploaden via klikken of slepen  
**Zodat** ik ze kan gebruiken voor mijn slide
 
**Acceptatiecriteria:**
- Drag & drop dropzone zichtbaar
- Klik op dropzone opent bestandskiezer
- Ondersteunde formaten: JPG, PNG, WEBP
- Maximaal 20 foto's per sessie
- Thumbnails direct zichtbaar na toevoegen
#### US-302 · Foto verwijderen
**Als** VEP lid  
**Wil ik** een foto kunnen verwijderen  
**Zodat** ik de selectie kan aanpassen
 
**Acceptatiecriteria:**
- Verwijderknop (✕) op elke thumbnail
- Foto direct verwijderd uit lijst en editor
---
 
### Epic 4 — Slide editor
 
#### US-401 · Layout kiezen
**Als** VEP lid  
**Wil ik** een layout kiezen voor mijn slide  
**Zodat** de foto's goed worden weergegeven
 
**Acceptatiecriteria:**
- 8 layouts beschikbaar: Fullscreen, Duo, Featured, Grid, Strip, Mozaïek, Cinematic, Auto
- Auto kiest op basis van aantal foto's
- Wijziging direct zichtbaar in canvas
#### US-402 · Foto uitsnede aanpassen
**Als** VEP lid  
**Wil ik** de uitsnede van een foto kunnen aanpassen  
**Zodat** het belangrijkste deel van de foto zichtbaar is
 
**Acceptatiecriteria:**
- Slepen op foto verschuift de uitsnede
- Ctrl + scroll zoomt in/uit op foto
- Pinch-to-zoom op touch apparaten
#### US-403 · Titelbalk configureren
**Als** VEP lid  
**Wil ik** de titelbalk kunnen aanpassen  
**Zodat** deze past bij het event en mijn voorkeur
 
**Acceptatiecriteria:**
- Breedte, hoogte, transparantie en rotatie instelbaar
- VEP kleurenpalet beschikbaar voor achtergrond en tekst
- Aangepaste kleur via color picker
- 4 tekststijlen: Elegant, Bold, Minimaal, Speels
- Titelbalk versleepbaar en resizeable via hoekhandvatten
#### US-404 · Naam in titelbalk
**Als** VEP lid  
**Wil ik** kunnen kiezen of mijn naam in de titelbalk staat  
**Zodat** ik zelf bepaal of ik zichtbaar ben
 
**Acceptatiecriteria:**
- Checkbox "Naam tonen in titelbalk" standaard aangevinkt
- Naam staat rechtsonder in de titelbalk
- Eventtekst gebruikt volledige breedte, naam en eventtekst overlappen nooit
- Wijziging direct zichtbaar in canvas
---
 
### Epic 5 — Slide aanmaken & verzenden
 
#### US-501 · Slide versturen
**Als** VEP lid  
**Wil ik** mijn samengestelde slide versturen  
**Zodat** deze verschijnt op de clubcasting
 
**Acceptatiecriteria:**
- Canvas gerenderd als JPEG (kwaliteit instelbaar via beheer-app)
- Verzonden naar Google Apps Script via POST
- Voortgangsindicator toont 4 stappen
- Succes bevestigd met samenvatting
#### US-502 · Slide bekijken na verzenden
**Als** VEP lid  
**Wil ik** de presentatie kunnen openen na het verzenden  
**Zodat** ik kan controleren of de slide goed is ingevoegd
 
**Acceptatiecriteria:**
- Knop "Open presentatie" opent Google Slides in nieuw tabblad
- Recente upload zichtbaar in lijst onderaan de pagina
---
 
### Epic 6 — Configuratie & Infrastructuur
 
#### US-601 · Slide afmetingen synchroniseren
**Als** de upload-app  
**Wil ik** de afmetingen ophalen uit Google Slides  
**Zodat** het canvas altijd overeenkomt met de werkelijke slide
 
**Acceptatiecriteria:**
- GET request naar Apps Script `?action=slideinfo`
- Canvas-afmetingen automatisch aangepast
- Fallback naar 1920×1080 bij fout
#### US-602 · Uploadkwaliteit beheren
**Als** beheerder  
**Wil ik** de JPEG-kwaliteit kunnen instellen  
**Zodat** ik een balans kan vinden tussen kwaliteit en bestandsgrootte
 
**Acceptatiecriteria:**
- Kwaliteit instelbaar in beheer-app via SharePoint `VEPSettings` lijst
- Upload-app laadt instelling bij opstarten
- Fallback naar kwaliteit 0.92 bij fout
#### US-603 · Test vs. productie omgeving
**Als** beheerder  
**Wil ik** wijzigingen eerst kunnen testen  
**Zodat** de productieomgeving stabiel blijft
 
**Acceptatiecriteria:**
- Testomgeving op aparte URL met gele TESTOMGEVING banner
- Testomgeving gebruikt TEST KIOSK Presentatie
- Productieomgeving gebruikt live KIOSK Presentatie
- Deployment volledig automatisch via GitHub Actions
---
 
## Huidige versies
 
| Component | Versie | Locatie |
|---|---|---|
| Upload-app | v2.15 | `upload-app/index.html` |
| Beheer-app | — | `beheer-app/index.html` |
| Apps Script | — | Google Apps Script "VEP Foto Compilatie" |
 
## Bekende beperkingen
 
- `no-cors` mode voor Apps Script POST: response niet leesbaar in browser, succes wordt aangenomen
- Recente uploads worden alleen bewaard zolang de browsersessie actief is (geen persistente geschiedenis)
- Eigen eventnaam (✏️ Ander event) wordt niet opgeslagen in SharePoint
