import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '@backstage/ui/css/styles.css';
import './modules/theme/fossier.css';

ReactDOM.createRoot(document.getElementById('root')!).render(App.createRoot());
