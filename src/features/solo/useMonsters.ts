import { useEffect, useMemo, useState } from 'react';
import { loadMonsters, type Monster } from '../../data/monsters';

/** The monster catalogue (a lazily fetched chunk) and an id lookup over it. `null` until loaded. */
export function useMonsters(): { monsters: Monster[] | null; byId: Map<string, Monster> } {
  const [monsters, setMonsters] = useState<Monster[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadMonsters().then((loaded) => !cancelled && setMonsters(loaded));
    return () => {
      cancelled = true;
    };
  }, []);
  const byId = useMemo(() => new Map((monsters ?? []).map((monster) => [monster.id, monster])), [monsters]);
  return { monsters, byId };
}
