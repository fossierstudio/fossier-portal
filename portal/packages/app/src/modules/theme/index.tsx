import { PropsWithChildren } from 'react';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { ThemeBlueprint } from '@backstage/plugin-app-react';
import {
  UnifiedThemeProvider,
  createUnifiedTheme,
  genPageTheme,
  palettes,
} from '@backstage/theme';

// Mirrors the tokens on fossier.studio.
const fossierTheme = createUnifiedTheme({
  palette: {
    ...palettes.dark,
    background: { default: '#000000', paper: '#0d090b' },
    primary: { main: '#ff6ec7' },
    secondary: { main: '#ffb3e6' },
    text: { primary: '#efe9ed', secondary: '#aaa0a7' },
    divider: '#2b2026',
    link: '#ff82d0',
    linkHover: '#ffb3e6',
    navigation: {
      ...palettes.dark.navigation,
      background: '#000000',
      indicator: '#ff6ec7',
      color: '#aaa0a7',
      selectedColor: '#ffb3e6',
      navItem: { hoverBackground: '#1e0a16' },
      submenu: { background: '#0d090b' },
    },
  },
  fontFamily:
    '"Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  defaultPageTheme: 'home',
  pageTheme: {
    home: genPageTheme({
      colors: ['#380a28', '#000000'],
      shape: 'none',
      options: { fontColor: '#efe9ed' },
    }),
  },
});

const fossierAppTheme = ThemeBlueprint.make({
  name: 'fossier',
  params: {
    theme: {
      id: 'fossier',
      title: 'Fossier Studio',
      variant: 'dark',
      Provider: ({ children }: PropsWithChildren<{}>) => (
        <UnifiedThemeProvider theme={fossierTheme}>
          {children}
        </UnifiedThemeProvider>
      ),
    },
  },
});

export const themeModule = createFrontendModule({
  pluginId: 'app',
  extensions: [fossierAppTheme],
});
