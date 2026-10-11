import { describe, expect, it } from 'vitest';
import { addEntry, EMPTY_CAMPAIGN, ENTRY_LIMIT, filterEntries, isEventSource, raiseWeights, removeEntry, setDay, TEXT_LIMIT, updateEntry } from './campaign';

const note = (title: string, kind: 'scene' | 'npc' | 'threat' | 'thread' = 'scene') => ({ kind, title, text: '', scene: 2 });

describe('campaign log', () => {
  it('puts the newest entry first and stamps it with the day and scene', () => {
    let log = setDay(EMPTY_CAMPAIGN, 4);
    log = addEntry(log, note('First'), 'a');
    log = addEntry(log, note('Second'), 'b');
    expect(log.entries.map((e) => e.title)).toEqual(['Second', 'First']);
    expect(log.entries[0]).toMatchObject({ day: 4, scene: 2, closed: false });
  });

  it('ignores an empty title and refuses to grow past the limit', () => {
    expect(addEntry(EMPTY_CAMPAIGN, note('   '), 'a')).toBe(EMPTY_CAMPAIGN);
    const full = { ...EMPTY_CAMPAIGN, entries: Array.from({ length: ENTRY_LIMIT }, (_, i) => ({ ...addEntry(EMPTY_CAMPAIGN, note('x'), String(i)).entries[0] })) };
    expect(addEntry(full, note('one more'), 'z')).toBe(full);
  });

  it('cuts overlong text, edits, settles and removes', () => {
    let log = addEntry(EMPTY_CAMPAIGN, { ...note('Wolves', 'threat'), text: 'x'.repeat(TEXT_LIMIT + 10) }, 'a');
    expect(log.entries[0].text).toHaveLength(TEXT_LIMIT);
    log = updateEntry(log, 'a', { text: 'howling', closed: true });
    expect(log.entries[0]).toMatchObject({ text: 'howling', closed: true });
    expect(removeEntry(log, 'a').entries).toEqual([]);
  });

  it('never lets the day drop below 1', () => {
    expect(setDay(EMPTY_CAMPAIGN, 0).day).toBe(1);
    expect(setDay(EMPTY_CAMPAIGN, Number.NaN).day).toBe(1);
  });

  it('"open" lists only unsettled threats and threads; search looks in titles and notes', () => {
    let log = EMPTY_CAMPAIGN;
    log = addEntry(log, note('Inn', 'scene'), '1');
    log = addEntry(log, note('Bandits', 'threat'), '2');
    log = addEntry(log, note('Who sent the letter?', 'thread'), '3');
    log = updateEntry(log, '2', { closed: true });
    expect(filterEntries(log.entries, 'open', '').map((e) => e.id)).toEqual(['3']);
    expect(filterEntries(log.entries, 'threat', '').map((e) => e.id)).toEqual(['2']);
    expect(filterEntries(log.entries, 'all', 'letter').map((e) => e.id)).toEqual(['3']);
  });
});

describe('entry weight', () => {
  it('starts at 1 and is clamped to 1–3', () => {
    let log = addEntry(EMPTY_CAMPAIGN, note('Marta', 'npc'), 'a');
    expect(log.entries[0].weight).toBe(1);
    log = updateEntry(log, 'a', { weight: 9 });
    expect(log.entries[0].weight).toBe(3);
    log = updateEntry(log, 'a', { weight: -4 });
    expect(log.entries[0].weight).toBe(1);
  });

  it('rises by one for everyone who took part, up to the cap', () => {
    let log = addEntry(EMPTY_CAMPAIGN, note('Marta', 'npc'), 'a');
    log = addEntry(log, note('Wolves', 'threat'), 'b');
    log = raiseWeights(log, ['a']);
    log = raiseWeights(log, ['a']);
    log = raiseWeights(log, ['a']);
    expect(log.entries.map((e) => [e.id, e.weight])).toEqual([['b', 1], ['a', 3]]);
  });

  it('is a subject for events unless it is a scene', () => {
    expect(isEventSource('npc')).toBe(true);
    expect(isEventSource('scene')).toBe(false);
  });
});
