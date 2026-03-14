import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Layers,
  LayoutDashboard,
  Users,
  CalendarDays,
  BarChart3,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Play,
  Check,
  X,
  UserX,
  Briefcase,
  Clock3,
  LifeBuoy,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Role = "Admin" | "Barber" | "Reception";
type BarberStatus = "Available" | "Busy" | "Break";
type AppointmentStatus = "scheduled" | "queued" | "in-progress" | "completed" | "cancelled" | "no-show";

interface UserSession {
  role: Role;
  displayName: string;
  barberId: string | null;
}

interface Barber {
  id: string;
  name: string;
  status: BarberStatus;
  currentCustomer: string | null;
  estimatedFinishTime: string | null;
  queueLength: number;
  schedule: Array<{
    day: string;
    start: string;
    end: string;
    off: boolean;
  }>;
  scheduleByDate: Record<
    string,
    {
      start: string;
      end: string;
      off: boolean;
    }
  >;
  shiftLogs: Record<
    string,
    {
      workedStart: string;
      workedEnd: string;
      breakMin: number;
      paid: boolean;
      notes: string;
    }
  >;
}

interface QueueEntry {
  id: string;
  appointmentId: string;
  customerName: string;
  serviceType: string;
  estimatedDurationMin: number;
  createdAt: string;
  assignedBarberId: string | null;
}

interface Appointment {
  id: string;
  customerName: string;
  serviceType: string;
  durationMin: number;
  status: AppointmentStatus;
  source: "walk-in" | "appointment" | "booksy";
  assignedBarberId: string | null;
  scheduledAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

interface NotificationLog {
  id: string;
  channel: "sms" | "email";
  recipient: string;
  message: string;
  status: "queued" | "sent" | "failed";
  createdAt: string;
  provider: "vonage" | "sendgrid";
  error?: string;
}

interface Analytics {
  totalBookingsToday: number;
  walkIns: number;
  appointments: number;
  directAppointments?: number;
  booksyAppointments?: number;
  peakHours: Array<{ hour: string; count: number }>;
  barberPerformance: Array<{
    barberId: string;
    barberName: string;
    completed: number;
    noShows: number;
    inProgress: number;
  }>;
}

interface OwnerState {
  serverTime: string;
  barbers: Barber[];
  queue: QueueEntry[];
  appointments: Appointment[];
  notificationLogs: NotificationLog[];
  analytics: Analytics;
}

interface WalkInAvailability {
  available: boolean;
  slotIso?: string;
  durationMin: number;
  barberId?: string;
  barberName?: string;
  message: string;
}

interface SharedServiceOption {
  name: string;
  price: string;
  durationMin: number;
}

interface SharedCatalogResponse {
  serviceOptions: SharedServiceOption[];
}

const TOKEN_KEY = "owner-dashboard-token";
const USER_KEY = "owner-dashboard-user";
const ENABLE_LIVE_QUEUE_UI = false;
const COMPANY_LOGO = "/logobarber.png";

const sectionItems = [
  { id: "all", label: "Daily Operations", icon: Layers },
  { id: "team", label: "Barber Team", icon: Users },
  { id: "schedule", label: "Schedule Manager", icon: CalendarDays },
  { id: "payroll", label: "Payroll", icon: Briefcase },
  ...(ENABLE_LIVE_QUEUE_UI ? [{ id: "queue", label: "Live Queue", icon: Users }] : []),
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "analytics", label: "Insights", icon: BarChart3 },
];

async function api<T>(url: string, token: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(payload.error || "Request failed");
  }

  return response.json() as Promise<T>;
}

function formatTime(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDateKeys(weekStartKey: string) {
  const start = new Date(`${weekStartKey}T00:00:00`);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toDateKey(d);
  });
}

function shiftDateKey(dateKey: string, days: number) {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

function getShiftForDate(barber: Barber, dateKey: string) {
  const byDate = barber.scheduleByDate?.[dateKey];
  if (byDate) return byDate;
  const previousWeekShift = barber.scheduleByDate?.[shiftDateKey(dateKey, -7)];
  if (previousWeekShift) return previousWeekShift;
  return { start: "", end: "", off: false };
}

function formatDateLabel(dateKey: string) {
  const d = new Date(`${dateKey}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getPastDateKeys(days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (i + 1));
    return toDateKey(d);
  });
}

function computeWorkedHours(dateKey: string, start: string, end: string, breakMin: number) {
  if (!start || !end) return "-";
  const startTime = new Date(`${dateKey}T${start}:00`).getTime();
  const endTime = new Date(`${dateKey}T${end}:00`).getTime();
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) return "-";
  const totalMin = Math.max(0, Math.round((endTime - startTime) / 60000) - Math.max(0, breakMin || 0));
  return (totalMin / 60).toFixed(2);
}

function statusClass(status: BarberStatus | AppointmentStatus) {
  if (status === "Available" || status === "completed") return "bg-emerald-500/20 text-emerald-300 border-emerald-400/40";
  if (status === "Busy" || status === "in-progress") return "bg-amber-500/20 text-amber-300 border-amber-400/40";
  if (status === "Break" || status === "cancelled") return "bg-slate-500/20 text-slate-300 border-slate-400/40";
  if (status === "queued" || status === "scheduled") return "bg-sky-500/20 text-sky-300 border-sky-400/40";
  return "bg-rose-500/20 text-rose-300 border-rose-400/40";
}

function sourceClass(source: Appointment["source"]) {
  if (source === "booksy") return "bg-cyan-500/20 text-cyan-300 border-cyan-400/40";
  if (source === "appointment") return "bg-violet-500/20 text-violet-300 border-violet-400/40";
  return "bg-amber-500/20 text-amber-300 border-amber-400/40";
}

function sourceLabel(source: Appointment["source"]) {
  if (source === "booksy") return "Booksy";
  if (source === "appointment") return "Direct";
  return "Walk-in";
}

export default function OwnerDashboard() {
  const [token, setToken] = useState<string>(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState<UserSession | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  });
  const [state, setState] = useState<OwnerState | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("all");

  const [displayName, setDisplayName] = useState("Owner");
  const [pin, setPin] = useState("");
  const [newBarberName, setNewBarberName] = useState("");
  const [teamToolMode, setTeamToolMode] = useState<"database" | "schedule">("database");
  const [weekStartKey, setWeekStartKey] = useState(() => toDateKey(getWeekStart(new Date())));
  const [scheduleEditMode, setScheduleEditMode] = useState(false);
  const [payrollEditMode, setPayrollEditMode] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<{ id: string; name: string } | null>(null);
  const [removeConfirmText, setRemoveConfirmText] = useState("");
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportScreenshot, setSupportScreenshot] = useState<
    { filename: string; type: string; contentBase64: string } | null
  >(null);
  const [supportResult, setSupportResult] = useState("");
  const [walkInCustomerName, setWalkInCustomerName] = useState("");
  const [walkInServiceType, setWalkInServiceType] = useState("");
  const [walkInBarberId, setWalkInBarberId] = useState("");
  const [walkInAvailability, setWalkInAvailability] = useState<WalkInAvailability | null>(null);
  const [walkInStatusMessage, setWalkInStatusMessage] = useState("");
  const [sharedServiceOptions, setSharedServiceOptions] = useState<SharedServiceOption[]>([]);

  const [walkInName, setWalkInName] = useState("");
  const [walkInService, setWalkInService] = useState("Mens Haircut");
  const [walkInDuration, setWalkInDuration] = useState(35);
  const [selectedShiftBarberId, setSelectedShiftBarberId] = useState("");

  const pollRef = useRef<number | null>(null);

  const canManageQueue = user?.role === "Admin";
  const canManageAppointments = Boolean(user);
  const showAllSections = activeSection === "all";
  const currentWeekStartKey = useMemo(() => toDateKey(getWeekStart(new Date())), []);
  const weekDateKeys = useMemo(() => getWeekDateKeys(weekStartKey), [weekStartKey]);
  const pastShiftDateKeys = useMemo(() => getPastDateKeys(14), []);

  const onSectionSelect = (sectionId: string) => {
    if (sectionId === "schedule") {
      setActiveSection("schedule");
      setTeamToolMode("schedule");
      return;
    }
    if (sectionId === "team") {
      setActiveSection("team");
      setTeamToolMode("database");
      setScheduleEditMode(false);
      setPayrollEditMode(false);
      return;
    }
    if (sectionId === "payroll") {
      setActiveSection("payroll");
      setScheduleEditMode(false);
      return;
    }
    setScheduleEditMode(false);
    setPayrollEditMode(false);
    setActiveSection(sectionId);
  };

  const appointmentsByStatus = useMemo(() => {
    const grouped = {
      today: state?.appointments || [],
      inProgress: (state?.appointments || []).filter((a) => a.status === "in-progress"),
      completed: (state?.appointments || []).filter((a) => a.status === "completed"),
      noShows: (state?.appointments || []).filter((a) => a.status === "no-show"),
    };
    return grouped;
  }, [state]);

  useEffect(() => {
    if (!token || !walkInServiceType.trim()) {
      setWalkInAvailability(null);
      return;
    }

    let disposed = false;

    const run = async () => {
      try {
        const availability = await api<WalkInAvailability>(
          "/api/owner/walkins/availability",
          token,
          "POST",
          {
            serviceType: walkInServiceType,
            barberId: walkInBarberId || undefined,
          }
        );
        if (!disposed) {
          setWalkInAvailability(availability);
        }
      } catch {
        if (!disposed) {
          setWalkInAvailability(null);
        }
      }
    };

    run();
    return () => {
      disposed = true;
    };
  }, [token, walkInServiceType, walkInBarberId]);

  useEffect(() => {
    const loadSharedCatalog = async () => {
      try {
        const response = await fetch("/api/shared/catalog");
        if (!response.ok) return;
        const payload = (await response.json()) as SharedCatalogResponse;
        const nextOptions = Array.isArray(payload.serviceOptions) ? payload.serviceOptions : [];
        setSharedServiceOptions(nextOptions);
        setWalkInServiceType((current) => (current || nextOptions[0]?.name || ""));
      } catch {
        // Keep existing values if shared catalog is temporarily unavailable.
      }
    };

    loadSharedCatalog();
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const firstBarberId = state?.barbers?.[0]?.id || "";
    setSelectedShiftBarberId((current) => {
      if (current && state?.barbers.some((b) => b.id === current)) return current;
      return firstBarberId;
    });
  }, [state]);

  useEffect(() => {
    if (!token) {
      setState(null);
      return;
    }

    let eventSource: EventSource | null = null;

    const load = async () => {
      try {
        const ownerState = await api<OwnerState>("/api/owner/state", token);
        setState(ownerState);
        setError("");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load dashboard state";
        setError(msg);
      }
    };

    load();

    eventSource = new EventSource(`/api/owner/stream?token=${encodeURIComponent(token)}`);
    eventSource.addEventListener("owner-state", (event) => {
      const customEvent = event as MessageEvent;
      const payload = JSON.parse(customEvent.data) as OwnerState;
      setState(payload);
      setError("");
    });

    eventSource.onerror = () => {
      if (eventSource) {
        eventSource.close();
      }
    };

    pollRef.current = window.setInterval(load, 5_000);

    return () => {
      if (eventSource) eventSource.close();
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [token]);

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/owner/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, displayName }),
      });

      const raw = await response.text();
      let payload: Record<string, unknown> = {};
      if (raw) {
        try {
          payload = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          payload = {};
        }
      }

      if (!response.ok) {
        const errorMessage =
          typeof payload.error === "string"
            ? payload.error
            : `Login failed (${response.status}). Ensure the server is running and /api/owner/auth/login is available.`;
        throw new Error(errorMessage);
      }

      if (typeof payload.token !== "string" || typeof payload.user !== "object" || payload.user === null) {
        throw new Error("Unexpected login response. Please restart the dev server and try again.");
      }

      setToken(payload.token);
      setUser(payload.user as UserSession);
      localStorage.setItem(TOKEN_KEY, payload.token);
      localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
      setPin("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login();
  };

  const logout = async () => {
    try {
      if (token) {
        await api("/api/owner/auth/logout", token, "POST");
      }
    } catch {
      // Ignore logout failures and clear local session anyway.
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
    setState(null);
  };

  const refresh = async () => {
    if (!token) return;
    const ownerState = await api<OwnerState>("/api/owner/state", token);
    setState(ownerState);
  };

  const updateBarberStatus = async (id: string, status: BarberStatus) => {
    if (!token) return;
    await api(`/api/owner/barbers/${id}/status`, token, "POST", { status });
    await refresh();
  };

  const addWalkIn = async () => {
    if (!token || !walkInName.trim()) return;
    await api("/api/owner/queue/walkin", token, "POST", {
      customerName: walkInName.trim(),
      serviceType: walkInService,
      estimatedDurationMin: walkInDuration,
    });
    setWalkInName("");
    await refresh();
  };

  const assignQueueEntry = async (queueId: string, selectedBarberId: string) => {
    if (!token) return;
    await api("/api/owner/queue/assign", token, "POST", { queueId, barberId: selectedBarberId });
    await refresh();
  };

  const reorderQueue = async (index: number, direction: -1 | 1) => {
    if (!token || !state) return;
    const next = [...state.queue];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    await api("/api/owner/queue/reorder", token, "POST", { orderedIds: next.map((q) => q.id) });
    await refresh();
  };

  const removeQueueEntry = async (queueId: string) => {
    if (!token) return;
    await api(`/api/owner/queue/${queueId}`, token, "DELETE");
    await refresh();
  };

  const updateAppointment = async (appointmentId: string, action: "start" | "finish" | "cancel" | "no-show") => {
    if (!token) return;
    await api(`/api/owner/appointments/${appointmentId}/action`, token, "POST", { action });
    await refresh();
  };

  const addBarber = async () => {
    if (!token || !newBarberName.trim()) return;
    await api("/api/owner/barbers", token, "POST", { name: newBarberName.trim() });
    setNewBarberName("");
    await refresh();
  };

  const saveBarberProfile = async (barber: Barber) => {
    if (!token) return;
    await api(`/api/owner/barbers/${barber.id}`, token, "PATCH", {
      name: barber.name,
      status: barber.status,
    });
    await refresh();
  };

  const removeBarber = async (barberIdToDelete: string) => {
    if (!token) return;
    await api(`/api/owner/barbers/${barberIdToDelete}`, token, "DELETE");
    setPendingRemoval(null);
    setRemoveConfirmText("");
    await refresh();
  };

  const updateDateScheduleCell = (
    barberIdToUpdate: string,
    dateKey: string,
    field: "start" | "end" | "off",
    value: string | boolean
  ) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        barbers: prev.barbers.map((b) => {
          if (b.id !== barberIdToUpdate) return b;
          const existing = getShiftForDate(b, dateKey);
          return {
            ...b,
            scheduleByDate: {
              ...(b.scheduleByDate || {}),
              [dateKey]: {
                ...existing,
                [field]: value,
              },
            },
          };
        }),
      };
    });
  };

  const saveCurrentWeekSchedule = async () => {
    if (!token || !state) return;
    for (const barber of state.barbers) {
      const dateSchedules = Object.entries(barber.scheduleByDate || {}).map(([date, v]) => {
        const row = v as { start: string; end: string; off: boolean };
        return {
        date,
        start: row.start,
        end: row.end,
        off: row.off,
      };
      });
      await api(`/api/owner/barbers/${barber.id}/schedule`, token, "PUT", {
        dateSchedules,
      });
    }
    await refresh();
    setScheduleEditMode(false);
    setBannerMessage("Schedule saved successfully.");
    window.setTimeout(() => setBannerMessage(""), 2400);
  };

  const printCurrentWeekSchedule = () => {
    if (!state) return;
    const rows = state.barbers
      .map((barber) => {
        const cells = weekDateKeys
          .map((dateKey) => {
            const shift = getShiftForDate(barber, dateKey);
            const text = shift.off ? "Off" : `${shift.start} - ${shift.end}`;
            return `<td>${text}</td>`;
          })
          .join("");
        return `<tr><td><strong>${barber.name}</strong></td>${cells}</tr>`;
      })
      .join("");

    const headerCells = weekDateKeys.map((d) => `<th>${formatDateLabel(d)}</th>`).join("");
    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>S.Blends Schedule</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>S.Blends Weekly Schedule</h1>
          <div>Week of ${formatDateLabel(weekDateKeys[0])}</div>
          <table>
            <thead><tr><th>Barber</th>${headerCells}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const updateShiftLogCell = (
    barberIdToUpdate: string,
    dateKey: string,
    field: "workedStart" | "workedEnd" | "breakMin" | "paid" | "notes",
    value: string | number | boolean
  ) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        barbers: prev.barbers.map((b) => {
          if (b.id !== barberIdToUpdate) return b;
          const existing = b.shiftLogs?.[dateKey] || {
            workedStart: "",
            workedEnd: "",
            breakMin: 0,
            paid: false,
            notes: "",
          };
          return {
            ...b,
            shiftLogs: {
              ...(b.shiftLogs || {}),
              [dateKey]: {
                ...existing,
                [field]: value,
              },
            },
          };
        }),
      };
    });
  };

  const saveShiftLog = async (barberIdToSave: string, dateKey: string, skipRefresh = false) => {
    if (!token || !state) return;
    const barber = state.barbers.find((b) => b.id === barberIdToSave);
    if (!barber) return;
    const entry = barber.shiftLogs?.[dateKey] || {
      workedStart: "",
      workedEnd: "",
      breakMin: 0,
      paid: false,
      notes: "",
    };
    await api(`/api/owner/barbers/${barberIdToSave}/shift-log`, token, "PUT", {
      date: dateKey,
      workedStart: entry.workedStart,
      workedEnd: entry.workedEnd,
      breakMin: Number(entry.breakMin || 0),
      paid: Boolean(entry.paid),
      notes: entry.notes || "",
    });
    if (!skipRefresh) {
      await refresh();
    }
  };

  const savePayrollForSelectedBarber = async () => {
    if (!state || !selectedShiftBarberId) return;
    for (const dateKey of pastShiftDateKeys) {
      await saveShiftLog(selectedShiftBarberId, dateKey, true);
    }
    await refresh();
    setPayrollEditMode(false);
    setBannerMessage("Payroll entries saved successfully.");
    window.setTimeout(() => setBannerMessage(""), 2400);
  };

  const submitSupportTicket = async () => {
    if (!token || !supportSubject.trim() || !supportMessage.trim()) return;
    const result = await api<{ ok: boolean; results: Array<{ to: string; sent: boolean; error?: string }> }>(
      "/api/owner/support-ticket",
      token,
      "POST",
      {
        subject: supportSubject.trim(),
        message: supportMessage.trim(),
        screenshot: supportScreenshot,
      }
    );

    if (result.ok) {
      setSupportResult("Support ticket sent to IT successfully.");
      setSupportSubject("");
      setSupportMessage("");
      setSupportScreenshot(null);
    } else {
      setSupportResult("Ticket submitted with delivery issues. Please verify SendGrid configuration.");
    }
  };

  const createWalkInAppointment = async () => {
    if (!token || !walkInCustomerName.trim() || !walkInServiceType.trim()) return;
    try {
      const result = await api<{
        ok: boolean;
        appointment: Appointment;
        assignedBarber: { id: string; name: string };
      }>("/api/owner/walkins", token, "POST", {
        customerName: walkInCustomerName.trim(),
        serviceType: walkInServiceType.trim(),
        barberId: walkInBarberId || undefined,
      });

      const time = new Date(result.appointment.scheduledAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setWalkInStatusMessage(`Walk-in added for ${time} with ${result.assignedBarber.name}.`);
      setWalkInCustomerName("");
      setWalkInServiceType("");
      setWalkInBarberId("");
      setWalkInAvailability(null);
      await refresh();
    } catch (err) {
      setWalkInStatusMessage(err instanceof Error ? err.message : "Failed to add walk-in");
    }
  };

  const onSupportScreenshotSelected = async (file?: File) => {
    if (!file) {
      setSupportScreenshot(null);
      return;
    }
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      setSupportResult("Please upload an image file for screenshot.");
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read screenshot file"));
      reader.readAsDataURL(file);
    });

    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : "";
    if (!base64) {
      setSupportResult("Could not process screenshot file.");
      return;
    }

    setSupportScreenshot({
      filename: file.name,
      type: file.type,
      contentBase64: base64,
    });
    setSupportResult("");
  };

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-noir text-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-noir-light border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="text-gold" size={22} />
            <h1 className="text-3xl font-display text-white">Owner Dashboard Access</h1>
          </div>
          <p className="text-gray-400 mb-8 font-light">Secure role-based access for operational staff.</p>

          <form onSubmit={onLoginSubmit}>
            <label className="text-sm text-gray-300 block mb-4">
              Display Name
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
              />
            </label>

            <div className="mb-4 text-xs text-gray-500 uppercase tracking-widest">Admin Access Only</div>

            <label className="text-sm text-gray-300 block mb-6">
              Access PIN
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                placeholder="Use role PIN from environment"
              />
            </label>

            {error && <div className="mb-4 text-sm text-rose-300 border border-rose-500/30 bg-rose-500/10 rounded-lg px-3 py-2">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-noir font-bold uppercase tracking-widest text-xs px-4 py-3 rounded-xl hover:bg-gold-light transition-colors disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5 text-xs text-gray-500 flex items-center gap-2">
            <Clock3 size={14} />
            Default local pin: Admin 1111
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir text-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="lg:min-h-screen border-b lg:border-b-0 lg:border-r border-white/10 bg-noir-light/80 p-3 lg:p-5">
          <div className="flex items-center gap-3 mb-5 lg:mb-10">
            <img src={COMPANY_LOGO} alt="S.Blends" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg text-white font-display">Owner Console</h1>
              <p className="text-xs text-gray-400 uppercase tracking-widest">S.Blends Operations</p>
            </div>
          </div>

          <nav className="flex lg:block gap-2 lg:space-y-2 overflow-x-auto pb-2 lg:pb-0">
            {sectionItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionSelect(item.id)}
                  title={item.label}
                  aria-label={item.label}
                  className={`shrink-0 lg:w-full flex items-center justify-center lg:justify-start gap-0 lg:gap-3 px-2.5 lg:px-3 py-2.5 rounded-xl text-left transition-colors ${
                    active ? "bg-gold text-noir" : "hover:bg-white/5 text-gray-300"
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden lg:inline text-sm font-semibold tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="p-3 sm:p-4 lg:p-6 space-y-5 lg:space-y-6">
          <div className="flex items-center justify-between gap-3 bg-noir-light border border-white/10 rounded-xl px-3 py-2.5">
            <div className="min-w-0">
              <div className="text-sm text-white font-semibold truncate">{user.displayName}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest">{user.role}</div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 border border-white/15 text-gray-200 text-[11px] uppercase tracking-widest font-bold py-1.5 px-2.5 rounded-lg hover:bg-white/5"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>

          {error && <div className="text-sm text-rose-300 border border-rose-500/30 bg-rose-500/10 rounded-lg px-3 py-2">{error}</div>}
          {bannerMessage && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[120] w-[calc(100%-1.5rem)] sm:w-auto max-w-xl text-sm text-emerald-200 border border-emerald-500/30 bg-emerald-500/10 rounded-lg px-3 py-2 shadow-2xl backdrop-blur-sm">
              {bannerMessage}
            </div>
          )}

          <section className="bg-noir-light border border-gold/40 rounded-2xl p-3.5 lg:p-4 shadow-[0_8px_28px_rgba(212,175,55,0.12)]">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-base lg:text-lg text-white font-display">Quick Walk-In</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
              <label className="text-sm text-gray-300">
                Name <span className="text-rose-300">*</span>
                <input
                  value={walkInCustomerName}
                  onChange={(e) => setWalkInCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                />
              </label>

              <label className="text-sm text-gray-300">
                Service <span className="text-rose-300">*</span>
                <select
                  value={walkInServiceType}
                  onChange={(e) => setWalkInServiceType(e.target.value)}
                  className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                >
                  <option value="">Select service</option>
                  {sharedServiceOptions.map((service) => (
                    <option key={service.name} value={service.name}>
                      {service.name} ({service.price})
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-gray-300">
                Barber (optional)
                <select
                  value={walkInBarberId}
                  onChange={(e) => setWalkInBarberId(e.target.value)}
                  className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                >
                  <option value="">Any barber (closest slot)</option>
                  {(state?.barbers || []).map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </label>

              <button
                onClick={createWalkInAppointment}
                disabled={!walkInCustomerName.trim() || !walkInServiceType.trim()}
                className="w-full md:w-auto bg-gold text-noir font-bold rounded-xl px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-gold-light disabled:opacity-50"
              >
                Add Walk-In
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {walkInAvailability && (
                <div className={`text-xs rounded-lg px-3 py-2 border ${
                  walkInAvailability.available
                    ? "text-emerald-200 border-emerald-500/30 bg-emerald-500/10"
                    : "text-rose-200 border-rose-500/30 bg-rose-500/10"
                }`}>
                  {walkInAvailability.message}
                </div>
              )}
              {walkInStatusMessage && (
                <div className="text-xs text-gold border border-gold/30 bg-gold/10 rounded-lg px-3 py-2">
                  {walkInStatusMessage}
                </div>
              )}
            </div>
          </section>

          <SmoothSection show={showAllSections || activeSection === "overview"} id="overview" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-xl lg:text-2xl text-white font-display">Barber Status Overview</h2>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Live • {formatTime(state?.serverTime || null)}</div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {state?.barbers.map((barber) => (
                <div key={barber.id} className="bg-noir-light border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{barber.name}</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">Queue {barber.queueLength}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusClass(barber.status)}`}>
                      {barber.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-300 space-y-2">
                    <div className="flex justify-between gap-4">
                      <span>Current Customer</span>
                      <span className="text-white font-semibold">{barber.currentCustomer || "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Estimated Finish</span>
                      <span className="text-white font-semibold">{formatTime(barber.estimatedFinishTime)}</span>
                    </div>
                  </div>

                  {(user.role === "Admin" || (user.role === "Barber" && user.barberId === barber.id)) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {(["Available", "Busy", "Break"] as BarberStatus[]).map((next) => (
                        <button
                          key={next}
                          onClick={() => updateBarberStatus(barber.id, next)}
                          className="text-xs border border-white/15 rounded-lg px-2.5 py-1.5 hover:bg-white/5"
                        >
                          {next}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SmoothSection>

          <SmoothSection show={activeSection === "team"} id="team" className="space-y-4">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
              <h2 className="text-xl lg:text-2xl text-white font-display">Barber Team</h2>
            </div>

            {!showAllSections && teamToolMode === "database" && (
              <>
                <div className="bg-noir-light border border-white/10 rounded-2xl p-5">
                  <div className="flex flex-col md:flex-row gap-3 md:items-end">
                    <label className="text-sm text-gray-300 w-full md:max-w-sm">
                      Add Barber
                      <input
                        value={newBarberName}
                        onChange={(e) => setNewBarberName(e.target.value)}
                        placeholder="Barber name"
                        className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                      />
                    </label>
                    <button
                      onClick={addBarber}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gold text-noir font-bold text-xs uppercase tracking-widest rounded-xl px-4 py-2 hover:bg-gold-light"
                    >
                      Add To Team
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(state?.barbers || []).map((barber) => (
                    <div key={barber.id} className="bg-noir-light border border-white/10 rounded-2xl p-5">
                      <div className="flex flex-col xl:flex-row xl:items-end gap-3">
                        <label className="text-sm text-gray-300 w-full lg:max-w-xs">
                          Barber Name
                          <input
                            value={barber.name}
                            onChange={(e) =>
                              setState((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      barbers: prev.barbers.map((b) =>
                                        b.id === barber.id ? { ...b, name: e.target.value } : b
                                      ),
                                    }
                                  : prev
                              )
                            }
                            className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                          />
                        </label>

                        <label className="text-sm text-gray-300 w-full lg:max-w-xs">
                          Status
                          <select
                            value={barber.status}
                            onChange={(e) =>
                              setState((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      barbers: prev.barbers.map((b) =>
                                        b.id === barber.id ? { ...b, status: e.target.value as BarberStatus } : b
                                      ),
                                    }
                                  : prev
                              )
                            }
                            className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                          >
                            <option value="Available">Available</option>
                            <option value="Busy">Busy</option>
                            <option value="Break">Break</option>
                          </select>
                        </label>

                        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                          <button
                            onClick={() => saveBarberProfile(barber)}
                            className="border border-white/15 rounded-lg px-3 py-2 text-xs uppercase tracking-widest hover:bg-white/5 w-full sm:w-auto"
                          >
                            Save Profile
                          </button>
                          <button
                            onClick={() => {
                              setPendingRemoval({ id: barber.id, name: barber.name });
                              setRemoveConfirmText("");
                            }}
                            className="border border-rose-400/30 text-rose-300 rounded-lg px-3 py-2 text-xs uppercase tracking-widest hover:bg-rose-500/10 w-full sm:w-auto"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}


          </SmoothSection>

          <SmoothSection show={activeSection === "schedule"} id="schedule" className="space-y-4">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
              <h2 className="text-xl lg:text-2xl text-white font-display">Barber Team & Schedule</h2>
              <div className="flex flex-col sm:flex-row xl:items-center gap-2 w-full xl:w-auto xl:justify-end">
                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const d = new Date(`${weekStartKey}T00:00:00`);
                      d.setDate(d.getDate() - 7);
                      setWeekStartKey(toDateKey(d));
                    }}
                    className="text-xs rounded-lg px-3 py-2 border border-white/15 text-gray-200 hover:bg-white/5 inline-flex items-center justify-center"
                    title="Previous Week"
                    aria-label="Previous Week"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setWeekStartKey(toDateKey(getWeekStart(new Date())));
                    }}
                    className="text-xs rounded-lg px-3 py-2 border border-white/15 text-gray-200 hover:bg-white/5 inline-flex items-center justify-center"
                    title="Current Week"
                    aria-label="Current Week"
                  >
                    <CalendarDays size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date(`${weekStartKey}T00:00:00`);
                      d.setDate(d.getDate() + 7);
                      setWeekStartKey(toDateKey(d));
                    }}
                    className="text-xs rounded-lg px-3 py-2 border border-white/15 text-gray-200 hover:bg-white/5 inline-flex items-center justify-center"
                    title="Next Week"
                    aria-label="Next Week"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

              </div>
            </div>

            <div className="bg-noir-light border border-white/10 rounded-2xl p-4 overflow-x-auto">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[170px_repeat(7,minmax(0,1fr))] gap-2 text-[11px] uppercase tracking-widest text-gray-500 mb-2">
                  <span className="px-2">Barber</span>
                  {weekDateKeys.map((dateKey) => (
                    <span key={dateKey} className="px-2 text-center">{formatDateLabel(dateKey)}</span>
                  ))}
                </div>
                <div className="space-y-2">
                  {(state?.barbers || []).map((barber) => (
                    <div key={barber.id} className="grid grid-cols-[170px_repeat(7,minmax(0,1fr))] gap-2 items-stretch">
                      <div className="bg-black/25 border border-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
                        <span className="text-white font-semibold text-sm">{barber.name}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusClass(barber.status)}`}>
                          {barber.status}
                        </span>
                      </div>
                      {weekDateKeys.map((dateKey) => {
                        const shift = getShiftForDate(barber, dateKey);
                        return (
                          <div key={`${barber.id}-${dateKey}`} className="bg-black/25 border border-white/5 rounded-lg px-2 py-2 text-center">
                            <div className="text-xs text-white font-semibold">{shift.off ? "Off" : `${shift.start} - ${shift.end}`}</div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {!scheduleEditMode ? (
                  <button
                    onClick={() => setScheduleEditMode(true)}
                    className="border border-white/15 rounded-lg px-3 py-2 text-xs uppercase tracking-widest hover:bg-white/5"
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={saveCurrentWeekSchedule}
                      className="bg-gold text-noir font-bold rounded-lg px-3 py-2 text-xs uppercase tracking-widest hover:bg-gold-light"
                    >
                      Save
                    </button>
                    <button
                      onClick={async () => {
                        await refresh();
                        setScheduleEditMode(false);
                      }}
                      className="border border-white/15 rounded-lg px-3 py-2 text-xs uppercase tracking-widest hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={printCurrentWeekSchedule}
                  className="border border-white/15 rounded-lg px-3 py-2 text-xs uppercase tracking-widest hover:bg-white/5"
                >
                  Print
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {(state?.barbers || []).map((barber) => (
                <div key={barber.id} className="bg-noir-light border border-white/10 rounded-2xl p-5">
                  <h3 className="text-white font-bold text-lg mb-3">{barber.name}</h3>

                  <div className="overflow-x-auto">
                    <div className="min-w-[960px]">
                      <div className="grid grid-cols-[150px_repeat(7,minmax(0,1fr))] gap-2 text-[11px] uppercase tracking-widest text-gray-500 px-2 pb-2">
                        <span>Field</span>
                        {weekDateKeys.map((dateKey) => (
                          <span key={dateKey} className="text-center">{formatDateLabel(dateKey)}</span>
                        ))}
                      </div>

                      <div className="grid grid-cols-[150px_repeat(7,minmax(0,1fr))] gap-2 items-center border-t border-white/5 px-2 py-2">
                        <span className="text-xs uppercase tracking-widest text-gray-400">Start</span>
                        {weekDateKeys.map((dateKey) => {
                          const shift = getShiftForDate(barber, dateKey);
                          return (
                            <input
                              key={`${barber.id}-${dateKey}-start`}
                              type="time"
                              value={shift.start}
                              disabled={!scheduleEditMode || shift.off}
                              onChange={(e) => updateDateScheduleCell(barber.id, dateKey, "start", e.target.value)}
                              className="bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm disabled:opacity-40"
                            />
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-[150px_repeat(7,minmax(0,1fr))] gap-2 items-center border-t border-white/5 px-2 py-2">
                        <span className="text-xs uppercase tracking-widest text-gray-400">End</span>
                        {weekDateKeys.map((dateKey) => {
                          const shift = getShiftForDate(barber, dateKey);
                          return (
                            <input
                              key={`${barber.id}-${dateKey}-end`}
                              type="time"
                              value={shift.end}
                              disabled={!scheduleEditMode || shift.off}
                              onChange={(e) => updateDateScheduleCell(barber.id, dateKey, "end", e.target.value)}
                              className="bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm disabled:opacity-40"
                            />
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-[150px_repeat(7,minmax(0,1fr))] gap-2 items-center border-t border-white/5 px-2 py-2">
                        <span className="text-xs uppercase tracking-widest text-gray-400">Off Day</span>
                        {weekDateKeys.map((dateKey) => {
                          const shift = getShiftForDate(barber, dateKey);
                          return (
                            <div key={`${barber.id}-${dateKey}-off`} className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={shift.off}
                                disabled={!scheduleEditMode}
                                onChange={(e) => updateDateScheduleCell(barber.id, dateKey, "off", e.target.checked)}
                                className="h-4 w-4 accent-gold disabled:opacity-40"
                                aria-label={`${barber.name} ${dateKey} off day`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SmoothSection>

          <SmoothSection show={activeSection === "payroll"} id="payroll" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl lg:text-2xl text-white font-display">Payroll</h2>
              <div className="flex items-center gap-2">
                {!payrollEditMode ? (
                  <button
                    onClick={() => setPayrollEditMode(true)}
                    className="border border-white/15 rounded-lg px-3 py-2 text-xs uppercase tracking-widest hover:bg-white/5"
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={savePayrollForSelectedBarber}
                      className="bg-gold text-noir font-bold rounded-lg px-3 py-2 text-xs uppercase tracking-widest hover:bg-gold-light"
                    >
                      Save
                    </button>
                    <button
                      onClick={async () => {
                        await refresh();
                        setPayrollEditMode(false);
                      }}
                      className="border border-white/15 rounded-lg px-3 py-2 text-xs uppercase tracking-widest hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-noir-light border border-white/10 rounded-2xl p-5 overflow-x-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-white font-bold text-lg">Past Shift Log</h3>
                <label className="text-sm text-gray-300 w-full sm:w-auto">
                  Employee
                  <select
                    value={selectedShiftBarberId}
                    onChange={(e) => setSelectedShiftBarberId(e.target.value)}
                    className="mt-2 w-full sm:w-56 bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                  >
                    {(state?.barbers || []).map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              {(() => {
                const selectedBarber = (state?.barbers || []).find((b) => b.id === selectedShiftBarberId);
                if (!selectedBarber) {
                  return <div className="text-sm text-gray-500">Select a barber to view payroll shifts.</div>;
                }

                return (
                  <div className="min-w-[980px]">
                    <div className="grid grid-cols-[130px_120px_120px_90px_100px_90px_1fr] gap-2 text-[11px] uppercase tracking-widest text-gray-500 pb-2 border-b border-white/10">
                      <span>Date</span>
                      <span>Start</span>
                      <span>End</span>
                      <span>Break</span>
                      <span>Hours</span>
                      <span>Paid</span>
                      <span>Notes</span>
                    </div>

                    <div className="space-y-2 mt-2">
                      {pastShiftDateKeys.map((dateKey) => {
                        const log = selectedBarber.shiftLogs?.[dateKey] || {
                          workedStart: "",
                          workedEnd: "",
                          breakMin: 0,
                          paid: false,
                          notes: "",
                        };
                        return (
                          <div key={`${selectedBarber.id}-${dateKey}`} className="grid grid-cols-[130px_120px_120px_90px_100px_90px_1fr] gap-2 items-center">
                            <span className="text-sm text-white">{formatDateLabel(dateKey)}</span>
                            <input
                              type="time"
                              value={log.workedStart}
                              disabled={!payrollEditMode}
                              onChange={(e) => updateShiftLogCell(selectedBarber.id, dateKey, "workedStart", e.target.value)}
                              className="bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm disabled:opacity-50"
                            />
                            <input
                              type="time"
                              value={log.workedEnd}
                              disabled={!payrollEditMode}
                              onChange={(e) => updateShiftLogCell(selectedBarber.id, dateKey, "workedEnd", e.target.value)}
                              className="bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm disabled:opacity-50"
                            />
                            <input
                              type="number"
                              min={0}
                              value={log.breakMin}
                              disabled={!payrollEditMode}
                              onChange={(e) => updateShiftLogCell(selectedBarber.id, dateKey, "breakMin", Number(e.target.value || 0))}
                              className="bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-300">
                              {computeWorkedHours(dateKey, log.workedStart, log.workedEnd, Number(log.breakMin || 0))}
                            </span>
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={Boolean(log.paid)}
                                disabled={!payrollEditMode}
                                onChange={(e) => updateShiftLogCell(selectedBarber.id, dateKey, "paid", e.target.checked)}
                                className="h-4 w-4 accent-gold disabled:opacity-50"
                                aria-label={`${selectedBarber.name} ${dateKey} paid`}
                              />
                            </div>
                            <input
                              value={log.notes || ""}
                              disabled={!payrollEditMode}
                              onChange={(e) => updateShiftLogCell(selectedBarber.id, dateKey, "notes", e.target.value)}
                              placeholder="Optional payroll note"
                              className="bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm disabled:opacity-50"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </SmoothSection>

          <SmoothSection show={ENABLE_LIVE_QUEUE_UI && (showAllSections || activeSection === "queue")} id="queue" className="space-y-4">
              <h2 className="text-2xl text-white font-display">Live Queue Management</h2>

              {canManageQueue && (
                <div className="bg-noir-light border border-white/10 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="Walk-in customer"
                    className="bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                  />
                  <input
                    value={walkInService}
                    onChange={(e) => setWalkInService(e.target.value)}
                    placeholder="Service type"
                    className="bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                  />
                  <input
                    value={walkInDuration}
                    onChange={(e) => setWalkInDuration(Number(e.target.value))}
                    type="number"
                    min={10}
                    max={180}
                    aria-label="Estimated duration in minutes"
                    title="Estimated duration in minutes"
                    placeholder="Minutes"
                    className="bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                  />
                  <button
                    onClick={addWalkIn}
                    className="inline-flex items-center justify-center gap-2 bg-gold text-noir font-bold text-xs uppercase tracking-widest rounded-xl px-3 py-2 hover:bg-gold-light"
                  >
                    <UserPlus size={16} /> Add Walk-In
                  </button>
                </div>
              )}

              <div className="bg-noir-light border border-white/10 rounded-2xl overflow-x-auto">
                <div className="min-w-[920px]">
                <div className="grid grid-cols-[1.4fr_1fr_110px_1fr_180px] text-xs uppercase tracking-widest text-gray-400 border-b border-white/10 px-4 py-3">
                  <span>Customer</span>
                  <span>Service</span>
                  <span>Duration</span>
                  <span>Assign Barber</span>
                  <span>Actions</span>
                </div>

                {(state?.queue || []).map((entry, index) => (
                  <div key={entry.id} className="grid grid-cols-[1.4fr_1fr_110px_1fr_180px] items-center gap-3 px-4 py-3 border-b border-white/5 text-sm">
                    <span className="font-semibold text-white">{entry.customerName}</span>
                    <span className="text-gray-300">{entry.serviceType}</span>
                    <span className="text-gray-300">{entry.estimatedDurationMin}m</span>
                    <QueueAssign
                      barbers={state?.barbers || []}
                      onAssign={(selectedBarber) => assignQueueEntry(entry.id, selectedBarber)}
                      disabled={!canManageQueue}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => reorderQueue(index, -1)}
                        className="border border-white/15 p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-40"
                        disabled={!canManageQueue || index === 0}
                        title="Move up"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        onClick={() => reorderQueue(index, 1)}
                        className="border border-white/15 p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-40"
                        disabled={!canManageQueue || index === (state?.queue.length || 1) - 1}
                        title="Move down"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        onClick={() => removeQueueEntry(entry.id)}
                        className="border border-rose-400/30 text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 disabled:opacity-40"
                        disabled={!canManageQueue}
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}

                {(state?.queue.length || 0) === 0 && <div className="px-4 py-8 text-center text-gray-500">Queue is currently empty.</div>}
                </div>
              </div>
          </SmoothSection>

          <SmoothSection show={showAllSections || activeSection === "appointments"} id="appointments" className="space-y-4">
            <h2 className="text-xl lg:text-2xl text-white font-display">Appointment Management</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard title="Today" value={appointmentsByStatus.today.length} />
              <MetricCard title="In Progress" value={appointmentsByStatus.inProgress.length} />
              <MetricCard title="Completed" value={appointmentsByStatus.completed.length} />
              <MetricCard title="No-Shows" value={appointmentsByStatus.noShows.length} />
            </div>

            <div className="bg-noir-light border border-white/10 rounded-2xl overflow-x-auto">
              <div className="min-w-[860px]">
              <div className="grid grid-cols-[1.2fr_1fr_120px_140px_220px] text-xs uppercase tracking-widest text-gray-400 border-b border-white/10 px-4 py-3">
                <span>Customer</span>
                <span>Service</span>
                <span>Source</span>
                <span>Status</span>
                <span>Quick Actions</span>
              </div>

              {appointmentsByStatus.today.map((appointment) => (
                <div key={appointment.id} className="grid grid-cols-[1.2fr_1fr_120px_140px_220px] items-center gap-3 px-4 py-3 border-b border-white/5 text-sm">
                  <div>
                    <div className="text-white font-semibold">{appointment.customerName}</div>
                    <div className="text-xs text-gray-500">{formatTime(appointment.scheduledAt)}</div>
                  </div>
                  <span className="text-gray-300">{appointment.serviceType}</span>
                  <span className={`w-max px-2.5 py-1 text-xs font-semibold rounded-full border ${sourceClass(appointment.source)}`}>
                    {sourceLabel(appointment.source)}
                  </span>
                  <span className={`w-max px-2.5 py-1 text-xs font-semibold rounded-full border ${statusClass(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  <div className="flex items-center flex-wrap gap-2">
                    <ActionButton
                      icon={<Play size={14} />}
                      label="Start"
                      onClick={() => updateAppointment(appointment.id, "start")}
                      disabled={!canManageAppointments}
                    />
                    <ActionButton
                      icon={<Check size={14} />}
                      label="Finish"
                      onClick={() => updateAppointment(appointment.id, "finish")}
                      disabled={!canManageAppointments}
                    />
                    <ActionButton
                      icon={<X size={14} />}
                      label="Cancel"
                      onClick={() => updateAppointment(appointment.id, "cancel")}
                      disabled={!canManageAppointments}
                    />
                    <ActionButton
                      icon={<UserX size={14} />}
                      label="No-show"
                      onClick={() => updateAppointment(appointment.id, "no-show")}
                      disabled={!canManageAppointments}
                    />
                  </div>
                </div>
              ))}
              </div>
            </div>
          </SmoothSection>

          <SmoothSection show={activeSection === "analytics"} id="analytics" className="space-y-4 pb-8">
            <h2 className="text-xl lg:text-2xl text-white font-display">Business Insights</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard title="Total Bookings Today" value={state?.analytics.totalBookingsToday || 0} />
              <MetricCard
                title="Source Split (Walk-in / Direct / Booksy)"
                value={`${state?.analytics.walkIns || 0} / ${(state?.analytics.directAppointments ?? state?.analytics.appointments ?? 0)} / ${state?.analytics.booksyAppointments || 0}`}
              />
              <MetricCard
                title="Peak Hour"
                value={state?.analytics.peakHours[0] ? `${state.analytics.peakHours[0].hour} (${state.analytics.peakHours[0].count})` : "-"}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="bg-noir-light border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-3">Peak Hours</h3>
                <div className="space-y-2">
                  {(state?.analytics.peakHours || []).map((slot) => (
                    <div key={slot.hour} className="flex items-center justify-between bg-black/25 border border-white/5 rounded-lg px-3 py-2 text-sm">
                      <span className="text-gray-300">{slot.hour}</span>
                      <span className="text-white font-semibold">{slot.count} bookings</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-noir-light border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-3">Barber Performance</h3>
                <div className="space-y-2">
                  {(state?.analytics.barberPerformance || []).map((row) => (
                    <div key={row.barberId} className="bg-black/25 border border-white/5 rounded-lg px-3 py-2 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-semibold">{row.barberName}</span>
                        <span className="text-gray-400 text-xs uppercase tracking-wide">In Progress {row.inProgress}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-300">
                        <span>Completed {row.completed}</span>
                        <span>No-shows {row.noShows}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SmoothSection>

          {pendingRemoval && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => {
                setPendingRemoval(null);
                setRemoveConfirmText("");
              }} />
              <div className="relative w-full max-w-md bg-noir-light border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl text-white font-display mb-2">Confirm Barber Removal</h3>
                <p className="text-sm text-gray-300 mb-4">
                  To prevent accidental deletion, type the barber name exactly:
                </p>
                <p className="text-gold font-bold mb-4">{pendingRemoval.name}</p>

                <input
                  value={removeConfirmText}
                  onChange={(e) => setRemoveConfirmText(e.target.value)}
                  placeholder="Type barber name to confirm"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 mb-4"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setPendingRemoval(null);
                      setRemoveConfirmText("");
                    }}
                    className="border border-white/15 text-gray-200 rounded-lg px-3 py-2 text-xs uppercase tracking-widest hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => removeBarber(pendingRemoval.id)}
                    disabled={removeConfirmText !== pendingRemoval.name}
                    className="border border-rose-400/60 bg-rose-500/10 text-rose-200 rounded-lg px-3 py-2 text-xs uppercase tracking-widest hover:bg-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Remove Barber
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <button
        onClick={() => {
          setIsSupportOpen(true);
          setSupportResult("");
        }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-90 bg-noir-light border border-gold/60 text-gold px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl shadow-2xl hover:bg-gold/10 transition-colors"
      >
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
          <LifeBuoy size={16} /> IT Support
        </span>
      </button>

      {isSupportOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSupportOpen(false)} />
          <div className="relative w-full max-w-xl bg-noir-light border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-white font-display">Raise IT Support Ticket</h3>
              <button
                onClick={() => setIsSupportOpen(false)}
                className="border border-white/15 text-gray-200 rounded-lg px-3 py-1.5 text-xs uppercase tracking-widest hover:bg-white/5"
              >
                Close
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              This ticket will be emailed to rajatpalsinghsodhi@gmail.com and sheikhshahid2201@gmail.com.
            </p>

            <div className="space-y-3">
              <label className="text-sm text-gray-300 block">
                Subject
                <input
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="Short title of the issue"
                  className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                />
              </label>

              <label className="text-sm text-gray-300 block">
                Details
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe the issue, affected area, and any error details"
                  className="mt-2 w-full min-h-32 bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                />
              </label>

              <label className="text-sm text-gray-300 block">
                Screenshot (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onSupportScreenshotSelected(e.target.files?.[0])}
                  className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                />
                {supportScreenshot && (
                  <span className="mt-2 block text-xs text-gray-400">
                    Attached: {supportScreenshot.filename}
                  </span>
                )}
              </label>

              {supportResult && (
                <div className="text-xs text-gold border border-gold/30 bg-gold/10 rounded-lg px-3 py-2">
                  {supportResult}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsSupportOpen(false)}
                  className="border border-white/15 text-gray-200 rounded-lg px-3 py-2 text-xs uppercase tracking-widest hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={submitSupportTicket}
                  disabled={!supportSubject.trim() || !supportMessage.trim()}
                  className="bg-gold text-noir font-bold rounded-lg px-3 py-2 text-xs uppercase tracking-widest hover:bg-gold-light disabled:opacity-50"
                >
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SmoothSection({
  show,
  id,
  className,
  children,
}: {
  show: boolean;
  id: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.section
          key={id}
          id={id}
          className={className}
          initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          layout
        >
          {children}
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}

function MetricCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-noir-light border border-white/10 rounded-2xl p-5">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">{title}</p>
      <p className="text-2xl text-white font-bold">{value}</p>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="border border-white/15 p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-40"
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function QueueAssign({
  barbers,
  onAssign,
  disabled,
}: {
  barbers: Barber[];
  onAssign: (barberId: string) => void;
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState(barbers[0]?.id || "");

  useEffect(() => {
    if (!barbers.find((b) => b.id === selected)) {
      setSelected(barbers[0]?.id || "");
    }
  }, [barbers, selected]);

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        aria-label="Assign barber"
        title="Assign barber"
        className="bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs"
        disabled={disabled}
      >
        {barbers.map((barber) => (
          <option key={barber.id} value={barber.id}>
            {barber.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => onAssign(selected)}
        disabled={disabled || !selected}
        className="text-xs uppercase tracking-wide border border-white/15 rounded-lg px-2 py-1.5 hover:bg-white/5 disabled:opacity-40"
      >
        Assign
      </button>
    </div>
  );
}
