import { describe, expect, it } from 'vitest';
import { addEntry, EMPTY_CAMPAIGN, setDay, updateEntry } from './campaign';
import { campaignFileName, campaignToMarkdown } from './campaign-export';

/** A stand-in for `t` that shows the key and the values, so the test reads the structure rather than the wording. */
const t = (key: string, options?: Record<string, unknown>) => (options ? `${key}${JSON.stringify(options)}` : key);

describe('campaignToMarkdown', () => {
  it('lists days oldest first, and each day by scene', () => {
    let log = addEntry(EMPTY_CAMPAIGN, { kind: 'scene', title: 'Arrival', text: '', scene: 1 }, 'a');
    log = setDay(log, 2);
    log = addEntry(log, { kind: 'scene', title: 'Late', text: '', scene: 4 }, 'b');
    log = addEntry(log, { kind: 'npc', title: 'Marta', text: 'Innkeeper.\nKnows the road.', scene: 3 }, 'c');
    const text = campaignToMarkdown(log, t);
    expect(text.indexOf('Arrival')).toBeLessThan(text.indexOf('Marta'));
    expect(text.indexOf('Marta')).toBeLessThan(text.indexOf('Late'));
    expect(text).toContain('  Innkeeper.\n  Knows the road.');
    expect(text.startsWith('# solo.campaign.export.title')).toBe(true);
  });

  it('marks settled and tracked threads and ends with what is still open', () => {
    let log = addEntry(EMPTY_CAMPAIGN, { kind: 'thread', title: 'Find the sister', text: '', scene: 0 }, 'a');
    log = updateEntry(log, 'a', { trackSize: 15, progress: 6 });
    log = addEntry(log, { kind: 'threat', title: 'Wolves', text: '', scene: 0 }, 'b');
    log = updateEntry(log, 'b', { closed: true });
    const text = campaignToMarkdown(log, t);
    expect(text).toContain('"progress":6,"size":15');
    expect(text).toContain('solo.campaign.export.settled');
    const tail = text.slice(text.indexOf('solo.campaign.export.open'));
    expect(tail).toContain('Find the sister');
    expect(tail).not.toContain('Wolves');
  });

  it('writes a title for an empty log and a file name with the day', () => {
    expect(campaignToMarkdown(EMPTY_CAMPAIGN, t)).toContain('solo.campaign.export.title');
    expect(campaignFileName(7)).toBe('campaign-day-7.md');
  });
});
