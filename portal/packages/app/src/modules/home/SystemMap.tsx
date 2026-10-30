import { MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';

export type CatalogRow = {
  kind: string;
  metadata: { name: string; title?: string };
  spec?: { system?: string; lifecycle?: string };
};

type StudioComponent = { name: string; title: string; lifecycle?: string };

export type StudioSystem = {
  name: string;
  title: string;
  hue: number;
  icon?: string;
  components: StudioComponent[];
};

// Hues match each project's color on fossier.studio.
const BRANDING: Record<string, { hue: number; icon?: string }> = {
  mycel: { hue: 83, icon: '/mycel-icon.png' },
  bramble: { hue: 128, icon: '/bramble-icon.png' },
  canopy: { hue: 173, icon: '/canopy-icon.png' },
  metamatching: { hue: 273 },
};
const SYSTEM_ORDER = Object.keys(BRANDING);
const DEFAULT_HUE = 345;

export const toSystems = (rows: CatalogRow[]): StudioSystem[] => {
  const rank = (name: string) => {
    const index = SYSTEM_ORDER.indexOf(name);
    return index === -1 ? SYSTEM_ORDER.length : index;
  };

  return rows
    .filter(row => row.kind === 'System')
    .map(row => ({
      name: row.metadata.name,
      title: row.metadata.title ?? row.metadata.name,
      hue: BRANDING[row.metadata.name]?.hue ?? DEFAULT_HUE,
      icon: BRANDING[row.metadata.name]?.icon,
      components: rows
        .filter(
          candidate =>
            candidate.kind === 'Component' &&
            candidate.spec?.system === row.metadata.name,
        )
        .map(candidate => ({
          name: candidate.metadata.name,
          title: candidate.metadata.title ?? candidate.metadata.name,
          lifecycle: candidate.spec?.lifecycle,
        })),
    }))
    .sort((a, b) => rank(a.name) - rank(b.name));
};

const tint = (hue: number) => `oklch(.76 .17 ${hue})`;

const WIDTH = 1100;
const ROOT_X = 56;
// Branches finish curving here, leaving a straight run to the system node so
// the name sits above the line and the count below it.
const BEND_X = 212;
const SYSTEM_X = 400;
const LEAF_X = 700;
const ROW_HEIGHT = 34;
const GROUP_GAP = 26;
const TOP = 30;

// A fixed offset per branch keeps the curves organic but stable between renders.
const wobble = (seed: number) => Math.sin(seed * 12.9898) * 26;

type Placement = StudioSystem & {
  y: number;
  leaves: (StudioComponent & { y: number })[];
};

const place = (systems: StudioSystem[]) => {
  let cursor = TOP;
  const placed: Placement[] = systems.map(system => {
    const rows = Math.max(system.components.length, 1);
    const leaves = system.components.map((component, index) => ({
      ...component,
      y: cursor + index * ROW_HEIGHT,
    }));
    const y = cursor + ((rows - 1) * ROW_HEIGHT) / 2;
    cursor += rows * ROW_HEIGHT + GROUP_GAP;
    return { ...system, y, leaves };
  });
  return { placed, height: cursor - GROUP_GAP + TOP - ROW_HEIGHT };
};

const useStyles = makeStyles({
  map: {
    display: 'block',
    width: '100%',
    height: 'auto',
    '@media (max-width: 760px)': { display: 'none' },
  },
  node: {
    cursor: 'pointer',
    '&:focus-visible': { outline: '2px solid #ffb3e6', outlineOffset: 4 },
    '&:hover text': { fill: '#ffffff' },
  },
  systemName: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  systemMeta: {
    fill: '#aaa0a7',
    fontSize: 14,
  },
  leafName: {
    fill: '#efe9ed',
    fontSize: 15,
  },
  list: {
    display: 'none',
    margin: 0,
    padding: 0,
    listStyle: 'none',
    '@media (max-width: 760px)': { display: 'block' },
  },
  listGroup: {
    padding: '12px 0 12px 16px',
    marginBottom: 12,
    borderLeft: '2px solid',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 700,
  },
  listItems: {
    margin: '6px 0 0',
    padding: 0,
    listStyle: 'none',
    lineHeight: 1.9,
  },
});

export const SystemMap = ({ systems }: { systems: StudioSystem[] }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { placed, height } = place(systems);
  const rootY = height / 2;

  const open = (path: string) => (event: MouseEvent) => {
    event.preventDefault();
    navigate(path);
  };

  return (
    <>
      <svg
        className={classes.map}
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="group"
        aria-label="Map of studio systems and their components"
      >
        {placed.map((system, systemIndex) => {
          const color = tint(system.hue);
          const systemPath = `/catalog/default/system/${system.name}`;
          return (
            <g key={system.name}>
              <path
                className="fossier-branch"
                pathLength={1}
                stroke={color}
                strokeWidth={2.4}
                d={`M${ROOT_X} ${rootY} C${ROOT_X + 80} ${
                  rootY + wobble(systemIndex + 1)
                } ${BEND_X - 90} ${system.y} ${BEND_X} ${
                  system.y
                } L${SYSTEM_X} ${system.y}`}
              />
              {system.leaves.map((leaf, leafIndex) => (
                <path
                  key={leaf.name}
                  className="fossier-branch"
                  style={{ animationDelay: '.45s' }}
                  pathLength={1}
                  stroke={color}
                  strokeOpacity={0.75}
                  strokeWidth={1.3}
                  d={`M${SYSTEM_X} ${system.y} C${SYSTEM_X + 110} ${
                    system.y + wobble(systemIndex + leafIndex + 5) / 3
                  } ${LEAF_X - 130} ${leaf.y} ${LEAF_X} ${leaf.y}`}
                />
              ))}
              <a
                className={classes.node}
                href={systemPath}
                onClick={open(systemPath)}
              >
                <text
                  className={classes.systemName}
                  x={SYSTEM_X - 28}
                  y={system.y - 12}
                  textAnchor="end"
                  fill={color}
                >
                  {system.title}
                </text>
                <text
                  className={classes.systemMeta}
                  x={SYSTEM_X - 28}
                  y={system.y + 24}
                  textAnchor="end"
                >
                  {system.components.length}{' '}
                  {system.components.length === 1 ? 'component' : 'components'}
                </text>
                {system.icon ? (
                  <>
                    {/* The icons are transparent, so mask the branch behind them. */}
                    <circle cx={SYSTEM_X} cy={system.y} r={20} fill="#000000" />
                    <image
                      href={system.icon}
                      x={SYSTEM_X - 17}
                      y={system.y - 17}
                      width={34}
                      height={34}
                    />
                  </>
                ) : (
                  <circle cx={SYSTEM_X} cy={system.y} r={9} fill={color} />
                )}
              </a>
              {system.leaves.map(leaf => {
                const leafPath = `/catalog/default/component/${leaf.name}`;
                const growing = leaf.lifecycle === 'experimental';
                return (
                  <a
                    key={leaf.name}
                    className={classes.node}
                    href={leafPath}
                    onClick={open(leafPath)}
                  >
                    {growing && <title>{leaf.title}, experimental</title>}
                    <circle
                      cx={LEAF_X}
                      cy={leaf.y}
                      r={4.5}
                      fill={growing ? '#000000' : color}
                      stroke={color}
                      strokeWidth={1.5}
                    />
                    <text
                      className={classes.leafName}
                      x={LEAF_X + 16}
                      y={leaf.y + 5}
                    >
                      {leaf.title}
                    </text>
                  </a>
                );
              })}
            </g>
          );
        })}
        <g
          transform={`translate(${ROOT_X - 24} ${rootY - 28})`}
          fill="#ff82d0"
          style={{ filter: 'drop-shadow(0 0 6px #ff6ec7)' }}
        >
          <rect x="14" y="10" width="7" height="28" rx="1.5" />
          <rect x="14" y="10" width="21" height="7" rx="1.5" />
          <rect x="14" y="21" width="16" height="6.5" rx="1.5" />
        </g>
      </svg>

      <ul className={classes.list}>
        {systems.map(system => (
          <li
            key={system.name}
            className={classes.listGroup}
            style={{ borderColor: tint(system.hue) }}
          >
            <Link
              className={classes.listTitle}
              style={{ color: tint(system.hue) }}
              to={`/catalog/default/system/${system.name}`}
            >
              {system.title}
            </Link>
            <ul className={classes.listItems}>
              {system.components.map(component => (
                <li key={component.name}>
                  <Link to={`/catalog/default/component/${component.name}`}>
                    {component.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
};
