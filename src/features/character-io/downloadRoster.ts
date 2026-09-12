import type { Character } from '../../types/character';
import { charactersToJson, rosterFileName } from './characterIo';

export function downloadRoster(characters: Character[]): void {
  const blob = new Blob([charactersToJson(characters)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = rosterFileName();
  link.click();
  URL.revokeObjectURL(url);
}
