# Functioneel Ontwerp — VEP Clubcasting Foto App
**VEP Tennis & Padel**
Versie 2.5 | Juni 2026
 
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
- **Event**: keuzelijst met events uit SharePoint (`VEPEvents` lijst)
  - Events gesorteerd op datum
  - Optie **✏️ Ander event**: vrij tekstveld voor eigen eventnaam (wordt opgeslagen in SharePoint en blijft 7 dagen kiesbaar)
### Stap 2 — Foto's
- Klik of sleep foto's (JPG, PNG, WEBP)
- Maximaal 20 foto's per upload
- Foto's direct als thumbnail weergegeven met verwijderknop
### Stap 3 — Editor
- **Layout kiezer**: Fullscreen, Duo, Featured, Grid, Strip, Mozaïek, Cinematic, Auto
- **Canvas editor** (1920×864px of afmetingen uit Google Slides) met twee tabbladen die de canvas-interactie scheiden:
  - **Tab 📷 Foto's**:
    - Sleep op foto = uitsnede verschuiven
    - Ctrl + scroll (of pinch op mobiel) = inzoomen op foto
  - **Tab 🏷️ Titelbalk**:
    - Sleep de titelbalk = verplaatsen
    - Sleep een hoekgreep = grootte aanpassen (tegenoverliggende hoek blijft vast)
    - Sleep de rotatiegreep boven de balk = draaien
    - In deze modus tonen een gestreepte omtrek en grepen rond de titelbalk; foto-interactie is uitgeschakeld
- **Titelbalk instellingen** (zichtbaar onder de tab 🏷️ Titelbalk, niet onder Foto's):
  - **Jouw naam**: automatisch ingevuld vanuit het Microsoft account (niet aanpasbaar); haakjes worden verwijderd, bijv. "Hans de Rooij (TV VEP)" → "Hans de Rooij"
  - **Naam tonen in titelbalk**: checkbox (standaard aangevinkt) om naam wel/niet te tonen
  - **Bijschrift**: optioneel vrij tekstveld; verschijnt achter de eventnaam in de titelbalk
  - Breedte, hoogte, transparantie, rotatie (velden blijven synchroon met slepen/schalen op canvas)
  - Achtergrondkleur (VEP kleurenpalet + aangepast)
  - Tekstkleur (VEP kleurenpalet + aangepast)
  - Stijl: Elegant, Bold, Minimaal, Speels
  - Naam staat altijd rechtsonder in de titelbalk, los van de eventtekst; eventtekst gebruikt volledige breedte en mag wrappen
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
- Naam automatisch ingevuld in naamveld (onder de tab 🏷️ Titelbalk in stap 3)
- Fallback via Microsoft Graph API als naam niet in token zit
- Naam wordt als vangnet gevalideerd bij de overgang naar stap 4 (verzenden)
---
 
### Epic 2 — Event selectie
 
#### US-201 · Event kiezen uit lijst
**Als** VEP lid  
**Wil ik** een event kunnen kiezen uit de actuele lijst  
**Zodat** mijn foto's worden gekoppeld aan het juiste event
 
**Acceptatiecriteria:**
- Events geladen uit SharePoint `VEPEvents` lijst
- Alleen events waarvan de einddatum (`DateTo`, of `DateFrom` als einddatum ontbreekt) maximaal **7 dagen** geleden is, worden getoond — events blijven dus nog één week na afloop kiesbaar
- Events zonder datum worden altijd getoond
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
- De ingevoerde naam wordt **opgeslagen** in de SharePoint lijst `VEPEvents` (met `DateFrom`/`DateTo` = vandaag, categorie `Anders`), zodat het event — net als reguliere events — nog **7 dagen** kiesbaar blijft als chip voor alle leden
- Bestaat een event met dezelfde naam al, dan wordt geen duplicaat aangemaakt
- Het opslaan gebeurt op de achtergrond en blokkeert het uploaden nooit (fouten worden stil genegeerd)
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
- Bij meerdere foto's tonen genummerde markeringen (framenummers) per fotovak in de editor, zodat het lid ziet welke foto in welk vak komt
- Framenummers zijn uitsluitend een hulpmiddel in de editor en verschijnen niet in de verstuurde slide (zie US-501)
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
- Titelbalk wordt aangepast via de tab 🏷️ Titelbalk; in die modus is foto-interactie uitgeschakeld, zodat slepen van de titelbalk en het verschuiven/uitsnijden van foto's elkaar niet in de weg zitten
- Titelbalk versleepbaar, schaalbaar via hoekgrepen en draaibaar via een rotatiegreep
- Slepen/schalen op canvas en de invoervelden (breedte/hoogte/rotatie) blijven synchroon
#### US-404 · Naam in titelbalk
**Als** VEP lid  
**Wil ik** kunnen kiezen of mijn naam in de titelbalk staat  
**Zodat** ik zelf bepaal of ik zichtbaar ben
 
**Acceptatiecriteria:**
- Checkbox "Naam tonen in titelbalk" staat onder de tab 🏷️ Titelbalk in stap 3, standaard aangevinkt
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
- De framenummers uit de editor worden niet meegerenderd in de verstuurde JPEG: vlak vóór de export wordt het canvas eenmalig hertekend zonder framenummers, de JPEG wordt vastgelegd, en daarna wordt de editor-weergave (mét framenummers) hersteld
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
| Upload-app | v2.45 | `upload-app/index.html` |
| Beheer-app | — | `beheer-app/index.html` |
| Apps Script | — | Google Apps Script "VEP Foto Compilatie" |
 
## Bekende beperkingen
 
- `no-cors` mode voor Apps Script POST: response niet leesbaar in browser, succes wordt aangenomen
- Recente uploads worden alleen bewaard zolang de browsersessie actief is (geen persistente geschiedenis)
