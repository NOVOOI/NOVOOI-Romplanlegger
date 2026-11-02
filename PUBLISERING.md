# Publiser NOVOOI Romplanlegger

Anbefalt løsning: **GitHub for kildekoden + Cloudflare Workers for appen + R2 for lagring + Google Drive for produktbiblioteket.**

## 1. Legg koden på GitHub

Opprett et tomt repo på GitHub. Pakk ut ZIP-filen og kjør fra mappen med `package.json`:

```sh
git init
git add .
git commit -m "Initial NOVOOI room planner"
git branch -M main
git remote add origin https://github.com/DITT-BRUKERNAVN/DITT-REPO.git
git push -u origin main
```

Bytt ut repo-adressen. `.gitignore` utelater nøkler, lokale data, avhengigheter og byggfiler. Hvis du har egne private CAD-filer, skal de ligge i Drive-biblioteket, ikke legges i repoet.

## 2. Opprett Cloudflare-lagringen

Installer Node.js 22.13+ og kjør:

```sh
npm ci
npx wrangler login
npx wrangler r2 bucket create novooi-designs
```

Aktiver R2 på Cloudflare-kontoen dersom Cloudflare ber om det. Bøtten skal være privat; ikke aktiver offentlig R2-URL. Navnet må samsvare med `bucket_name` i `wrangler.jsonc`.

Lag en tilfeldig sesjonsnøkkel:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Ta vare på verdien i passordbehandleren og legg den inn når denne kommandoen spør:

```sh
npx wrangler secret put SESSION_SECRET
```

Nøkkelen må være den samme ved senere utrullinger. Bytter du den, mister eksisterende nettlesere tilgang til sine gamle skyversjoner fra grensesnittet.

## 3. Koble til NOVOOIs Google Drive-mappe

1. Åpne [Google Cloud Console](https://console.cloud.google.com/).
2. Velg eller opprett et prosjekt for NOVOOI. Aktiver **Google Drive API**.
3. Åpne **IAM & Admin → Service Accounts**, og opprett en tjenestekonto, for eksempel `novooi-products`. Den trenger ikke en prosjektadministratorrolle.
4. Åpne tjenestekontoen → **Keys → Add key → Create new key → JSON**. Last ned nøkkelfilen til et privat sted utenfor repoet.
5. Kopier tjenestekontoens e-postadresse (slutter på `iam.gserviceaccount.com`).
6. Åpne NOVOOIs produktmappe i Google Drive, trykk **Del**, og gi denne e-postadressen **Leser**-tilgang. Ikke del hele organisasjonens Drive og ikke aktiver domenedelegering.
7. Mappens ID er delen etter `/folders/` i Drive-adressen. Sett den som `DRIVE_ROOT_FOLDER_ID` i `wrangler.jsonc`. Leveransen inneholder ID-en som allerede var brukt i verktøyet: `1_mod7TCGlRHxMdDf5HYrskq9X3OmF_qn`. Kontroller at dette er riktig mappe.
8. Legg nøkkelen inn som en Cloudflare-hemmelighet. Kjør fra prosjektmappen, med faktisk privat filsti:

```sh
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON < "/privat/sti/til/google-service-account.json"
```

Hele JSON-filen skal inn, ikke bare `private_key`. Ikke legg filen i GitHub, `public/` eller `wrangler.jsonc`.

Appen bruker et skrivebeskyttet Drive-scope. Serveren kontrollerer i tillegg at filer tilhører den konfigurerte mappen før metadata eller filinnhold leveres. Symbolske Drive-snarveier følges ikke. Mapper som flyttes ut, mister tilgangen gjennom appen ved neste lesing.

Anbefalt struktur:

```text
4. Brands/
  Merke A/
    Tekniske filer/
      Stol.glb
      Sofa.zip
  Merke B/
    Tekniske filer/
      Bord.3dm
```

Automatisk synk leser modellfiler under «Tekniske filer». Manuell filnavigering kan brukes ellers i den delte produktmappen. ZIP kan inneholde modell og teksturer. Enkel GLB er enklest å distribuere. Filer større enn 100 MB avvises som standard; grensen kan settes med `DRIVE_MAX_FILE_MB` (maksimalt 250).

## 4. Kontroller og publiser

```sh
npm run check
npm run deploy
```

Wrangler viser appens `workers.dev`-adresse. Appen må hete det samme som `name` i `wrangler.jsonc` hvis du senere bruker Cloudflare Workers Builds.

Besøk `https://DIN-WORKER-ADRESSE/api/drive?action=status`.

- `configured: true` betyr at Worker har lest den konfigurerte Google-mappen.
- `drive_not_configured`: manglende nøkkel eller mappe-ID.
- `drive_credentials_invalid`: nøkkelen er feil, deaktivert eller ikke gyldig.
- `drive_access_denied`: kontroller mappe-deling, Google Drive API og organisasjonens delingsregler.

Åpne appen → **Drive** → **Synk nå**. Kontroller at merkevarer og modeller kommer frem, og importer én faktisk GLB-fil. Lagre et design og sjekk at statusen sier både enheten og skyen. Lag en delingslenke, åpne den i en annen nettleser og trekk den deretter tilbake.

## 5. Automatisk publisering fra GitHub

Velg én av disse metodene:

**Cloudflare Workers Builds:** I Cloudflare, åpne Worker → **Settings → Builds** og koble GitHub-repoet. Bruk installasjon `npm ci`, bygg `npm run build` og deploy `npx wrangler deploy`. Oppdateringer på valgt gren publiseres automatisk. Serverhemmelighetene må ligge under Workerens runtime-innstillinger, ikke bare i byggmiljøet.

**GitHub Actions:** Repoet inneholder en manuell jobb «Deploy to Cloudflare». Legg `CLOUDFLARE_API_TOKEN` og `CLOUDFLARE_ACCOUNT_ID` i GitHub → **Settings → Secrets and variables → Actions**. Tokenet må kunne redigere Workers og laste opp statiske assets på riktig konto. Opprett GitHub-miljøet `production` om ønskelig. Kjør jobben fra **Actions → Deploy to Cloudflare → Run workflow**. Google-nøkkelen og sesjonsnøkkelen legges fortsatt inn i Cloudflare én gang, som beskrevet over.

Du trenger ikke begge metodene. Jobben «Check repository» kjører tester på push og pull requests og publiserer ingenting.

## 6. Eget domene og flytting

I Cloudflare Worker → **Settings → Domains & Routes**, legg til et domene eller subdomene du eier, for eksempel `romplanlegger.ditt-domene.no`. Eksporter viktige `.novooi`-design fra den tidligere vertsadressen og importer dem i den nye; nettleserlagring og sesjonscookies flyttes ikke automatisk mellom domener.

## Faktisk verifisering i leveransen

Tester dekker blant annet signerte sesjoner, avvisning av forfalsket identitet, isolasjon mellom lagringer, delingslenker, tilbakekalling, Drive-tokenets signatur, mappegrenser, flytting av filer ut av biblioteket og binær nedlasting. Google-svar er simulerte i de automatiske testene.

Den virkelige Google-mappen og Cloudflare-kontoen kan først verifiseres når du har satt kontoens hemmeligheter og delt mappen. Det følger ikke med produksjonsnøkler, og en vellykket byggtest betyr ikke at Google-tilkoblingen allerede er aktiv.

## Offisiell dokumentasjon

- [Cloudflare Workers og Git](https://developers.cloudflare.com/workers/ci-cd/builds/)
- [Cloudflare statiske assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare hemmeligheter](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Google-tjenestekonto og tilgang til filer](https://developers.google.com/workspace/guides/create-credentials)
- [Google server-til-server OAuth](https://developers.google.com/identity/protocols/oauth2/service-account)
