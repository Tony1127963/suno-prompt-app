export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  glassColor?: string;
  glassOpacity: number;
  blur: number;
  radius: number;
  glow: number;
  panelOpacity: number;
  panelBlur: number;
  borderOpacity: number;
  shadowIntensity: number;
  fontFamily: 'sans' | 'mono';
  aiPanelColor: string;
  aiPanelOpacity: number;
}

export const THEMES: Theme[] = [
  {
    name: 'Suno Default',
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#09090b',
    glassColor: '#18181b',
    glassOpacity: 0.8,
    blur: 16,
    radius: 1.5,
    glow: 0.15,
    panelOpacity: 0.05,
    panelBlur: 8,
    borderOpacity: 0.1,
    shadowIntensity: 0.5,
    fontFamily: 'sans',
    aiPanelColor: '#8b5cf6',
    aiPanelOpacity: 0.1,
  },
  {
    name: 'Neon Cyberpunk',
    primary: '#06b6d4',
    secondary: '#ec4899',
    background: '#020617',
    glassColor: '#0f172a',
    glassOpacity: 0.9,
    blur: 24,
    radius: 0.5,
    glow: 0.3,
    panelOpacity: 0.1,
    panelBlur: 12,
    borderOpacity: 0.2,
    shadowIntensity: 0.8,
    fontFamily: 'mono',
    aiPanelColor: '#ec4899',
    aiPanelOpacity: 0.15,
  },
  {
    name: 'Midnight Purple',
    primary: '#a855f7',
    secondary: '#d946ef',
    background: '#170f2e',
    glassColor: '#2e1f4f',
    glassOpacity: 0.85,
    blur: 20,
    radius: 1.0,
    glow: 0.2,
    panelOpacity: 0.08,
    panelBlur: 10,
    borderOpacity: 0.15,
    shadowIntensity: 0.6,
    fontFamily: 'sans',
    aiPanelColor: '#d946ef',
    aiPanelOpacity: 0.1,
  }
];
