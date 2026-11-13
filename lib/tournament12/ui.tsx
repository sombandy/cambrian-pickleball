import Image from "next/image";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type FormEvent,
} from "react";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Flag,
  Info,
  ListOrdered,
  RefreshCw,
  Search,
  ShieldCheck,
  Trophy,
  Users,
  WifiOff,
} from "lucide-react";
import {
  gamesFor,
  LEAGUE,
  playerFirstName,
  playerName,
  resultsCsv,
  scoreInputError,
  seriesOutcome,
  standings,
  TEAMS,
  winPoints,
  type Action,
  type Game,
  type Phase,
  type Team,
  type Tournament,
} from "./domain";
import {
  downloadFile,
  downloadWorkbook,
  exportToGoogle,
  prepareGoogleExport,
} from "./export";
import type { TournamentStore } from "./store";
import { TEAM_DIRECTORY, teamDisplay } from "./team-directory";

type Tab = "games" | "standings" | "playoffs" | "teams" | "backup";
const stageName = (stage: string) =>
  stage === "league"
    ? "League round"
    : stage.startsWith("semis")
      ? "Semifinals"
      : "Final & third place";
const signed = (n: number) => (n > 0 ? `+${n}` : String(n));
function localGet(key: string) {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}
function localSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* In-memory inputs remain usable without local storage. */
  }
}
function time(at: string) {
  return new Date(at).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
const identity = (team: Team) => teamDisplay(team);
const teamBadge = (team: Team) => {
  const info = identity(team);
  return (
    <span
      className={`team-dot team-${team.toLowerCase()} ${info.logo ? "logo-badge" : ""}`}
      title={info.name}
    >
      {info.logo ? (
        <Image
          unoptimized
          src={`/tournament12/${info.logo}`}
          alt=""
          width={32}
          height={32}
          loading="lazy"
        />
      ) : (
        team
      )}
    </span>
  );
};
function Diya() {
  return (
    <svg className="diya" viewBox="0 0 48 44" fill="none" aria-hidden="true">
      <path d="M24 3C14 15 18 22 24 23C31 20 32 14 24 3Z" fill="#d69a35" />
      <path d="M24 11C20 17 22 20 24 21C27 19 27 16 24 11Z" fill="#fff1b7" />
      <path d="M7 27H41C38 37 31 40 24 40C17 40 10 37 7 27Z" fill="#9b4e36" />
      <ellipse cx="24" cy="27" rx="18" ry="4" fill="#e3b45f" />
      <path
        d="M24 26V22M13 31C19 35 29 35 35 31"
        stroke="#fff1ce"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M7 15L8 18L11 19L8 20L7 23L6 20L3 19L6 18Z" fill="#b88a3b" />
      <path
        d="M40 8L41 11L44 12L41 13L40 16L39 13L36 12L39 11Z"
        fill="#b88a3b"
      />
    </svg>
  );
}

export function Desk({
  store,
  editor,
  practice,
  auth,
  draftScope = "live",
  practiceTools,
  signedInName,
}: {
  store: TournamentStore;
  editor: boolean;
  practice: boolean;
  auth: ReactNode;
  draftScope?: string;
  practiceTools?: ReactNode;
  // Name on the signed-in account; when set, the scorer is not asked to type one.
  signedInName?: string;
}) {
  const view = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const s = view.snapshot.payload;
  const [tab, setTab] = useState<Tab>("games");
  const [typedName, setTypedName] = useState(() =>
    localGet(`cpl12:${draftScope}:editor-name`),
  );
  const editorName = signedInName || typedName;
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [confirm, setConfirm] = useState<{
    title: string;
    body: string;
    action: Action;
  } | null>(null);
  const activePhase: Phase =
    s.stage === "league"
      ? "league"
      : s.stage.startsWith("semis")
        ? "semis"
        : "finals";
  const games = gamesFor(s, activePhase);
  const done = games.filter((g) => s.results[g.id]).length;
  const ready =
    editor &&
    !view.loading &&
    !view.stale &&
    !view.saving &&
    !view.pending &&
    online;
  useEffect(() => {
    void store.refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void store.refresh();
    }, 15000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void store.refresh();
    };
    const onOnline = () => {
      setOnline(true);
      void store.refresh();
    };
    const onOffline = () => setOnline(false);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("focus", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("focus", onVisibility);
    };
  }, [store]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 7000);
    return () => clearTimeout(id);
  }, [notice]);
  const [lastStage, setLastStage] = useState(s.stage);
  if (lastStage !== s.stage) {
    setLastStage(s.stage);
    if (s.stage.endsWith("setup")) setTab("playoffs");
  }
  function navigateTab(next: Tab) {
    setTab(next);
    setActionError("");
    document.getElementById("main")?.scrollIntoView({ block: "start" });
  }
  async function save(action: Action) {
    setActionError("");
    try {
      await store.save(action, editorName);
      setNotice(
        action.type === "score"
          ? `${action.id.replace("L", "Game ")} saved`
          : "Saved",
      );
      return true;
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Couldn’t save. Please try again.",
      );
      return false;
    }
  }
  const nav = [
    { id: "games", label: "Games", icon: ClipboardList },
    { id: "standings", label: "Standings", icon: ListOrdered },
    { id: "playoffs", label: "Playoffs", icon: Trophy },
    { id: "teams", label: "Teams", icon: Users },
    { id: "backup", label: "Export", icon: ArrowDownToLine },
  ] as const;
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {practice && (
        <div className="practice-bar">
          <strong>Practice preview</strong>
          <span>
            Changes stay on this device. This is not the shared tournament.
          </span>
        </div>
      )}
      <header className="site-header">
        <div className="diwali-trim" aria-hidden="true" />
        <div className="brand">
          <Image
            unoptimized
            className="tournament-art"
            src={`/tournament12/tournament-art.png`}
            alt="12th Cambrian Pickleball Tournament artwork"
            width={60}
            height={60}
          />
          <div>
            <strong>12th Cambrian</strong>
            <small>Pickleball Tournament</small>
          </div>
        </div>
        {auth}
      </header>
      {practiceTools}
      <div className="app-layout">
        <aside className="desktop-nav">
          <p className="eyebrow">TOURNAMENT DESK</p>
          <nav aria-label="Main navigation">
            {nav.map((n) => (
              <button
                key={n.id}
                className={tab === n.id ? "selected" : ""}
                aria-current={tab === n.id ? "page" : undefined}
                onClick={() => {
                  navigateTab(n.id);
                  setActionError("");
                }}
              >
                <n.icon size={20} />
                {n.label}
              </button>
            ))}
          </nav>
          <div className="venue-note">
            <strong>Saturday, Nov 14</strong>
            <span>11 AM–7 PM</span>
            <span>Ace Pickleball Club</span>
            <span>San Jose</span>
          </div>
          <a
            className="text-link"
            href="https://cambrianpickleball.com/tournament/12/rules"
            target="_blank"
            rel="noreferrer"
          >
            Tournament rules <ExternalLink size={14} />
          </a>
        </aside>
        <main id="main" className="main-content">
          <div className="day-line">
            <span>Saturday, November 14</span>
            <span
              className={
                !online || view.stale ? "sync-state stale" : "sync-state"
              }
            >
              {!online ? (
                <WifiOff size={14} />
              ) : (
                <span className="status-dot" />
              )}
              {!online
                ? "Offline"
                : view.loading
                  ? "Connecting…"
                  : view.stale
                    ? "Needs refresh"
                    : practice
                      ? "Device preview"
                      : "Shared scoreboard"}
            </span>
          </div>
          <div className="page-heading">
            <div>
              <p className="eyebrow">{stageName(s.stage)}</p>
              <h1>
                {tab === "games"
                  ? "Games"
                  : tab === "standings"
                    ? "Standings"
                    : tab === "playoffs"
                      ? "Playoffs"
                      : tab === "teams"
                        ? "Teams"
                        : "Export"}
              </h1>
            </div>
            <div className="heading-diya">
              <Diya />
            </div>
            <span className="round-count">
              <strong>{done}</strong> / {games.length}
              <small>games saved</small>
            </span>
          </div>
          <div
            className="progress-track"
            aria-label={`${done} of ${games.length} ${activePhase} games saved`}
          >
            <span
              style={{
                width: `${games.length ? (done / games.length) * 100 : 0}%`,
              }}
            />
          </div>
          {editor && (
            <div className="editor-strip">
              <ShieldCheck size={18} />
              <strong>Editor mode</strong>
              {signedInName ? (
                <span>Signed in as {signedInName}</span>
              ) : (
                <label>
                  <span>Your name</span>
                  <input
                    aria-label="Your name"
                    value={typedName}
                    maxLength={80}
                    onChange={(e) => {
                      setTypedName(e.target.value);
                      localSet(`cpl12:${draftScope}:editor-name`, e.target.value);
                    }}
                    placeholder="Enter your name"
                    autoComplete="given-name"
                  />
                </label>
              )}
            </div>
          )}
          {(view.error || actionError || !online) && (
            <div className="notice error" role="alert">
              <Info size={20} />
              <div>
                <p>
                  {actionError ||
                    view.error ||
                    "You’re offline. Keep your entries here and reconnect before saving."}
                </p>
                <button
                  className="text-button"
                  disabled={view.saving || (view.pending && !editor)}
                  onClick={() => {
                    setActionError("");
                    (view.pending ? store.retry() : store.refresh()).catch(
                      () => {},
                    );
                  }}
                >
                  {view.pending ? "Check save" : "Refresh scoreboard"}
                </button>
              </div>
            </div>
          )}
          {view.loading ? (
            <div className="empty-state" role="status">
              <RefreshCw size={24} />
              <h2>Loading the scoreboard…</h2>
            </div>
          ) : (
            <>
              {tab === "games" && (
                <>
                  {s.stage.endsWith("setup") && (
                    <div className="notice">
                      <Info size={20} />
                      <div>
                        <p>
                          Player lineups must be published before this round’s
                          scores can be entered.
                        </p>
                        <button
                          className="text-button"
                          onClick={() => navigateTab("playoffs")}
                        >
                          Review playoff lineups
                        </button>
                      </div>
                    </div>
                  )}
                  <Games
                    key={activePhase}
                    state={s}
                    phase={activePhase}
                    editor={editor}
                    ready={ready}
                    saving={view.saving}
                    save={save}
                    draftScope={draftScope}
                  />
                </>
              )}
              {tab === "standings" && <Standings state={s} />}
              {tab === "playoffs" && (
                <Playoffs
                  key={LEAGUE.map((g) =>
                    s.results[g.id]
                      ? `${s.results[g.id].a}:${s.results[g.id].b}`
                      : "",
                  ).join(",")}
                  state={s}
                  editor={editor}
                  ready={ready}
                  save={save}
                  ask={setConfirm}
                  setTab={navigateTab}
                />
              )}
              {tab === "teams" && (
                <TeamsView
                  state={s}
                  editor={editor}
                  ready={ready}
                  save={save}
                />
              )}
              {tab === "backup" && (
                <Backup
                  state={s}
                  updated={view.snapshot.updated_at}
                  stale={view.stale || !online}
                  practice={practice}
                />
              )}
            </>
          )}
          {confirm && (
            <section
              className="confirm-box"
              role="alertdialog"
              aria-modal="false"
              aria-labelledby="confirm-title"
            >
              <h2 id="confirm-title">{confirm.title}</h2>
              <p>{confirm.body}</p>
              <div className="button-row">
                <button
                  className="button primary"
                  disabled={!ready}
                  onClick={async () => {
                    if (await save(confirm.action)) setConfirm(null);
                  }}
                >
                  Confirm and continue
                </button>
                <button
                  className="button quiet"
                  onClick={() => setConfirm(null)}
                >
                  Cancel
                </button>
              </div>
            </section>
          )}
          <footer className="page-footer">
            <span>
              {view.lastSync
                ? `Checked ${time(view.lastSync)} · refreshes every 15 seconds`
                : "Waiting for shared scores"}
            </span>
            <button
              className="icon-button"
              aria-label="Refresh scores"
              onClick={() => void store.refresh()}
            >
              <RefreshCw size={17} />
            </button>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Main navigation">
        {nav.map((n) => (
          <button
            key={n.id}
            aria-current={tab === n.id ? "page" : undefined}
            className={tab === n.id ? "selected" : ""}
            onClick={() => {
              navigateTab(n.id);
              setActionError("");
            }}
          >
            <n.icon size={21} />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
        </div>
      )}
    </>
  );
}

function Games({
  state: s,
  phase,
  editor,
  ready,
  saving,
  save,
  draftScope,
}: {
  state: Tournament;
  phase: Phase;
  editor: boolean;
  ready: boolean;
  saving: boolean;
  save: (a: Action) => Promise<boolean>;
  draftScope: string;
}) {
  const [team, setTeam] = useState("all");
  const [status, setStatus] = useState("pending");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(20);
  const [open, setOpen] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<Phase>(phase);
  const games = gamesFor(s, selectedPhase);
  const filtered = games.filter((g) => {
    const matchTeam = team === "all" || g.a === team || g.b === team;
    const matchState =
      status === "all" ||
      (status === "saved" ? !!s.results[g.id] : !s.results[g.id]);
    const text =
      `${g.id} ${g.number} team ${g.a} team ${g.b} ${identity(g.a).name} ${identity(g.b).name} ${identity(g.a).abbreviation} ${identity(g.b).abbreviation} ${g.pair.map((p) => playerName(s, g.a, p, g.phase) + " " + playerName(s, g.b, p, g.phase)).join(" ")}`.toLowerCase();
    return (
      matchTeam && matchState && (!query || text.includes(query.toLowerCase()))
    );
  });
  return (
    <>
      <div className="section-intro">
        <h2>Game scores</h2>
        <p>
          {editor
            ? "Find the game. Enter both final scores. Save."
            : "Follow results as organizers save them."}
        </p>
      </div>
      <div className="filter-bar">
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="Find game or player"
            placeholder="Game # or player name"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(20);
            }}
          />
        </label>
        <label>
          <span className="sr-only">Filter by team</span>
          <select
            value={team}
            onChange={(e) => {
              setTeam(e.target.value);
              setLimit(20);
            }}
          >
            <option value="all">All teams</option>
            {TEAMS.map((t) => (
              <option key={t} value={t}>
                {identity(t).abbreviation} · {identity(t).name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setLimit(20);
            }}
          >
            <option value="pending">To play</option>
            <option value="saved">Saved</option>
            <option value="all">All games</option>
          </select>
        </label>
      </div>
      {s.seeds.length > 0 && (
        <label className="round-picker">
          Round{" "}
          <select
            value={selectedPhase}
            onChange={(e) => {
              setSelectedPhase(e.target.value as Phase);
              setOpen(null);
            }}
          >
            <option value="league">League</option>
            <option value="semis">Semifinals</option>
            {s.finalists.final.length > 0 && (
              <option value="finals">Final / third place</option>
            )}
          </select>
        </label>
      )}
      <div className="list-heading">
        <span>
          {filtered.length}{" "}
          {status === "pending"
            ? "to play"
            : status === "saved"
              ? "saved"
              : "games"}
        </span>
        <span>
          {selectedPhase === "league"
            ? "Open courts · game order"
            : "Fixed playoff courts"}
        </span>
      </div>
      <div className="game-list">
        {filtered.slice(0, limit).map((g) => (
          <GameRow
            key={g.id}
            game={g}
            state={s}
            open={open === g.id}
            setOpen={() => setOpen(open === g.id ? null : g.id)}
            editor={editor && selectedPhase === s.stage}
            ready={ready}
            saving={saving}
            save={save}
            draftScope={draftScope}
          />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Check size={27} />
          <h3>
            {games.length &&
            !games.some((g) => !s.results[g.id]) &&
            status === "pending"
              ? "All results are in."
              : "No games match these filters."}
          </h3>
          <p>
            {status === "pending"
              ? "Choose “Saved” to view completed games."
              : "Try a different team or player."}
          </p>
        </div>
      )}
      {filtered.length > limit && (
        <button
          className="button secondary wide"
          onClick={() => setLimit(limit + 20)}
        >
          Show more games <ChevronDown size={17} />
        </button>
      )}
      <div className="note-line">
        <Info size={17} />
        <span>
          2 points for a win. A 21–14 win or wider earns 1 extra point.
        </span>
      </div>
    </>
  );
}
function GameRow({
  game: g,
  state: s,
  open,
  setOpen,
  editor,
  ready,
  saving,
  save,
  draftScope,
}: {
  game: Game;
  state: Tournament;
  open: boolean;
  setOpen: () => void;
  editor: boolean;
  ready: boolean;
  saving: boolean;
  save: (a: Action) => Promise<boolean>;
  draftScope: string;
}) {
  const r = s.results[g.id];
  const lead = g.lead
    ? playerFirstName(s, g.lead[0] as Team, Number(g.lead.slice(1)))
    : "";
  return (
    <article className={`game-row ${open ? "expanded" : ""}`}>
      <div className="game-summary">
        <div className="game-meta">
          <strong>
            {g.phase === "league"
              ? `GAME ${g.number.toString().padStart(2, "0")}`
              : `${g.series} · GAME ${g.number}`}
          </strong>
          <span>{g.court ? `Court ${g.court}` : `Lead ${lead}`}</span>
        </div>
        <div className="matchup">
          {([g.a, g.b] as Team[]).map((t, i) => (
            <div className="team-line" key={t}>
              {teamBadge(t)}
              <div className="player-pair">
                <strong title={identity(t).name}>
                  {identity(t).abbreviation}
                </strong>
                <span>
                  {g.pair
                    .map((p) => playerFirstName(s, t, p, g.phase))
                    .join(" + ")}
                </span>
              </div>
              <span
                className={`game-score ${r && (i ? r.b > r.a : r.a > r.b) ? "winner" : ""}`}
              >
                {r ? (i ? r.b : r.a) : "—"}
              </span>
              {r && (i ? r.b > r.a : r.a > r.b) && (
                <Check className="winner-check" size={16} aria-label="Winner" />
              )}
            </div>
          ))}
        </div>
        <div className="game-action">
          {r ? (
            <span className="saved-label">
              <Check size={14} />
              Saved
            </span>
          ) : (
            <span className="pending-label">To play</span>
          )}
          {editor && (
            <button
              className={`button ${open ? "quiet" : r ? "quiet" : "secondary"}`}
              aria-expanded={open}
              aria-controls={`score-${g.id}`}
              onClick={setOpen}
            >
              {open ? "Close" : r ? "Edit score" : "Enter score"}
              {!open && <ChevronRight size={16} />}
            </button>
          )}
        </div>
      </div>
      {open && editor && (
        <ScoreForm
          key={`${g.id}-${r?.at ?? "new"}`}
          game={g}
          result={r}
          ready={ready}
          saving={saving}
          draftScope={draftScope}
          save={async (a) => {
            const ok = await save(a);
            if (ok) setOpen();
            return ok;
          }}
        />
      )}
    </article>
  );
}
function ScoreForm({
  game: g,
  result,
  ready,
  saving,
  draftScope,
  save,
}: {
  game: Game;
  result?: { a: number; b: number };
  ready: boolean;
  saving: boolean;
  draftScope: string;
  save: (a: Action) => Promise<boolean>;
}) {
  const key = `cpl12:draft:${draftScope}:${g.id}`;
  const [savedDraft] = useState(() => {
    try {
      const draft = JSON.parse(localGet(key));
      if (draft && typeof draft.a === "string" && typeof draft.b === "string")
        return draft as { a: string; b: string };
    } catch {
      /* Ignore malformed device drafts. */
    }
    return {
      a: result ? String(result.a) : "",
      b: result ? String(result.b) : "",
    };
  });
  const [a, setA] = useState(savedDraft.a);
  const [b, setB] = useState(savedDraft.b);
  const [error, setError] = useState("");
  useEffect(() => {
    localSet(key, JSON.stringify({ a, b }));
  }, [key, a, b]);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const msg = scoreInputError(a, b);
    setError(msg || "");
    if (msg) return;
    if (await save({ type: "score", id: g.id, a: Number(a), b: Number(b) })) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* no-op */
      }
    }
  };
  const bonus =
    a !== "" &&
    b !== "" &&
    !scoreInputError(a, b) &&
    winPoints(Math.max(+a, +b), Math.min(+a, +b)) === 3;
  return (
    <form
      noValidate
      className="score-form"
      id={`score-${g.id}`}
      onSubmit={onSubmit}
    >
      <div className="score-inputs">
        {[
          { team: g.a, value: a, set: setA },
          { team: g.b, value: b, set: setB },
        ].map((x, i) => (
          <label key={x.team}>
            <span>{identity(x.team).abbreviation} score</span>
            <input
              autoFocus={i === 0}
              aria-label={`${identity(x.team).abbreviation} score`}
              aria-describedby={error ? `error-${g.id}` : undefined}
              aria-invalid={!!error}
              inputMode="numeric"
              pattern="[0-9]*"
              value={x.value}
              onChange={(e) => {
                x.set(e.target.value);
                setError("");
              }}
              placeholder="0"
              autoComplete="off"
            />
          </label>
        ))}
      </div>
      {error && (
        <p className="field-error" id={`error-${g.id}`} role="alert">
          {error}
        </p>
      )}
      <p className="score-help">
        To 21. At 20–20, win by 2, capped at 23. A 23–22 finish is valid.
      </p>
      <div className="score-form-footer">
        <span>
          {a && b && !scoreInputError(a, b)
            ? `${identity(+a > +b ? g.a : g.b).abbreviation} wins ${Math.max(+a, +b)}–${Math.min(+a, +b)} · ${bonus ? 3 : 2} points`
            : "Enter the final score, not a live score."}
        </span>
        <button
          className="button primary"
          disabled={!ready || saving}
          type="submit"
        >
          {saving ? "Saving…" : result ? "Save correction" : "Save result"}
          <Check size={17} />
        </button>
      </div>
    </form>
  );
}
function Standings({ state: s }: { state: Tournament }) {
  const rows = standings(s);
  const played = LEAGUE.filter((g) => s.results[g.id]).length;
  return (
    <>
      <div className="section-intro">
        <h2>League standings</h2>
        <p>
          {played === 60
            ? "All 60 games saved."
            : `${60 - played} league games still to play. Rankings are provisional.`}
        </p>
      </div>
      <div className="standings-wrap">
        <table className="standings-table">
          <thead>
            <tr>
              <th scope="col">Rank / team</th>
              <th scope="col">Played</th>
              <th scope="col">
                <abbr title="Wins">W</abbr>
              </th>
              <th scope="col">
                <abbr title="Losses">L</abbr>
              </th>
              <th scope="col">
                <abbr title="Point differential">PD</abbr>
              </th>
              <th scope="col">Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const same = rows.findIndex(
                (other) => other.points === r.points && other.pd === r.pd,
              );
              const rank =
                s.seeds.length && s.seeds.includes(r.team)
                  ? s.seeds.indexOf(r.team) + 1
                  : same + 1;
              return (
                <tr key={r.team}>
                  <th scope="row">
                    <div className="standing-team">
                      <span className="rank">
                        {played ? rank : "—"}
                        {played > 0 && r.tied && !s.seeds.length ? "=" : ""}
                      </span>
                      {teamBadge(r.team)}
                      <span className="standing-team-name">
                        {identity(r.team).name}
                        {s.seeds.includes(r.team) && (
                          <small>Semifinalist</small>
                        )}
                      </span>
                    </div>
                  </th>
                  <td>{r.played}</td>
                  <td>{r.wins}</td>
                  <td>{r.losses}</td>
                  <td>{signed(r.pd)}</td>
                  <td className="standing-points">{r.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="rules-note">
        <Flag size={20} />
        <div>
          <strong>Top four go to the semifinals.</strong>
          <p>
            Ranked by win-points, then point differential. Teams still tied play
            a tiebreak; alphabetical display order never decides qualification.
          </p>
        </div>
      </div>
      <details className="plain-details">
        <summary>How the points work</summary>
        <p>
          A win earns 2 points. Winning 21–14 or by a wider margin earns 3. A
          loss earns 0. Differential is points scored minus points conceded. The
          same win-points and differential rules decide each five-game playoff
          series.
        </p>
      </details>
    </>
  );
}
function Playoffs({
  state: s,
  editor,
  ready,
  save,
  ask,
  setTab,
}: {
  state: Tournament;
  editor: boolean;
  ready: boolean;
  save: (a: Action) => Promise<boolean>;
  ask: (v: { title: string; body: string; action: Action }) => void;
  setTab: (t: Tab) => void;
}) {
  const complete = LEAGUE.filter((g) => s.results[g.id]).length;
  const [order, setOrder] = useState<Team[]>(() =>
    standings(s).map((r) => r.team),
  );
  const setup = s.stage.endsWith("setup");
  const phase = s.stage.startsWith("semis") ? "semis" : "finals";
  const ids = phase === "semis" ? ["SF1", "SF2"] : ["F", "P3"];
  return (
    <>
      <div className="section-intro">
        <h2>
          {s.stage === "league"
            ? "League → semifinals → final"
            : stageName(s.stage)}
        </h2>
        <p>
          Every playoff series has five games. Play all five, even if a team
          leads early.
        </p>
      </div>
      <div className="round-steps">
        <span className={s.stage === "league" ? "active" : ""}>
          1 <strong>League</strong>
        </span>
        <ChevronRight size={16} />
        <span className={s.stage.startsWith("semis") ? "active" : ""}>
          2 <strong>Semifinals</strong>
        </span>
        <ChevronRight size={16} />
        <span className={s.stage.startsWith("finals") ? "active" : ""}>
          3 <strong>Finals</strong>
        </span>
      </div>
      {s.stage === "league" ? (
        <section className="setup-panel">
          <Trophy size={28} />
          <h3>
            {complete === 60
              ? "Confirm semifinal seeds."
              : "Finish the league to open playoffs."}
          </h3>
          <p>
            {complete === 60
              ? "Check the final standings. Resolve any exact ties with a played tiebreak before confirming seeds."
              : `Save the remaining ${60 - complete} league results to qualify four teams.`}
          </p>
          {complete === 60 && editor && (
            <>
              <div className="seed-list">
                {order.map((t, i) => (
                  <label key={i}>
                    <span>
                      {i + 1 <= 4 ? `Seed ${i + 1}` : `Place ${i + 1}`}
                    </span>
                    <select
                      aria-label={`Seed position ${i + 1}`}
                      value={t}
                      onChange={(e) => {
                        const next = [...order];
                        const at = next.indexOf(e.target.value as Team);
                        [next[i], next[at]] = [next[at], next[i]];
                        setOrder(next);
                      }}
                    >
                      {TEAMS.map((t) => (
                        <option key={t} value={t}>
                          {identity(t).shortName}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <p className="small-note">
                Only teams tied on both win-points and differential may change
                order. For a tie involving more than two teams, organizers must
                agree the tiebreak procedure before proceeding.
              </p>
              <button
                className="button primary"
                disabled={!ready}
                onClick={() =>
                  ask({
                    title: "Confirm semifinal seeds?",
                    body: "This locks league scores. You can then enter team position swaps before publishing the semifinal lineups.",
                    action: { type: "prepare-semis", seeds: order },
                  })
                }
              >
                Confirm seeds & review lineups <ChevronRight size={17} />
              </button>
            </>
          )}
        </section>
      ) : (
        <>
          {setup && (
            <section className="setup-panel">
              <h3>Review position swaps</h3>
              <p>
                Collect the teams’ swaps first, then enter them below. Each team
                gets two swaps in total across the playoffs. League lineups stay
                unchanged.
              </p>
              <p className="small-note">
                These are draft lineups until published. All shared editors can
                see them.
              </p>
              <div className="swap-list">
                {s.seeds.map((t) => (
                  <SwapEditor
                    key={t}
                    state={s}
                    team={t}
                    phase={phase}
                    editor={editor}
                    ready={ready}
                    save={save}
                  />
                ))}
              </div>
              {editor && (
                <button
                  className="button primary wide"
                  disabled={!ready}
                  onClick={() =>
                    ask({
                      title: `Publish ${phase === "semis" ? "semifinal" : "final / third-place"} lineups?`,
                      body: "Check all four team lineups. Publishing locks the player positions and opens this round for score entry.",
                      action: { type: "publish-lineups" },
                    })
                  }
                >
                  Publish lineups & start round <Check size={17} />
                </button>
              )}
            </section>
          )}
          {ids.map((id) => (
            <Series
              key={id}
              id={id}
              state={s}
              editor={editor && !setup}
              ready={ready}
              save={save}
            />
          ))}
          {!setup && (
            <button
              className="button secondary wide"
              onClick={() => setTab("games")}
            >
              Go to game scores <ChevronRight size={17} />
            </button>
          )}
          {s.stage === "semis" &&
            editor &&
            ["SF1", "SF2"].every((id) => {
              const out = seriesOutcome(s, id);
              return out && out !== "tie";
            }) && (
              <button
                className="button primary wide"
                disabled={!ready}
                onClick={() =>
                  ask({
                    title: "Set up the final & third place?",
                    body: "This locks semifinal scores. Review any remaining position swaps before publishing the next lineups.",
                    action: { type: "prepare-finals" },
                  })
                }
              >
                Set up final & third place <ChevronRight size={17} />
              </button>
            )}
        </>
      )}
    </>
  );
}
function SwapEditor({
  state: s,
  team,
  phase,
  editor,
  ready,
  save,
}: {
  state: Tournament;
  team: Team;
  phase: "semis" | "finals";
  editor: boolean;
  ready: boolean;
  save: (a: Action) => Promise<boolean>;
}) {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const used = [...s.swaps.semis, ...s.swaps.finals].filter(
    (x) => x.team === team,
  ).length;
  return (
    <details className="swap-team">
      <summary>
        {teamBadge(team)}
        <strong title={identity(team).name}>{identity(team).shortName}</strong>
        <span>
          {2 - used} {2 - used === 1 ? "swap" : "swaps"} left
        </span>
        <ChevronDown size={17} />
      </summary>
      <ol className="lineup-list">
        {[1, 2, 3, 4, 5].map((p) => (
          <li key={p}>
            <span>P{p}</span>
            <strong>{playerName(s, team, p, phase)}</strong>
            {s.lineups[phase][team][p - 1] !== p && (
              <small>from P{s.lineups[phase][team][p - 1]}</small>
            )}
          </li>
        ))}
      </ol>
      {editor && used < 2 && (
        <form
          className="swap-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              await save({ type: "swap", team, first: +first, second: +second })
            ) {
              setFirst("");
              setSecond("");
            }
          }}
        >
          <label>
            First position
            <select
              required
              aria-label={`Team ${team} first position`}
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            >
              <option value="">Choose…</option>
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>
                  P{p} · {playerName(s, team, p, phase)}
                </option>
              ))}
            </select>
          </label>
          <ArrowLeftRight size={19} />
          <label>
            Second position
            <select
              required
              aria-label={`Team ${team} second position`}
              value={second}
              onChange={(e) => setSecond(e.target.value)}
            >
              <option value="">Choose…</option>
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>
                  P{p} · {playerName(s, team, p, phase)}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button secondary"
            disabled={!ready || !first || !second || first === second}
          >
            Apply swap
          </button>
        </form>
      )}
    </details>
  );
}
function Series({
  id,
  state: s,
  editor,
  ready,
  save,
}: {
  id: string;
  state: Tournament;
  editor: boolean;
  ready: boolean;
  save: (a: Action) => Promise<boolean>;
}) {
  const games = [...gamesFor(s, "semis"), ...gamesFor(s, "finals")].filter(
    (g) => g.series === id,
  );
  const g = games[0];
  if (!g) return null;
  const rows = standings(s, games).filter(
    (r) => r.team === g.a || r.team === g.b,
  );
  const outcome = seriesOutcome(s, id);
  const played = games.filter((g) => s.results[g.id]).length;
  return (
    <section className="series-panel">
      <div className="list-heading">
        <strong>
          {id === "F"
            ? "CHAMPIONSHIP FINAL"
            : id === "P3"
              ? "THIRD PLACE"
              : `SEMIFINAL ${id.slice(-1)}`}
        </strong>
        <span>{played} / 5 games</span>
      </div>
      {rows.map((r) => (
        <div className="series-team" key={r.team}>
          {teamBadge(r.team)}
          <strong title={identity(r.team).name}>
            {identity(r.team).shortName}
          </strong>
          {outcome === r.team && (
            <span className="winner-tag">
              {id === "F" ? "Champion" : "Winner"} <Trophy size={14} />
            </span>
          )}
          <span>
            {r.points} pts <small>PD {signed(r.pd)}</small>
          </span>
        </div>
      ))}
      {outcome === "tie" && (
        <>
          <p className="field-error">
            Tied on win-points and differential. Play a tiebreak to 15.
          </p>
          {editor && <TieForm game={g} ready={ready} save={save} />}
        </>
      )}
      {s.tiebreaks[id] && (
        <>
          <p className="small-note">
            Tiebreak: {g.a} {s.tiebreaks[id].a}–{s.tiebreaks[id].b} {g.b} · P
            {s.tiebreaks[id].positions.join(" + P")}
          </p>
          {editor && (
            <details className="plain-details">
              <summary>Correct tiebreak</summary>
              <TieForm
                key={s.tiebreaks[id].at}
                game={g}
                ready={ready}
                save={save}
              />
            </details>
          )}
        </>
      )}
    </section>
  );
}
function TieForm({
  game: g,
  ready,
  save,
}: {
  game: Game;
  ready: boolean;
  save: (a: Action) => Promise<boolean>;
}) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [positions, setPositions] = useState([1, 2]);
  const [error, setError] = useState("");
  return (
    <form
      noValidate
      className="tie-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const msg = scoreInputError(a, b, true);
        setError(msg || "");
        if (!msg)
          await save({
            type: "tiebreak",
            series: g.series,
            a: +a,
            b: +b,
            positions,
          });
      }}
    >
      <div className="button-row">
        <span>Player positions:</span>
        {positions.map((p, i) => (
          <select
            key={i}
            aria-label={`Tiebreak player position ${i + 1}`}
            value={p}
            onChange={(e) =>
              setPositions(
                positions.map((v, j) => (j === i ? +e.target.value : v)),
              )
            }
          >
            {[1, 2, 3, 4, 5].map((p) => (
              <option key={p} value={p}>
                P{p}
              </option>
            ))}
          </select>
        ))}
        <button
          type="button"
          className="button quiet"
          onClick={() => {
            const nums = new Uint32Array(2);
            crypto.getRandomValues(nums);
            const a = (nums[0] % 5) + 1;
            let b = (nums[1] % 4) + 1;
            if (b >= a) b++;
            setPositions([a, b].sort());
          }}
        >
          Pick randomly
        </button>
      </div>
      <div className="score-inputs">
        <label>
          {identity(g.a).shortName}
          <input
            required
            inputMode="numeric"
            pattern="[0-9]*"
            value={a}
            onChange={(e) => setA(e.target.value)}
          />
        </label>
        <label>
          {identity(g.b).shortName}
          <input
            required
            inputMode="numeric"
            pattern="[0-9]*"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <button
        className="button primary"
        disabled={!ready || positions[0] === positions[1]}
      >
        Save tiebreak
      </button>
    </form>
  );
}
function TeamsView({
  state: s,
  editor,
  ready,
  save,
}: {
  state: Tournament;
  editor: boolean;
  ready: boolean;
  save: (a: Action) => Promise<boolean>;
}) {
  return (
    <>
      <div className="section-intro">
        <h2>Teams & captains</h2>
        <p>
          Official league lineups, listed in P1–P5 order. Use Playoffs for
          position swaps before each playoff round.
        </p>
      </div>

      <div className="team-directory">
        {TEAM_DIRECTORY.map((team) => (
          <section
            className="named-team"
            key={team.id}
            aria-labelledby={`team-${team.id}`}
          >
            <div className="named-team-header">
              <a
                className="team-logo-link"
                href={`/tournament12/${team.logo}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${team.name} logo`}
              >
                <Image
                  unoptimized
                  className="team-logo"
                  src={`/tournament12/${team.logo}`}
                  alt={`${team.name} logo`}
                  width={96}
                  height={96}
                  loading="lazy"
                />
              </a>
              <div>
                <h3 id={`team-${team.id}`}>{team.name}</h3>
                <p>
                  <span>
                    Team {team.scheduleLetter} · {team.abbreviation} · Captain
                  </span>
                  {team.captain}
                </p>
              </div>
            </div>
            <ul
              className="member-list"
              aria-label={`${team.name} league players in P1 to P5 order`}
            >
              {team.members.map((name, i) => (
                <li key={`${team.scheduleLetter}-${i}`}>
                  <span className="member-position">P{i + 1}</span>
                  <span className="member-name">
                    {playerName(s, team.scheduleLetter, i + 1)}
                  </span>
                  {name === team.captainMemberName && <small>Captain</small>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <details className="plain-details">
        <summary>League names & position details</summary>
        <p>
          League positions are fixed. Edit spelling here; use Playoffs to swap
          player positions.
        </p>
        <div className="roster-grid">
          {TEAMS.map((t) => (
            <Roster
              key={t}
              team={t}
              state={s}
              editor={editor}
              ready={ready}
              save={save}
            />
          ))}
        </div>
      </details>
    </>
  );
}
function Roster({
  team: t,
  state: s,
  editor,
  ready,
  save,
}: {
  team: Team;
  state: Tournament;
  editor: boolean;
  ready: boolean;
  save: (a: Action) => Promise<boolean>;
}) {
  const [names, setNames] = useState(() =>
    [1, 2, 3, 4, 5].map((p) => playerName(s, t, p)),
  );
  const [editing, setEditing] = useState(false);
  return (
    <section className="roster-panel">
      <div className="roster-heading">
        {teamBadge(t)}
        <h3 title={identity(t).name}>
          {identity(t).shortName} <small>({t})</small>
        </h3>
        {editor && (
          <button
            className="text-button"
            onClick={() => {
              if (!editing) {
                setNames([1, 2, 3, 4, 5].map((p) => playerName(s, t, p)));
              }
              setEditing(!editing);
            }}
          >
            {editing ? "Close" : "Edit names"}
          </button>
        )}
      </div>
      {editing ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (await save({ type: "names", team: t, names })) {
              setEditing(false);
            }
          }}
        >
          {names.map((name, i) => (
            <label className="name-field" key={i}>
              <span>P{i + 1}</span>
              <input
                aria-label={`Team ${t} player ${i + 1} name`}
                value={name}
                maxLength={80}
                placeholder={`${t}${i + 1}`}
                onChange={(e) => {
                  setNames(names.map((n, j) => (j === i ? e.target.value : n)));
                }}
              />
            </label>
          ))}
          <button className="button secondary wide" disabled={!ready}>
            Save names <Check size={17} />
          </button>
        </form>
      ) : (
        <ol className="lineup-list">
          {[1, 2, 3, 4, 5].map((p) => (
            <li key={p}>
              <span>P{p}</span>
              <strong>{playerName(s, t, p)}</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
function Backup({
  state: s,
  updated,
  stale,
  practice,
}: {
  state: Tournament;
  updated: string;
  stale: boolean;
  practice: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const googleConfigured = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  useEffect(() => {
    if (googleConfigured)
      prepareGoogleExport()
        .then(() => setGoogleReady(true))
        .catch((e) => setError(e.message));
  }, [googleConfigured]);
  return (
    <>
      <div className="section-intro">
        <h2>Spreadsheet exports</h2>
        <p>
          Export scores, standings, each round’s lineups, and swap history.
          Spreadsheet formulas keep league standings working if you continue
          there.
        </p>
      </div>
      {practice && (
        <div className="notice">
          <Info size={20} />
          <p>This export contains practice data from this device.</p>
        </div>
      )}
      {stale && (
        <div className="notice error">
          <WifiOff size={20} />
          <p>
            This is the last available snapshot. It may be missing recent
            results from other devices.
          </p>
        </div>
      )}
      <section className="export-panel">
        <div className="export-icon">
          <ArrowDownToLine size={26} />
        </div>
        <div>
          <h3>Export to Google Sheets</h3>
          <p>
            Create a new, private spreadsheet in your Google account. This is a
            snapshot; edits in Sheets won’t update the app.
          </p>
          <button
            className="button primary"
            disabled={busy || !googleReady}
            onClick={() => {
              setBusy(true);
              setError("");
              setUrl("");
              exportToGoogle(s, updated)
                .then(setUrl)
                .catch((e) => setError(e.message))
                .finally(() => setBusy(false));
            }}
          >
            {busy ? "Exporting…" : "Export to Google Sheets"}
            <ExternalLink size={16} />
          </button>
          {!googleConfigured && (
            <p className="small-note">
              Google export needs its one-time connection. The download below
              works now.
            </p>
          )}
          {url && (
            <a
              className="success-link"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              Spreadsheet ready · open Google Sheets <ExternalLink size={16} />
            </a>
          )}
        </div>
      </section>
      <section className="export-panel">
        <div className="export-icon secondary-icon">
          <ClipboardList size={26} />
        </div>
        <div>
          <h3>Download a spreadsheet</h3>
          <p>
            Works in Google Sheets and Excel. Includes all 60 league fixtures
            and formulas for win-points and standings.
          </p>
          <button
            className="button secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                await downloadWorkbook(s, updated);
              } catch {
                setError(
                  "Couldn’t create the workbook. Use the scores CSV below.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            Download .xlsx <ArrowDownToLine size={17} />
          </button>
        </div>
      </section>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      <div className="backup-extras">
        <button
          className="text-button"
          onClick={() =>
            downloadFile(
              resultsCsv(s),
              "cambrian-scores.csv",
              "text/csv;charset=utf-8",
            )
          }
        >
          Download scores CSV
        </button>
        <button
          className="text-button"
          onClick={() =>
            downloadFile(
              JSON.stringify(
                {
                  exported_at: new Date().toISOString(),
                  snapshot_at: updated,
                  payload: s,
                },
                null,
                2,
              ),
              "cambrian-complete-backup.json",
              "application/json",
            )
          }
        >
          Download complete backup
        </button>
      </div>
      <div className="rules-note">
        <ShieldCheck size={21} />
        <div>
          <strong>Make a backup before each round.</strong>
          <p>
            If you switch to Sheets during the tournament, have every editor
            switch together. Changes in a backup are separate from the app.
          </p>
        </div>
      </div>
      <details className="plain-details">
        <summary>Recent changes</summary>
        <ul className="history-list">
          {s.history.length ? (
            s.history.slice(0, 30).map((h, i) => (
              <li key={i}>
                <strong>{h.note}</strong>
                <span>
                  {h.editor} · {time(h.at)}
                </span>
              </li>
            ))
          ) : (
            <li>No results or lineup changes saved yet.</li>
          )}
        </ul>
      </details>
    </>
  );
}
