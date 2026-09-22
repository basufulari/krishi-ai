import AsyncStorage from '@react-native-async-storage/async-storage';

export type ActivityType =
  | 'SCAN'          // Disease scan
  | 'WEATHER'       // Checked weather
  | 'MANDI'         // Checked mandi prices
  | 'CHATBOT'       // Used chatbot
  | 'LOAN'          // Checked loan options
  | 'GEO'           // Measured land
  | 'COMMUNITY'     // Posted / interacted in community
  | 'AGRISHARE'     // Used equipment sharing
  | 'LOGIN'         // App session start
  | 'GOV_SCHEME';   // Checked gov schemes

export type ActivityEvent = {
  id: string;
  type: ActivityType;
  timestamp: number;     // epoch ms
  label: string;         // human-readable e.g. "Scanned Wheat"
  meta?: Record<string, string | number | boolean>;
};

const getKey = (username: string) => `krishi_ai_user_history_v2_${username}`;
const MAX_EVENTS = 200;

async function readEvents(username: string): Promise<ActivityEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(getKey(username));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ActivityEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeEvents(username: string, events: ActivityEvent[]): Promise<void> {
  try {
    await AsyncStorage.setItem(getKey(username), JSON.stringify(events));
  } catch {
    // ignore persistence errors
  }
}

export const StorageUserHistory = {
  /** Log a new activity event */
  log: async (
    username: string,
    type: ActivityType,
    label: string,
    meta?: ActivityEvent['meta'],
  ): Promise<void> => {
    const events = await readEvents(username);
    const event: ActivityEvent = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      timestamp: Date.now(),
      label,
      meta,
    };
    // Prepend newest first, cap at MAX_EVENTS
    events.unshift(event);
    if (events.length > MAX_EVENTS) events.splice(MAX_EVENTS);
    await writeEvents(username, events);
  },

  /** Get all events (newest first) */
  getAll: async (username: string): Promise<ActivityEvent[]> => {
    return await readEvents(username);
  },

  /** Get events of a specific type */
  getByType: async (username: string, type: ActivityType): Promise<ActivityEvent[]> => {
    const all = await readEvents(username);
    return all.filter((e) => e.type === type);
  },

  /** Get summary stats for the dashboard */
  getSummary: async (username: string): Promise<{
    totalEvents: number;
    totalScans: number;
    daysActive: number;
    eventsByType: Record<string, number>;
    recentEvents: ActivityEvent[];
  }> => {
    const all = await readEvents(username);
    const scans = all.filter((e) => e.type === 'SCAN');

    // Unique days active
    const daySet = new Set(
      all.map((e) => new Date(e.timestamp).toDateString()),
    );

    const eventsByType: Record<string, number> = {};
    for (const e of all) {
      eventsByType[e.type] = (eventsByType[e.type] ?? 0) + 1;
    }

    return {
      totalEvents: all.length,
      totalScans: scans.length,
      daysActive: daySet.size,
      eventsByType,
      recentEvents: all.slice(0, 15),
    };
  },

  /** Clear all history */
  clear: async (username: string): Promise<void> => {
    await writeEvents(username, []);
  },
};
