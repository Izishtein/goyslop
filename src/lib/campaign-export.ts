import type { Campaign, CampaignEntry } from './campaign';

/** The slice of i18next's `t` the export needs: a key and interpolation values in, text out. */
export type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Keeps a title from breaking the Markdown line it sits on. */
const inline = (text: string): string => text.replace(/[\r\n]+/g, ' ').trim();

function entryLine(entry: CampaignEntry, t: Translate): string {
  const marks: string[] = [t(`solo.campaign.kinds.${entry.kind}`)];
  if (entry.place) marks.push(entry.place);
  if (entry.kind === 'thread' && entry.trackSize > 0) marks.push(t('solo.campaign.export.progress', { progress: entry.progress, size: entry.trackSize }));
  if (entry.closed) marks.push(t('solo.campaign.export.settled'));
  const head = `- **${inline(entry.title)}** (${marks.join(', ')}; ${t('solo.campaign.export.scene', { scene: entry.scene })})`;
  const text = entry.text.trim();
  if (!text) return head;
  const indented = text.split(/\r?\n/).map((line) => `  ${line}`).join('\n');
  return `${head}\n${indented}`;
}

/** The campaign log as a readable story-so-far: by day, oldest first, then what is still open. */
export function campaignToMarkdown(campaign: Campaign, t: Translate): string {
  const chronological = [...campaign.entries].reverse();
  const days = [...new Set(chronological.map((entry) => entry.day))].sort((a, b) => a - b);
  const lines: string[] = [`# ${t('solo.campaign.export.title')}`, '', t('solo.campaign.export.today', { day: campaign.day }), ''];
  for (const day of days) {
    lines.push(`## ${t('solo.campaign.day', { day })}`, '');
    const ofDay = chronological.filter((entry) => entry.day === day).sort((a, b) => a.scene - b.scene);
    for (const entry of ofDay) lines.push(entryLine(entry, t));
    lines.push('');
  }
  const open = chronological.filter((entry) => (entry.kind === 'threat' || entry.kind === 'thread') && !entry.closed);
  if (open.length > 0) {
    lines.push(`## ${t('solo.campaign.export.open')}`, '');
    for (const entry of open) lines.push(`- ${inline(entry.title)} (${t(`solo.campaign.kinds.${entry.kind}`)})`);
    lines.push('');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

export const campaignFileName = (day: number): string => `campaign-day-${day}.md`;
