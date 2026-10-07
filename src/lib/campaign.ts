/*
 * The campaign log: what happened (scenes) and what is still open — people (NPCs), dangers
 * (threats) and unanswered questions (threads). Plain notes by the player; nothing here rolls.
 */

export const ENTRY_KINDS = ['scene', 'npc', 'threat', 'thread'] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

export interface CampaignEntry {
  id: string;
  kind: EntryKind;
  title: string;
  text: string;
  /** Threats and threads are settled when dealt with; scenes and NPCs ignore it. */
  closed: boolean;
  /** The campaign day it was written on. */
  day: number;
  /** The oracle's scene counter at the time, so the log lines up with the oracle's. */
  scene: number;
}

export interface Campaign {
  day: number;
  entries: CampaignEntry[];
}

export const EMPTY_CAMPAIGN: Campaign = { day: 1, entries: [] };

/** Notes live in localStorage, which has a small quota — the log is bounded rather than trusted. */
export const ENTRY_LIMIT = 300;
export const TITLE_LIMIT = 80;
export const TEXT_LIMIT = 2000;

export const isSettleable = (kind: EntryKind): boolean => kind === 'threat' || kind === 'thread';

export function addEntry(
  campaign: Campaign,
  input: { kind: EntryKind; title: string; text: string; scene: number },
  id: string,
): Campaign {
  const title = input.title.trim().slice(0, TITLE_LIMIT);
  if (!title || campaign.entries.length >= ENTRY_LIMIT) return campaign;
  const entry: CampaignEntry = {
    id,
    kind: input.kind,
    title,
    text: input.text.slice(0, TEXT_LIMIT),
    closed: false,
    day: campaign.day,
    scene: input.scene,
  };
  return { ...campaign, entries: [entry, ...campaign.entries] };
}

export function updateEntry(campaign: Campaign, id: string, patch: Partial<Pick<CampaignEntry, 'text' | 'closed'>>): Campaign {
  return {
    ...campaign,
    entries: campaign.entries.map((entry) =>
      entry.id === id ? { ...entry, ...patch, text: patch.text === undefined ? entry.text : patch.text.slice(0, TEXT_LIMIT) } : entry,
    ),
  };
}

export function removeEntry(campaign: Campaign, id: string): Campaign {
  return { ...campaign, entries: campaign.entries.filter((entry) => entry.id !== id) };
}

export function setDay(campaign: Campaign, day: number): Campaign {
  return { ...campaign, day: Math.max(1, Math.floor(day) || 1) };
}

export type KindFilter = EntryKind | 'all' | 'open';

/** "open" gathers every unsettled threat and thread — the player's to-do list. */
export function filterEntries(entries: CampaignEntry[], filter: KindFilter, search: string): CampaignEntry[] {
  const needle = search.trim().toLowerCase();
  return entries.filter((entry) => {
    if (filter === 'open') {
      if (!isSettleable(entry.kind) || entry.closed) return false;
    } else if (filter !== 'all' && entry.kind !== filter) {
      return false;
    }
    return !needle || entry.title.toLowerCase().includes(needle) || entry.text.toLowerCase().includes(needle);
  });
}
