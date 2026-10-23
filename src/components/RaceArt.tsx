import { raceArtUrl } from '../lib/race-art';

/** The book's picture of a race (see lib/race-art.ts); decorative, the race's name is always beside it. Nothing when there is none. */
export function RaceArt({ raceId, className }: { raceId: string; className?: string }) {
  const url = raceArtUrl(raceId);
  return url ? <img src={url} alt="" className={className} loading="lazy" decoding="async" draggable={false} /> : null;
}
