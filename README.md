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

Nettleseren lagrer katalogen i IndexedDB og gjenbruker den mellom besøk. Filene vises straks i katalogen og fordeles i kategorier ut fra produktnavn og mappe. Manglende modellbilder bygges automatisk i bakgrunnen, med synlige produkter prioritert. Modeller, bilder og originalfiler lagres lokalt. Ukjent kategori vises under Andre produkter. Allerede importerte produkter beholdes når Drive-katalogen endres. Bakgrunnsfremdrift endrer bare statusfeltet, slik at åpne menyer og markeringer beholdes. Bruk «Vis produkter» for å vise en ny katalog etter synk.

SketchUp `.skp` støttes som beta via den fastlåste MIT-pakken OpenSKP. Konvertering til GLB kjører i en separat Web Worker som bygges lokalt med esbuild, inkludert i både Cloudflare- og Pages-bygg. Enkelte SketchUp-versjoner eller modeller kan fortsatt kreve eksport til GLB/OBJ fra SketchUp. Dette er lesesynk/import til produktkatalogen, ikke opplasting av design til Google Drive.

## Kodekart

- `public/`: planleggeren, stilark, logo og lokale 3D-biblioteker.
- `public/backend.js`: transport og gjennomgang av det felles produktbiblioteket.
- `worker/drive.mjs`: Google-token, mappeavgrensning og binær nedlasting.
- `worker/session.mjs`: signerte nettlesersesjoner.
- `worker/index.ts`: avgrensede API-ruter og statiske filer.
- `app/api/`: designlagring, deling og tilbakemeldinger. Vanlige funksjoner, ingen rammeverkavhengighet.
- `lib/design-store.ts`: R2-lagring og grunnvalidering.
- `tests/`: automatiserte tester.

Tredjepartsbibliotekenes lisenser er bevart i `public/vendor/`. Eksempelmodellene er ikke virkelige NOVOOI-varer og inngår ikke i handlelisten. Serveren har ingen tilgang til lager eller prisgaranti utover det nettbutikkens offentlige API returnerer.

Modellretning: SKP, glTF/GLB og Collada beholder formatets Y-opp-retning. «Vipp 90°» retter manuelle unntak og lagrer valget. Veggfesting velger den nærmeste 90-gradersretningen og beregner avstanden ut fra den faktiske siden mot veggen.
