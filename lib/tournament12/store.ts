import {
  applyAction,
  initialTournament,
  fillOfficialLeagueNames,
  type Action,
  type Tournament,
} from "./domain";
import { isTournament } from "./validate";

export interface Snapshot {
  payload: Tournament;
  revision: number;
  updated_at: string;
}
export interface Write {
  action: Action;
  payload: Tournament;
  revision: number;
  operation: string;
  editor: string;
}
export interface Backend {
  load(): Promise<Snapshot>;
  save(write: Write): Promise<Snapshot>;
  canEdit?(): Promise<boolean>;
}
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export interface StoreState {
  snapshot: Snapshot;
  loading: boolean;
  saving: boolean;
  stale: boolean;
  error: string;
  pending: boolean;
  lastSync: string | null;
}
const seedSnapshot = (): Snapshot => ({
  payload: initialTournament(),
  revision: 0,
  updated_at: new Date().toISOString(),
});
const isSnapshot = (v: unknown): v is Snapshot =>
  !!v &&
  typeof v === "object" &&
  "payload" in v &&
  isTournament((v as Snapshot).payload) &&
  Number.isInteger((v as Snapshot).revision) &&
  (v as Snapshot).revision >= 0 &&
  typeof (v as Snapshot).updated_at === "string";
const read = (storage: StorageLike | undefined, key: string) => {
  try {
    return JSON.parse(storage?.getItem(key) || "null");
  } catch {
    return null;
  }
};
export class TournamentStore {
  private listeners = new Set<() => void>();
  private pendingWrite: Write | null;
  private loadingRequest: Promise<void> | null = null;
  private state: StoreState;
  private key: string;
  constructor(
    private backend: Backend,
    private storage?: StorageLike,
    namespace = "live",
  ) {
    this.key = `cpl12:${namespace}`;
    const cache = read(storage, this.key);
    const pending = read(storage, this.key + ":pending");
    this.pendingWrite =
      isTournament(pending?.payload) &&
      pending?.action &&
      Number.isInteger(pending.revision) &&
      typeof pending.operation === "string" &&
      typeof pending.editor === "string"
        ? pending
        : null;
    this.state = {
      snapshot: isSnapshot(cache) ? cache : seedSnapshot(),
      loading: true,
      saving: false,
      stale: true,
      error: "",
      pending: !!this.pendingWrite,
      lastSync: null,
    };
  }
  getSnapshot = () => this.state;
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  private emit(patch: Partial<StoreState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn());
  }
  private cache(key: string, value: unknown) {
    try {
      if (value === null) this.storage?.removeItem(key);
      else this.storage?.setItem(key, JSON.stringify(value));
    } catch {
      /* A failed cache never turns a confirmed server write into a failed save. */
    }
  }
  private accept(snapshot: Snapshot) {
    if (!isSnapshot(snapshot))
      throw new Error(
        "The scoreboard returned unexpected data. Please refresh.",
      );
    if (snapshot.revision >= this.state.snapshot.revision) {
      this.cache(this.key, snapshot);
      this.emit({ snapshot });
    }
    this.emit({
      stale: false,
      loading: false,
      lastSync: new Date().toISOString(),
    });
  }
  refresh = (): Promise<void> => {
    if (this.loadingRequest) return this.loadingRequest;
    this.loadingRequest = (async () => {
      try {
        this.accept(await this.backend.load());
        this.emit({
          error: this.pendingWrite
            ? "A previous save is unconfirmed. Use “Check save” before entering another result."
            : "",
        });
      } catch {
        this.emit({
          loading: false,
          stale: true,
          error:
            "Couldn’t reach the scoreboard. Showing the last available scores. Your entries are kept on this device.",
        });
      } finally {
        this.loadingRequest = null;
      }
    })();
    return this.loadingRequest;
  };
  save = async (action: Action, editor: string) => {
    if (this.state.saving) throw new Error("A save is already in progress.");
    if (this.pendingWrite)
      throw new Error(
        "Check your previous save before entering another result.",
      );
    if (this.state.loading || this.state.stale)
      throw new Error(
        "Reconnect and refresh the scoreboard before saving. Your entries are kept here.",
      );
    const payload = applyAction(this.state.snapshot.payload, action, editor);
    const write = {
      action,
      payload,
      revision: this.state.snapshot.revision,
      operation: crypto.randomUUID(),
      editor,
    };
    this.pendingWrite = write;
    this.cache(this.key + ":pending", write);
    this.emit({ saving: true, pending: true, error: "" });
    await this.send(write);
  };
  retry = async () => {
    if (!this.pendingWrite || this.state.saving) return;
    this.emit({ saving: true, error: "" });
    await this.send(this.pendingWrite);
  };
  private async send(write: Write) {
    try {
      this.accept(await this.backend.save(write));
      this.pendingWrite = null;
      this.cache(this.key + ":pending", null);
      this.emit({ pending: false, error: "" });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes("STALE_STATE")) {
        this.pendingWrite = null;
        this.cache(this.key + ":pending", null);
        this.emit({ pending: false });
        await this.refresh();
        this.emit({
          error:
            "Another result was saved first. Review the latest scores, then save your entry again.",
        });
      } else if (message.includes("NOT_EDITOR")) {
        this.pendingWrite = null;
        this.cache(this.key + ":pending", null);
        this.emit({
          pending: false,
          error:
            "This account cannot edit. Sign in with an email on the scorer list.",
        });
      } else if (
        message.includes("INVALID_DATA") ||
        message.includes("OPERATION_CONFLICT")
      ) {
        this.pendingWrite = null;
        this.cache(this.key + ":pending", null);
        this.emit({
          pending: false,
          error:
            "The server rejected this entry. Refresh and check the scores.",
        });
      } else {
        this.emit({
          stale: true,
          error:
            "We couldn’t confirm your save. Your entry is kept here. Reconnect, then tap “Check save”; don’t enter it again.",
        });
      }
      throw new Error(this.state.error);
    } finally {
      this.emit({ saving: false });
    }
  }
}
export function practiceBackend(
  storage: StorageLike,
  namespace = "practice",
): Backend {
  const key = `cpl12:${namespace}:data`;
  return {
    async load() {
      const cached = read(storage, key);
      const current = isSnapshot(cached) ? cached : seedSnapshot();
      const payload = fillOfficialLeagueNames(current.payload);
      if (payload === current.payload) return current;
      const at = new Date().toISOString();
      payload.history = [
        {
          at,
          editor: "Tournament setup",
          note: "Applied official league player positions",
        },
        ...payload.history,
      ].slice(0, 200);
      const migrated = {
        payload,
        revision: current.revision + 1,
        updated_at: at,
      };
      storage.setItem(key, JSON.stringify(migrated));
      return migrated;
    },
    async save(w) {
      const current = await this.load();
      if (read(storage, key + ":operation") === w.operation) return current;
      if (current.revision !== w.revision) throw new Error("STALE_STATE");
      const next = {
        payload: w.payload,
        revision: current.revision + 1,
        updated_at: new Date().toISOString(),
      };
      storage.setItem(key, JSON.stringify(next));
      storage.setItem(key + ":operation", JSON.stringify(w.operation));
      return next;
    },
  };
}
