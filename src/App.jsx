import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase.js';

const categories = [
  'Alle arrangementer',
  'Gratis mat',
  'Kurs og workshops',
  'Studieveiledning',
  'Bedriftsbesøk',
];

const categoryArt = {
  'Gratis mat': { accent: 'yellow', icon: '🥪' },
  'Kurs og workshops': { accent: 'lavender', icon: '💻' },
  Studieveiledning: { accent: 'mint', icon: '🧠' },
  Bedriftsbesøk: { accent: 'coral', icon: '✳' },
};

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
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Alle arrangementer');
  const [showMine, setShowMine] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [isLoadingRsvps, setIsLoadingRsvps] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [workingEventId, setWorkingEventId] = useState(null);

  useEffect(() => {
    if (!supabase) return undefined;

    let isCurrent = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isCurrent) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthMessage('');
      setRsvps([]);
    });

    return () => {
      isCurrent = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;

    let isCurrent = true;
    async function loadEvents() {
      setIsLoading(true);
      setError('');
      const { data, error: eventError } = await supabase
        .from('events')
        .select('id, title, description, starts_at, location, category, has_food, organizers(name)')
        .gt('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true });

      if (!isCurrent) return;
      if (eventError) {
        setError(`Kunne ikke hente arrangementer: ${eventError.message}`);
      } else {
        setEvents(
          data.map((event) => ({
            ...event,
            organizer: event.organizers?.name ?? 'Arrangør',
            ...categoryArt[event.category],
          })),
        );
      }
      setIsLoading(false);
    }

    loadEvents();
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) {
      setRsvps([]);
      setIsLoadingRsvps(false);
      return undefined;
    }

    let isCurrent = true;
    async function loadRsvps() {
      setIsLoadingRsvps(true);
      const { data, error: rsvpError } = await supabase
        .from('rsvps')
        .select('event_id, status')
        .eq('user_id', session.user.id);

      if (!isCurrent) return;
      if (rsvpError) {
        setError(`Kunne ikke hente påmeldingene dine: ${rsvpError.message}`);
      } else {
        setRsvps(data);
      }
      setIsLoadingRsvps(false);
    }

    loadRsvps();
    return () => {
      isCurrent = false;
    };
  }, [session]);

  const interestedEventIds = useMemo(
    () =>
      rsvps
        .filter((rsvp) => rsvp.status === 'interested')
        .map((rsvp) => rsvp.event_id),
    [rsvps],
  );

  const visibleEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          (!showMine || interestedEventIds.includes(event.id)) &&
          (activeCategory === 'Alle arrangementer' ||
            event.category === activeCategory),
      ),
    [activeCategory, events, interestedEventIds, showMine],
  );

  const featuredEvent = events.find((event) =>
    isWithinInterestWindow(event.starts_at),
  ) ?? events.find((event) => new Date(event.starts_at).getTime() > Date.now());

  async function handleAuthSubmit(event) {
    event.preventDefault();
    if (!supabase) return;

    setIsSubmittingAuth(true);
    setError('');
    setAuthMessage('');
    const result =
      authMode === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setError(`Innlogging feilet: ${result.error.message}`);
    } else if (authMode === 'signup' && !result.data.session) {
      setAuthMessage('Sjekk e-posten din for å bekrefte kontoen før du logger inn.');
    } else {
      setAuthMessage(authMode === 'signup' ? 'Konto opprettet.' : 'Du er logget inn.');
    }
    setIsSubmittingAuth(false);
  }

  async function handleSignOut() {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(`Kunne ikke logge ut: ${signOutError.message}`);
    else setShowMine(false);
  }

  async function toggleInterest(eventId) {
    if (!session?.user) {
      setAuthMode('signin');
      document.getElementById('konto')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const existingRsvp = rsvps.find((rsvp) => rsvp.event_id === eventId);
    const nextStatus =
      existingRsvp?.status === 'interested' ? 'cancelled' : 'interested';

    setWorkingEventId(eventId);
    setError('');
    const result = existingRsvp
      ? await supabase
          .from('rsvps')
          .update({ status: nextStatus })
          .eq('event_id', eventId)
          .eq('user_id', session.user.id)
      : await supabase.from('rsvps').insert({
          user_id: session.user.id,
          event_id: eventId,
          status: nextStatus,
        });

    if (result.error) {
      setError(`Kunne ikke lagre interessen: ${result.error.message}`);
    } else {
      setRsvps((currentRsvps) =>
        existingRsvp
          ? currentRsvps.map((rsvp) =>
              rsvp.event_id === eventId
                ? { ...rsvp, status: nextStatus }
                : rsvp,
            )
          : [...currentRsvps, { event_id: eventId, status: nextStatus }],
      );
    }
    setWorkingEventId(null);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" aria-label="FreeBite hjem">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 20V9.5a5 5 0 0 1 10 0V20M7 13h10" />
            </svg>
          </span>
          <span>freebite<span className="brand-period">.</span></span>
        </a>
        <nav className="header-nav" aria-label="Hovedmeny">
          <a className={!showMine ? 'nav-link active' : 'nav-link'} href="#arrangementer">
            Utforsk
          </a>
          <button
            className={`my-events-button${showMine ? ' selected' : ''}`}
            type="button"
            aria-pressed={showMine}
            onClick={() => {
              if (session?.user) setShowMine((current) => !current);
              else document.getElementById('konto')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {session?.user ? 'Mine planer' : 'Logg inn'}
            {interestedEventIds.length > 0 && (
              <span className="interest-count">{interestedEventIds.length}</span>
            )}
          </button>
          <span className="header-location">
            <span className="location-dot" aria-hidden="true" />
            Trondheim
          </span>
        </nav>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="hero-kicker">
              <span className="location-dot" aria-hidden="true" />
              STUDENTLIVET, SAMLET PÅ ETT STED
            </p>
            <h1 id="hero-title">
              Planer som
              <br />
              <span>blir til noe.</span>
            </h1>
            <p className="hero-description">
              Finn folkene, maten og opplevelsene du ellers kunne gått glipp av.
              Gode studentarrangementer, rett rundt hjørnet.
            </p>
            <a className="hero-link" href="#arrangementer">
              Finn ditt neste arrangement <span aria-hidden="true">↗</span>
            </a>
          </div>
          {featuredEvent && (
            <aside className="hero-spotlight" aria-label="Kommende arrangement">
              <div className="spotlight-topline">
                <span className="spotlight-label">NESTE PÅ PLANEN</span>
                <span className="spotlight-spark" aria-hidden="true">✳</span>
              </div>
              <div className="spotlight-date">
                <span>{dateFormatter.format(new Date(featuredEvent.starts_at))}</span>
                <span>{timeFormatter.format(new Date(featuredEvent.starts_at))}</span>
              </div>
              <span className="spotlight-category">{featuredEvent.category}</span>
              <h2>{featuredEvent.title}</h2>
              <p>Med {featuredEvent.organizer} <span aria-hidden="true">·</span> {featuredEvent.location}</p>
              <a href="#arrangementer" aria-label="Se alle arrangementer">
                Se alle arrangementer <span aria-hidden="true">→</span>
              </a>
              <span className="spotlight-orbit orbit-one" aria-hidden="true" />
              <span className="spotlight-orbit orbit-two" aria-hidden="true" />
            </aside>
          )}
        </section>

        <section className="account-section" id="konto" aria-labelledby="account-title">
          {session?.user ? (
            <div className="account-status">
              <div>
                <p className="section-eyebrow">KONTOEN DIN</p>
                <h2 id="account-title">Du er logget inn</h2>
                <p>{session.user.email}</p>
              </div>
              <button className="account-button" type="button" onClick={handleSignOut}>
                Logg ut
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              <div>
                <p className="section-eyebrow">KONTO</p>
                <h2 id="account-title">
                  {authMode === 'signin' ? 'Logg inn for å melde interesse' : 'Opprett konto'}
                </h2>
                <p>Påmeldingene dine lagres privat på kontoen din.</p>
              </div>
              <label>
                E-post
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label>
                Passord
                <input
                  type="password"
                  autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <button className="auth-submit" type="submit" disabled={!supabase || isSubmittingAuth}>
                {isSubmittingAuth
                  ? 'Vent litt …'
                  : authMode === 'signin'
                    ? 'Logg inn'
                    : 'Opprett konto'}
              </button>
              <button
                className="auth-mode-toggle"
                type="button"
                onClick={() => {
                  setAuthMode((mode) => (mode === 'signin' ? 'signup' : 'signin'));
                  setAuthMessage('');
                  setError('');
                }}
              >
                {authMode === 'signin' ? 'Ny her? Opprett konto' : 'Har du allerede konto? Logg inn'}
              </button>
            </form>
          )}
          {!supabase && (
            <p className="account-message">
              Supabase er ikke konfigurert ennå. Fyll inn `VITE_SUPABASE_URL` og
              `VITE_SUPABASE_ANON_KEY` i `.env.local`, og start utviklingsserveren på nytt.
            </p>
          )}
          {authMessage && <p className="account-message" role="status">{authMessage}</p>}
          {error && <p className="account-error" role="alert">{error}</p>}
        </section>

        <section
          className="events-section"
          id="arrangementer"
          aria-labelledby="events-title"
        >
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">
                {showMine ? 'DIN OVERSIKT' : 'LAG NOE Å GLEDE DEG TIL'}
              </p>
              <h2 id="events-title">
                {showMine ? 'Mine planer' : 'På campus snart'}
              </h2>
            </div>
            <span className="event-total">{visibleEvents.length} treff</span>
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

          {isLoading ? (
            <div className="empty-state"><p>Henter arrangementer …</p></div>
          ) : visibleEvents.length > 0 ? (
            <div className="event-grid">
              {visibleEvents.map((event) => {
                const isInterested = interestedEventIds.includes(event.id);
                const canExpressInterest = isWithinInterestWindow(event.starts_at);

                return (
                  <article className="event-card" key={event.id}>
                    <div className={`event-art ${event.accent ?? 'mint'}`}>
                      <span className="event-illustration" aria-hidden="true">
                        {event.icon ?? '✳'}
                      </span>
                      <span className="event-category">{event.category}</span>
                      {event.has_food && (
                        <span className="food-tag">
                          <span aria-hidden="true">✳</span> Mat inkludert
                        </span>
                      )}
                    </div>
                    <div className="event-content">
                      <div className="event-meta">
                        <span>{dateFormatter.format(new Date(event.starts_at))}</span>
                        <span className="meta-separator">·</span>
                        <span>{timeFormatter.format(new Date(event.starts_at))}</span>
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
                          disabled={
                            (!canExpressInterest && !isInterested) ||
                            workingEventId === event.id ||
                            (Boolean(session?.user) && isLoadingRsvps)
                          }
                          aria-pressed={isInterested}
                          onClick={() => toggleInterest(event.id)}
                        >
                          {workingEventId === event.id
                            ? 'Lagrer …'
                            : isInterested
                              ? '✓ Interessert'
                              : canExpressInterest
                                ? session?.user
                                  ? 'Jeg kommer'
                                  : 'Logg inn for å melde'
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
                  : isLoading
                    ? 'Henter arrangementer …'
                    : 'Ingen arrangementer i denne kategorien akkurat nå.'}
              </p>
              {showMine && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMine(false);
                    setActiveCategory('Alle arrangementer');
                  }}
                >
                  Se alle arrangementer
                </button>
              )}
            </div>
          )}
        </section>

        <section className="reminder-banner" aria-label="Slik fungerer FreeBite">
          <span className="reminder-icon" aria-hidden="true">↗</span>
          <div>
            <p className="reminder-title">Interesse nå. Bekreftelse på dagen.</p>
            <p>
              Neste steg: påminnelse på arrangementsdagen, så du kan bekrefte
              om du fortsatt kommer.
            </p>
          </div>
          <span className="reminder-action" aria-hidden="true">En enklere måte å møtes på</span>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#" aria-label="FreeBite hjem">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 20V9.5a5 5 0 0 1 10 0V20M7 13h10" />
            </svg>
          </span>
          <span>freebite<span className="brand-period">.</span></span>
        </a>
        <span>Mer studentliv. Mindre leting.</span>
        <span>Trondheim, Norge <span aria-hidden="true">♡</span></span>
      </footer>
    </div>
  );
}

export default App;
