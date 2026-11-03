# NOVOOI Romplanlegger

Selvstendig romplanlegger for 2D/3D, møbler, materialer, innervegger og CAD-import. Kildekoden kan ligge i et vanlig GitHub-repo. Cloudflare Workers kjører serverdelen og leverer nettsiden.

**Start med [PUBLISERING.md](PUBLISERING.md)** for hele oppsettet av GitHub, Cloudflare, R2 og Google Drive.

## Dette følger med

- Den oppdaterte planleggeren med NOVOOI-logo og lyst tema.
- Felles produktbibliotek fra én Google Drive-mappe, via en Google-tjenestekonto.
- NOVOOI-nettbutikkens produktdata via en avgrenset serverrute.
- Lokal lagring, designfiler, bildeeksport, skylagring og delingslenker.
- Cloudflare-konfigurasjon, låste npm-avhengigheter og GitHub Actions.
- Tester for geometri, lagring, deling, tilgangskontroll og Drive-integrasjon.

## Kjøre lokalt

Node.js 22.13 eller nyere:

```sh
npm ci
cp .dev.vars.example .dev.vars
```

Sett en tilfeldig `SESSION_SECRET` i `.dev.vars` (minst 32 tegn). For Drive legger du også inn hele Google-tjenestekontoens JSON som `GOOGLE_SERVICE_ACCOUNT_JSON`. Se publiseringsveiledningen.

```sh
npm run build
npm run dev
```

Åpne adressen Wrangler skriver ut. Uten Google-nøkkel virker romplanleggeren og lokal lagring; Drive viser at biblioteket ikke er konfigurert. Lokal utvikling bruker lokal R2-emulering.

```sh
npm run check
```

Kjører tester, bygger nettsiden og pakker en Worker som tørrkjøring. Publiserer ikke.

## Publisering

```sh
npm run deploy
```

Krever innlogging i Cloudflare, R2-bøtten og serverhemmelighetene fra veiledningen. Du kan også koble GitHub-repoet til Cloudflare Workers Builds eller bruke den manuelle GitHub Actions-jobben.

## Hva fungerer hvor?

| Funksjon | Cloudflare Worker | GitHub Pages |
| --- | --- | --- |
| Planlegging, materialer, CAD-import fra maskinen | Ja | Ja |
| Lokal lagring, designfiler og bildeeksport | Ja | Ja |
| Felles Google Drive-bibliotek | Ja, etter kontooppsett | Nei |
| Nettbutikk-kobling | Ja | Nei |
| Skylagring og delingslenker | Ja, med R2 og sesjonsnøkkel | Nei |

For ren GitHub Pages: `npm run build:pages`, eller kjør Pages-jobben manuelt etter at **Settings → Pages → Source** er satt til **GitHub Actions**. Den bygger `dist-pages/` med relative filstier, også under `/repo-navn/`.

## Lagring og personvern

Det er ikke implementert personlige brukerkontoer. Hver nettleser får en tilfeldig, signert og HttpOnly-beskyttet sesjon. Skyversjoner isoleres etter denne sesjonen; andre enheter eller nettleserprofiler finner dem ikke automatisk. Slettede informasjonskapsler gjør at den gamle skysesjonen ikke kan åpnes fra grensesnittet. Bruk designfil/sikkerhetskopi for flytting mellom enheter.

Lokale utkast og importerte modeller ligger i nettleserens lagring. Før du bytter domene eller vert: eksporter `.novooi`-filer fra den gamle utgaven og importer dem i den nye.

En opprettet delingslenke gir alle med lenken lesetilgang til en kopi av designet. Eieren kan trekke tilbake den nettbaserte lenken. En allerede nedlastet kopi kan ikke trekkes tilbake.

## Drive-biblioteket

Besøkende får lesetilgang til innholdet under den konfigurerte produktmappen gjennom appen. Bruk en mappe med materiale som skal være tilgjengelig for brukerne. Ingen besøkende trenger å logge inn i Google. Tjenestekontonøkkelen ligger bare som serverhemmelighet; den sendes aldri til nettleseren.

Katalogen omfatter alle støttede 3D-filer og ZIP-pakker under produktmappen, uansett undermappenavn. Serveren bygger en komplett indeks og lagrer den i R2 i én time. «Synk nå» bygger indeksen på nytt. Feil og ufullstendige søk erstatter aldri en ferdig indeks. Filer utenfor produktmappen filtreres bort, og nedlasting kontrollerer fortsatt filens nåværende plassering.

Nettleseren lagrer katalogen i IndexedDB og gjenbruker den mellom besøk. Produkt-ID arves fra nærmeste produktmappe med navn som `65542 (Keeep Your Sofa)`, gjennom alle undermapper. Filnavn, dimensjoner og årstall brukes aldri som produkt-ID. `/api/products` leser eksakte produkt-ID-er fra WooCommerces offentlige Store API med GET. Kategorienes faktiske term-ID-er og navn, produktbilder, attributter og priser brukes direkte; automatisk navnesøk brukes ikke i denne koblingen. Produktdata og variantpriser mellomlagres i R2 i 15 minutter, manglende produkt-ID-er i fem minutter. Variantene pagineres komplett og kontrolleres mot riktig foreldreprodukt. Ingen API-nøkkel med skrivetilgang trengs, og ingen av disse rutene kan skrive til WooCommerce.

Produkter uten gyldig ID eller uten tilgjengelig WooCommerce-produkt samles i en sammenfoldet oversikt over skjulte produktfiler. Tydelige avvik mellom produkt og modellfil, som en transporttralle i en stolmappe, markeres for kontroll og brukes ikke til produktprising. Originalmapper og møbler som allerede ligger i design, slettes ikke. Manglende modellbilder bygges i bakgrunnen. Grupper og kort oppdateres uten å bytte ut søkefelt eller kategorimeny.

SketchUp `.skp` støttes som beta via den fastlåste MIT-pakken OpenSKP. Konvertering til GLB kjører i en separat Web Worker som bygges lokalt med esbuild, inkludert i både Cloudflare- og Pages-bygg. Enkelte SketchUp-versjoner eller modeller kan fortsatt kreve eksport til GLB/OBJ fra SketchUp. Dette er lesesynk/import til produktkatalogen, ikke opplasting av design til Google Drive.

## Kodekart

- `public/`: planleggeren, stilark, logo og lokale 3D-biblioteker.
- `public/backend.js`: transport og gjennomgang av det felles produktbiblioteket.
- `worker/drive.mjs`: Google-token, mappeavgrensning og binær nedlasting.
- `worker/products.mjs`: skrivebeskyttet ID-oppslag, pris- og variantbuffer.
- `public/catalog-core.js`: felles ID- og kategoriregler.
- `public/material-pilots.js`: kontrollerte materialsoner og produsentmaterialer for pilotene.
- `worker/session.mjs`: signerte nettlesersesjoner.
- `worker/index.ts`: avgrensede API-ruter og statiske filer.
- `app/api/`: designlagring, deling og tilbakemeldinger. Vanlige funksjoner, ingen rammeverkavhengighet.
- `lib/design-store.ts`: R2-lagring og grunnvalidering.
- `tests/`: automatiserte tester.

Tredjepartsbibliotekenes lisenser er bevart i `public/vendor/`. Eksempelmodellene er ikke virkelige NOVOOI-varer og inngår ikke i handlelisten. Serveren har ingen tilgang til lager eller prisgaranti utover det nettbutikkens offentlige API returnerer.

Modellretning: SKP, glTF/GLB og Collada beholder formatets Y-opp-retning. «Vipp modell» retter manuelle unntak og lagrer valget. Veggfesting velger den nærmeste 90-gradersretningen og beregner avstanden ut fra den faktiske siden mot veggen.

## Materialpiloter

`material-pilots.html` viser to gjennomgåtte produkter, med priser og varianter fra WooCommerce:

- **72080, Pavilion AV15:** kroppens frem- og baksider får Kvadrat Vidar 4 / 0333 med produsentens farge-, normal- og matthetskart. Skala: 27,89 × 39,32 cm. Stålunderstellet får ingen tekstiltekstur.
- **67934, Pavilion AV1:** valnøtt bruker produsentens innebygde Walnut-V-tekstur. Eik, svartlakkert eik og det feilaktige Woo-alternativet «Pavilion AV1» mangler foreløpig verifiserte materialprøver og vises nøytralt. Ingen tilfeldig farge brukes som erstatning.

SKP-konverteringen bevarer komponentnavn og stabile materialnavn. Pilotoppskriftene sjekker produkt-ID, kildefil og faktiske materialsoner før de aktiveres. Eldre lokale konverteringer kan oppgraderes med «Klargjør materialpilot» i produktpanelet. Valgt materiale og produktidentitet følger med i lagrede og delte design.

Materialbildene ligger tapskomprimert/base64-kodet i `assets/` og dekodes med SHA-256-kontroll under bygging til `dist/materials/`. De lastes først når en materialpilot brukes. Dette gjør kildekoden mulig å overføre via GitHubs nettredigerer uten å legge binærdata i JavaScript-bunten. Kilde og fysisk skala finnes i `assets/material-pilots.json` og den bygde `materials/sources.json`. Teksturene er leverandørmateriale, ikke en del av OpenSKPs MIT-lisens.
