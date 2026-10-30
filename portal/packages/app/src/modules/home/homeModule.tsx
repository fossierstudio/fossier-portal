import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { PageBlueprint } from '@backstage/frontend-plugin-api';
import HomeIcon from '@material-ui/icons/Home';

// Takes over from the widget-based page:home, which app-config.yaml disables.
const homePage = PageBlueprint.make({
  name: 'home',
  params: {
    path: '/',
    title: 'Home',
    icon: <HomeIcon />,
    noHeader: true,
    loader: () => import('./HomePage').then(m => <m.HomePage />),
  },
});

export const homeModule = createFrontendModule({
  pluginId: 'app',
  extensions: [homePage],
});
