# FreeBite

> Arbeidstittel. Navnet er ikke endelig bestemt.

**Én app for alle studentarrangementer. Meld at du kommer, bekreft på dagen.**

FreeBite samler informasjon om kommende studentarrangementer på ett sted, slik at studenter får med seg hva som skjer, og arrangører får et mer presist estimat på oppmøtet.

---

## Innhold

- [FreeBite](#freebite)
  - [Innhold](#innhold)
  - [Problemet](#problemet)
  - [Løsningen](#løsningen)
  - [Brukere og kunder](#brukere-og-kunder)
  - [Kjernefunksjonalitet](#kjernefunksjonalitet)
    - [For studenter](#for-studenter)
    - [For arrangører](#for-arrangører)
    - [Senere](#senere)
  - [Brukerflyt](#brukerflyt)
  - [MVP-omfang](#mvp-omfang)
  - [Datamodell (utkast)](#datamodell-utkast)
  - [Teknologi](#teknologi)
  - [Forretningsmodell](#forretningsmodell)
  - [Veikart](#veikart)
  - [Ordliste](#ordliste)
  - [Kontekst for AI-assistenter](#kontekst-for-ai-assistenter)

---

## Problemet

Mange bedrifter og organisasjoner arrangerer gratis eventer for studenter, ofte med mat og snacks. Likevel er oppmøtet ofte lavt, fordi studentene ikke får med seg informasjonen. Informasjon er spredt over Facebook-grupper, e-post, plakater, Slack og Instagram.

Arrangørene har i tillegg to problemer:

1. De vet ikke hvor mange som kommer, så de bestiller for mye eller for lite mat.
2. De har ingen enkel kanal som faktisk når studentene.

## Løsningen

En app (først som nettside) der alle kommende studentarrangementer samles og kan filtreres etter interesse.

Kjernen i løsningen er en **todelt bekreftelse**:

1. Studenten melder **interesse** for et arrangement, opptil **14 dager** i forkant.
2. Siden planer endrer seg, får studenten en **påminnelse på selve dagen** med spørsmål om hen fortsatt kommer.

Arrangøren får dermed et mer realistisk estimat enn en vanlig "interessert"-knapp gir, og kan bestille mat deretter.

## Brukere og kunder

| Rolle | Beskrivelse |
|---|---|
| **Student (bruker)** | Bruker appen gratis. Finner arrangementer, melder interesse, bekrefter på dagen. |
| **Arrangør (kunde)** | Bedrifter, linjeforeninger og andre som publiserer arrangementer. Betaler en liten avgift per publisert arrangement. |

Første målgruppe: studenter ved NTNU i Trondheim. Tanken er å utvide til andre studiesteder senere.

## Kjernefunksjonalitet

### For studenter
- Se en samlet liste over kommende arrangementer
- Filtrere etter kategori, for eksempel:
  - Gratis mat
  - Kurs og workshops
  - Studieveiledning
  - Bedriftsbesøk og presentasjoner
- Melde interesse for et arrangement (opptil 14 dager før)
- Motta påminnelse på arrangementsdagen og bekrefte eller avmelde seg
- Se egne påmeldinger

### For arrangører
- Publisere arrangement (tittel, beskrivelse, tid, sted, kategori, om det er mat)
- Se antall interesserte og antall bekreftede på dagen
- Betale publiseringsavgift

### Senere
- Kuponger og belønninger fra samarbeidspartnere i matbransjen, for eksempel etter at studenten har brukt appen et visst antall ganger

## Brukerflyt

```text
Student åpner appen
   └─> ser liste over arrangementer
        └─> filtrerer på kategori (f.eks. "Gratis mat")
             └─> åpner et arrangement
                  └─> trykker "Jeg kommer"        (kun opptil 14 dager før)
                       └─> [arrangementsdagen] får påmindelse
                            ├─> "Ja, jeg kommer"  -> bekreftet
                            └─> "Nei, kan ikke"   -> avmeldt
```

Arrangøren ser to tall: **interesserte** (frem til dagen) og **bekreftede** (etter påminnelsen).

## MVP-omfang

**Inkludert i første versjon:**
- Liste over arrangementer
- Filter på kategori
- Konto med e-post og passord
- "Jeg kommer"-knapp (interessemelding lagret på kontoen)

**Utenfor MVP (kommer senere):**
- Påminnelse på arrangementsdagen
- Arrangørportal og publisering
- Betaling
- Kuponger og samarbeidspartnere
- Mobilapp

I første versjon kan arrangementer legges inn manuelt (for eksempel i en JSON-fil eller direkte i databasen).

## Datamodell (utkast)

Dette er et utkast og kan endre seg.

```text
User
  id, email, name, created_at

Organizer
  id, name, contact_email

Event
  id, organizer_id, title, description,
  starts_at, location, category, has_food,
  created_at

Rsvp
  id, user_id, event_id,
  status        -- 'interested' | 'confirmed' | 'cancelled'
  created_at, confirmed_at
```

**Regler:**
- En bruker kan bare ha én `Rsvp` per `Event`.
- `Rsvp` med status `interested` kan bare opprettes inntil 14 dager før `starts_at`.
- På arrangementsdagen sendes en påminnelse, og status oppdateres til `confirmed` eller `cancelled`.

## Teknologi

Foreløpig oppsett:

| Område | Valg |
|---|---|
| Frontend | React + Vite (JavaScript) |
| Backend / database | Supabase eller Firebase (kan utsettes i starten) |
| Hosting | Vercel eller Netlify |
| Versjonskontroll | GitHub |

### Kjøre prototypen lokalt

```bash
npm install
npm run dev
```

Appen henter arrangementer og lagrer påmeldinger i Supabase. Sett opp prosjektet
før du starter appen:

1. Opprett et Supabase-prosjekt på [supabase.com](https://supabase.com/).
2. Åpne **SQL Editor**, kjør `supabase/schema.sql`, og deretter
   `supabase/seed.sql` for å legge inn testarrangementer.
3. Kopier `.env.example` til `.env.local`. Finn **Project URL** og den offentlige
   **anon/publishable key** under prosjektets API-innstillinger, og fyll dem inn:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-key
   ```

4. Start appen på nytt med `npm run dev`. Opprett en konto med e-post og passord.
   Hvis e-postbekreftelse er slått på i Supabase, må du bekrefte adressen før
   innlogging. Under **Authentication → URL Configuration**, sett lokal
   utviklingsadresse som **Site URL** og legg til Vercel-adressen under
   **Redirect URLs** når du publiserer.
5. Legg de samme to miljøvariablene inn i Vercel-prosjektets
   **Environment Variables** for hvert miljø som skal bruke appen.

`.env.local` skal ikke committes. `.env.example` er en mal uten ekte nøkler.
Frontend bruker bare Supabase sin offentlige anon/publishable key; aldri legg
`service_role`-nøkkelen i appen eller i GitHub.

**Sikkerhet i MVP:** RLS er aktivert på `organizers`, `events` og `rsvps`.
Alle kan lese arrangementer og arrangørnavn, men bare innloggede brukere kan
lese sine egne RSVP-er. Databasen kontrollerer både eierskap og 14-dagersgrensen
for nye interesser. Arrangører og arrangementer kan foreløpig bare administreres
fra Supabase-dashboardet; offentlig skrivetilgang er ikke gitt.
Klienten har bare kolonnerettigheter til å sette inn en RSVP og endre dens
status, ikke til å endre bruker, arrangement eller bekreftelsestidspunkt.

`User` i datamodellen håndteres av Supabase Auth (`auth.users`), ikke av en
separat offentlig brukertabell. Tabell- og RLS-oppsettet ligger i
[`supabase/schema.sql`](./supabase/schema.sql); testdataene i
[`supabase/seed.sql`](./supabase/seed.sql) kan kjøres på nytt uten å lage
duplikater.

## Forretningsmodell

- **Studenter:** gratis.
- **Arrangører:** betaler en liten avgift for å publisere arrangementer.
- **På sikt:** samarbeid med aktører i matbransjen. Studenter kan for eksempel få kupong etter å ha brukt appen et visst antall ganger. Dette gir både et insentiv for studentene og en ekstra inntektskilde.

## Veikart

- [ ] **Fase 1 (MVP):** arrangementsliste, kategorifilter, innlogging, lagring av påmeldinger
- [ ] **Fase 2:** påminnelse og bekreftelse på arrangementsdagen
- [ ] **Fase 3:** arrangørportal og publisering
- [ ] **Fase 4:** betaling
- [ ] **Fase 5:** kuponger og samarbeidspartnere
- [ ] **Fase 6:** flere studiesteder, evt. mobilapp

## Ordliste

| Begrep | Betydning |
|---|---|
| Arrangement | Et event for studenter, for eksempel bedriftspresentasjon, kurs eller matarrangement |
| Arrangør | Bedrift eller organisasjon som publiserer arrangementer |
| Interesse | Studentens første, uforpliktende påmelding (opptil 14 dager før) |
| Bekreftelse | Studentens svar på påminnelsen på arrangementsdagen |
| MVP | Minste versjon som er nyttig nok til å testes med ekte brukere |

---

## Kontekst for AI-assistenter

Denne delen er skrevet for AI-verktøy som hjelper til med kode og planlegging.

**Kort om prosjektet:** FreeBite er en plattform som samler studentarrangementer og bruker en todelt påmelding (interesse i forkant, bekreftelse på dagen) for å gi arrangører et mer presist oppmøteestimat.

**Utvikler:** Student på informatikk (andre år, NTNU). Kan Java, JavaScript og Python. Dette er førsteprosjektet i React, så forklar gjerne valg og unngå unødvendig kompleksitet.

**Retningslinjer:**
- Hold løsningene enkle og tilpasset MVP-omfanget over. Ikke foreslå funksjoner fra senere faser med mindre jeg ber om det.
- Foretrekk lesbar kode med korte forklaringer fremfor avanserte mønstre.
- Bruk React med funksjonelle komponenter og hooks.
- Hold forretningsreglene (14-dagersgrensen, påminnelse på dagen) i bakhodet når du foreslår datamodeller og logikk.
- Supabase skal bruke RLS. RSVP-er er private for den innloggede brukeren; publisering av arrangementer er foreløpig bare administratorstyrt.
- Svar på norsk, med mindre jeg skriver på engelsk. Kode, variabelnavn og commit-meldinger skrives på engelsk.

**Viktigste begreper i koden:** `Event`, `Organizer`, `Rsvp`, `status` (`interested` / `confirmed` / `cancelled`).