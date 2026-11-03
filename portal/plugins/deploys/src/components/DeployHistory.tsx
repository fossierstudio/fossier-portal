import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/frontend-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { makeStyles } from '@material-ui/core';
import useAsync from 'react-use/esm/useAsync';
import { DeploySummary, deploysApiRef } from '../api';
import { DEPLOY_HISTORY_ANNOTATION } from '../annotation';

const useStyles = makeStyles(theme => ({
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  stat: {
    padding: theme.spacing(2.5),
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
  },
  label: {
    margin: 0,
    color: theme.palette.text.secondary,
    fontSize: 14,
  },
  value: {
    margin: theme.spacing(0.5, 0),
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  detail: {
    margin: 0,
    color: theme.palette.text.secondary,
    fontSize: 14,
  },
  chart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 3,
    height: 180,
  },
  week: {
    flex: '1 1 0',
    minWidth: 2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  deployBar: {
    background: theme.palette.primary.main,
    borderRadius: '2px 2px 0 0',
  },
  failedBar: {
    background: theme.palette.error.main,
    opacity: 0.8,
  },
  axis: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: 13,
  },
  legend: {
    display: 'flex',
    gap: theme.spacing(3),
    marginTop: theme.spacing(2),
    color: theme.palette.text.secondary,
    fontSize: 14,
  },
  swatch: {
    display: 'inline-block',
    width: 10,
    height: 10,
    marginRight: theme.spacing(1),
    borderRadius: 2,
  },
  note: {
    marginTop: theme.spacing(2),
    color: theme.palette.text.secondary,
    fontSize: 13,
  },
}));

const day = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

const minutes = (value?: number) =>
  value === undefined ? '–' : `${value.toFixed(1)} min`;

const Stat = (props: { label: string; value: string; detail: string }) => {
  const classes = useStyles();
  return (
    <div className={classes.stat}>
      <p className={classes.label}>{props.label}</p>
      <p className={classes.value}>{props.value}</p>
      <p className={classes.detail}>{props.detail}</p>
    </div>
  );
};

export const DeployHistoryView = ({ summary }: { summary: DeploySummary }) => {
  const classes = useStyles();
  const peak = Math.max(1, ...summary.weeks.map(w => w.deploys + w.failed));
  const busiest = Math.max(0, ...summary.weeks.map(w => w.deploys));
  const first = summary.weeks[0];
  const last = summary.weeks[summary.weeks.length - 1];

  return (
    <>
      <div className={classes.stats}>
        <Stat
          label="Production deploys"
          value={summary.deploys.toLocaleString('en-US')}
          detail={
            summary.firstDeploy
              ? `since ${day(summary.firstDeploy)}`
              : 'none yet'
          }
        />
        <Stat
          label="Median push to live"
          value={minutes(summary.medianMinutes)}
          detail={`90% within ${minutes(summary.p90Minutes)}`}
        />
        <Stat
          label="Failed runs"
          value={summary.failedRuns.toLocaleString('en-US')}
          detail={`${Math.round(summary.failureRate * 100)}% of finished runs`}
        />
        <Stat
          label="Last deploy"
          value={summary.lastDeploy ? day(summary.lastDeploy) : '–'}
          detail={`${summary.cancelledRuns} runs cancelled`}
        />
      </div>
      <InfoCard title="Runs per week">
        <div
          className={classes.chart}
          role="img"
          aria-label={`Weekly runs over ${summary.weeks.length} weeks, with up to ${busiest} deploys in a week`}
        >
          {summary.weeks.map(week => (
            <div
              key={week.start}
              className={classes.week}
              title={`Week of ${day(week.start)}: ${week.deploys} deploys, ${
                week.failed
              } failed`}
            >
              <div
                className={classes.failedBar}
                style={{ height: `${(week.failed / peak) * 100}%` }}
              />
              <div
                className={classes.deployBar}
                style={{ height: `${(week.deploys / peak) * 100}%` }}
              />
            </div>
          ))}
        </div>
        {first && last && (
          <div className={classes.axis}>
            <span>{day(first.start)}</span>
            <span>{day(last.start)}</span>
          </div>
        )}
        <div className={classes.legend}>
          <span>
            <span className={`${classes.swatch} ${classes.deployBar}`} />
            Deploys
          </span>
          <span>
            <span className={`${classes.swatch} ${classes.failedBar}`} />
            Failed runs
          </span>
        </div>
        <div className={classes.note}>
          {summary.description}, exported {day(summary.exportedAt)}. A failed
          run failed its tests or its deploy step, so it never reached
          production.
        </div>
      </InfoCard>
    </>
  );
};

/** The Deploys tab on an entity page. */
export const DeployHistory = () => {
  const { entity } = useEntity();
  const deploysApi = useApi(deploysApiRef);
  const name = entity.metadata.annotations?.[DEPLOY_HISTORY_ANNOTATION] ?? '';
  const { value, loading, error } = useAsync(
    () => deploysApi.getHistory(name),
    [deploysApi, name],
  );

  if (loading) {
    return <Progress />;
  }
  if (error) {
    return <ResponseErrorPanel error={error} />;
  }
  return <DeployHistoryView summary={value!} />;
};
