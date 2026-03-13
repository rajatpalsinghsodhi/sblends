import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { google } from "googleapis";

dotenv.config();

// S.Blends Barbershop - Oakville (150 Oak Park Blvd Unit 5)
const DEFAULT_PLACE_ID = "ChIJM7fhXaBDK4gRg-5N5Ps94Io";
const SUPPORT_TICKET_RECIPIENTS = [
  "rajatpalsinghsodhi@gmail.com",
  "sheikhshahid2201@gmail.com",
];

const DEFAULT_SERVICE_DURATION_MIN = 35;
const SHARED_SERVICES = [
  {
    category: "Signature Cuts",
    items: [
      { name: "Mens Haircut", price: "$35", description: "Precision cut tailored to your style and face shape.", durationMin: 35 },
      { name: "Mens Haircut + Beard", price: "$55", description: "Complete grooming: Haircut plus expert beard shaping and line-up.", durationMin: 55 },
      { name: "Student Haircut (10-17)", price: "$30", description: "Professional cut for students aged 10 to 17.", durationMin: 30 },
      { name: "Senior Haircut (65+)", price: "$30", description: "Classic cut for our distinguished seniors.", durationMin: 30 },
      { name: "Kids Haircut (Under 10)", price: "$25", description: "Gentle and stylish cut for the little ones.", durationMin: 25 },
    ],
  },
  {
    category: "Shaves & Beards",
    items: [
      { name: "Head Shave", price: "$35", description: "Old school head shave using a straight razor blade for the smoothest finish.", durationMin: 35 },
      { name: "Head Shave + Beard", price: "$55", description: "Straight razor head shave combined with beard grooming.", durationMin: 55 },
      { name: "Beard Line up", price: "$25", description: "Clean up the edges and maintain your beard's shape.", durationMin: 25 },
      { name: "Beard (Colour)", price: "$35", description: "Professional beard coloring to cover greys or enhance depth.", durationMin: 35 },
      { name: "Hair (Colour)", price: "$45", description: "Full hair color treatment for a fresh new look.", durationMin: 45 },
    ],
  },
  {
    category: "Facial & Treatments",
    items: [
      { name: "Grooms Package", price: "$130", description: "The ultimate wedding-day grooming experience.", durationMin: 130 },
      { name: "Diamond Facial", price: "$75", description: "Premium skin rejuvenation and deep cleansing.", durationMin: 75 },
      { name: "Gold Facial", price: "$55", description: "Luxurious facial treatment for glowing skin.", durationMin: 55 },
      { name: "Black Peel-off Mask", price: "$10", description: "Deep cleansing charcoal mask to clear pores.", durationMin: 10 },
      { name: "Hot Towel (Add On)", price: "$5", description: "Relaxing steam treatment with facial massage.", durationMin: 5 },
      { name: "Threading", price: "$10", description: "Precise hair removal for eyebrows and cheeks.", durationMin: 10 },
    ],
  },
];

const SHARED_SERVICE_OPTIONS = SHARED_SERVICES.flatMap((category) =>
  category.items.map((item) => ({
    name: item.name,
    price: item.price,
    durationMin: item.durationMin,
  }))
);

const SERVICE_DURATION_HINTS: Record<string, number> = Object.fromEntries(
  SHARED_SERVICE_OPTIONS.map((item) => [item.name.toLowerCase(), item.durationMin])
);

type Role = "Admin" | "Barber" | "Reception";
type BarberStatus = "Available" | "Busy" | "Break";
type AppointmentStatus = "scheduled" | "queued" | "in-progress" | "completed" | "cancelled" | "no-show";
type AppointmentSource = "walk-in" | "appointment" | "booksy";

interface ShiftLogEntry {
  workedStart: string;
  workedEnd: string;
  breakMin: number;
  paid: boolean;
  notes: string;
}

const AUTO_SHIFT_LOG_NOTE = "Auto-created from schedule";
const AUTO_OFFDAY_NOTE = "Scheduled Off Day";

interface Barber {
  id: string;
  name: string;
  status: BarberStatus;
  currentCustomer: string | null;
  estimatedFinishTime: string | null;
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
  shiftLogs: Record<string, ShiftLogEntry>;
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
  source: AppointmentSource;
  assignedBarberId: string | null;
  scheduledAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  externalEventId?: string;
  externalCalendarId?: string;
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

interface Session {
  token: string;
  role: Role;
  displayName: string;
  barberId: string | null;
}

const sessions = new Map<string, Session>();

function createDefaultSchedule() {
  return [
    { day: "Mon", start: "10:00", end: "20:00", off: false },
    { day: "Tue", start: "10:00", end: "20:00", off: false },
    { day: "Wed", start: "10:00", end: "20:00", off: false },
    { day: "Thu", start: "09:00", end: "21:00", off: false },
    { day: "Fri", start: "09:00", end: "21:00", off: false },
    { day: "Sat", start: "09:00", end: "18:00", off: false },
    { day: "Sun", start: "10:00", end: "17:00", off: false },
  ];
}

const barbers: Barber[] = [
  { id: "b1", name: "Sami", status: "Busy", currentCustomer: "Liam", estimatedFinishTime: null, schedule: createDefaultSchedule(), scheduleByDate: {}, shiftLogs: {} },
  { id: "b2", name: "Marcus", status: "Available", currentCustomer: null, estimatedFinishTime: null, schedule: createDefaultSchedule(), scheduleByDate: {}, shiftLogs: {} },
  { id: "b3", name: "Noah", status: "Break", currentCustomer: null, estimatedFinishTime: null, schedule: createDefaultSchedule(), scheduleByDate: {}, shiftLogs: {} },
];

const now = new Date();
const inMinutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

const appointments: Appointment[] = [
  {
    id: "a1",
    customerName: "Liam",
    serviceType: "Mens Haircut + Beard",
    durationMin: 55,
    status: "in-progress",
    source: "appointment",
    assignedBarberId: "b1",
    scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString(),
    startedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 5).toISOString(),
    finishedAt: null,
  },
  {
    id: "a2",
    customerName: "Ava",
    serviceType: "Diamond Facial",
    durationMin: 75,
    status: "scheduled",
    source: "appointment",
    assignedBarberId: "b2",
    scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0).toISOString(),
    startedAt: null,
    finishedAt: null,
  },
  {
    id: "a3",
    customerName: "Noah P.",
    serviceType: "Kids Haircut (Under 10)",
    durationMin: 25,
    status: "completed",
    source: "appointment",
    assignedBarberId: "b3",
    scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).toISOString(),
    startedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).toISOString(),
    finishedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 27).toISOString(),
  },
  {
    id: "a4",
    customerName: "Mason",
    serviceType: "Beard Line up",
    durationMin: 25,
    status: "no-show",
    source: "appointment",
    assignedBarberId: "b1",
    scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30).toISOString(),
    startedAt: null,
    finishedAt: null,
  },
];

const queue: QueueEntry[] = [
  {
    id: "q1",
    appointmentId: "a5",
    customerName: "Ethan",
    serviceType: "Mens Haircut",
    estimatedDurationMin: 35,
    createdAt: new Date().toISOString(),
    assignedBarberId: null,
  },
];

appointments.push({
  id: "a5",
  customerName: "Ethan",
  serviceType: "Mens Haircut",
  durationMin: 35,
  status: "queued",
  source: "walk-in",
  assignedBarberId: null,
  scheduledAt: new Date().toISOString(),
  startedAt: null,
  finishedAt: null,
});

barbers[0].estimatedFinishTime = inMinutes(32);

const notificationLogs: NotificationLog[] = [];
const sseClients = new Set<Response>();
const googleOAuthStates = new Set<string>();

let booksyGoogleTokens: Record<string, unknown> | null = null;
let booksyLastSyncAt: string | null = null;
let booksyLastSyncError: string | null = null;

const BOOKSY_SYNC_INTERVAL_MS = Number(process.env.BOOKSY_SYNC_INTERVAL_MS || 45_000);

function parseBooksyCalendarMap(raw: string | undefined) {
  const map: Record<string, string> = {};
  for (const token of (raw || "").split(",")) {
    const chunk = token.trim();
    if (!chunk) continue;
    const [barberId, calendarId] = chunk.split(":").map((p) => p.trim());
    if (!barberId || !calendarId) continue;
    map[barberId] = calendarId;
  }
  return map;
}

const BOOKSY_CALENDAR_MAP = parseBooksyCalendarMap(process.env.BOOKSY_GOOGLE_CALENDAR_IDS);

function getRolePins() {
  return {
    Admin: process.env.OWNER_ADMIN_PIN || "1111",
    Barber: process.env.OWNER_BARBER_PIN || "2222",
    Reception: process.env.OWNER_RECEPTION_PIN || "3333",
  } as const;
}

function getTodayBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.getTime(), end: end.getTime() };
}

function isTodayIso(iso: string) {
  const t = Date.parse(iso);
  const { start, end } = getTodayBounds();
  return t >= start && t < end;
}

function updateBarberDerivedState() {
  for (const barber of barbers) {
    const inProgress = appointments.find(
      (a) => a.assignedBarberId === barber.id && a.status === "in-progress"
    );
    if (inProgress) {
      barber.status = "Busy";
      barber.currentCustomer = inProgress.customerName;
      if (!inProgress.startedAt) {
        inProgress.startedAt = new Date().toISOString();
      }
      const finishMs = Date.parse(inProgress.startedAt) + inProgress.durationMin * 60_000;
      barber.estimatedFinishTime = new Date(finishMs).toISOString();
    } else if (barber.status === "Busy") {
      barber.status = "Available";
      barber.currentCustomer = null;
      barber.estimatedFinishTime = null;
    }
  }
}

function getBarberQueueLength(barberId: string) {
  return queue.filter((q) => q.assignedBarberId === barberId || q.assignedBarberId === null).length;
}

function buildAnalytics() {
  const todays = appointments.filter((a) => isTodayIso(a.scheduledAt));
  const totalBookingsToday = todays.length;
  const walkIns = todays.filter((a) => a.source === "walk-in").length;
  const directAppointments = todays.filter((a) => a.source === "appointment").length;
  const booksyAppointments = todays.filter((a) => a.source === "booksy").length;

  const hourBuckets: Record<string, number> = {};
  for (const a of todays) {
    const hour = new Date(a.scheduledAt).getHours();
    const label = `${hour.toString().padStart(2, "0")}:00`;
    hourBuckets[label] = (hourBuckets[label] || 0) + 1;
  }

  const peakHours = Object.entries(hourBuckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, count]) => ({ hour, count }));

  const barberPerformance = barbers.map((b) => {
    const mine = todays.filter((a) => a.assignedBarberId === b.id);
    return {
      barberId: b.id,
      barberName: b.name,
      completed: mine.filter((a) => a.status === "completed").length,
      noShows: mine.filter((a) => a.status === "no-show").length,
      inProgress: mine.filter((a) => a.status === "in-progress").length,
    };
  });

  return {
    totalBookingsToday,
    walkIns,
    appointments: directAppointments + booksyAppointments,
    directAppointments,
    booksyAppointments,
    peakHours,
    barberPerformance,
  };
}

function getBooksyOAuthClient(port: number) {
  const clientId = process.env.GOOGLE_BOOKSY_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_BOOKSY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return null;
  }
  const redirectUri =
    process.env.GOOGLE_BOOKSY_REDIRECT_URI ||
    `http://localhost:${port}/api/owner/booksy/google/callback`;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function parseGoogleEventDate(isoLike?: string | null) {
  if (!isoLike) return null;
  const parsed = Date.parse(isoLike);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

function parseServiceTypeFromDescription(description: string | null | undefined) {
  if (!description) return "Booksy Booking";
  const lines = description.split(/\r?\n/).map((line) => line.trim());
  const serviceLine = lines.find((line) => /^service\s*:/i.test(line));
  if (!serviceLine) return "Booksy Booking";
  const [, value] = serviceLine.split(/:/, 2);
  return value?.trim() || "Booksy Booking";
}

async function notifyBooksyImport(newCount: number) {
  if (newCount <= 0) return;
  const body = `Imported ${newCount} new Booksy appointment${newCount === 1 ? "" : "s"} from Google Calendar.`;
  const sentAt = new Date().toISOString();

  const ownerPhone = process.env.OWNER_NOTIFICATION_PHONE;
  if (ownerPhone) {
    const smsResult = await sendVonageSms(ownerPhone, body);
    notificationLogs.push({
      id: randomUUID(),
      channel: "sms",
      recipient: ownerPhone,
      message: body,
      status: smsResult.sent ? "sent" : "failed",
      provider: "vonage",
      error: smsResult.error,
      createdAt: sentAt,
    });
  }

  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
  if (ownerEmail) {
    const emailResult = await sendSendgridEmail(ownerEmail, "Booksy Sync Update", body);
    notificationLogs.push({
      id: randomUUID(),
      channel: "email",
      recipient: ownerEmail,
      message: body,
      status: emailResult.sent ? "sent" : "failed",
      provider: "sendgrid",
      error: emailResult.error,
      createdAt: sentAt,
    });
  }
}

async function syncBooksyFromGoogleCalendar(port: number, trigger: "manual" | "interval" | "oauth") {
  const oauthClient = getBooksyOAuthClient(port);
  if (!oauthClient) {
    return { ok: false, skipped: true, reason: "Google OAuth client not configured" };
  }
  if (!booksyGoogleTokens) {
    return { ok: false, skipped: true, reason: "Google Calendar is not connected" };
  }

  const mappedCalendars = Object.entries(BOOKSY_CALENDAR_MAP);
  if (mappedCalendars.length === 0) {
    return { ok: false, skipped: true, reason: "BOOKSY_GOOGLE_CALENDAR_IDS is not configured" };
  }

  oauthClient.setCredentials(booksyGoogleTokens);
  oauthClient.on("tokens", (tokens) => {
    booksyGoogleTokens = {
      ...(booksyGoogleTokens || {}),
      ...tokens,
    };
  });

  const calendar = google.calendar({ version: "v3", auth: oauthClient });
  const nowMs = Date.now();
  const windowStart = new Date(nowMs - 6 * 60 * 60_000).toISOString();
  const windowEnd = new Date(nowMs + 14 * 24 * 60 * 60_000).toISOString();

  const seenExternalIds = new Set<string>();
  let importedCount = 0;
  let updatedCount = 0;

  for (const [barberId, calendarId] of mappedCalendars) {
    const barber = barbers.find((b) => b.id === barberId);
    if (!barber) continue;

    const eventResponse = await calendar.events.list({
      calendarId,
      timeMin: windowStart,
      timeMax: windowEnd,
      singleEvents: true,
      showDeleted: true,
      orderBy: "startTime",
      maxResults: 250,
    });

    for (const event of eventResponse.data.items || []) {
      if (!event.id) continue;

      const startDate = parseGoogleEventDate(event.start?.dateTime || event.start?.date || null);
      const endDate = parseGoogleEventDate(event.end?.dateTime || event.end?.date || null);
      if (!startDate) continue;

      const durationMin = Math.max(
        10,
        Math.round(((endDate?.getTime() || startDate.getTime() + DEFAULT_SERVICE_DURATION_MIN * 60_000) - startDate.getTime()) / 60_000)
      );
      const normalizedCustomer = (event.summary || "Booksy Client").trim();
      const serviceType = parseServiceTypeFromDescription(event.description);
      const cancelled = event.status === "cancelled";

      const existing = appointments.find(
        (a) => a.source === "booksy" && a.externalEventId === event.id
      );

      seenExternalIds.add(`${calendarId}:${event.id}`);

      if (existing) {
        if (!["completed", "no-show"].includes(existing.status)) {
          existing.customerName = normalizedCustomer;
          existing.serviceType = serviceType;
          existing.durationMin = durationMin;
          existing.assignedBarberId = barberId;
          existing.scheduledAt = startDate.toISOString();
          existing.externalCalendarId = calendarId;
          existing.status = cancelled ? "cancelled" : existing.status === "in-progress" ? "in-progress" : "scheduled";
          if (cancelled) {
            existing.finishedAt = new Date().toISOString();
          }
          updatedCount += 1;
        }
        continue;
      }

      if (cancelled) {
        continue;
      }

      appointments.push({
        id: randomUUID(),
        customerName: normalizedCustomer,
        serviceType,
        durationMin,
        status: "scheduled",
        source: "booksy",
        assignedBarberId: barberId,
        scheduledAt: startDate.toISOString(),
        startedAt: null,
        finishedAt: null,
        externalEventId: event.id,
        externalCalendarId: calendarId,
      });
      importedCount += 1;
    }
  }

  for (const appointment of appointments) {
    if (appointment.source !== "booksy") continue;
    if (!appointment.externalEventId || !appointment.externalCalendarId) continue;
    const externalKey = `${appointment.externalCalendarId}:${appointment.externalEventId}`;
    if (seenExternalIds.has(externalKey)) continue;
    if (["completed", "cancelled", "no-show"].includes(appointment.status)) continue;
    appointment.status = "cancelled";
    appointment.finishedAt = new Date().toISOString();
  }

  await notifyBooksyImport(importedCount);

  booksyLastSyncAt = new Date().toISOString();
  booksyLastSyncError = null;
  broadcastOwnerState();
  return {
    ok: true,
    trigger,
    importedCount,
    updatedCount,
    syncedAt: booksyLastSyncAt,
  };
}

function buildOwnerState() {
  updateBarberDerivedState();
  syncPastShiftLogs();
  return {
    serverTime: new Date().toISOString(),
    barbers: barbers.map((b) => ({ ...b, queueLength: getBarberQueueLength(b.id) })),
    queue: [...queue],
    appointments: appointments.filter((a) => isTodayIso(a.scheduledAt)),
    notificationLogs: [...notificationLogs].slice(-50).reverse(),
    analytics: buildAnalytics(),
  };
}

function buildSharedCatalog() {
  updateBarberDerivedState();
  const dateKey = toDateKey(new Date());
  return {
    generatedAt: new Date().toISOString(),
    services: SHARED_SERVICES,
    serviceOptions: SHARED_SERVICE_OPTIONS,
    barbers: barbers.map((b) => {
      const nextAvailableSlotIso = findNextSlotForBarber(b, DEFAULT_SERVICE_DURATION_MIN, dateKey);
      return {
        id: b.id,
        name: b.name,
        status: b.status,
        queueLength: getBarberQueueLength(b.id),
        nextAvailableSlotIso,
      };
    }),
  };
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftDateKey(dateKey: string, days: number) {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

function parseTimeOnDate(dateKey: string, hhmm: string) {
  const [h, m] = hhmm.split(":").map((p) => Number(p));
  const d = new Date(`${dateKey}T00:00:00`);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

function roundUpTo5Minutes(date: Date) {
  const ms = date.getTime();
  const chunk = 5 * 60_000;
  return new Date(Math.ceil(ms / chunk) * chunk);
}

function estimateDurationForService(serviceType: string) {
  const normalized = serviceType.trim().toLowerCase();
  if (!normalized) return DEFAULT_SERVICE_DURATION_MIN;
  for (const [key, minutes] of Object.entries(SERVICE_DURATION_HINTS)) {
    if (normalized.includes(key)) {
      return minutes;
    }
  }
  const exactSeen = appointments.find((a) => a.serviceType.toLowerCase() === normalized);
  return exactSeen?.durationMin || DEFAULT_SERVICE_DURATION_MIN;
}

function getTemplateShiftForDate(barber: Barber, dateKey: string) {
  const d = new Date(`${dateKey}T00:00:00`);
  const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
  return barber.schedule.find((row) => row.day === dayLabel) || null;
}

function getShiftForDate(barber: Barber, dateKey: string) {
  const byDate = barber.scheduleByDate?.[dateKey];
  if (byDate) {
    return byDate;
  }
  const previousWeekDateKey = shiftDateKey(dateKey, -7);
  const previousWeekShift = barber.scheduleByDate?.[previousWeekDateKey];
  if (previousWeekShift) {
    return previousWeekShift;
  }
  const template = getTemplateShiftForDate(barber, dateKey);
  if (!template) {
    return null;
  }
  return {
    start: template.start,
    end: template.end,
    off: template.off,
  };
}

function getBusyIntervalsForBarber(barberId: string, dateKey: string) {
  const startDay = new Date(`${dateKey}T00:00:00`).getTime();
  const endDay = startDay + 24 * 60 * 60 * 1000;
  return appointments
    .filter(
      (a) =>
        a.assignedBarberId === barberId &&
        ["scheduled", "queued", "in-progress"].includes(a.status)
    )
    .map((a) => {
      const base = a.status === "in-progress" ? (a.startedAt ? new Date(a.startedAt) : new Date()) : new Date(a.scheduledAt);
      const s = base.getTime();
      const e = s + a.durationMin * 60_000;
      return { start: s, end: e };
    })
    .filter((it) => it.end > startDay && it.start < endDay)
    .sort((a, b) => a.start - b.start);
}

function findNextSlotForBarber(barber: Barber, durationMin: number, dateKey: string) {
  const shift = getShiftForDate(barber, dateKey);
  if (!shift || shift.off) {
    return null;
  }

  const shiftStart = parseTimeOnDate(dateKey, shift.start).getTime();
  const shiftEnd = parseTimeOnDate(dateKey, shift.end).getTime();
  const earliestNow = roundUpTo5Minutes(new Date()).getTime();
  let cursor = Math.max(shiftStart, earliestNow);

  const intervals = getBusyIntervalsForBarber(barber.id, dateKey);
  const neededMs = durationMin * 60_000;

  for (const iv of intervals) {
    if (iv.end <= cursor) continue;
    if (iv.start - cursor >= neededMs) {
      return new Date(cursor).toISOString();
    }
    cursor = Math.max(cursor, iv.end);
  }

  if (shiftEnd - cursor >= neededMs) {
    return new Date(cursor).toISOString();
  }
  return null;
}

function findNextSlotAnyBarber(durationMin: number, dateKey: string) {
  const options = barbers
    .map((b) => {
      const slotIso = findNextSlotForBarber(b, durationMin, dateKey);
      return slotIso ? { barber: b, slotIso } : null;
    })
    .filter((x): x is { barber: Barber; slotIso: string } => Boolean(x))
    .sort((a, b) => Date.parse(a.slotIso) - Date.parse(b.slotIso));

  return options[0] || null;
}

function syncPastShiftLogs() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const barber of barbers) {
    for (let i = 1; i <= 42; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = toDateKey(d);
      if (barber.shiftLogs[dateKey]) continue;

      const shift = getShiftForDate(barber, dateKey);
      if (!shift) continue;

      if (shift.off) {
        barber.shiftLogs[dateKey] = {
          workedStart: "",
          workedEnd: "",
          breakMin: 0,
          paid: false,
          notes: AUTO_OFFDAY_NOTE,
        };
        continue;
      }

      barber.shiftLogs[dateKey] = {
        workedStart: shift.start,
        workedEnd: shift.end,
        breakMin: 0,
        paid: false,
        notes: AUTO_SHIFT_LOG_NOTE,
      };
    }
  }
}

function sendSseEvent(type: string, payload: unknown) {
  const data = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    client.write(data);
  }
}

function broadcastOwnerState() {
  sendSseEvent("owner-state", buildOwnerState());
}

function extractToken(req: Request) {
  const authHeader = req.header("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const queryToken = req.query.token;
  return typeof queryToken === "string" ? queryToken : "";
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  const session = sessions.get(token);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  (req as Request & { session?: Session }).session = session;
  next();
}

function requireRoles(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const session = (req as Request & { session?: Session }).session;
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!roles.includes(session.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

async function sendVonageSms(to: string, text: string): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.VONAGE_API_KEY;
  const apiSecret = process.env.VONAGE_API_SECRET;
  const from = process.env.VONAGE_FROM || "SBLENDS";
  if (!apiKey || !apiSecret) {
    return { sent: false, error: "Vonage env vars missing" };
  }

  const body = new URLSearchParams({
    api_key: apiKey,
    api_secret: apiSecret,
    to,
    from,
    text,
  });

  const res = await fetch("https://rest.nexmo.com/sms/json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  const status = data.messages?.[0]?.status;
  if (String(status) === "0") {
    return { sent: true };
  }
  return { sent: false, error: String(data.messages?.[0]?.["error-text"] || "Unknown SMS error") };
}

async function sendSendgridEmail(
  to: string,
  subject: string,
  text: string,
  attachment?: { filename: string; type: string; contentBase64: string }
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;
  if (!apiKey || !from) {
    return { sent: false, error: "SendGrid env vars missing" };
  }

  const payload: {
    personalizations: Array<{ to: Array<{ email: string }> }>;
    from: { email: string };
    subject: string;
    content: Array<{ type: string; value: string }>;
    attachments?: Array<{ content: string; filename: string; type: string; disposition: string }>;
  } = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from },
    subject,
    content: [{ type: "text/plain", value: text }],
  };

  if (attachment) {
    payload.attachments = [
      {
        content: attachment.contentBase64,
        filename: attachment.filename,
        type: attachment.type,
        disposition: "attachment",
      },
    ];
  }

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    return { sent: true };
  }
  const errText = await res.text();
  return { sent: false, error: errText || "Unknown email error" };
}

async function sendSupportTicketEmails(
  subject: string,
  message: string,
  attachment?: { filename: string; type: string; contentBase64: string }
) {
  const results = await Promise.all(
    SUPPORT_TICKET_RECIPIENTS.map(async (to) => {
      const result = await sendSendgridEmail(to, subject, message, attachment);
      return { to, ...result };
    })
  );

  return {
    ok: results.every((r) => r.sent),
    results,
  };
}

// Resolve CID (numeric) to Place ID (ChIJ...) via Legacy Places API
async function resolvePlaceId(idOrCid: string, apiKey: string): Promise<string> {
  if (!/^\d+$/.test(idOrCid)) return idOrCid;
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?cid=${idOrCid}&key=${apiKey}`
  );
  const data = await res.json();
  if (data.result?.place_id) return data.result.place_id;
  throw new Error(data.error_message || "Could not resolve CID to Place ID");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3001;
  app.use(express.json());

  app.post("/api/owner/auth/login", (req, res) => {
    const { pin, displayName } = req.body || {};
    if (!pin || !displayName) {
      return res.status(400).json({ error: "pin and displayName are required" });
    }

    const pins = getRolePins();
    if (pin !== pins.Admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = randomUUID();
    const session: Session = {
      token,
      role: "Admin",
      displayName,
      barberId: null,
    };
    sessions.set(token, session);

    res.json({
      token,
      user: {
        role: session.role,
        displayName: session.displayName,
        barberId: session.barberId,
      },
    });
  });

  app.post("/api/owner/auth/logout", requireAuth, (req, res) => {
    const token = extractToken(req);
    sessions.delete(token);
    res.json({ ok: true });
  });

  app.get("/api/shared/catalog", (_req, res) => {
    res.json(buildSharedCatalog());
  });

  app.get("/api/owner/me", requireAuth, (req, res) => {
    const session = (req as Request & { session?: Session }).session!;
    res.json({
      role: session.role,
      displayName: session.displayName,
      barberId: session.barberId,
    });
  });

  app.get("/api/owner/state", requireAuth, requireRoles(["Admin", "Barber", "Reception"]), (_req, res) => {
    res.json(buildOwnerState());
  });

  app.get("/api/owner/barbers", requireAuth, requireRoles(["Admin"]), (_req, res) => {
    res.json(barbers);
  });

  app.get("/api/owner/booksy/status", requireAuth, requireRoles(["Admin"]), (_req, res) => {
    const hasOAuthConfig = Boolean(process.env.GOOGLE_BOOKSY_CLIENT_ID && process.env.GOOGLE_BOOKSY_CLIENT_SECRET);
    const mappedCalendars = Object.entries(BOOKSY_CALENDAR_MAP).map(([barberId, calendarId]) => ({
      barberId,
      calendarId,
      barberName: barbers.find((b) => b.id === barberId)?.name || barberId,
    }));
    res.json({
      hasOAuthConfig,
      connected: Boolean(booksyGoogleTokens),
      mappedCalendars,
      lastSyncAt: booksyLastSyncAt,
      lastSyncError: booksyLastSyncError,
      intervalMs: BOOKSY_SYNC_INTERVAL_MS,
    });
  });

  app.get("/api/owner/booksy/google/auth-url", requireAuth, requireRoles(["Admin"]), (_req, res) => {
    const oauthClient = getBooksyOAuthClient(PORT);
    if (!oauthClient) {
      return res.status(500).json({ error: "Google OAuth is not configured" });
    }

    const state = randomUUID();
    googleOAuthStates.add(state);
    const url = oauthClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/calendar.readonly"],
      state,
    });
    return res.json({ url, state });
  });

  app.get("/api/owner/booksy/google/callback", async (req, res) => {
    const oauthClient = getBooksyOAuthClient(PORT);
    if (!oauthClient) {
      return res.status(500).send("Google OAuth is not configured.");
    }
    const code = String(req.query.code || "");
    const state = String(req.query.state || "");
    if (!code || !state || !googleOAuthStates.has(state)) {
      return res.status(400).send("Invalid OAuth callback state.");
    }
    googleOAuthStates.delete(state);

    try {
      const tokenResponse = await oauthClient.getToken(code);
      booksyGoogleTokens = {
        ...(booksyGoogleTokens || {}),
        ...(tokenResponse.tokens || {}),
      };
      const syncResult = await syncBooksyFromGoogleCalendar(PORT, "oauth");
      return res.send(`Booksy Google Calendar connected successfully. Imported ${syncResult.ok ? syncResult.importedCount : 0} new appointments. You can close this tab.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown OAuth error";
      booksyLastSyncError = message;
      return res.status(500).send(`OAuth setup failed: ${message}`);
    }
  });

  app.post("/api/owner/booksy/sync-now", requireAuth, requireRoles(["Admin"]), async (_req, res) => {
    try {
      const syncResult = await syncBooksyFromGoogleCalendar(PORT, "manual");
      res.json(syncResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Booksy sync failed";
      booksyLastSyncError = message;
      res.status(500).json({ ok: false, error: message });
    }
  });

  app.post("/api/owner/walkins/availability", requireAuth, requireRoles(["Admin"]), (req, res) => {
    const { serviceType, barberId } = req.body || {};
    if (!serviceType || typeof serviceType !== "string") {
      return res.status(400).json({ error: "serviceType is required" });
    }

    const durationMin = estimateDurationForService(serviceType);
    const dateKey = toDateKey(new Date());

    if (barberId) {
      const barber = barbers.find((b) => b.id === barberId);
      if (!barber) {
        return res.status(404).json({ error: "Barber not found" });
      }
      const slotIso = findNextSlotForBarber(barber, durationMin, dateKey);
      if (!slotIso) {
        return res.json({
          available: false,
          message: `${barber.name} is not available for the rest of today.`,
          durationMin,
        });
      }
      return res.json({
        available: true,
        slotIso,
        durationMin,
        barberId: barber.id,
        barberName: barber.name,
        message: `Next slot with ${barber.name}: ${new Date(slotIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      });
    }

    const next = findNextSlotAnyBarber(durationMin, dateKey);
    if (!next) {
      return res.json({
        available: false,
        message: "No barber is available for the rest of today.",
        durationMin,
      });
    }

    return res.json({
      available: true,
      slotIso: next.slotIso,
      durationMin,
      barberId: next.barber.id,
      barberName: next.barber.name,
      message: `Closest slot: ${new Date(next.slotIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} with ${next.barber.name}`,
    });
  });

  app.post("/api/owner/walkins", requireAuth, requireRoles(["Admin"]), (req, res) => {
    const { customerName, serviceType, barberId } = req.body || {};
    if (!customerName || typeof customerName !== "string") {
      return res.status(400).json({ error: "customerName is required" });
    }
    if (!serviceType || typeof serviceType !== "string") {
      return res.status(400).json({ error: "serviceType is required" });
    }

    const durationMin = estimateDurationForService(serviceType);
    const dateKey = toDateKey(new Date());

    let pickedBarber: Barber | null = null;
    let slotIso: string | null = null;

    if (barberId) {
      const barber = barbers.find((b) => b.id === barberId);
      if (!barber) {
        return res.status(404).json({ error: "Barber not found" });
      }
      const slot = findNextSlotForBarber(barber, durationMin, dateKey);
      if (!slot) {
        return res.status(400).json({ error: `${barber.name} is not available for the rest of today.` });
      }
      pickedBarber = barber;
      slotIso = slot;
    } else {
      const next = findNextSlotAnyBarber(durationMin, dateKey);
      if (!next) {
        return res.status(400).json({ error: "No barber is available for the rest of today." });
      }
      pickedBarber = next.barber;
      slotIso = next.slotIso;
    }

    const appointment: Appointment = {
      id: randomUUID(),
      customerName: customerName.trim(),
      serviceType: serviceType.trim(),
      durationMin,
      status: "scheduled",
      source: "walk-in",
      assignedBarberId: pickedBarber.id,
      scheduledAt: slotIso,
      startedAt: null,
      finishedAt: null,
    };

    appointments.push(appointment);
    broadcastOwnerState();

    return res.json({
      ok: true,
      appointment,
      assignedBarber: { id: pickedBarber.id, name: pickedBarber.name },
    });
  });

  app.post("/api/owner/barbers", requireAuth, requireRoles(["Admin"]), (req, res) => {
    const { name } = req.body || {};
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "name is required" });
    }
    const barber: Barber = {
      id: randomUUID(),
      name: name.trim(),
      status: "Available",
      currentCustomer: null,
      estimatedFinishTime: null,
      schedule: createDefaultSchedule(),
      scheduleByDate: {},
      shiftLogs: {},
    };
    barbers.push(barber);
    broadcastOwnerState();
    res.json({ ok: true, barber });
  });

  app.patch("/api/owner/barbers/:barberId", requireAuth, requireRoles(["Admin"]), (req, res) => {
    const { barberId } = req.params;
    const barber = barbers.find((b) => b.id === barberId);
    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }

    const { name, status } = req.body || {};
    if (typeof name === "string" && name.trim()) {
      barber.name = name.trim();
    }
    if (status && ["Available", "Busy", "Break"].includes(status)) {
      barber.status = status;
      if (status !== "Busy") {
        barber.currentCustomer = null;
        barber.estimatedFinishTime = null;
      }
    }

    broadcastOwnerState();
    res.json({ ok: true, barber });
  });

  app.put("/api/owner/barbers/:barberId/schedule", requireAuth, requireRoles(["Admin"]), (req, res) => {
    const { barberId } = req.params;
    const barber = barbers.find((b) => b.id === barberId);
    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }

    const { schedule, dateSchedules } = req.body || {};

    if (Array.isArray(schedule)) {
      if (schedule.length !== 7) {
        return res.status(400).json({ error: "schedule must include 7 day entries" });
      }

      const isValidTemplate = schedule.every(
        (row: any) =>
          typeof row?.day === "string" &&
          typeof row?.start === "string" &&
          typeof row?.end === "string" &&
          typeof row?.off === "boolean"
      );
      if (!isValidTemplate) {
        return res.status(400).json({ error: "Invalid schedule format" });
      }
      barber.schedule = schedule;
    }

    if (Array.isArray(dateSchedules)) {
      const isValidDateSchedule = dateSchedules.every(
        (row: any) =>
          typeof row?.date === "string" &&
          typeof row?.start === "string" &&
          typeof row?.end === "string" &&
          typeof row?.off === "boolean"
      );
      if (!isValidDateSchedule) {
        return res.status(400).json({ error: "Invalid dateSchedules format" });
      }
      const next: Barber["scheduleByDate"] = {};
      for (const row of dateSchedules) {
        next[row.date] = {
          start: row.start,
          end: row.end,
          off: row.off,
        };
      }
      barber.scheduleByDate = next;
    }

    if (!Array.isArray(schedule) && !Array.isArray(dateSchedules)) {
      return res.status(400).json({ error: "Provide schedule or dateSchedules" });
    }

    broadcastOwnerState();
    res.json({ ok: true, barber });
  });

  app.put("/api/owner/barbers/:barberId/shift-log", requireAuth, requireRoles(["Admin"]), (req, res) => {
    const { barberId } = req.params;
    const barber = barbers.find((b) => b.id === barberId);
    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }

    const { date, workedStart, workedEnd, breakMin, paid, notes } = req.body || {};
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "date is required in YYYY-MM-DD format" });
    }

    const nextLog: ShiftLogEntry = {
      workedStart: typeof workedStart === "string" ? workedStart : "",
      workedEnd: typeof workedEnd === "string" ? workedEnd : "",
      breakMin: typeof breakMin === "number" && Number.isFinite(breakMin) ? Math.max(0, Math.round(breakMin)) : 0,
      paid: typeof paid === "boolean" ? paid : false,
      notes: typeof notes === "string" ? notes.slice(0, 200) : "",
    };

    barber.shiftLogs[date] = nextLog;
    broadcastOwnerState();
    res.json({ ok: true, date, shiftLog: nextLog });
  });

  app.delete("/api/owner/barbers/:barberId", requireAuth, requireRoles(["Admin"]), (req, res) => {
    const { barberId } = req.params;
    const index = barbers.findIndex((b) => b.id === barberId);
    if (index < 0) {
      return res.status(404).json({ error: "Barber not found" });
    }

    const hasOpenWork = appointments.some(
      (a) => a.assignedBarberId === barberId && !["completed", "cancelled", "no-show"].includes(a.status)
    );
    if (hasOpenWork) {
      return res.status(400).json({ error: "Cannot delete barber with active appointments" });
    }

    barbers.splice(index, 1);
    broadcastOwnerState();
    res.json({ ok: true });
  });

  app.get("/api/owner/stream", requireAuth, requireRoles(["Admin", "Barber", "Reception"]), (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    sseClients.add(res);
    res.write(`event: owner-state\ndata: ${JSON.stringify(buildOwnerState())}\n\n`);

    const heartbeat = setInterval(() => {
      res.write(`event: heartbeat\ndata: {"ts":"${new Date().toISOString()}"}\n\n`);
    }, 30_000);

    req.on("close", () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  app.post("/api/owner/barbers/:barberId/status", requireAuth, requireRoles(["Admin", "Barber"]), (req, res) => {
    const session = (req as Request & { session?: Session }).session!;
    const { barberId } = req.params;
    if (session.role === "Barber" && session.barberId !== barberId) {
      return res.status(403).json({ error: "Barbers can only update their own status" });
    }
    const barber = barbers.find((b) => b.id === barberId);
    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }
    const { status } = req.body as { status?: BarberStatus };
    if (!status || !["Available", "Busy", "Break"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    barber.status = status;
    if (status !== "Busy") {
      barber.currentCustomer = null;
      barber.estimatedFinishTime = null;
    }
    broadcastOwnerState();
    res.json({ ok: true, barber });
  });

  app.post("/api/owner/queue/walkin", requireAuth, requireRoles(["Admin", "Reception"]), (req, res) => {
    const { customerName, serviceType, estimatedDurationMin } = req.body || {};
    if (!customerName || !serviceType || !estimatedDurationMin) {
      return res
        .status(400)
        .json({ error: "customerName, serviceType, estimatedDurationMin are required" });
    }
    const appointmentId = randomUUID();
    const newAppointment: Appointment = {
      id: appointmentId,
      customerName,
      serviceType,
      durationMin: Number(estimatedDurationMin),
      status: "queued",
      source: "walk-in",
      assignedBarberId: null,
      scheduledAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
    };
    const entry: QueueEntry = {
      id: randomUUID(),
      appointmentId,
      customerName,
      serviceType,
      estimatedDurationMin: Number(estimatedDurationMin),
      createdAt: new Date().toISOString(),
      assignedBarberId: null,
    };
    appointments.push(newAppointment);
    queue.push(entry);
    broadcastOwnerState();
    res.json({ ok: true, queueEntry: entry });
  });

  app.post("/api/owner/queue/assign", requireAuth, requireRoles(["Admin", "Reception"]), (req, res) => {
    const { queueId, barberId } = req.body || {};
    const entryIndex = queue.findIndex((q) => q.id === queueId);
    if (entryIndex < 0) {
      return res.status(404).json({ error: "Queue entry not found" });
    }
    const barber = barbers.find((b) => b.id === barberId);
    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }

    const entry = queue[entryIndex];
    queue.splice(entryIndex, 1);

    const appointment = appointments.find((a) => a.id === entry.appointmentId);
    if (appointment) {
      appointment.assignedBarberId = barberId;
      appointment.status = "in-progress";
      appointment.startedAt = new Date().toISOString();
    }

    barber.status = "Busy";
    barber.currentCustomer = entry.customerName;
    barber.estimatedFinishTime = inMinutes(entry.estimatedDurationMin);

    broadcastOwnerState();
    res.json({ ok: true });
  });

  app.post("/api/owner/queue/reorder", requireAuth, requireRoles(["Admin", "Reception"]), (req, res) => {
    const { orderedIds } = req.body || {};
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "orderedIds must be an array" });
    }

    const byId = new Map(queue.map((q) => [q.id, q]));
    const reordered: QueueEntry[] = [];
    for (const id of orderedIds) {
      const row = byId.get(id);
      if (row) reordered.push(row);
    }
    for (const row of queue) {
      if (!orderedIds.includes(row.id)) reordered.push(row);
    }
    queue.splice(0, queue.length, ...reordered);

    broadcastOwnerState();
    res.json({ ok: true });
  });

  app.delete("/api/owner/queue/:queueId", requireAuth, requireRoles(["Admin", "Reception"]), (req, res) => {
    const { queueId } = req.params;
    const idx = queue.findIndex((q) => q.id === queueId);
    if (idx < 0) {
      return res.status(404).json({ error: "Queue entry not found" });
    }
    const [removed] = queue.splice(idx, 1);
    const appointment = appointments.find((a) => a.id === removed.appointmentId);
    if (appointment && appointment.status === "queued") {
      appointment.status = "cancelled";
      appointment.finishedAt = new Date().toISOString();
    }
    broadcastOwnerState();
    res.json({ ok: true });
  });

  app.post(
    "/api/owner/appointments/:appointmentId/action",
    requireAuth,
    requireRoles(["Admin", "Barber", "Reception"]),
    (req, res) => {
      const session = (req as Request & { session?: Session }).session!;
      const { appointmentId } = req.params;
      const { action } = req.body || {};
      const appointment = appointments.find((a) => a.id === appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      if (session.role === "Barber" && session.barberId && appointment.assignedBarberId && appointment.assignedBarberId !== session.barberId) {
        return res.status(403).json({ error: "Barber can only update assigned appointments" });
      }

      switch (action) {
        case "start": {
          appointment.status = "in-progress";
          appointment.startedAt = new Date().toISOString();
          if (appointment.assignedBarberId) {
            const barber = barbers.find((b) => b.id === appointment.assignedBarberId);
            if (barber) {
              barber.status = "Busy";
              barber.currentCustomer = appointment.customerName;
              barber.estimatedFinishTime = inMinutes(appointment.durationMin);
            }
          }
          break;
        }
        case "finish": {
          appointment.status = "completed";
          appointment.finishedAt = new Date().toISOString();
          if (appointment.assignedBarberId) {
            const barber = barbers.find((b) => b.id === appointment.assignedBarberId);
            if (barber) {
              barber.status = "Available";
              barber.currentCustomer = null;
              barber.estimatedFinishTime = null;
            }
          }
          break;
        }
        case "cancel": {
          appointment.status = "cancelled";
          appointment.finishedAt = new Date().toISOString();
          break;
        }
        case "no-show": {
          appointment.status = "no-show";
          appointment.finishedAt = new Date().toISOString();
          break;
        }
        default:
          return res.status(400).json({ error: "Invalid action" });
      }

      broadcastOwnerState();
      res.json({ ok: true, appointment });
    }
  );

  app.get("/api/owner/notifications/logs", requireAuth, requireRoles(["Admin", "Reception"]), (_req, res) => {
    res.json([...notificationLogs].slice(-50).reverse());
  });

  app.post("/api/owner/notifications/sms", requireAuth, requireRoles(["Admin", "Reception"]), async (req, res) => {
    const { to, message } = req.body || {};
    if (!to || !message) {
      return res.status(400).json({ error: "to and message are required" });
    }
    const result = await sendVonageSms(to, message);
    const log: NotificationLog = {
      id: randomUUID(),
      channel: "sms",
      recipient: to,
      message,
      status: result.sent ? "sent" : "failed",
      provider: "vonage",
      error: result.error,
      createdAt: new Date().toISOString(),
    };
    notificationLogs.push(log);
    broadcastOwnerState();
    res.json({ ok: result.sent, log });
  });

  app.post("/api/owner/notifications/email", requireAuth, requireRoles(["Admin", "Reception"]), async (req, res) => {
    const { to, subject, message } = req.body || {};
    if (!to || !subject || !message) {
      return res.status(400).json({ error: "to, subject and message are required" });
    }
    const result = await sendSendgridEmail(to, subject, message);
    const log: NotificationLog = {
      id: randomUUID(),
      channel: "email",
      recipient: to,
      message,
      status: result.sent ? "sent" : "failed",
      provider: "sendgrid",
      error: result.error,
      createdAt: new Date().toISOString(),
    };
    notificationLogs.push(log);
    broadcastOwnerState();
    res.json({ ok: result.sent, log });
  });

  app.post("/api/owner/support-ticket", requireAuth, requireRoles(["Admin"]), async (req, res) => {
    const session = (req as Request & { session?: Session }).session!;
    const { subject, message, screenshot } = req.body || {};
    if (!subject || !message) {
      return res.status(400).json({ error: "subject and message are required" });
    }

    let attachment: { filename: string; type: string; contentBase64: string } | undefined;
    if (screenshot) {
      const validAttachment =
        typeof screenshot?.filename === "string" &&
        typeof screenshot?.type === "string" &&
        typeof screenshot?.contentBase64 === "string";
      if (!validAttachment) {
        return res.status(400).json({ error: "Invalid screenshot attachment format" });
      }
      attachment = {
        filename: screenshot.filename,
        type: screenshot.type,
        contentBase64: screenshot.contentBase64,
      };
    }

    const emailSubject = `[S.Blends IT Support] ${String(subject).trim()}`;
    const emailBody = [
      `Reporter: ${session.displayName} (${session.role})`,
      `Submitted: ${new Date().toISOString()}`,
      "",
      "Issue:",
      String(message).trim(),
    ].join("\n");

    const sent = await sendSupportTicketEmails(emailSubject, emailBody, attachment);
    return res.json(sent);
  });

  // Helper: Find Place ID via Text Search (call /api/find-place?q=S+Blends+Oakville)
  app.get("/api/find-place", async (req, res) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const query = (req.query.q as string) || "S Blends Barbershop Oakville";
    if (!apiKey) {
      return res.status(500).json({ error: "GOOGLE_PLACES_API_KEY not configured" });
    }
    try {
      const response = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
          },
          body: JSON.stringify({ textQuery: query }),
        }
      );
      const data = await response.json();
      if (data.error) {
        return res.status(400).json(data);
      }
      res.json(data);
    } catch (error) {
      console.error("Error finding place:", error);
      res.status(500).json({ error: "Failed to find place" });
    }
  });

  // API routes
  app.get("/api/place-details", async (req, res) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const idOrCid = process.env.PLACE_ID || DEFAULT_PLACE_ID;
    
    if (!apiKey) {
      return res.status(500).json({ error: "API Key not configured" });
    }

    try {
      const placeId = await resolvePlaceId(idOrCid, apiKey);
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,rating,reviews,photos,regularOpeningHours,formattedAddress,nationalPhoneNumber,websiteUri&key=${apiKey}`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching place details:", error);
      res.status(500).json({ error: "Failed to fetch place details" });
    }
  });

  app.get("/api/photo/:photoName(*)", async (req, res) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const photoName = req.params.photoName;

    if (!apiKey) {
      return res.status(500).json({ error: "API Key not configured" });
    }

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch photo: ${response.statusText}`);
      }

      // Pipe the image directly to the response
      const contentType = response.headers.get("content-type");
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Error fetching photo:", error);
      res.status(500).json({ error: "Failed to fetch photo" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  setInterval(async () => {
    try {
      await syncBooksyFromGoogleCalendar(PORT, "interval");
    } catch (error) {
      booksyLastSyncError = error instanceof Error ? error.message : "Booksy sync interval failed";
    }
  }, BOOKSY_SYNC_INTERVAL_MS);
}

startServer();
