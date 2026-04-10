import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const CLUB_LOGO_PUBLIC_URL =
  "https://ssv-hoechstaedt.de/wp-content/uploads/2022/01/ssv-logo_transparent.png";

type Player = {
  id: string;
  name: string;
  team?: string;
  role?: string;
  password?: string;
  pass_number?: string;
};

type Tournament = {
  id: string;
  title: string;
  date: string;
  registration_time?: string;
  start_time?: string;
  location?: string;
  team_name?: string;
  tournamentType?: string;
  has_passes?: string;
  notes?: string;
};

type Entry = {
  id: string;
  player_name: string;
  team?: string;
  tournament_id: string;
  status: string;
};

const teamOptions = [
  "1. Mannschaft",
  "2. Mannschaft",
  "3. Mannschaft",
  "4. Mannschaft",
  "Damen-Mannschaft",
  "Ü50-Mannschaft",
  "Gemischtes Team",
];

const timeOptions = Array.from({ length: 32 }, (_, i) => {
  const hour = String(6 + Math.floor(i / 2)).padStart(2, "0");
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour}:${minute} Uhr`;
});

const COLORS = {
  red: "#d90416",
  redDark: "#a50312",
  blue: "#022b45",
  blueSoft: "#0a466d",
  yellow: "#f2c200",
  yellowSoft: "#fff4bf",
  white: "#ffffff",
  line: "#d8dee6",
  bg: "#f4f6f9",
  card: "#ffffff",
  soft: "#f8fafc",
  text: "#10253a",
  muted: "#5b6b7c",
  green: "#1fa34a",
  orange: "#d97706",
};

function formatDate(dateValue: string) {
  if (!dateValue) return "-";
  const parts = dateValue.split("-");
  if (parts.length !== 3) return dateValue;
  const [year, month, day] = parts;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const weekdays = ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."];
  return `${weekdays[date.getDay()]} ${day}.${month}.${year}`;
}

function normalizePassNumber(value: string) {
  return value.trim();
}

function shellStyle(isMobile: boolean): React.CSSProperties {
  return {
    minHeight: "100vh",
    background: `linear-gradient(180deg, ${COLORS.bg} 0%, #eef2f7 100%)`,
    padding: isMobile ? 12 : 20,
    fontFamily: "Arial, sans-serif",
    color: COLORS.text,
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
  };
}

function cardStyle(): React.CSSProperties {
  return {
    background: COLORS.card,
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 10px 24px rgba(2,43,69,0.08)",
    border: `1px solid ${COLORS.line}`,
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
  };
}

function inputStyle(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    display: "block",
    padding: 11,
    borderRadius: 10,
    border: `1px solid ${COLORS.line}`,
    boxSizing: "border-box",
    background: "#fffdf2",
    outline: "none",
    fontSize: 16,
    appearance: "none" as any,
    WebkitAppearance: "none" as any,
    ...extra,
  };
}

function selectStyle(extra: React.CSSProperties = {}): React.CSSProperties {
  return inputStyle({ background: "#f6fbff", ...extra });
}

function primaryButton(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    background: COLORS.red,
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    boxSizing: "border-box",
    ...extra,
  };
}

function successButton(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    ...primaryButton(),
    background: COLORS.green,
    ...extra,
  };
}

function warnButton(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    ...primaryButton(),
    background: COLORS.orange,
    ...extra,
  };
}

function dangerButton(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    ...primaryButton(),
    background: COLORS.red,
    ...extra,
  };
}

function mutedButton(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    ...primaryButton(),
    background: COLORS.blueSoft,
    ...extra,
  };
}

function sectionTitleStyle(): React.CSSProperties {
  return {
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 14,
    color: COLORS.blue,
  };
}

function detailBoxStyle(): React.CSSProperties {
  return {
    background: COLORS.soft,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
  };
}

function detailRowStyle(isMobile: boolean): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "190px minmax(0, 1fr)",
    gap: isMobile ? 4 : 14,
    alignItems: "start",
    padding: "7px 0",
    borderBottom: `1px solid ${COLORS.line}`,
    minWidth: 0,
  };
}

function detailLabelStyle(isMobile: boolean): React.CSSProperties {
  return {
    fontWeight: 700,
    color: COLORS.blue,
    whiteSpace: isMobile ? "normal" : "nowrap",
    textAlign: "left",
    minWidth: 0,
  };
}

function detailValueStyle(): React.CSSProperties {
  return {
    color: COLORS.text,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    textAlign: "left",
    minWidth: 0,
  };
}

function statusBadgeStyle(status: string): React.CSSProperties {
  const isDabei = status === "dabei";
  return {
    padding: "5px 10px",
    borderRadius: 999,
    background: isDabei ? COLORS.green : COLORS.orange,
    color: "white",
    fontWeight: 700,
    fontSize: 13,
    whiteSpace: "nowrap",
    display: "inline-block",
  };
}

function tableWrapStyle(): React.CSSProperties {
  return {
    border: `1px solid ${COLORS.line}`,
    borderRadius: 14,
    overflow: "hidden",
    background: COLORS.white,
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    boxSizing: "border-box",
  };
}

function tableHeaderStyle(columns: string): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: columns,
    gap: 12,
    alignItems: "center",
    padding: "12px 14px",
    background: COLORS.blue,
    borderBottom: `1px solid ${COLORS.blue}`,
    fontWeight: 800,
    color: COLORS.white,
    textAlign: "left",
    minWidth: 0,
    boxSizing: "border-box",
  };
}

function tableRowStyle(
  columns: string,
  striped: boolean,
  isLast: boolean
): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: columns,
    gap: 12,
    alignItems: "center",
    padding: "12px 14px",
    background: striped ? "#f8fafc" : COLORS.white,
    borderBottom: isLast ? "none" : `1px solid ${COLORS.line}`,
    textAlign: "left",
    minWidth: 0,
    boxSizing: "border-box",
  };
}

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<Player | null>(null);

  const [activeTournamentId, setActiveTournamentId] = useState("");

  const [adminTab, setAdminTab] = useState<
    "turniere" | "spieler" | "einstellungen"
  >("turniere");
  const [appTitle, setAppTitle] = useState("SSV Höchstädt Turnierplanung");
  const [titleInput, setTitleInput] = useState("SSV Höchstädt Turnierplanung");
  const [clubLogo] = useState(CLUB_LOGO_PUBLIC_URL);
  const [loadError, setLoadError] = useState("");

  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerRole, setPlayerRole] = useState("Spieler");
  const [playerPassword, setPlayerPassword] = useState("");
  const [playerPassNumber, setPlayerPassNumber] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerSort, setPlayerSort] = useState<
    "name_asc" | "name_desc" | "pass_asc" | "pass_desc"
  >("name_asc");

  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(
    null
  );
  const [tournamentTitle, setTournamentTitle] = useState("");
  const [tournamentDate, setTournamentDate] = useState("");
  const [registrationTime, setRegistrationTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState("");
  const [teamName, setTeamName] = useState("1. Mannschaft");
  const [tournamentType, setTournamentType] = useState("Freies-Turnier");
  const [hasPasses, setHasPasses] = useState("ja");
  const [notes, setNotes] = useState("");

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 900 : false
  );

  useEffect(() => {
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.width = "100%";
    document.documentElement.style.maxWidth = "100%";
    document.documentElement.style.overflowX = "hidden";
    document.documentElement.style.boxSizing = "border-box";

    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.width = "100%";
    document.body.style.maxWidth = "100%";
    document.body.style.overflowX = "hidden";
    document.body.style.boxSizing = "border-box";

    const root = document.getElementById("root");
    if (root) {
      root.style.margin = "0";
      root.style.padding = "0";
      root.style.width = "100%";
      root.style.maxWidth = "100%";
      root.style.overflowX = "hidden";
      root.style.boxSizing = "border-box";
    }

    const savedTitle = localStorage.getItem("turnierplanung_app_title");
    if (savedTitle) {
      setAppTitle(savedTitle);
      setTitleInput(savedTitle);
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    void loadAll();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function loadAll() {
    setLoading(true);
    setLoadError("");

    try {
      const [p, t, e] = await Promise.all([
        supabase.from("players").select("*").order("name"),
        supabase.from("tournaments").select("*").order("date"),
        supabase.from("entries").select("*").order("created_at"),
      ]);

      if (p.error) {
        throw new Error(`Spieler konnten nicht geladen werden: ${p.error.message}`);
      }
      if (t.error) {
        throw new Error(`Turniere konnten nicht geladen werden: ${t.error.message}`);
      }
      if (e.error) {
        throw new Error(`Einträge konnten nicht geladen werden: ${e.error.message}`);
      }

      const loadedPlayers = (p.data as Player[]) || [];
      const loadedTournaments = (t.data as Tournament[]) || [];
      const loadedEntries = (e.data as Entry[]) || [];

      setPlayers(loadedPlayers);
      setTournaments(loadedTournaments);
      setEntries(loadedEntries);

      setSelectedPlayerId((current) => {
        if (
          current &&
          loadedPlayers.some((pl) => String(pl.id) === String(current))
        ) {
          return current;
        }
        return loadedPlayers[0]?.id || "";
      });

      setActiveTournamentId((current) => {
        if (
          current &&
          loadedTournaments.some((tr) => String(tr.id) === String(current))
        ) {
          return current;
        }
        return loadedTournaments[0]?.id || "";
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unbekannter Fehler beim Laden.";
      setLoadError(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const selectedPlayer =
    players.find((p) => String(p.id) === String(selectedPlayerId)) || null;

  const activeTournament =
    tournaments.find((t) => String(t.id) === String(activeTournamentId)) || null;

  const isAdmin =
    (currentUser?.role || "").toLowerCase() === "admin" ||
    (currentUser?.name || "").toLowerCase().includes("admin");

  const activeEntries = useMemo(() => {
    if (!activeTournament) return [];
    return entries
      .filter((e) => String(e.tournament_id) === String(activeTournament.id))
      .sort((a, b) => a.player_name.localeCompare(b.player_name, "de"));
  }, [entries, activeTournament]);

  const myEntry = useMemo(() => {
    if (!currentUser || !activeTournament) return null;
    return activeEntries.find((e) => e.player_name === currentUser.name) || null;
  }, [activeEntries, currentUser, activeTournament]);

  const filteredAndSortedPlayers = useMemo(() => {
    const q = playerSearch.trim().toLowerCase();

    const filtered = players.filter((p) => {
      if (!q) return true;
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.pass_number || "").toLowerCase().includes(q) ||
        (p.role || "").toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      const passA = (a.pass_number || "").toLowerCase();
      const passB = (b.pass_number || "").toLowerCase();

      switch (playerSort) {
        case "name_desc":
          return nameB.localeCompare(nameA, "de");
        case "pass_asc":
          return (
            passA.localeCompare(passB, "de", { numeric: true }) ||
            nameA.localeCompare(nameB, "de")
          );
        case "pass_desc":
          return (
            passB.localeCompare(passA, "de", { numeric: true }) ||
            nameA.localeCompare(nameB, "de")
          );
        default:
          return nameA.localeCompare(nameB, "de");
      }
    });
  }, [players, playerSearch, playerSort]);

  function getPassNumberByPlayerName(playerNameValue: string) {
    const player = players.find((p) => p.name === playerNameValue);
    return player?.pass_number || "-";
  }

  function login() {
    if (!selectedPlayer) {
      alert("Kein Spieler ausgewählt.");
      return;
    }

    if ((selectedPlayer.password || "") === password) {
      setCurrentUser(selectedPlayer);
      setPassword("");
    } else {
      alert("Falsches Passwort");
    }
  }

  function logout() {
    setCurrentUser(null);
    setPassword("");
  }

  async function saveStatus(status: string) {
    if (!currentUser || !activeTournament) return;

    if (myEntry) {
      const { error } = await supabase
        .from("entries")
        .update({
          status,
          team: currentUser.team || "",
        })
        .eq("id", myEntry.id);

      if (error) {
        alert("Fehler beim Speichern: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("entries").insert({
        player_name: currentUser.name,
        team: currentUser.team || "",
        tournament_id: activeTournament.id,
        status,
      });

      if (error) {
        alert("Fehler beim Speichern: " + error.message);
        return;
      }
    }

    await loadAll();
  }

  async function deleteMyEntry() {
    if (!myEntry) return;

    const { error } = await supabase.from("entries").delete().eq("id", myEntry.id);
    if (error) {
      alert("Fehler beim Löschen: " + error.message);
      return;
    }

    await loadAll();
  }

  function resetPlayerForm() {
    setEditingPlayerId(null);
    setPlayerName("");
    setPlayerRole("Spieler");
    setPlayerPassword("");
    setPlayerPassNumber("");
  }

  function editPlayer(player: Player) {
    setEditingPlayerId(player.id);
    setPlayerName(player.name || "");
    setPlayerRole(player.role || "Spieler");
    setPlayerPassword(player.password || "");
    setPlayerPassNumber(player.pass_number || "");
    setAdminTab("spieler");
  }

  async function savePlayer() {
    if (!playerName || !playerPassword) {
      alert("Name und Passwort bitte ausfüllen.");
      return;
    }

    const normalizedPassNumber = normalizePassNumber(playerPassNumber);

    if (!normalizedPassNumber) {
      alert("Bitte eine Passnummer eingeben.");
      return;
    }

    const duplicatePlayer = players.find((p) => {
      if (editingPlayerId && String(p.id) === String(editingPlayerId)) return false;
      return normalizePassNumber(p.pass_number || "") === normalizedPassNumber;
    });

    if (duplicatePlayer) {
      alert(`Diese Passnummer ist bereits vergeben: ${normalizedPassNumber}`);
      return;
    }

    if (editingPlayerId) {
      const { error } = await supabase
        .from("players")
        .update({
          name: playerName,
          role: playerRole,
          password: playerPassword,
          pass_number: normalizedPassNumber,
        })
        .eq("id", editingPlayerId);

      if (error) {
        alert("Fehler beim Bearbeiten des Spielers: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("players").insert({
        name: playerName,
        role: playerRole,
        password: playerPassword,
        pass_number: normalizedPassNumber,
      });

      if (error) {
        alert("Fehler beim Anlegen des Spielers: " + error.message);
        return;
      }
    }

    resetPlayerForm();
    await loadAll();
  }

  async function deletePlayer(id: string, name: string) {
    if (currentUser?.id === id) {
      alert("Der aktuell angemeldete Admin kann nicht gelöscht werden.");
      return;
    }

    await supabase.from("entries").delete().eq("player_name", name);

    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) {
      alert("Fehler beim Löschen des Spielers: " + error.message);
      return;
    }

    await loadAll();
  }

  function resetTournamentForm() {
    setEditingTournamentId(null);
    setTournamentTitle("");
    setTournamentDate("");
    setRegistrationTime("");
    setStartTime("");
    setLocation("");
    setTeamName("1. Mannschaft");
    setTournamentType("Freies-Turnier");
    setHasPasses("ja");
    setNotes("");
  }

  function editTournament(tournament: Tournament) {
    setEditingTournamentId(tournament.id);
    setTournamentTitle(tournament.title || "");
    setTournamentDate(tournament.date || "");
    setRegistrationTime(tournament.registration_time || "");
    setStartTime(tournament.start_time || "");
    setLocation(tournament.location || "");
    setTeamName(tournament.team_name || "1. Mannschaft");
    setTournamentType(tournament.tournamentType || "Freies-Turnier");
    setHasPasses(tournament.has_passes || "ja");
    setNotes(tournament.notes || "");
    setAdminTab("turniere");
  }

  async function saveTournament() {
    if (!tournamentTitle || !tournamentDate) {
      alert("Turniername und Datum bitte ausfüllen.");
      return;
    }

    const payload = {
      title: tournamentTitle,
      date: tournamentDate,
      registration_time: registrationTime,
      start_time: startTime,
      location,
      team_name: teamName,
      tournamentType,
      has_passes: hasPasses,
      notes,
    };

    if (editingTournamentId) {
      const { error } = await supabase
        .from("tournaments")
        .update(payload)
        .eq("id", editingTournamentId);

      if (error) {
        alert("Fehler beim Bearbeiten des Turniers: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("tournaments").insert(payload);

      if (error) {
        alert("Fehler beim Anlegen des Turniers: " + error.message);
        return;
      }
    }

    resetTournamentForm();
    await loadAll();
  }

  async function deleteTournament(id: string) {
    await supabase.from("entries").delete().eq("tournament_id", id);

    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) {
      alert("Fehler beim Löschen des Turniers: " + error.message);
      return;
    }

    await loadAll();
  }

  function saveSettings() {
    const finalTitle = titleInput || "SSV Höchstädt Turnierplanung";
    setAppTitle(finalTitle);
    localStorage.setItem("turnierplanung_app_title", finalTitle);
    alert("Einstellungen gespeichert.");
  }

  if (loading) {
    return <div style={shellStyle(isMobile)}>Daten werden geladen...</div>;
  }

  if (loadError) {
    return (
      <div style={shellStyle(isMobile)}>
        <div style={{ ...cardStyle(), maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ marginTop: 0, color: COLORS.red }}>Fehler beim Laden</h2>
          <div style={{ color: COLORS.redDark, marginBottom: 14 }}>{loadError}</div>
          <button onClick={() => void loadAll()} style={primaryButton()}>
            Erneut laden
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div
        style={{
          ...shellStyle(isMobile),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            ...cardStyle(),
            width: "100%",
            maxWidth: 460,
            textAlign: "center",
          }}
        >
          {clubLogo ? (
            <img
              src={clubLogo}
              alt="Logo"
              style={{
                width: 82,
                height: 82,
                objectFit: "cover",
                borderRadius: 16,
                marginBottom: 14,
                border: `2px solid ${COLORS.red}`,
              }}
            />
          ) : null}

          <h1
            style={{
              marginTop: 0,
              fontSize: isMobile ? 28 : 38,
              lineHeight: 1.15,
              color: COLORS.blue,
              wordBreak: "break-word",
            }}
          >
            {appTitle}
          </h1>

          <p style={{ color: COLORS.muted, fontSize: 17 }}>Bitte melde dich an.</p>

          {players.length === 0 ? (
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: COLORS.yellowSoft,
                border: `1px solid ${COLORS.yellow}`,
                color: COLORS.blue,
              }}
            >
              Es sind noch keine Spieler vorhanden.
            </div>
          ) : (
            <>
              <select
                value={selectedPlayerId}
                style={selectStyle({ marginBottom: 12 })}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.role ? ` - ${p.role}` : ""}
                  </option>
                ))}
              </select>

              <input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") login();
                }}
                style={inputStyle({ marginBottom: 12 })}
              />

              <button onClick={login} style={{ ...primaryButton(), width: "100%" }}>
                Anmelden
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div style={shellStyle(isMobile)}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 20,
            flexWrap: "wrap",
            background: COLORS.white,
            borderRadius: 18,
            padding: isMobile ? 14 : "18px 20px",
            boxShadow: "0 8px 22px rgba(2,43,69,0.08)",
            border: `1px solid ${COLORS.line}`,
            width: "100%",
            minWidth: 0,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              minWidth: 0,
              flex: "1 1 auto",
            }}
          >
            {clubLogo ? (
              <img
                src={clubLogo}
                alt="Logo"
                style={{
                  height: isMobile ? 54 : 64,
                  width: isMobile ? 54 : 64,
                  borderRadius: 12,
                  objectFit: "cover",
                  border: `2px solid ${COLORS.red}`,
                  flexShrink: 0,
                }}
              />
            ) : null}

            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: isMobile ? 20 : 30,
                  lineHeight: 1.15,
                  color: COLORS.blue,
                  wordBreak: "break-word",
                }}
              >
                {appTitle}
              </h1>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: isMobile ? "stretch" : "center",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              width: isMobile ? "100%" : "auto",
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: 15,
                color: COLORS.muted,
                textAlign: isMobile ? "left" : "right",
                lineHeight: 1.35,
                minWidth: 0,
                flex: isMobile ? "1 1 100%" : "0 1 auto",
                wordBreak: "break-word",
              }}
            >
              Angemeldet als <strong style={{ color: COLORS.blue }}>{currentUser.name}</strong>
              {currentUser.role ? ` · ${currentUser.role}` : ""}
            </div>

            <button
              onClick={logout}
              style={dangerButton({ width: isMobile ? "100%" : "auto" })}
            >
              Abmelden
            </button>
          </div>
        </div>

        <div style={{ ...cardStyle(), padding: 0, overflow: "hidden" }}>
          <div
            style={{
              background: COLORS.blue,
              padding: isMobile ? "14px" : "14px 16px",
              borderBottom: `1px solid ${COLORS.blue}`,
            }}
          >
            <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 800, color: COLORS.white }}>
              Admin-Bereich
            </div>
            <div style={{ fontSize: 13, color: "#d7e4ef", marginTop: 4 }}>
              Verwaltung von Turnieren, Spielern und Einstellungen
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              padding: isMobile ? 12 : 16,
              flexWrap: "wrap",
              borderBottom: `1px solid ${COLORS.line}`,
              background: "#f7fafc",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <button
              onClick={() => setAdminTab("turniere")}
              style={adminTab === "turniere" ? primaryButton() : mutedButton()}
            >
              Turniere
            </button>

            <button
              onClick={() => setAdminTab("spieler")}
              style={adminTab === "spieler" ? primaryButton() : mutedButton()}
            >
              Spieler
            </button>

            <button
              onClick={() => setAdminTab("einstellungen")}
              style={adminTab === "einstellungen" ? primaryButton() : mutedButton()}
            >
              Einstellungen
            </button>
          </div>

          <div
            style={{
              padding: isMobile ? 12 : 16,
              width: "100%",
              boxSizing: "border-box",
              minWidth: 0,
            }}
          >
            {adminTab === "turniere" ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 18,
                  alignItems: "start",
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    background: COLORS.soft,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 14,
                    padding: 14,
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      marginBottom: 12,
                      color: COLORS.blue,
                    }}
                  >
                    {editingTournamentId ? "Turnier bearbeiten" : "Turnier anlegen"}
                  </div>

                  <div style={{ display: "grid", gap: 10, width: "100%", minWidth: 0 }}>
                    <input
                      placeholder="Turniername"
                      value={tournamentTitle}
                      onChange={(e) => setTournamentTitle(e.target.value)}
                      style={inputStyle()}
                    />

                    <input
                      type="date"
                      value={tournamentDate}
                      onChange={(e) => setTournamentDate(e.target.value)}
                      style={inputStyle()}
                    />

                    <select
                      value={registrationTime}
                      onChange={(e) => setRegistrationTime(e.target.value)}
                      style={selectStyle()}
                    >
                      <option value="">Meldung auswählen</option>
                      {timeOptions.map((time) => (
                        <option key={`reg-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      style={selectStyle()}
                    >
                      <option value="">Beginn auswählen</option>
                      {timeOptions.map((time) => (
                        <option key={`start-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    <input
                      placeholder="Ort"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      style={inputStyle()}
                    />

                    <select
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      style={selectStyle()}
                    >
                      {teamOptions.map((team) => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>

                    <select
                      value={tournamentType}
                      onChange={(e) => setTournamentType(e.target.value)}
                      style={selectStyle()}
                    >
                      <option value="Freies-Turnier">Freies-Turnier</option>
                      <option value="Herren-Turnier">Herren-Turnier</option>
                      <option value="Damen-Turnier">Damen-Turnier</option>
                      <option value="Ü50-Turnier">Ü50-Turnier</option>
                    </select>

                    <select
                      value={hasPasses}
                      onChange={(e) => setHasPasses(e.target.value)}
                      style={selectStyle()}
                    >
                      <option value="ja">ja</option>
                      <option value="nein">nein</option>
                    </select>

                    <textarea
                      placeholder="Bemerkung"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ ...inputStyle(), minHeight: 90, resize: "vertical" }}
                    />

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        width: "100%",
                      }}
                    >
                      <button
                        onClick={saveTournament}
                        style={successButton({ width: isMobile ? "100%" : "auto" })}
                      >
                        {editingTournamentId ? "Änderungen speichern" : "Turnier speichern"}
                      </button>
                      <button
                        onClick={resetTournamentForm}
                        style={mutedButton({ width: isMobile ? "100%" : "auto" })}
                      >
                        Zurücksetzen
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: COLORS.white,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 14,
                    padding: 14,
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10, color: COLORS.blue }}>
                    Gemeldete Turniere
                  </div>

                  <div style={{ display: "grid", gap: 10, width: "100%", minWidth: 0 }}>
                    {tournaments.map((t) => {
                      const tournamentEntries = entries
                        .filter((e) => String(e.tournament_id) === String(t.id))
                        .sort((a, b) => a.player_name.localeCompare(b.player_name, "de"));

                      return (
                        <div
                          key={t.id}
                          style={{
                            padding: 14,
                            borderRadius: 12,
                            background: COLORS.soft,
                            border: `1px solid ${COLORS.line}`,
                            width: "100%",
                            minWidth: 0,
                            boxSizing: "border-box",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                              alignItems: "flex-start",
                              flexWrap: "wrap",
                              marginBottom: 12,
                              minWidth: 0,
                            }}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 800,
                                  fontSize: 17,
                                  color: COLORS.blue,
                                  wordBreak: "break-word",
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {t.title}
                              </div>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                                width: isMobile ? "100%" : "auto",
                              }}
                            >
                              <button
                                onClick={() => editTournament(t)}
                                style={mutedButton({
                                  padding: "8px 10px",
                                  width: isMobile ? "100%" : "auto",
                                })}
                              >
                                Bearbeiten
                              </button>
                              <button
                                onClick={() => deleteTournament(t.id)}
                                style={dangerButton({
                                  padding: "8px 10px",
                                  width: isMobile ? "100%" : "auto",
                                })}
                              >
                                Löschen
                              </button>
                            </div>
                          </div>

                          <div style={detailBoxStyle()}>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Datum:</div>
                              <div style={detailValueStyle()}>{formatDate(t.date)}</div>
                            </div>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Meldung:</div>
                              <div style={detailValueStyle()}>{t.registration_time || "-"}</div>
                            </div>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Beginn:</div>
                              <div style={detailValueStyle()}>{t.start_time || "-"}</div>
                            </div>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Ort:</div>
                              <div style={detailValueStyle()}>{t.location || "-"}</div>
                            </div>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Mannschaft:</div>
                              <div style={detailValueStyle()}>{t.team_name || "-"}</div>
                            </div>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Turnierart:</div>
                              <div style={detailValueStyle()}>{t.tournamentType || "-"}</div>
                            </div>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Pässe:</div>
                              <div style={detailValueStyle()}>{t.has_passes || "-"}</div>
                            </div>
                            <div style={{ ...detailRowStyle(isMobile), borderBottom: "none" }}>
                              <div style={detailLabelStyle(isMobile)}>Bemerkung:</div>
                              <div style={detailValueStyle()}>{t.notes || "-"}</div>
                            </div>
                          </div>

                          <div style={{ marginTop: 12, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, marginBottom: 8, color: COLORS.blue }}>
                              Teilnehmer
                            </div>

                            {tournamentEntries.length > 0 ? (
                              <div style={{ ...tableWrapStyle(), overflowX: "auto" }}>
                                <div style={{ minWidth: 520 }}>
                                  <div
                                    style={tableHeaderStyle(
                                      "minmax(220px, 1.6fr) minmax(140px, 1fr) minmax(120px, 0.9fr)"
                                    )}
                                  >
                                    <div>Name</div>
                                    <div>Passnummer</div>
                                    <div>Status</div>
                                  </div>

                                  <div style={{ display: "grid" }}>
                                    {tournamentEntries.map((e, index) => (
                                      <div
                                        key={e.id}
                                        style={tableRowStyle(
                                          "minmax(220px, 1.6fr) minmax(140px, 1fr) minmax(120px, 0.9fr)",
                                          index % 2 === 1,
                                          index === tournamentEntries.length - 1
                                        )}
                                      >
                                        <div style={{ fontWeight: 700, color: COLORS.text }}>
                                          {e.player_name}
                                        </div>
                                        <div>{getPassNumberByPlayerName(e.player_name)}</div>
                                        <div>
                                          <span style={statusBadgeStyle(e.status)}>{e.status}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div style={{ color: COLORS.muted }}>
                                Noch keine Teilnehmer vorhanden.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {tournaments.length === 0 ? (
                      <div style={{ color: COLORS.muted }}>Noch keine Turniere angelegt.</div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {adminTab === "spieler" ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 18,
                  alignItems: "start",
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    background: COLORS.soft,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 14,
                    padding: 14,
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      marginBottom: 12,
                      color: COLORS.blue,
                    }}
                  >
                    {editingPlayerId ? "Spieler bearbeiten" : "Spieler anlegen"}
                  </div>

                  <div style={{ display: "grid", gap: 10, width: "100%", minWidth: 0 }}>
                    <input
                      placeholder="Name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      style={inputStyle()}
                    />

                    <input
                      placeholder="Passnummer"
                      value={playerPassNumber}
                      onChange={(e) => setPlayerPassNumber(e.target.value)}
                      style={inputStyle({ background: "#eef6ff" })}
                    />

                    <select
                      value={playerRole}
                      onChange={(e) => setPlayerRole(e.target.value)}
                      style={selectStyle()}
                    >
                      <option value="Spieler">Spieler</option>
                      <option value="Spielerin">Spielerin</option>
                      <option value="Admin">Admin</option>
                    </select>

                    <input
                      type="password"
                      placeholder="Passwort"
                      value={playerPassword}
                      onChange={(e) => setPlayerPassword(e.target.value)}
                      style={inputStyle()}
                    />

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        onClick={savePlayer}
                        style={successButton({ width: isMobile ? "100%" : "auto" })}
                      >
                        {editingPlayerId ? "Änderungen speichern" : "Spieler speichern"}
                      </button>
                      <button
                        onClick={resetPlayerForm}
                        style={mutedButton({ width: isMobile ? "100%" : "auto" })}
                      >
                        Zurücksetzen
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: COLORS.white,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 14,
                    padding: 14,
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginBottom: 12,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.blue }}>
                      Spielerliste
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        width: isMobile ? "100%" : "auto",
                        minWidth: 0,
                      }}
                    >
                      <input
                        placeholder="Suche nach Name, Passnummer oder Rolle"
                        value={playerSearch}
                        onChange={(e) => setPlayerSearch(e.target.value)}
                        style={inputStyle({
                          width: isMobile ? "100%" : 280,
                          background: "#fff",
                          flex: isMobile ? "1 1 100%" : undefined,
                        })}
                      />

                      <select
                        value={playerSort}
                        onChange={(e) =>
                          setPlayerSort(
                            e.target.value as
                              | "name_asc"
                              | "name_desc"
                              | "pass_asc"
                              | "pass_desc"
                          )
                        }
                        style={selectStyle({
                          width: isMobile ? "100%" : 200,
                          background: "#fff",
                        })}
                      >
                        <option value="name_asc">Name A-Z</option>
                        <option value="name_desc">Name Z-A</option>
                        <option value="pass_asc">Passnummer aufsteigend</option>
                        <option value="pass_desc">Passnummer absteigend</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12, color: COLORS.muted, fontSize: 13 }}>
                    Gefundene Spieler: {filteredAndSortedPlayers.length}
                  </div>

                  <div style={{ ...tableWrapStyle(), overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        minWidth: 560,
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                        background: COLORS.white,
                      }}
                    >
                      <colgroup>
                        <col style={{ width: "40%" }} />
                        <col style={{ width: "28%" }} />
                        <col style={{ width: "32%" }} />
                      </colgroup>

                      <thead>
                        <tr style={{ background: COLORS.blue }}>
                          <th
                            style={{
                              padding: "14px",
                              color: COLORS.white,
                              fontWeight: 800,
                              textAlign: "left",
                              fontSize: 16,
                            }}
                          >
                            Name
                          </th>
                          <th
                            style={{
                              padding: "14px",
                              color: COLORS.white,
                              fontWeight: 800,
                              textAlign: "left",
                              fontSize: 16,
                            }}
                          >
                            Passnummer
                          </th>
                          <th
                            style={{
                              padding: "14px",
                              color: COLORS.white,
                              fontWeight: 800,
                              textAlign: "left",
                              fontSize: 16,
                            }}
                          >
                            Aktionen
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredAndSortedPlayers.map((p, index) => (
                          <tr
                            key={p.id}
                            style={{
                              background: index % 2 === 1 ? "#f8fafc" : COLORS.white,
                              borderBottom:
                                index === filteredAndSortedPlayers.length - 1
                                  ? "none"
                                  : `1px solid ${COLORS.line}`,
                            }}
                          >
                            <td
                              style={{
                                padding: "8px 12px",
                                textAlign: "left",
                                fontWeight: 700,
                                color: COLORS.text,
                                wordBreak: "break-word",
                                verticalAlign: "middle",
                              }}
                            >
                              {p.name}
                            </td>

                            <td
                              style={{
                                padding: "8px 12px",
                                textAlign: "left",
                                fontWeight: 700,
                                color: COLORS.blueSoft,
                                verticalAlign: "middle",
                              }}
                            >
                              {p.pass_number || "-"}
                            </td>

                            <td
                              style={{
                                padding: "8px 12px",
                                textAlign: "left",
                                verticalAlign: "middle",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: 6,
                                  flexWrap: isMobile ? "wrap" : "nowrap",
                                  alignItems: "center",
                                }}
                              >
                                <button
                                  onClick={() => editPlayer(p)}
                                  style={mutedButton({
                                    padding: "6px 10px",
                                    fontSize: 13,
                                    width: isMobile ? "100%" : "auto",
                                  })}
                                >
                                  Bearbeiten
                                </button>
                                <button
                                  onClick={() => deletePlayer(p.id, p.name)}
                                  style={dangerButton({
                                    padding: "6px 10px",
                                    fontSize: 13,
                                    width: isMobile ? "100%" : "auto",
                                  })}
                                >
                                  Löschen
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {filteredAndSortedPlayers.length === 0 ? (
                          <tr>
                            <td
                              colSpan={3}
                              style={{ padding: 14, color: COLORS.muted, textAlign: "left" }}
                            >
                              Keine Spieler zur Suche gefunden.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}

            {adminTab === "einstellungen" ? (
              <div
                style={{
                  background: COLORS.soft,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 14,
                  padding: 14,
                  display: "grid",
                  gap: 10,
                  maxWidth: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    marginBottom: 4,
                    color: COLORS.blue,
                  }}
                >
                  Einstellungen
                </div>

                <input
                  placeholder="Überschrift"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  style={inputStyle()}
                />

                <button
                  onClick={saveSettings}
                  style={successButton({ width: isMobile ? "100%" : "auto" })}
                >
                  Überschrift speichern
                </button>

                <div
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: "#fff",
                    border: `1px solid ${COLORS.line}`,
                    color: COLORS.muted,
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                  }}
                >
                  Das Vereinslogo wird jetzt fest über eine öffentliche URL geladen.
                  Änderungen am Logo bitte direkt oben im Code bei
                  <strong> CLUB_LOGO_PUBLIC_URL </strong>
                  vornehmen.
                </div>

                {clubLogo ? (
                  <div style={{ marginTop: 6 }}>
                    <img
                      src={clubLogo}
                      alt="Vereinslogo"
                      style={{
                        width: 90,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: 14,
                        border: `2px solid ${COLORS.red}`,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle(isMobile)}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
          background: COLORS.white,
          borderRadius: 18,
          padding: isMobile ? 14 : "18px 20px",
          boxShadow: "0 8px 22px rgba(2,43,69,0.08)",
          border: `1px solid ${COLORS.line}`,
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            minWidth: 0,
            flex: "1 1 auto",
          }}
        >
          {clubLogo ? (
            <img
              src={clubLogo}
              alt="Logo"
              style={{
                height: isMobile ? 54 : 64,
                width: isMobile ? 54 : 64,
                borderRadius: 12,
                objectFit: "cover",
                border: `2px solid ${COLORS.red}`,
                flexShrink: 0,
              }}
            />
          ) : null}

          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 20 : 30,
                lineHeight: 1.15,
                color: COLORS.blue,
                wordBreak: "break-word",
              }}
            >
              {appTitle}
            </h1>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: isMobile ? "stretch" : "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "flex-end",
            width: isMobile ? "100%" : "auto",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 15,
              color: COLORS.muted,
              textAlign: isMobile ? "left" : "right",
              lineHeight: 1.35,
              minWidth: 0,
              flex: isMobile ? "1 1 100%" : "0 1 auto",
              wordBreak: "break-word",
            }}
          >
            Angemeldet als <strong style={{ color: COLORS.blue }}>{currentUser.name}</strong>
            {currentUser.role ? ` · ${currentUser.role}` : ""}
          </div>

          <button
            onClick={logout}
            style={dangerButton({ width: isMobile ? "100%" : "auto" })}
          >
            Abmelden
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "320px minmax(0,1fr)",
          gap: 20,
          alignItems: "start",
          width: "100%",
          minWidth: 0,
        }}
      >
        <div style={cardStyle()}>
          <div style={sectionTitleStyle()}>Turniere</div>

          <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
            {tournaments.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTournamentId(t.id)}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: activeTournamentId === t.id ? "#ffe7ea" : COLORS.soft,
                  cursor: "pointer",
                  border:
                    activeTournamentId === t.id
                      ? `1px solid ${COLORS.red}`
                      : `1px solid ${COLORS.line}`,
                  transition: "0.15s",
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: COLORS.muted,
                    marginBottom: 4,
                    fontWeight: 600,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {formatDate(t.date)}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: activeTournamentId === t.id ? COLORS.redDark : COLORS.blue,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    whiteSpace: "normal",
                  }}
                >
                  {t.title}
                </div>
              </div>
            ))}

            {tournaments.length === 0 ? (
              <div style={{ color: COLORS.muted }}>Noch keine Turniere vorhanden.</div>
            ) : null}
          </div>
        </div>

        <div style={{ ...cardStyle(), minWidth: 0 }}>
          {activeTournament ? (
            <>
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 12,
                  color: COLORS.blue,
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  whiteSpace: "normal",
                }}
              >
                {activeTournament.title}
              </h2>

              <div style={detailBoxStyle()}>
                <div style={detailRowStyle(isMobile)}>
                  <div style={detailLabelStyle(isMobile)}>Datum:</div>
                  <div style={detailValueStyle()}>{formatDate(activeTournament.date)}</div>
                </div>
                <div style={detailRowStyle(isMobile)}>
                  <div style={detailLabelStyle(isMobile)}>Meldung:</div>
                  <div style={detailValueStyle()}>{activeTournament.registration_time || "-"}</div>
                </div>
                <div style={detailRowStyle(isMobile)}>
                  <div style={detailLabelStyle(isMobile)}>Beginn:</div>
                  <div style={detailValueStyle()}>{activeTournament.start_time || "-"}</div>
                </div>
                <div style={detailRowStyle(isMobile)}>
                  <div style={detailLabelStyle(isMobile)}>Ort:</div>
                  <div style={detailValueStyle()}>{activeTournament.location || "-"}</div>
                </div>
                <div style={detailRowStyle(isMobile)}>
                  <div style={detailLabelStyle(isMobile)}>Mannschaft:</div>
                  <div style={detailValueStyle()}>{activeTournament.team_name || "-"}</div>
                </div>
                <div style={detailRowStyle(isMobile)}>
                  <div style={detailLabelStyle(isMobile)}>Turnierart:</div>
                  <div style={detailValueStyle()}>{activeTournament.tournamentType || "-"}</div>
                </div>
                <div style={detailRowStyle(isMobile)}>
                  <div style={detailLabelStyle(isMobile)}>Pässe:</div>
                  <div style={detailValueStyle()}>{activeTournament.has_passes || "-"}</div>
                </div>
                <div style={{ ...detailRowStyle(isMobile), borderBottom: "none" }}>
                  <div style={detailLabelStyle(isMobile)}>Bemerkung:</div>
                  <div style={detailValueStyle()}>{activeTournament.notes || "-"}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <button
                  onClick={() => saveStatus("dabei")}
                  style={successButton({ width: isMobile ? "100%" : "auto" })}
                >
                  Ich bin dabei
                </button>
                <button
                  onClick={() => saveStatus("nicht dabei")}
                  style={warnButton({ width: isMobile ? "100%" : "auto" })}
                >
                  Ich bin nicht dabei
                </button>
                <button
                  onClick={deleteMyEntry}
                  style={dangerButton({ width: isMobile ? "100%" : "auto" })}
                >
                  Meldung löschen
                </button>
              </div>

              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: COLORS.blue }}>
                Teilnehmer
              </div>

              {activeEntries.length > 0 ? (
                <div style={{ ...tableWrapStyle(), overflowX: "auto" }}>
                  <div style={{ minWidth: 520 }}>
                    <div
                      style={tableHeaderStyle(
                        "minmax(220px, 1.6fr) minmax(140px, 1fr) minmax(120px, 0.9fr)"
                      )}
                    >
                      <div>Name</div>
                      <div>Passnummer</div>
                      <div>Status</div>
                    </div>

                    <div style={{ display: "grid" }}>
                      {activeEntries.map((e, index) => (
                        <div
                          key={e.id}
                          style={tableRowStyle(
                            "minmax(220px, 1.6fr) minmax(140px, 1fr) minmax(120px, 0.9fr)",
                            index % 2 === 1,
                            index === activeEntries.length - 1
                          )}
                        >
                          <div style={{ fontWeight: 700, color: COLORS.text }}>
                            {e.player_name}
                          </div>
                          <div>{getPassNumberByPlayerName(e.player_name)}</div>
                          <div>
                            <span style={statusBadgeStyle(e.status)}>{e.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>Noch keine Teilnehmer vorhanden.</div>
              )}
            </>
          ) : (
            <div>Bitte ein Turnier auswählen.</div>
          )}
        </div>
      </div>
    </div>
  );
}