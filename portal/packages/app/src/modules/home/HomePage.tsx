import { useEffect, useState } from 'react';
import { Progress } from '@backstage/core-components';
import { useApi } from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  DeploySummary,
  deploysApiRef,
} from '@internal/backstage-plugin-deploys';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import { CatalogRow, StudioSystem, SystemMap, toSystems } from './SystemMap';

const useStyles = makeStyles({
  root: {
    maxWidth: 1240,
    padding: 'clamp(24px, 5vw, 64px)',
    color: '#efe9ed',
  },
  headline: {
    margin: 0,
    maxWidth: 16 * 40,
    fontSize: 'clamp(32px, 4.4vw, 52px)',
    fontWeight: 800,
    lineHeight: 1.08,
    letterSpacing: '-0.03em',
  },
  summary: {
    margin: '16px 0 0',
    maxWidth: 680,
    color: '#aaa0a7',
    fontSize: 18,
    lineHeight: 1.5,
  },
  map: {
    margin: '32px 0',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '12px 28px',
  },
  primary: {
    padding: '12px 20px',
    borderRadius: 8,
    background: '#ff6ec7',
    color: '#12000b',
    fontWeight: 700,
    textDecoration: 'none',
    '&:hover': { background: '#ffb3e6' },
    '&:focus-visible': { outline: '2px solid #ffb3e6', outlineOffset: 3 },
  },
  secondary: {
    color: '#ff82d0',
    fontWeight: 600,
    '&:hover': { color: '#ffb3e6' },
    '&:focus-visible': { outline: '2px solid #ffb3e6', outlineOffset: 3 },
  },
  deploys: {
    color: 'inherit',
    textDecorationColor: '#ff82d0',
    textUnderlineOffset: 3,
    '&:hover': { color: '#ffb3e6' },
    '&:focus-visible': { outline: '2px solid #ffb3e6', outlineOffset: 3 },
  },
  error: {
    color: '#efe9ed',
    fontSize: 18,
  },
});

const month = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

export const HomePage = () => {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const deploysApi = useApi(deploysApiRef);
  const [systems, setSystems] = useState<StudioSystem[]>();
  const [deploys, setDeploys] = useState<DeploySummary>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    catalogApi
      .getEntities({
        filter: [{ kind: 'system' }, { kind: 'component' }],
        fields: [
          'kind',
          'metadata.name',
          'metadata.title',
          'spec.system',
          'spec.lifecycle',
        ],
      })
      .then(response => setSystems(toSystems(response.items as CatalogRow[])))
      .catch(() => setFailed(true));
  }, [catalogApi]);

  // The deploy sentence is left out if the history can't be read.
  useEffect(() => {
    deploysApi
      .getHistory('bramble-server')
      .then(setDeploys)
      .catch(() => undefined);
  }, [deploysApi]);

  const componentCount =
    systems?.reduce((total, system) => total + system.components.length, 0) ??
    0;

  return (
    <main className={classes.root}>
      <h1 className={classes.headline}>Fossier Studio's developer portal</h1>
      {systems && (
        <p className={classes.summary}>
          {systems.length} systems and {componentCount} components. Every
          component has an owner, and every system has docs.
          {deploys?.firstDeploy && deploys.medianMinutes !== undefined && (
            <>
              {' '}
              <Link
                className={classes.deploys}
                to="/catalog/default/component/bramble-server/deploys"
              >
                Bramble alone has shipped {deploys.deploys} production deploys
                since {month(deploys.firstDeploy)}
              </Link>
              , with a median of {Math.round(deploys.medianMinutes)} minutes
              from push to live.
            </>
          )}
        </p>
      )}
      <div className={classes.map}>
        {failed && (
          <p className={classes.error}>
            The catalog didn't load. Reload the page, or check the portal logs
            if it keeps failing.
          </p>
        )}
        {!failed && !systems && <Progress />}
        {systems && <SystemMap systems={systems} />}
      </div>
      <nav className={classes.actions} aria-label="Next steps">
        <Link className={classes.primary} to="/catalog">
          Browse the catalog
        </Link>
        <Link className={classes.secondary} to="/docs">
          Read the docs
        </Link>
        <a
          className={classes.secondary}
          href="https://fossier.studio/engineering/"
          target="_blank"
          rel="noreferrer"
        >
          How it's built
        </a>
      </nav>
    </main>
  );
};
