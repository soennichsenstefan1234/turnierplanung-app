import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const LOGO_BUCKET = "vereinslogos";
const LOGO_FILE_NAME = "logo_hoechstaedt.png";
const CLUB_LOGO_PUBLIC_URL =
  "https://qlcbiguuzkfhqsphnuwn.supabase.co/storage/v1/object/public/vereinslogos/logo_hoechstaedt.png";

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
  blueLight: "#eaf4fb",
  yellow: "#f2c200",
  yellowSoft: "#fff4bf",
  white: "#ffffff",
  line: "#d8dee6",
  bg: "#f4f7fb",
  card: "#ffffff",
  soft: "#f8fafc",
  text: "#10253a",
  muted: "#5b6b7c",
  green: "#1fa34a",
  greenSoft: "#e8f7ee",
  orange: "#d97706",
  orangeSoft: "#fff3e8",
  shadow: "0 16px 36px rgba(2,43,69,0.08)",
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
    width: "100%",
    maxWidth: "100vw",
    overflowX: "hidden",
    position: "relative",
    background:
      "linear-gradient(180deg, #f4f7fb 0%, #edf2f8 45%, #f7f9fc 100%)",
    padding: isMobile ? 10 : 24,
    fontFamily: "Arial, sans-serif",
    color: COLORS.text,
    boxSizing: "border-box",
  };
}

function appContainerStyle(): React.CSSProperties {
  return {
    width: "100%",
    maxWidth: 1240,
    margin: "0 auto",
    minWidth: 0,
    overflowX: "hidden",
    boxSizing: "border-box",
  };
}

function cardStyle(isMobile: boolean): React.CSSProperties {
  return {
    background: COLORS.card,
    borderRadius: isMobile ? 18 : 22,
    padding: isMobile ? 14 : 20,
    boxShadow: COLORS.shadow,
    border: `1px solid ${COLORS.line}`,
    boxSizing: "border-box",
    minWidth: 0,
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
  };
}

function softPanelStyle(isMobile: boolean): React.CSSProperties {
  return {
    background: COLORS.soft,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 18,
    padding: isMobile ? 12 : 16,
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    overflow: "hidden",
  };
}

function inputStyle(
  isMobile: boolean,
  extra: React.CSSProperties = {}
): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    padding: isMobile ? "10px 12px" : "12px 13px",
    fontSize: 14,
    lineHeight: 1.35,
    borderRadius: 12,
    border: `1px solid ${COLORS.line}`,
    boxSizing: "border-box",
    background: "#ffffff",
    outline: "none",
    margin: 0,
    overflow: "hidden",
    color: COLORS.text,
    ...extra,
  };
}

function textareaStyle(
  isMobile: boolean,
  extra: React.CSSProperties = {}
): React.CSSProperties {
  return {
    ...inputStyle(isMobile),
    resize: "vertical",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    ...extra,
  };
}

function selectStyle(
  isMobile: boolean,
  extra: React.CSSProperties = {}
): React.CSSProperties {
  return inputStyle(isMobile, {
    background: "#fafdff",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    ...extra,
  });
}

function formFieldWrapStyle(): React.CSSProperties {
  return {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
    boxSizing: "border-box",
  };
}

function fieldLabelStyle(): React.CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.blueSoft,
    marginBottom: 6,
    letterSpacing: 0.2,
  };
}

function primaryButton(
  isMobile: boolean,
  extra: React.CSSProperties = {}
): React.CSSProperties {
  return {
    padding: isMobile ? "10px 13px" : "11px 15px",
    borderRadius: 12,
    border: "none",
    background: COLORS.red,
    color: "white",
    fontWeight: 700,
    fontSize: isMobile ? 13 : 14,
    cursor: "pointer",
    boxSizing: "border-box",
    maxWidth: "100%",
    boxShadow: "0 10px 20px rgba(217,4,22,0.18)",
    ...extra,
  };
}

function successButton(
  isMobile: boolean,
  extra: React.CSSProperties = {}
): React.CSSProperties {
  return {
    ...primaryButton(isMobile),
    background: COLORS.green,
    boxShadow: "0 10px 20px rgba(31,163,74,0.18)",
    ...extra,
  };
}

function warnButton(
  isMobile: boolean,
  extra: React.CSSProperties = {}
): React.CSSProperties {
  return {
    ...primaryButton(isMobile),
    background: COLORS.orange,
    boxShadow: "0 10px 20px rgba(217,119,6,0.18)",
    ...extra,
  };
}

function dangerButton(
  isMobile: boolean,
  extra: React.CSSProperties = {}
): React.CSSProperties {
  return {
    ...primaryButton(isMobile),
    background: COLORS.red,
    ...extra,
  };
}

function mutedButton(
  isMobile: boolean,
  extra: React.CSSProperties = {}
): React.CSSProperties {
  return {
    ...primaryButton(isMobile),
    background: COLORS.blueSoft,
    boxShadow: "0 10px 20px rgba(10,70,109,0.18)",
    ...extra,
  };
}

function secondaryGhostButton(
  isMobile: boolean,
  extra: React.CSSProperties = {}
): React.CSSProperties {
  return {
    padding: isMobile ? "10px 13px" : "11px 15px",
    borderRadius: 12,
    border: `1px solid ${COLORS.line}`,
    background: COLORS.white,
    color: COLORS.blue,
    fontWeight: 700,
    fontSize: isMobile ? 13 : 14,
    cursor: "pointer",
    boxSizing: "border-box",
    maxWidth: "100%",
    ...extra,
  };
}

function adminTabButtonStyle(
  isMobile: boolean,
  active: boolean
): React.CSSProperties {
  return {
    padding: isMobile ? "9px 12px" : "10px 16px",
    minHeight: isMobile ? 38 : 42,
    borderRadius: 999,
    border: active ? "none" : `1px solid ${COLORS.line}`,
    background: active ? COLORS.red : COLORS.white,
    color: active ? COLORS.white : COLORS.blue,
    fontWeight: 700,
    fontSize: isMobile ? 13 : 14,
    cursor: "pointer",
    whiteSpace: "nowrap",
    flex: isMobile ? "1 1 auto" : "0 0 auto",
    textAlign: "center",
    boxShadow: active ? "0 10px 20px rgba(217,4,22,0.16)" : "none",
  };
}

function sectionTitleStyle(isMobile: boolean): React.CSSProperties {
  return {
    fontSize: isMobile ? 17 : 19,
    fontWeight: 800,
    marginBottom: isMobile ? 10 : 14,
    color: COLORS.blue,
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  };
}

function sectionSubTitleStyle(): React.CSSProperties {
  return {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: -6,
    marginBottom: 12,
    lineHeight: 1.4,
  };
}

function detailBoxStyle(isMobile: boolean): React.CSSProperties {
  return {
    background: COLORS.soft,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 18,
    padding: isMobile ? 12 : 16,
    marginBottom: 18,
    minWidth: 0,
    boxSizing: "border-box",
    overflowX: "hidden",
    maxWidth: "100%",
  };
}

function detailRowStyle(isMobile: boolean): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "190px minmax(0, 1fr)",
    gap: isMobile ? 4 : 14,
    alignItems: "start",
    padding: isMobile ? "7px 0" : "8px 0",
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
    fontSize: isMobile ? 13 : 14,
  };
}

function detailValueStyle(isMobile: boolean): React.CSSProperties {
  return {
    color: COLORS.text,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    textAlign: "left",
    minWidth: 0,
    fontSize: isMobile ? 13 : 14,
  };
}

function statusBadgeStyle(status: string): React.CSSProperties {
  const isDabei = status === "dabei";
  return {
    padding: "6px 10px",
    borderRadius: 999,
    background: isDabei ? COLORS.green : COLORS.orange,
    color: "white",
    fontWeight: 700,
    fontSize: 13,
    whiteSpace: "nowrap",
    display: "inline-block",
    maxWidth: "100%",
  };
}

function pillStyle(
  tone: "blue" | "green" | "orange" | "red"
): React.CSSProperties {
  const map = {
    blue: { bg: COLORS.blueLight, color: COLORS.blueSoft },
    green: { bg: COLORS.greenSoft, color: COLORS.green },
    orange: { bg: COLORS.orangeSoft, color: COLORS.orange },
    red: { bg: "#ffe8eb", color: COLORS.redDark },
  };

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    background: map[tone].bg,
    color: map[tone].color,
    fontWeight: 700,
    fontSize: 12,
    maxWidth: "100%",
  };
}

function statCardStyle(accent: string): React.CSSProperties {
  return {
    background: COLORS.white,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 16,
    padding: 14,
    minWidth: 0,
    boxSizing: "border-box",
    boxShadow: "0 8px 18px rgba(2,43,69,0.05)",
    borderLeft: `5px solid ${accent}`,
    overflowX: "hidden",
  };
}

function tableWrapStyle(): React.CSSProperties {
  return {
    border: `1px solid ${COLORS.line}`,
    borderRadius: 16,
    overflow: "hidden",
    background: COLORS.white,
    minWidth: 0,
    maxWidth: "100%",
    boxSizing: "border-box",
  };
}

function emptyStateStyle(): React.CSSProperties {
  return {
    padding: 16,
    borderRadius: 14,
    background: COLORS.soft,
    border: `1px dashed ${COLORS.line}`,
    color: COLORS.muted,
  };
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={formFieldWrapStyle()}>
      <div style={fieldLabelStyle()}>{label}</div>
      {children}
    </div>
  );
}

function ParticipantCard({
  name,
  passNumber,
  status,
}: {
  name: string;
  passNumber: string;
  status: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 14,
        background: COLORS.white,
        padding: 12,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.blueSoft,
          marginBottom: 4,
        }}
      >
        Name
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: COLORS.text,
          marginBottom: 10,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {name}
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.blueSoft,
          marginBottom: 4,
        }}
      >
        Passnummer
      </div>
      <div
        style={{
          fontSize: 14,
          color: COLORS.text,
          marginBottom: 10,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {passNumber}
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.blueSoft,
          marginBottom: 4,
        }}
      >
        Status
      </div>
      <div>
        <span
          style={{
            ...statusBadgeStyle(status),
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {status}
        </span>
      </div>
    </div>
  );
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
  const [showTournamentForm, setShowTournamentForm] = useState(false);

  const [appTitle, setAppTitle] = useState("SSV Höchstädt Turnierplanung");
  const [titleInput, setTitleInput] = useState("SSV Höchstädt Turnierplanung");
  const [logoVersion, setLogoVersion] = useState(Date.now());
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

  const logoSrc = `${CLUB_LOGO_PUBLIC_URL}?v=${logoVersion}`;

  useEffect(() => {
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";
    document.body.style.maxWidth = "100vw";

    const savedTitle = localStorage.getItem("turnierplanung_app_title");

    if (savedTitle) {
      setAppTitle(savedTitle);
      setTitleInput(savedTitle);
    }

    setLogoVersion(Date.now());

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

  const countDabei = useMemo(
    () => activeEntries.filter((e) => e.status === "dabei").length,
    [activeEntries]
  );

  const countNichtDabei = useMemo(
    () => activeEntries.filter((e) => e.status === "nicht dabei").length,
    [activeEntries]
  );

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

    const sorted = [...filtered].sort((a, b) => {
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
        case "name_asc":
        default:
          return nameA.localeCompare(nameB, "de");
      }
    });

    return sorted;
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

  function startNewTournament() {
    resetTournamentForm();
    setShowTournamentForm(true);
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
    setShowTournamentForm(true);
    setAdminTab("turniere");
    setActiveTournamentId(tournament.id);
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
      const { data, error } = await supabase
        .from("tournaments")
        .insert(payload)
        .select()
        .single();

      if (error) {
        alert("Fehler beim Anlegen des Turniers: " + error.message);
        return;
      }

      if (data?.id) {
        setActiveTournamentId(data.id);
      }
    }

    resetTournamentForm();
    setShowTournamentForm(false);
    await loadAll();
  }

  async function deleteTournament(id: string) {
    await supabase.from("entries").delete().eq("tournament_id", id);

    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) {
      alert("Fehler beim Löschen des Turniers: " + error.message);
      return;
    }

    if (String(activeTournamentId) === String(id)) {
      setActiveTournamentId("");
    }

    setShowTournamentForm(false);
    resetTournamentForm();
    await loadAll();
  }

  function saveSettings() {
    const finalTitle = titleInput || "SSV Höchstädt Turnierplanung";
    setAppTitle(finalTitle);
    localStorage.setItem("turnierplanung_app_title", finalTitle);
    alert("Überschrift gespeichert.");
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Bitte eine Bilddatei auswählen.");
      return;
    }

    const { error } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(LOGO_FILE_NAME, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      alert("Fehler beim Hochladen des Logos: " + error.message);
      return;
    }

    setLogoVersion(Date.now());
    alert("Vereinslogo erfolgreich hochgeladen und für alle sichtbar gespeichert.");
  }

  if (loading) {
    return (
      <div style={shellStyle(isMobile)}>
        <div style={appContainerStyle()}>
          <div style={{ ...cardStyle(isMobile), textAlign: "center" }}>
            Daten werden geladen...
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={shellStyle(isMobile)}>
        <div style={appContainerStyle()}>
          <div style={{ ...cardStyle(isMobile), maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ marginTop: 0, color: COLORS.red }}>Fehler beim Laden</h2>
            <div style={{ color: COLORS.redDark, marginBottom: 14 }}>{loadError}</div>
            <button onClick={() => void loadAll()} style={primaryButton(isMobile)}>
              Erneut laden
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={shellStyle(isMobile)}>
        <div
          style={{
            ...appContainerStyle(),
            minHeight: "calc(100vh - 20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              ...cardStyle(isMobile),
              width: "100%",
              maxWidth: 500,
              textAlign: "center",
              padding: isMobile ? 18 : 26,
            }}
          >
            <div style={{ marginBottom: 14 }}>
              <span style={pillStyle("blue")}>Turnier-Portal</span>
            </div>

            <img
              src={logoSrc}
              alt="Logo"
              onError={(e) => {
                e.currentTarget.src = CLUB_LOGO_PUBLIC_URL;
              }}
              style={{
                width: 88,
                height: 88,
                objectFit: "contain",
                borderRadius: 18,
                marginBottom: 16,
                border: `2px solid ${COLORS.red}`,
                background: "#fff",
                padding: 6,
              }}
            />

            <h1
              style={{
                marginTop: 0,
                marginBottom: 10,
                fontSize: isMobile ? 28 : 38,
                lineHeight: 1.12,
                color: COLORS.blue,
                wordBreak: "break-word",
              }}
            >
              {appTitle}
            </h1>

            <p
              style={{
                color: COLORS.muted,
                fontSize: isMobile ? 14 : 16,
                marginTop: 0,
                marginBottom: 18,
              }}
            >
              Anmeldung für Spieler und Admin-Bereich
            </p>

            {players.length === 0 ? (
              <div style={emptyStateStyle()}>
                Es sind noch keine Spieler vorhanden.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12, textAlign: "left" }}>
                <FormField label="Spieler auswählen">
                  <select
                    value={selectedPlayerId}
                    style={selectStyle(isMobile)}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.role ? `- ${p.role}` : ""}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Passwort">
                  <input
                    type="password"
                    placeholder="Passwort eingeben"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") login();
                    }}
                    style={inputStyle(isMobile)}
                  />
                </FormField>

                <button
                  onClick={login}
                  style={{ ...primaryButton(isMobile), width: "100%" }}
                >
                  Anmelden
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div style={shellStyle(isMobile)}>
        <div style={appContainerStyle()}>
          <div
            style={{
              ...cardStyle(isMobile),
              marginBottom: isMobile ? 12 : 18,
              padding: isMobile ? 14 : 18,
              background:
                "linear-gradient(135deg, #ffffff 0%, #f8fbff 55%, #f5f8fc 100%)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: isMobile ? 10 : 16,
                flexWrap: "wrap",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 10 : 14,
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <img
                  src={logoSrc}
                  alt="Logo"
                  onError={(e) => {
                    e.currentTarget.src = CLUB_LOGO_PUBLIC_URL;
                  }}
                  style={{
                    height: isMobile ? 58 : 70,
                    width: isMobile ? 58 : 70,
                    borderRadius: 16,
                    objectFit: "contain",
                    border: `2px solid ${COLORS.red}`,
                    background: "#fff",
                    padding: 4,
                    flexShrink: 0,
                  }}
                />

                <div style={{ minWidth: 0 }}>
                  <div style={{ marginBottom: 6 }}>
                    <span style={pillStyle("red")}>Admin-Dashboard</span>
                  </div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: isMobile ? 20 : 30,
                      lineHeight: 1.14,
                      color: COLORS.blue,
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {appTitle}
                  </h1>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: isMobile ? 12 : 13,
                      color: COLORS.muted,
                    }}
                  >
                    Verwaltung von Turnieren, Spielern und Einstellungen
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: isMobile ? "stretch" : "center",
                  gap: 10,
                  marginLeft: "auto",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    color: COLORS.muted,
                    textAlign: isMobile ? "left" : "right",
                    lineHeight: 1.35,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    minWidth: 0,
                    flex: isMobile ? "1 1 100%" : undefined,
                  }}
                >
                  Angemeldet als{" "}
                  <strong style={{ color: COLORS.blue }}>{currentUser.name}</strong>
                  {currentUser.role ? ` · ${currentUser.role}` : ""}
                </div>

                <button
                  onClick={logout}
                  style={dangerButton(isMobile, {
                    width: isMobile ? "100%" : "auto",
                  })}
                >
                  Abmelden
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div style={statCardStyle(COLORS.red)}>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>
                Turniere
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.blue }}>
                {tournaments.length}
              </div>
            </div>

            <div style={statCardStyle(COLORS.green)}>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>
                Spieler
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.blue }}>
                {players.length}
              </div>
            </div>

            <div style={statCardStyle(COLORS.orange)}>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>
                Einträge
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.blue }}>
                {entries.length}
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle(isMobile), padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: isMobile ? 10 : 16,
                borderBottom: `1px solid ${COLORS.line}`,
                background: "#f8fafc",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: isMobile ? 8 : 10,
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setAdminTab("turniere")}
                  style={adminTabButtonStyle(isMobile, adminTab === "turniere")}
                >
                  Turniere
                </button>

                <button
                  onClick={() => setAdminTab("spieler")}
                  style={adminTabButtonStyle(isMobile, adminTab === "spieler")}
                >
                  Spieler
                </button>

                <button
                  onClick={() => setAdminTab("einstellungen")}
                  style={adminTabButtonStyle(isMobile, adminTab === "einstellungen")}
                >
                  Einstellungen
                </button>
              </div>
            </div>

            <div
              style={{
                padding: isMobile ? 10 : 18,
                minWidth: 0,
                boxSizing: "border-box",
              }}
            >
              {adminTab === "turniere" ? (
                <div style={{ display: "grid", gap: isMobile ? 12 : 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={sectionTitleStyle(isMobile)}>Turnierverwaltung</div>
                      <div style={sectionSubTitleStyle()}>
                        Neue Turniere anlegen, vorhandene bearbeiten und Teilnehmer prüfen
                      </div>
                    </div>

                    <button onClick={startNewTournament} style={successButton(isMobile)}>
                      Neues Turnier anlegen
                    </button>
                  </div>

                  {showTournamentForm ? (
                    <div style={softPanelStyle(isMobile)}>
                      <div
                        style={{
                          fontSize: isMobile ? 16 : 18,
                          fontWeight: 800,
                          marginBottom: 12,
                          color: COLORS.blue,
                          wordBreak: "break-word",
                        }}
                      >
                        {editingTournamentId
                          ? "Turnier bearbeiten"
                          : "Neues Turnier anlegen"}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gap: isMobile ? 10 : 12,
                          minWidth: 0,
                          width: "100%",
                          maxWidth: "100%",
                          overflow: "hidden",
                        }}
                      >
                        <FormField label="Turniername">
                          <textarea
                            placeholder="z. B. Brotzeitturnier in Höchstädt"
                            value={tournamentTitle}
                            onChange={(e) => setTournamentTitle(e.target.value)}
                            rows={2}
                            style={textareaStyle(isMobile, { minHeight: 56 })}
                          />
                        </FormField>

                        <FormField label="Datum">
                          <input
                            type="date"
                            value={tournamentDate}
                            onChange={(e) => setTournamentDate(e.target.value)}
                            style={inputStyle(isMobile)}
                          />
                        </FormField>

                        <FormField label="Meldung">
                          <select
                            value={registrationTime}
                            onChange={(e) => setRegistrationTime(e.target.value)}
                            style={selectStyle(isMobile)}
                          >
                            <option value="">Meldung auswählen</option>
                            {timeOptions.map((time) => (
                              <option key={`reg-${time}`} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </FormField>

                        <FormField label="Beginn">
                          <select
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            style={selectStyle(isMobile)}
                          >
                            <option value="">Beginn auswählen</option>
                            {timeOptions.map((time) => (
                              <option key={`start-${time}`} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </FormField>

                        <FormField label="Ort">
                          <textarea
                            placeholder="z. B. Stockschützen-Arena Höchstädt"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            rows={2}
                            style={textareaStyle(isMobile, { minHeight: 56 })}
                          />
                        </FormField>

                        <FormField label="Mannschaft">
                          <select
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            style={selectStyle(isMobile)}
                          >
                            {teamOptions.map((team) => (
                              <option key={team} value={team}>
                                {team}
                              </option>
                            ))}
                          </select>
                        </FormField>

                        <FormField label="Turnierart">
                          <select
                            value={tournamentType}
                            onChange={(e) => setTournamentType(e.target.value)}
                            style={selectStyle(isMobile)}
                          >
                            <option value="Freies-Turnier">Freies-Turnier</option>
                            <option value="Herren-Turnier">Herren-Turnier</option>
                            <option value="Damen-Turnier">Damen-Turnier</option>
                            <option value="Ü50-Turnier">Ü50-Turnier</option>
                          </select>
                        </FormField>

                        <FormField label="Pässe erforderlich">
                          <select
                            value={hasPasses}
                            onChange={(e) => setHasPasses(e.target.value)}
                            style={selectStyle(isMobile)}
                          >
                            <option value="ja">ja</option>
                            <option value="nein">nein</option>
                          </select>
                        </FormField>

                        <FormField label="Bemerkung">
                          <textarea
                            placeholder="Zusätzliche Hinweise für Spieler"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            style={textareaStyle(isMobile, { minHeight: 90 })}
                          />
                        </FormField>

                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                            width: "100%",
                            minWidth: 0,
                            flexDirection: isMobile ? "column" : "row",
                            marginTop: 4,
                          }}
                        >
                          <button
                            onClick={saveTournament}
                            style={successButton(isMobile, {
                              width: isMobile ? "100%" : "auto",
                            })}
                          >
                            {editingTournamentId
                              ? "Änderungen speichern"
                              : "Turnier speichern"}
                          </button>
                          <button
                            onClick={() => {
                              resetTournamentForm();
                              setShowTournamentForm(false);
                            }}
                            style={secondaryGhostButton(isMobile, {
                              width: isMobile ? "100%" : "auto",
                            })}
                          >
                            Abbrechen
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "minmax(0,1fr)"
                        : "320px minmax(0,1fr)",
                      gap: 18,
                      alignItems: "start",
                      minWidth: 0,
                    }}
                  >
                    <div style={cardStyle(isMobile)}>
                      <div style={sectionTitleStyle(isMobile)}>Turnierliste</div>
                      <div style={sectionSubTitleStyle()}>
                        Auswahl eines aktiven Turniers zur Detailansicht
                      </div>

                      <div style={{ display: "grid", gap: 8 }}>
                        {tournaments.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => setActiveTournamentId(t.id)}
                            style={{
                              padding: 13,
                              borderRadius: 14,
                              background:
                                activeTournamentId === t.id
                                  ? "#fff0f2"
                                  : COLORS.soft,
                              cursor: "pointer",
                              border:
                                activeTournamentId === t.id
                                  ? `1px solid ${COLORS.red}`
                                  : `1px solid ${COLORS.line}`,
                              transition: "0.15s",
                              minWidth: 0,
                              boxShadow:
                                activeTournamentId === t.id
                                  ? "0 8px 18px rgba(217,4,22,0.08)"
                                  : "none",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                color: COLORS.muted,
                                marginBottom: 5,
                                fontWeight: 600,
                                wordBreak: "break-word",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {formatDate(t.date)}
                            </div>
                            <div
                              style={{
                                fontWeight: 800,
                                color:
                                  activeTournamentId === t.id
                                    ? COLORS.redDark
                                    : COLORS.blue,
                                wordBreak: "break-word",
                                overflowWrap: "anywhere",
                                whiteSpace: "normal",
                                marginBottom: 6,
                              }}
                            >
                              {t.title}
                            </div>
                            <div style={pillStyle("blue")}>
                              {t.team_name || "Keine Mannschaft"}
                            </div>
                          </div>
                        ))}

                        {tournaments.length === 0 ? (
                          <div style={emptyStateStyle()}>
                            Noch keine Turniere vorhanden.
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div style={{ ...cardStyle(isMobile), minWidth: 0 }}>
                      {activeTournament ? (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                              flexWrap: "wrap",
                              alignItems: "center",
                              marginBottom: 14,
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <h2
                                style={{
                                  margin: 0,
                                  color: COLORS.blue,
                                  wordBreak: "break-word",
                                  overflowWrap: "anywhere",
                                  fontSize: isMobile ? 22 : 26,
                                }}
                              >
                                {activeTournament.title}
                              </h2>
                              <div
                                style={{
                                  marginTop: 6,
                                  display: "flex",
                                  gap: 8,
                                  flexWrap: "wrap",
                                }}
                              >
                                <span style={pillStyle("blue")}>
                                  {formatDate(activeTournament.date)}
                                </span>
                                <span style={pillStyle("green")}>
                                  Zusagen: {countDabei}
                                </span>
                                <span style={pillStyle("orange")}>
                                  Absagen: {countNichtDabei}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button
                                onClick={() => editTournament(activeTournament)}
                                style={mutedButton(isMobile)}
                              >
                                Bearbeiten
                              </button>
                              <button
                                onClick={() => deleteTournament(activeTournament.id)}
                                style={dangerButton(isMobile)}
                              >
                                Löschen
                              </button>
                            </div>
                          </div>

                          <div style={detailBoxStyle(isMobile)}>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Datum:</div>
                              <div style={detailValueStyle(isMobile)}>
                                {formatDate(activeTournament.date)}
                              </div>
                            </div>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Meldung:</div>
                              <div style={detailValueStyle(isMobile)}>
                                {activeTournament.registration_time || "-"}
                              </div>
                            </div>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Beginn:</div>
                              <div style={detailValueStyle(isMobile)}>
                                {activeTournament.start_time || "-"}
                              </div>
                            </div>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Ort:</div>
                              <div style={detailValueStyle(isMobile)}>
                                {activeTournament.location || "-"}
                              </div>
                            </div>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Mannschaft:</div>
                              <div style={detailValueStyle(isMobile)}>
                                {activeTournament.team_name || "-"}
                              </div>
                            </div>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Turnierart:</div>
                              <div style={detailValueStyle(isMobile)}>
                                {activeTournament.tournamentType || "-"}
                              </div>
                            </div>
                            <div style={detailRowStyle(isMobile)}>
                              <div style={detailLabelStyle(isMobile)}>Pässe:</div>
                              <div style={detailValueStyle(isMobile)}>
                                {activeTournament.has_passes || "-"}
                              </div>
                            </div>
                            <div
                              style={{
                                ...detailRowStyle(isMobile),
                                borderBottom: "none",
                              }}
                            >
                              <div style={detailLabelStyle(isMobile)}>Bemerkung:</div>
                              <div style={detailValueStyle(isMobile)}>
                                {activeTournament.notes || "-"}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 800,
                              marginBottom: 10,
                              color: COLORS.blue,
                            }}
                          >
                            Teilnehmer
                          </div>

                          {activeEntries.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                                width: "100%",
                                maxWidth: "100%",
                                minWidth: 0,
                                overflowX: "hidden",
                                boxSizing: "border-box",
                              }}
                            >
                              {activeEntries.map((e) => (
                                <ParticipantCard
                                  key={e.id}
                                  name={e.player_name}
                                  passNumber={getPassNumberByPlayerName(e.player_name)}
                                  status={e.status}
                                />
                              ))}
                            </div>
                          ) : (
                            <div style={emptyStateStyle()}>
                              Noch keine Teilnehmer vorhanden.
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={emptyStateStyle()}>
                          Bitte ein Turnier auswählen.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {adminTab === "spieler" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "360px 1fr",
                    gap: isMobile ? 12 : 18,
                    alignItems: "start",
                    minWidth: 0,
                  }}
                >
                  <div style={softPanelStyle(isMobile)}>
                    <div style={sectionTitleStyle(isMobile)}>
                      {editingPlayerId ? "Spieler bearbeiten" : "Spieler anlegen"}
                    </div>
                    <div style={sectionSubTitleStyle()}>
                      Verwaltung von Namen, Passnummern, Rollen und Zugangsdaten
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: isMobile ? 10 : 12,
                        minWidth: 0,
                        width: "100%",
                        maxWidth: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <FormField label="Name">
                        <input
                          placeholder="Name eingeben"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          style={inputStyle(isMobile)}
                        />
                      </FormField>

                      <FormField label="Passnummer">
                        <input
                          placeholder="Passnummer eingeben"
                          value={playerPassNumber}
                          onChange={(e) => setPlayerPassNumber(e.target.value)}
                          style={inputStyle(isMobile)}
                        />
                      </FormField>

                      <FormField label="Rolle">
                        <select
                          value={playerRole}
                          onChange={(e) => setPlayerRole(e.target.value)}
                          style={selectStyle(isMobile)}
                        >
                          <option value="Spieler">Spieler</option>
                          <option value="Spielerin">Spielerin</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </FormField>

                      <FormField label="Passwort">
                        <input
                          type="password"
                          placeholder="Passwort eingeben"
                          value={playerPassword}
                          onChange={(e) => setPlayerPassword(e.target.value)}
                          style={inputStyle(isMobile)}
                        />
                      </FormField>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          minWidth: 0,
                          flexDirection: isMobile ? "column" : "row",
                        }}
                      >
                        <button
                          onClick={savePlayer}
                          style={successButton(isMobile, {
                            width: isMobile ? "100%" : "auto",
                          })}
                        >
                          {editingPlayerId
                            ? "Änderungen speichern"
                            : "Spieler speichern"}
                        </button>
                        <button
                          onClick={resetPlayerForm}
                          style={secondaryGhostButton(isMobile, {
                            width: isMobile ? "100%" : "auto",
                          })}
                        >
                          Zurücksetzen
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={cardStyle(isMobile)}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <div style={sectionTitleStyle(isMobile)}>Spielerliste</div>
                        <div style={sectionSubTitleStyle()}>
                          Suchen, sortieren und bestehende Spieler bearbeiten
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          width: isMobile ? "100%" : "auto",
                        }}
                      >
                        <input
                          placeholder="Suche nach Name, Passnummer oder Rolle"
                          value={playerSearch}
                          onChange={(e) => setPlayerSearch(e.target.value)}
                          style={inputStyle(isMobile, {
                            width: isMobile ? "100%" : 300,
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
                          style={selectStyle(isMobile, {
                            width: isMobile ? "100%" : 210,
                          })}
                        >
                          <option value="name_asc">Name A-Z</option>
                          <option value="name_desc">Name Z-A</option>
                          <option value="pass_asc">Passnummer aufsteigend</option>
                          <option value="pass_desc">Passnummer absteigend</option>
                        </select>
                      </div>
                    </div>

                    <div
                      style={{
                        marginBottom: 12,
                        color: COLORS.muted,
                        fontSize: 13,
                      }}
                    >
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
                                fontSize: 15,
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
                                fontSize: 15,
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
                                fontSize: 15,
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
                                  padding: "9px 12px",
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
                                  padding: "9px 12px",
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
                                  padding: "9px 12px",
                                  textAlign: "left",
                                  verticalAlign: "middle",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 6,
                                    flexWrap: "nowrap",
                                    alignItems: "center",
                                  }}
                                >
                                  <button
                                    onClick={() => editPlayer(p)}
                                    style={mutedButton(isMobile, {
                                      padding: "6px 10px",
                                      fontSize: 13,
                                    })}
                                  >
                                    Bearbeiten
                                  </button>
                                  <button
                                    onClick={() => deletePlayer(p.id, p.name)}
                                    style={dangerButton(isMobile, {
                                      padding: "6px 10px",
                                      fontSize: 13,
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
                                style={{
                                  padding: 14,
                                  color: COLORS.muted,
                                  textAlign: "left",
                                }}
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
                <div style={{ ...softPanelStyle(isMobile), maxWidth: 560 }}>
                  <div style={sectionTitleStyle(isMobile)}>Einstellungen</div>
                  <div style={sectionSubTitleStyle()}>
                    Überschrift und Vereinslogo für die gesamte App anpassen
                  </div>

                  <div style={{ display: "grid", gap: 12 }}>
                    <FormField label="Überschrift">
                      <input
                        placeholder="Überschrift"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        style={inputStyle(isMobile)}
                      />
                    </FormField>

                    <button onClick={saveSettings} style={successButton(isMobile)}>
                      Überschrift speichern
                    </button>

                    <FormField label="Vereinslogo hochladen">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        style={inputStyle(isMobile)}
                      />
                    </FormField>

                    <div
                      style={{
                        color: COLORS.muted,
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      Das Vereinslogo wird direkt in Supabase Storage hochgeladen und
                      ist danach für alle Nutzer auf PC und Handy sichtbar.
                    </div>

                    <div style={{ marginTop: 4 }}>
                      <img
                        src={logoSrc}
                        alt="Vereinslogo"
                        onError={(e) => {
                          e.currentTarget.src = CLUB_LOGO_PUBLIC_URL;
                        }}
                        style={{
                          width: 96,
                          height: 96,
                          objectFit: "contain",
                          borderRadius: 16,
                          border: `2px solid ${COLORS.red}`,
                          background: "#fff",
                          padding: 6,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle(isMobile)}>
      <div style={appContainerStyle()}>
        <div
          style={{
            ...cardStyle(isMobile),
            marginBottom: 18,
            background:
              "linear-gradient(135deg, #ffffff 0%, #f8fbff 55%, #f5f8fc 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                minWidth: 0,
                flex: 1,
              }}
            >
              <img
                src={logoSrc}
                alt="Logo"
                onError={(e) => {
                  e.currentTarget.src = CLUB_LOGO_PUBLIC_URL;
                }}
                style={{
                  height: isMobile ? 60 : 68,
                  width: isMobile ? 60 : 68,
                  borderRadius: 16,
                  objectFit: "contain",
                  border: `2px solid ${COLORS.red}`,
                  background: "#fff",
                  padding: 4,
                  flexShrink: 0,
                }}
              />

              <div style={{ minWidth: 0 }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={pillStyle("blue")}>Spielerbereich</span>
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: isMobile ? 24 : 30,
                    lineHeight: 1.15,
                    color: COLORS.blue,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
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
                marginLeft: "auto",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                width: isMobile ? "100%" : "auto",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.muted,
                  textAlign: isMobile ? "left" : "right",
                  lineHeight: 1.35,
                  minWidth: 0,
                }}
              >
                Angemeldet als{" "}
                <strong style={{ color: COLORS.blue }}>{currentUser.name}</strong>
                {currentUser.role ? ` · ${currentUser.role}` : ""}
              </div>

              <button
                onClick={logout}
                style={dangerButton(isMobile, {
                  width: isMobile ? "100%" : "auto",
                })}
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "320px minmax(0,1fr)",
            gap: 18,
            alignItems: "start",
            minWidth: 0,
            width: "100%",
            maxWidth: "100%",
            overflowX: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div style={cardStyle(isMobile)}>
            <div style={sectionTitleStyle(isMobile)}>Turniere</div>
            <div style={sectionSubTitleStyle()}>
              Wähle ein Turnier aus, um Details und Teilnehmer zu sehen
            </div>

            <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
              {tournaments.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTournamentId(t.id)}
                  style={{
                    padding: 13,
                    borderRadius: 14,
                    background: activeTournamentId === t.id ? "#fff0f2" : COLORS.soft,
                    cursor: "pointer",
                    border:
                      activeTournamentId === t.id
                        ? `1px solid ${COLORS.red}`
                        : `1px solid ${COLORS.line}`,
                    transition: "0.15s",
                    minWidth: 0,
                    boxShadow:
                      activeTournamentId === t.id
                        ? "0 8px 18px rgba(217,4,22,0.08)"
                        : "none",
                    overflow: "hidden",
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
                      fontWeight: 800,
                      color: activeTournamentId === t.id ? COLORS.redDark : COLORS.blue,
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      whiteSpace: "normal",
                      marginBottom: 6,
                    }}
                  >
                    {t.title}
                  </div>
                  <div style={pillStyle("blue")}>{t.team_name || "Keine Mannschaft"}</div>
                </div>
              ))}

              {tournaments.length === 0 ? (
                <div style={emptyStateStyle()}>Noch keine Turniere vorhanden.</div>
              ) : null}
            </div>
          </div>

          <div style={{ ...cardStyle(isMobile), minWidth: 0, overflowX: "hidden" }}>
            {activeTournament ? (
              <>
                <div
                  style={{
                    marginBottom: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                    minWidth: 0,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h2
                      style={{
                        marginTop: 0,
                        marginBottom: 8,
                        color: COLORS.blue,
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        whiteSpace: "normal",
                        fontSize: isMobile ? 24 : 28,
                      }}
                    >
                      {activeTournament.title}
                    </h2>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={pillStyle("blue")}>
                        {formatDate(activeTournament.date)}
                      </span>
                      <span style={pillStyle("green")}>
                        Zusagen: {countDabei}
                      </span>
                      <span style={pillStyle("orange")}>
                        Absagen: {countNichtDabei}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={detailBoxStyle(isMobile)}>
                  <div style={detailRowStyle(isMobile)}>
                    <div style={detailLabelStyle(isMobile)}>Datum:</div>
                    <div style={detailValueStyle(isMobile)}>
                      {formatDate(activeTournament.date)}
                    </div>
                  </div>
                  <div style={detailRowStyle(isMobile)}>
                    <div style={detailLabelStyle(isMobile)}>Meldung:</div>
                    <div style={detailValueStyle(isMobile)}>
                      {activeTournament.registration_time || "-"}
                    </div>
                  </div>
                  <div style={detailRowStyle(isMobile)}>
                    <div style={detailLabelStyle(isMobile)}>Beginn:</div>
                    <div style={detailValueStyle(isMobile)}>
                      {activeTournament.start_time || "-"}
                    </div>
                  </div>
                  <div style={detailRowStyle(isMobile)}>
                    <div style={detailLabelStyle(isMobile)}>Ort:</div>
                    <div style={detailValueStyle(isMobile)}>
                      {activeTournament.location || "-"}
                    </div>
                  </div>
                  <div style={detailRowStyle(isMobile)}>
                    <div style={detailLabelStyle(isMobile)}>Mannschaft:</div>
                    <div style={detailValueStyle(isMobile)}>
                      {activeTournament.team_name || "-"}
                    </div>
                  </div>
                  <div style={detailRowStyle(isMobile)}>
                    <div style={detailLabelStyle(isMobile)}>Turnierart:</div>
                    <div style={detailValueStyle(isMobile)}>
                      {activeTournament.tournamentType || "-"}
                    </div>
                  </div>
                  <div style={detailRowStyle(isMobile)}>
                    <div style={detailLabelStyle(isMobile)}>Pässe:</div>
                    <div style={detailValueStyle(isMobile)}>
                      {activeTournament.has_passes || "-"}
                    </div>
                  </div>
                  <div style={{ ...detailRowStyle(isMobile), borderBottom: "none" }}>
                    <div style={detailLabelStyle(isMobile)}>Bemerkung:</div>
                    <div style={detailValueStyle(isMobile)}>
                      {activeTournament.notes || "-"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 18,
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  <button
                    onClick={() => saveStatus("dabei")}
                    style={successButton(isMobile, {
                      width: isMobile ? "100%" : "auto",
                    })}
                  >
                    Ich bin dabei
                  </button>
                  <button
                    onClick={() => saveStatus("nicht dabei")}
                    style={warnButton(isMobile, {
                      width: isMobile ? "100%" : "auto",
                    })}
                  >
                    Ich bin nicht dabei
                  </button>
                  <button
                    onClick={deleteMyEntry}
                    style={secondaryGhostButton(isMobile, {
                      width: isMobile ? "100%" : "auto",
                    })}
                  >
                    Meldung löschen
                  </button>
                </div>

                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    marginBottom: 10,
                    color: COLORS.blue,
                  }}
                >
                  Teilnehmer
                </div>

                {activeEntries.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      width: "100%",
                      maxWidth: "100%",
                      minWidth: 0,
                      overflowX: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                    {activeEntries.map((e) => (
                      <ParticipantCard
                        key={e.id}
                        name={e.player_name}
                        passNumber={getPassNumberByPlayerName(e.player_name)}
                        status={e.status}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={emptyStateStyle()}>
                    Noch keine Teilnehmer vorhanden.
                  </div>
                )}
              </>
            ) : (
              <div style={emptyStateStyle()}>Bitte ein Turnier auswählen.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}