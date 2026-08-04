import type { Character } from '../../types/character';
import { characterFileName, characterToJson } from './characterIo';

export function downloadCharacter(character: Character): void {
  const blob = new Blob([characterToJson(character)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = characterFileName(character);
  link.click();
  URL.revokeObjectURL(url);
}
