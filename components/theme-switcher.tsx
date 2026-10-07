'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTheme } from '@/components/theme-provider';

const themes = [
  {
    id: 'printed_hong_kong_1910_1949',
    label: 'Foxfire & Steel Hong Kong',
    controlLabel: 'Foxfire',
    period: 'First half of the twentieth century · speculative film-inspired style',
  },
  {
    id: 'postwar_cha_chaan_teng_1950_1999',
    label: 'Post-war Cha Chaan Teng',
    controlLabel: 'Cha Chaan Teng',
    period: 'Second half of the twentieth century',
  },
];

export default function ThemeSwitcher() {
  const { activeTheme, setActiveTheme } = useTheme();

  return (
    <div className="era-control-group">
      <span className="era-control-label">Theme</span>
      <ToggleGroup
        className="era-toggle"
        aria-label="Theme"
        value={[activeTheme]}
        onValueChange={(values) => values[0] && setActiveTheme(values[0])}
      >
        {themes.map((theme, index) => (
          <ToggleGroupItem
            key={theme.id}
            value={theme.id}
            aria-label={`Use ${theme.label} visual style`}
            title={`${theme.label} · ${theme.period}`}
          >
            <span className="theme-toggle-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="theme-toggle-name">{theme.controlLabel}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
