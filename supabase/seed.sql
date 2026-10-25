insert into public.organizers (id, name, contact_email)
values
  ('10000000-0000-4000-8000-000000000001', 'Knowit', 'student@knowit.no'),
  ('10000000-0000-4000-8000-000000000002', 'Webkom', null),
  ('10000000-0000-4000-8000-000000000003', 'Bekk', 'student@bekk.no'),
  ('10000000-0000-4000-8000-000000000004', 'Sit', null)
on conflict (id) do update set
  name = excluded.name,
  contact_email = excluded.contact_email;

insert into public.events (
  id, organizer_id, title, description, starts_at, location, category, has_food
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Pizza & prat med Knowit',
    'Bli kjent med folkene bak noen av Norges mest spennende digitale løsninger. Vi spanderer pizza!',
    now() + interval '3 days',
    'Knowit, Solsiden',
    'Bedriftsbesøk',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    'Lag din første nettside',
    'En lavterskel workshop der du lærer HTML og CSS. Ingen forkunnskaper nødvendig, bare ta med egen PC.',
    now() + interval '8 days',
    'Realfagbygget, R90',
    'Kurs og workshops',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000003',
    'Gratis lunsj med Bekk',
    'Ta en pause fra lesesalen og spis lunsj sammen med konsulenter som også har vært studenter på NTNU.',
    now() + interval '12 days',
    'Hovedbygningen, S2',
    'Gratis mat',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000004',
    'Få kontroll på eksamensstress',
    'Sit Råd gir deg konkrete verktøy for å planlegge lesingen og ta vare på deg selv i eksamensperioden.',
    now() + interval '20 days',
    'Dragvoll, D12',
    'Studieveiledning',
    false
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000001',
    'Fra studentprosjekt til ekte produkt',
    'Knowit deler erfaringer fra å utvikle digitale produkter i tverrfaglige team. Det blir tid til spørsmål og pizza.',
    date_trunc('day', now()) + interval '4 days 17 hours',
    'Knowit, Solsiden',
    'Bedriftsbesøk',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000002',
    'Bygg en enkel nettside sammen',
    'Prøv deg på HTML og CSS i en uformell workshop. Ta med PC; nybegynnere er velkomne.',
    date_trunc('day', now()) + interval '5 days 16 hours',
    'Realfagbygget, R90',
    'Kurs og workshops',
    false
  ),
  (
    '20000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000003',
    'Lunsj og karriereprat',
    'Spis lunsj og hør hvordan arbeidshverdagen kan se ut etter studiene. Still spørsmål til Bekk-konsulentene.',
    date_trunc('day', now()) + interval '6 days 11 hours',
    'Hovedbygningen, S2',
    'Gratis mat',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000008',
    '10000000-0000-4000-8000-000000000004',
    'Studieteknikk før eksamen',
    'Sit Råd viser konkrete metoder for å planlegge lesingen, ta pauser og komme i gang med pensum.',
    date_trunc('day', now()) + interval '7 days 14 hours',
    'Dragvoll, D12',
    'Studieveiledning',
    false
  ),
  (
    '20000000-0000-4000-8000-000000000009',
    '10000000-0000-4000-8000-000000000001',
    'Teknologi, team og taco',
    'En uformell kveld med korte innlegg om teknologi og samarbeid, etterfulgt av taco og prat.',
    date_trunc('day', now()) + interval '9 days 17 hours',
    'Knowit, Solsiden',
    'Bedriftsbesøk',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000010',
    '10000000-0000-4000-8000-000000000002',
    'Introduksjon til Git og GitHub',
    'Lær det grunnleggende om versjonskontroll gjennom praktiske oppgaver. Ingen forkunnskaper kreves.',
    date_trunc('day', now()) + interval '10 days 16 hours',
    'Realfagbygget, R90',
    'Kurs og workshops',
    false
  ),
  (
    '20000000-0000-4000-8000-000000000011',
    '10000000-0000-4000-8000-000000000003',
    'Middag og spørsmål om konsulentlivet',
    'Møt tidligere NTNU-studenter, få svar på spørsmål om jobbhverdagen og spis middag sammen.',
    date_trunc('day', now()) + interval '13 days 17 hours',
    'Hovedbygningen, S2',
    'Gratis mat',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000012',
    '10000000-0000-4000-8000-000000000004',
    'Balansér studier og fritid',
    'Sit Råd deler tips til å finne en god rytme mellom forelesninger, lesing, søvn og fritid.',
    date_trunc('day', now()) + interval '16 days 14 hours',
    'Dragvoll, D12',
    'Studieveiledning',
    false
  ),
  (
    '20000000-0000-4000-8000-000000000013',
    '10000000-0000-4000-8000-000000000003',
    'Karrierefrokost med Bekk',
    'Start dagen med frokost og en uformell prat om teknologi, arbeidsliv og muligheter etter studiene.',
    date_trunc('day', now()) + interval '18 days 8 hours',
    'Hovedbygningen, S2',
    'Bedriftsbesøk',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000014',
    '10000000-0000-4000-8000-000000000002',
    'Lag en liten app fra idé til prototype',
    'En praktisk workshop der du skisserer og lager en enkel prototype sammen med andre studenter.',
    date_trunc('day', now()) + interval '22 days 16 hours',
    'Realfagbygget, R90',
    'Kurs og workshops',
    false
  )
on conflict (id) do update set
  organizer_id = excluded.organizer_id,
  title = excluded.title,
  description = excluded.description,
  starts_at = excluded.starts_at,
  location = excluded.location,
  category = excluded.category,
  has_food = excluded.has_food;
