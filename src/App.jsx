import React, { useMemo, useState } from 'react';

const events = [
  {
    id: 1,
    title: 'Pizza & prat med Knowit',
    organizer: 'Knowit',
    description:
      'Bli kjent med folkene bak noen av Norges mest spennende digitale løsninger. Vi spanderer pizza!',
    startsAt: '2026-10-23T17:00:00+02:00',
    location: 'Knowit, Solsiden',
    category: 'Bedriftsbesøk',
    hasFood: true,
    accent: 'coral',
    icon: '🍕',
  },
  {
    id: 2,
    title: 'Lag din første nettside',
    organizer: 'Webkom',
    description:
      'En lavterskel workshop der du lærer HTML og CSS. Ingen forkunnskaper nødvendig, bare ta med egen PC.',
    startsAt: '2026-10-27T16:15:00+02:00',
    location: 'Realfagbygget, R90',
    category: 'Kurs og workshops',
    hasFood: true,
    accent: 'lavender',
    icon: '💻',
  },
  {
    id: 3,
    title: 'Gratis lunsj med Bekk',
    organizer: 'Bekk',
    description:
      'Ta en pause fra lesesalen og spis lunsj sammen med konsulenter som også har vært studenter på NTNU.',
    startsAt: '2026-11-02T11:30:00+01:00',
    location: 'Hovedbygningen, S2',
    category: 'Gratis mat',
    hasFood: true,
    accent: 'yellow',
    icon: '🥪',
  },
  {
    id: 4,
    title: 'Få kontroll på eksamensstress',
    organizer: 'Sit',
    description:
      'Sit Råd gir deg konkrete verktøy for å planlegge lesingen og ta vare på deg selv i eksamensperioden.',
    startsAt: '2026-11-12T14:15:00+01:00',
    location: 'Dragvoll, D12',
    category: 'Studieveiledning',
    hasFood: false,
    accent: 'mint',
    icon: '🧠',
  },
];

const categories = [
  'Alle arrangementer',
  'Gratis mat',
  'Kurs og workshops',
  'Studieveiledning',
  'Bedriftsbesøk',
];

const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

const timeFormatter = new Intl.DateTimeFormat('nb-NO', {
  hour: '2-digit',
  minute: '2-digit',
});

function isWithinInterestWindow(startsAt) {
  const start = new Date(startsAt).getTime();
  const now = Date.now();
  const fourteenDays = 14 * 24 * 60 * 60 * 1000;

  return start > now && start - now <= fourteenDays;
}

function App() {
  const [activeCategory, setActiveCategory] = useState('Alle arrangementer');
  const [interestedEventIds, setInterestedEventIds] = useState([]);
  const [showMine, setShowMine] = useState(false);

  const visibleEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          (!showMine || interestedEventIds.includes(event.id)) &&
          (activeCategory === 'Alle arrangementer' ||
            event.category === activeCategory),
      ),
    [activeCategory, interestedEventIds, showMine],
  );

  function toggleInterest(eventId) {
    setInterestedEventIds((currentIds) =>
      currentIds.includes(eventId)
        ? currentIds.filter((id) => id !== eventId)
        : [...currentIds, eventId],
    );
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" aria-label="FreeBite hjem">
          <span className="brand-mark" aria-hidden="true">
            f
          </span>
          <span>freebite</span>
        </a>
        <div className="header-location">
          <span className="location-dot" aria-hidden="true" />
          Trondheim
          <span className="header-campus">· NTNU</span>
        </div>
        <button
          className={`my-events-button${showMine ? ' selected' : ''}`}
          type="button"
          aria-pressed={showMine}
          onClick={() => setShowMine((current) => !current)}
        >
          <span aria-hidden="true">♡</span>
          Mine arrangementer
          {interestedEventIds.length > 0 && (
            <span className="interest-count">{interestedEventIds.length}</span>
          )}
        </button>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span aria-hidden="true">✳</span> Studentlivet skjer her
            </p>
            <h1 id="hero-title">
              Gode ting skjer.
              <br />
              <span>Du burde være der.</span>
            </h1>
            <p className="hero-description">
              Oppdag studentarrangementer i Trondheim — fra gratis lunsj til
              kurs, bedriftspresentasjoner og alt imellom.
            </p>
            <a className="hero-link" href="#arrangementer">
              Se hva som skjer <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-sun" />
            <div className="art-card art-card-back">
              <span>MAT</span>
              <span className="art-sparkle">✳</span>
            </div>
            <div className="art-card art-card-front">
              <span className="art-caption">DET SKJER NOE</span>
              <span className="art-big-type">BLI<br />MED!</span>
              <span className="art-smile">☺</span>
            </div>
            <span className="art-sticker">GRATIS<br />FOR DEG</span>
          </div>
          <div className="hero-note">
            <span className="note-icon" aria-hidden="true">↗</span>
            <span>Din neste favoritt-plan<br />er rett rundt hjørnet.</span>
          </div>
        </section>

        <section
          className="events-section"
          id="arrangementer"
          aria-labelledby="events-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow section-eyebrow">
                {showMine ? 'Din oversikt' : 'Finn din greie'}
              </p>
              <h2 id="events-title">
                {showMine ? 'Mine arrangementer' : 'Dette skjer snart'}
              </h2>
            </div>
            <span className="event-total">
              {visibleEvents.length} arrangementer
            </span>
          </div>

          <div className="category-list" aria-label="Filtrer arrangementer">
            {categories.map((category) => (
              <button
                className={`category-chip${activeCategory === category ? ' active' : ''}`}
                key={category}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category === 'Alle arrangementer' && (
                  <span aria-hidden="true">✳</span>
                )}
                {category}
              </button>
            ))}
          </div>

          {visibleEvents.length > 0 ? (
            <div className="event-grid">
              {visibleEvents.map((event) => {
                const isInterested = interestedEventIds.includes(event.id);
                const canExpressInterest = isWithinInterestWindow(event.startsAt);

                return (
                  <article className="event-card" key={event.id}>
                    <div className={`event-art ${event.accent}`}>
                      <span className="event-illustration" aria-hidden="true">
                        {event.icon}
                      </span>
                      <span className="event-category">{event.category}</span>
                      {event.hasFood && (
                        <span className="food-tag">
                          <span aria-hidden="true">✳</span> Mat inkludert
                        </span>
                      )}
                    </div>
                    <div className="event-content">
                      <div className="event-meta">
                        <span>{dateFormatter.format(new Date(event.startsAt))}</span>
                        <span className="meta-separator">·</span>
                        <span>{timeFormatter.format(new Date(event.startsAt))}</span>
                      </div>
                      <h3>{event.title}</h3>
                      <p className="event-organizer">med {event.organizer}</p>
                      <p className="event-description">{event.description}</p>
                      <div className="event-footer">
                        <span className="event-location">
                          <span aria-hidden="true">⌖</span> {event.location}
                        </span>
                        <button
                          className={`interest-button${isInterested ? ' interested' : ''}`}
                          type="button"
                          disabled={!canExpressInterest && !isInterested}
                          aria-pressed={isInterested}
                          onClick={() => toggleInterest(event.id)}
                        >
                          {isInterested
                            ? '✓ Interessert'
                            : canExpressInterest
                              ? 'Jeg kommer'
                              : 'Åpner senere'}
                        </button>
                      </div>
                      {!canExpressInterest && !isInterested && (
                        <p className="interest-hint">
                          Du kan melde interesse fra 14 dager før.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true">✳</span>
              <p>
                {showMine
                  ? 'Du har ikke meldt interesse for noen arrangementer ennå.'
                  : 'Ingen arrangementer i denne kategorien akkurat nå.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowMine(false);
                  setActiveCategory('Alle arrangementer');
                }}
              >
                Se alle arrangementer
              </button>
            </div>
          )}
        </section>

        <section className="reminder-banner" aria-label="Slik fungerer FreeBite">
          <span className="reminder-icon" aria-hidden="true">♡</span>
          <div>
            <p className="reminder-title">Planer kan endre seg. Helt greit.</p>
            <p>
              Neste steg: påminnelse på arrangementsdagen, så du kan bekrefte
              om du fortsatt kommer.
            </p>
          </div>
          <span className="reminder-sparkle" aria-hidden="true">✳</span>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#" aria-label="FreeBite hjem">
          <span className="brand-mark" aria-hidden="true">f</span>
          <span>freebite</span>
        </a>
        <span>Mer studentliv. Mindre leting.</span>
        <span>Trondheim, Norge <span aria-hidden="true">♡</span></span>
      </footer>
    </div>
  );
}

export default App;
