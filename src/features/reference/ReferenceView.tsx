import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackgroundsReference } from './BackgroundsReference';
import { ArtsReference, CombatFeatsReference, ItemsReference, SpellsReference } from './CatalogReference';
import { ClassesReference } from './ClassesReference';
import { RacesReference } from './RacesReference';
import styles from './ReferenceView.module.css';

const TABS = ['races', 'classes', 'backgrounds', 'spells', 'feats', 'arts', 'items'] as const;
type ReferenceTab = (typeof TABS)[number];

const PANELS: Record<ReferenceTab, () => React.JSX.Element> = {
  races: RacesReference,
  classes: ClassesReference,
  backgrounds: BackgroundsReference,
  spells: SpellsReference,
  feats: CombatFeatsReference,
  arts: ArtsReference,
  items: ItemsReference,
};

export function ReferenceView({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ReferenceTab>('races');
  const Panel = PANELS[tab];

  return (
    <section className={styles.reference} aria-labelledby="reference-title">
      <div className={styles.head}>
        <div>
          <h2 id="reference-title">{t('reference.title')}</h2>
          <p className={styles.note}>{t('reference.intro')}</p>
        </div>
        <button type="button" onClick={onClose}>
          {t('reference.close')}
        </button>
      </div>

      {/* Plain buttons rather than a tablist: radix-ui is a dependency with no usage in the
          app yet, and buttons are already hidden on paper, so printing yields exactly the
          open catalog and none of the chrome. */}
      <div className={styles.tabs}>
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            className={`${styles.tab} ${tab === name ? styles.tabActive : ''}`}
            aria-pressed={tab === name}
            onClick={() => setTab(name)}
          >
            {t(`reference.tab.${name}`)}
          </button>
        ))}
      </div>

      <Panel />
    </section>
  );
}
