import { test } from "node:test";
import assert from "node:assert/strict";
import { initialTournament } from "./domain";
import {
  TournamentStore,
  practiceBackend,
  type Backend,
  type Snapshot,
  type StorageLike,
  type Write,
} from "./store";
import { practiceScenario } from "./practice";
import { applyAction } from "./domain";
class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}
function service() {
  let snapshot: Snapshot = {
    payload: initialTournament(),
    revision: 0,
    updated_at: new Date().toISOString(),
  };
  const operations = new Set<string>();
  let saves = 0;
  const backend: Backend = {
    async load() {
      return structuredClone(snapshot);
    },
    async save(w: Write) {
      saves++;
      if (operations.has(w.operation)) return structuredClone(snapshot);
      if (w.revision !== snapshot.revision) throw new Error("STALE_STATE");
      operations.add(w.operation);
      snapshot = {
        payload: w.payload,
        revision: snapshot.revision + 1,
        updated_at: new Date().toISOString(),
      };
      return structuredClone(snapshot);
    },
  };
  return {
    backend,
    get snapshot() {
      return snapshot;
    },
    get saves() {
      return saves;
    },
  };
}
test("a failed initial load never opens an editable empty tournament", async () => {
  const backend: Backend = {
    async load() {
      throw new Error("offline");
    },
    async save() {
      throw new Error("unexpected");
    },
  };
  const store = new TournamentStore(backend, new MemoryStorage());
  await store.refresh();
  assert.equal(store.getSnapshot().stale, true);
  await assert.rejects(
    store.save({ type: "score", id: "L1", a: 21, b: 10 }, "Editor"),
    /Reconnect/,
  );
});
test("do not show an unconfirmed score as saved; retries reuse the exact operation", async () => {
  const svc = service();
  const backend: Backend = {
    ...svc.backend,
    async save(w) {
      await svc.backend.save(w);
      throw new Error("response lost");
    },
  };
  const store = new TournamentStore(backend, new MemoryStorage());
  await store.refresh();
  await assert.rejects(
    store.save({ type: "score", id: "L1", a: 21, b: 10 }, "Editor"),
    /couldn’t confirm/,
  );
  assert.equal(store.getSnapshot().snapshot.revision, 0);
  assert.equal(store.getSnapshot().pending, true);
  assert.equal(svc.snapshot.revision, 1);
  backend.save = svc.backend.save;
  await store.retry();
  assert.equal(store.getSnapshot().snapshot.revision, 1);
  assert.equal(svc.snapshot.payload.history.length, 1);
  assert.equal(store.getSnapshot().pending, false);
});
test("pending save survives a browser reload and can be checked safely", async () => {
  const svc = service(),
    storage = new MemoryStorage();
  const backend = {
    ...svc.backend,
    async save(w: Write) {
      await svc.backend.save(w);
      throw new Error("timeout");
    },
  };
  const first = new TournamentStore(backend, storage);
  await first.refresh();
  await assert.rejects(
    first.save({ type: "score", id: "L1", a: 21, b: 10 }, "Editor"),
  );
  const reopened = new TournamentStore(svc.backend, storage);
  await reopened.refresh();
  assert.equal(reopened.getSnapshot().pending, true);
  await reopened.retry();
  assert.equal(svc.snapshot.revision, 1);
  assert.equal(reopened.getSnapshot().pending, false);
});
test("two editors with stale snapshots cannot overwrite each other", async () => {
  const svc = service();
  const a = new TournamentStore(svc.backend),
    b = new TournamentStore(svc.backend);
  await Promise.all([a.refresh(), b.refresh()]);
  await a.save({ type: "score", id: "L1", a: 21, b: 10 }, "A");
  await assert.rejects(
    b.save({ type: "score", id: "L2", a: 21, b: 12 }, "B"),
    /Another result/,
  );
  assert.equal(b.getSnapshot().snapshot.payload.results.L1.a, 21);
  assert.equal(b.getSnapshot().pending, false);
  await b.save({ type: "score", id: "L2", a: 21, b: 12 }, "B");
  assert.equal(Object.keys(svc.snapshot.payload.results).length, 2);
});
test("double taps trigger only one write while a request is pending", async () => {
  const svc = service();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const backend = {
    ...svc.backend,
    async save(w: Write) {
      await gate;
      return svc.backend.save(w);
    },
  };
  const store = new TournamentStore(backend);
  await store.refresh();
  const write = store.save({ type: "score", id: "L1", a: 21, b: 10 }, "Editor");
  await assert.rejects(
    store.save({ type: "score", id: "L1", a: 21, b: 10 }, "Editor"),
    /progress/,
  );
  release();
  await write;
  assert.equal(svc.saves, 1);
});
test("stale read responses never replace newer confirmed saves", async () => {
  const svc = service();
  let release!: () => void;
  let delayed = false;
  const backend = {
    ...svc.backend,
    async load() {
      const old = await svc.backend.load();
      if (delayed)
        await new Promise<void>((r) => {
          release = r;
        });
      return old;
    },
  };
  const store = new TournamentStore(backend);
  await store.refresh();
  delayed = true;
  const refresh = store.refresh();
  await new Promise((r) => setTimeout(r, 0));
  await store.save({ type: "score", id: "L1", a: 21, b: 10 }, "Editor");
  release();
  await refresh;
  assert.equal(store.getSnapshot().snapshot.revision, 1);
});
test("storage quota errors cannot turn a confirmed server save into failure", async () => {
  const svc = service();
  const storage: StorageLike = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error("quota");
    },
    removeItem() {
      throw new Error("quota");
    },
  };
  const store = new TournamentStore(svc.backend, storage);
  await store.refresh();
  await store.save({ type: "score", id: "L1", a: 21, b: 10 }, "Editor");
  assert.equal(store.getSnapshot().snapshot.revision, 1);
});
test("malformed server data cannot crash the UI or open an editable scoreboard", async () => {
  const svc = service();
  const backend = {
    ...svc.backend,
    async load() {
      return {
        payload: { version: 1 },
        revision: 1,
        updated_at: "now",
      } as Snapshot;
    },
  };
  const store = new TournamentStore(backend);
  await store.refresh();
  assert.equal(store.getSnapshot().stale, true);
  assert.equal(store.getSnapshot().snapshot.revision, 0);
  await assert.rejects(
    store.save({ type: "score", id: "L1", a: 21, b: 10 }, "Organizer"),
    /Reconnect/,
  );
});
test("older device previews gain official names without losing scores, custom names or playoff swaps", async () => {
  const storage = new MemoryStorage();
  let legacy = practiceScenario("semis-setup");
  legacy = applyAction(
    legacy,
    { type: "swap", team: "A", first: 1, second: 3 },
    "Test",
  );
  for (const names of Object.values(legacy.players)) names.fill("");
  legacy.players.B[3] = "Som (custom spelling)";
  storage.setItem(
    "cpl12:upgrade:data",
    JSON.stringify({
      payload: legacy,
      revision: 8,
      updated_at: new Date().toISOString(),
    }),
  );
  const backend = practiceBackend(storage, "upgrade");
  const migrated = await backend.load();
  assert.equal(migrated.revision, 9);
  assert.equal(migrated.payload.players.A[0], "Sharan Jayadevaiah");
  assert.equal(migrated.payload.players.B[3], "Som (custom spelling)");
  assert.deepEqual(migrated.payload.results, legacy.results);
  assert.deepEqual(migrated.payload.lineups, legacy.lineups);
  assert.deepEqual(migrated.payload.swaps, legacy.swaps);
  const repeat = await backend.load();
  assert.equal(repeat.revision, 9);
  assert.deepEqual(repeat.payload, migrated.payload);
});
test("revised league order updates only the two prior pairs without consuming playoff swaps", async () => {
  const storage = new MemoryStorage();
  const legacy = initialTournament();
  [legacy.players.A[2], legacy.players.A[3]] = [
    "Kaushik Ram",
    "Naresh Ramaiya",
  ];
  [legacy.players.C[2], legacy.players.C[3]] = ["Monish", "Ankit Agarwal"];
  legacy.results.L1 = {
    a: 23,
    b: 22,
    editor: "Test",
    at: new Date().toISOString(),
  };
  storage.setItem(
    "cpl12:revision:data",
    JSON.stringify({
      payload: legacy,
      revision: 3,
      updated_at: new Date().toISOString(),
    }),
  );
  const backend = practiceBackend(storage, "revision");
  const revised = await backend.load();
  assert.equal(revised.revision, 4);
  assert.deepEqual(revised.payload.players.A.slice(2, 4), [
    "Naresh Ramaiya",
    "Kaushik Ram",
  ]);
  assert.deepEqual(revised.payload.players.C.slice(2, 4), [
    "Ankit Agarwal",
    "Monish",
  ]);
  for (const t of ["B", "D", "E", "F"] as const)
    assert.deepEqual(revised.payload.players[t], legacy.players[t]);
  assert.deepEqual(revised.payload.results, legacy.results);
  assert.deepEqual(revised.payload.swaps, legacy.swaps);
  assert.deepEqual(revised.payload.lineups, legacy.lineups);
  assert.deepEqual(await backend.load(), revised);
});
