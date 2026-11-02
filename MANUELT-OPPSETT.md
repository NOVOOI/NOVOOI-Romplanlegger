# Publiser uten terminal

Du kan gjøre hele oppsettet i nettleseren. Kommandoene nedenfor skrives i Cloudflares innstillingsfelt; Cloudflare kjører dem for deg.

## 1. Last opp til GitHub

1. Pakk ut `novooi-romplanlegger-github.zip` i Finder.
2. Åpne https://github.com/new og opprett et repo, gjerne privat. Legg gjerne til README for å få en førsteside.
3. Velg **Add file → Upload files**.
4. Åpne den utpakkede mappen. Dra **innholdet**, ikke selve mappen, til opplastingsfeltet. `package.json`, `wrangler.jsonc`, `public`, `worker`, `lib`, `app` og `scripts` skal ligge rett på repoets øverste nivå.
5. Velg **Commit changes**. Last opp i flere omganger hvis GitHub ber om det.

Finder skjuler navn som begynner med punktum. Trykk **Cmd + Shift + .** for å vise dem. Last også opp `.gitignore`, `.dev.vars.example` og `.github` dersom mulig. `.github` inneholder valgfrie automatiske kontroller; Cloudflare-oppsettet under trenger ikke GitHub Actions. Aldri last opp en ekte Google-nøkkelfil, `.dev.vars` eller `.env`.

## 2. Opprett lagring i Cloudflare

1. Åpne https://dash.cloudflare.com/.
2. Gå til **R2 Object Storage**, og aktiver tjenesten dersom nødvendig.
3. Opprett en bøtte med nøyaktig navnet **novooi-designs**.
4. La bøtten være privat, uten offentlig URL.

## 3. Koble GitHub til Cloudflare

1. Gå til **Workers & Pages → Create application** og velg å importere et Git-repo for en **Worker**.
2. Koble til GitHub og velg repoet.
3. Bruk navnet **novooi-romplanlegger**, som samsvarer med `wrangler.jsonc`.
4. Velg produksjonsgren **main** og la prosjektroten være repoets øverste nivå.
5. Sett **Build command** til `npm ci && npm run build`.
6. Sett **Deploy command** til `npx wrangler deploy`.
7. Publiser. Cloudflare installerer og bygger på sin server. Du trenger ingen terminal på maskinen din.

Konfigurasjonen i repoet kobler bøtten `novooi-designs` til appens `BUCKET`. Hvis du får feil om manglende bøtte, kontroller navnet og at den ble opprettet på samme Cloudflare-konto. Appens adresse blir tilgjengelig når byggingen er ferdig. Lagring fungerer først etter neste steg.

## 4. Legg inn sesjonsnøkkelen

1. Åpne Workerens **Settings → Variables and Secrets**. Dette er innstillinger for den kjørende appen, ikke bygginnstillingene.
2. Legg til en verdi av typen **Secret**, med navnet **SESSION_SECRET**.
3. Bruk passordbehandleren din til å generere et tilfeldig passord på minst 48 tegn. Lim inn dette som verdi og oppbevar en sikker kopi.
4. Lagre og publiser endringen hvis grensesnittet ber om det.

Behold samme nøkkel ved senere oppdateringer. Bytter du den, mister gamle nettleserøkter tilgangen til sine lagrede skyversjoner fra grensesnittet.

## 5. Koble NOVOOIs felles Drive-mappe

1. Åpne https://console.cloud.google.com/, og velg eller opprett NOVOOIs prosjekt.
2. Gå til **APIs & Services → Library**, finn **Google Drive API**, og aktiver den.
3. Gå til **IAM & Admin → Service Accounts**, og opprett en tjenestekonto, for eksempel `novooi-products`. Den trenger ingen prosjektadministratorrolle.
4. Åpne tjenestekontoen → **Keys → Add key → Create new key → JSON**. Last ned filen til et privat sted. Hvis organisasjonen blokkerer oppretting av nøkler, må Google Workspace/Cloud-administratoren hjelpe.
5. Kopier tjenestekontoens e-postadresse, som slutter på `iam.gserviceaccount.com`.
6. Åpne NOVOOIs produktmappe i Drive → **Del**, og gi denne adressen **Leser**-tilgang. Ikke del resten av organisasjonens Drive og ikke aktiver domenedelegering.
7. Åpne den nedlastede JSON-filen i et tekstredigeringsprogram. Kopier hele innholdet, inkludert klammeparentesene. Behold `\n` inne i nøkkelfeltet slik det står.
8. I Cloudflare Worker → **Settings → Variables and Secrets**, opprett en **Secret** som heter **GOOGLE_SERVICE_ACCOUNT_JSON**, og lim inn hele innholdet. Lagre/publiser endringen.

Ikke send nøkkelen i en chat eller legg den på GitHub.

Repoet er satt opp med mappe-ID `1_mod7TCGlRHxMdDf5HYrskq9X3OmF_qn`. Kontroller at dette er riktig produktmappe: ID-en står etter `/folders/` i Drive-adressen. Hvis den er feil, åpne `wrangler.jsonc` på GitHub, trykk blyanten, endre `DRIVE_ROOT_FOLDER_ID` og velg **Commit changes**. Cloudflare bygger på nytt.

Automatisk synk ser etter modellfiler i undermapper som heter **Tekniske filer**, eksempelvis `4. Brands / Merke / Tekniske filer / Stol.glb`. Biblioteket er tilgjengelig for alle som bruker appen; bare del produktfiler dere ønsker å gjøre tilgjengelige der.

## 6. Kontroller at alt virker

- Åpne appens Cloudflare-adresse.
- Åpne samme adresse med `/api/drive?action=status` etter domenet. `configured: true` betyr at Google-mappen kunne leses.
- I appen: velg **Drive → Synk nå**, og importer en faktisk modell.
- Lagre et rom, og kontroller at meldingen bekrefter lagring på enheten og i skyen.
- Opprett en delingslenke, og åpne den i et privat nettleservindu.

Vanlige Drive-feil: `drive_not_configured` betyr manglende nøkkel/mappe-ID; `drive_credentials_invalid` betyr ugyldig nøkkel; `drive_access_denied` betyr at mappetilgang, API-aktivering eller organisasjonens delingsregler må kontrolleres.

## Offisiell hjelp

- Cloudflare Git-integrasjon: https://developers.cloudflare.com/workers/ci-cd/builds/
- Cloudflare bygginnstillinger: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- Cloudflare hemmeligheter: https://developers.cloudflare.com/workers/configuration/secrets/
- Google-tjenestekonto: https://developers.google.com/workspace/guides/create-credentials
