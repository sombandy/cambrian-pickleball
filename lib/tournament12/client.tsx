"use client";

import { useEffect, useMemo, useState } from "react";
import { SignInButton, useAuth, useClerk, useUser } from "@clerk/nextjs";
import { Desk } from "./ui";
import { TournamentStore, practiceBackend } from "./store";
import { httpBackend } from "./http-backend";
import { practiceScenario, type Scenario } from "./practice";
import "./scoreboard.css";

function Practice() {
  const store = useMemo(
    () =>
      new TournamentStore(
        practiceBackend(localStorage),
        localStorage,
        "practice",
      ),
    [],
  );
  const [editing, setEditing] = useState(false);
  const [scenario, setScenario] = useState<Scenario>("fresh");
  return (
    <Desk
      store={store}
      practice
      editor={editing}
      draftScope="practice"
      auth={
        <button
          className="button secondary"
          onClick={() => setEditing(!editing)}
        >
          {editing ? "View as player" : "Try score entry"}
        </button>
      }
      practiceTools={
        <details className="practice-tools">
          <summary>Practice scenarios</summary>
          <p>Loading a scenario replaces only this device’s practice scores.</p>
          <label>
            Start at
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as Scenario)}
            >
              <option value="fresh">Empty tournament</option>
              <option value="league-complete">
                League complete · confirm seeds
              </option>
              <option value="semis-setup">
                Semifinals · try position swaps
              </option>
              <option value="finals-setup">Finals · try remaining swaps</option>
            </select>
          </label>
          <button
            className="button secondary"
            onClick={() => {
              localStorage.setItem(
                "cpl12:practice:data",
                JSON.stringify({
                  payload: practiceScenario(scenario),
                  revision: 0,
                  updated_at: new Date().toISOString(),
                }),
              );
              localStorage.removeItem("cpl12:practice");
              localStorage.removeItem("cpl12:practice:pending");
              for (const key of Object.keys(localStorage))
                if (key.startsWith("cpl12:draft:practice:"))
                  localStorage.removeItem(key);
              location.reload();
            }}
          >
            Replace practice data & load
          </button>
        </details>
      }
    />
  );
}
function Live({
  authControl,
  editor = false,
  signedInName,
}: {
  authControl: React.ReactNode;
  editor?: boolean;
  signedInName?: string;
}) {
  const store = useMemo(
    () => new TournamentStore(httpBackend(), localStorage, "railway:12"),
    [],
  );
  return (
    <Desk
      store={store}
      practice={false}
      editor={editor}
      auth={authControl}
      signedInName={signedInName}
      draftScope="railway:12"
    />
  );
}
function AuthenticatedLive() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  // Same rule as the server (editor-auth.ts): account name, else the email's local part.
  const signedInName =
    user?.fullName?.trim() ||
    user?.primaryEmailAddress?.emailAddress.split("@")[0];
  const [editor, setEditor] = useState(false);
  useEffect(() => {
    let active = true;
    const check = async () => {
      if (!isLoaded || !isSignedIn) {
        if (active) setEditor(false);
        return;
      }
      try {
        const allowed = await httpBackend().canEdit!();
        if (active) setEditor(allowed);
      } catch {
        if (active) setEditor(false);
      }
    };
    void check();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void check();
    }, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [isLoaded, isSignedIn, userId]);
  return (
    <Live
      editor={!!isSignedIn && editor}
      signedInName={isSignedIn ? signedInName : undefined}
      authControl={
        isSignedIn ? (
          <button className="button quiet" onClick={() => void signOut()}>
            Sign out
          </button>
        ) : (
          <SignInButton mode="modal">
            <button className="button secondary" disabled={!isLoaded}>
              Editor sign in
            </button>
          </SignInButton>
        )
      }
    />
  );
}
export default function ScoringClient({
  authenticationEnabled,
}: {
  authenticationEnabled: boolean;
}) {
  const practice = new URLSearchParams(location.search).get("practice") === "1";
  return (
    <div className="scoreboard">
      {practice ? (
        <Practice />
      ) : authenticationEnabled ? (
        <AuthenticatedLive />
      ) : (
        <Live
          authControl={
            <a className="button secondary" href="?practice=1">
              Try practice mode
            </a>
          }
        />
      )}
    </div>
  );
}
