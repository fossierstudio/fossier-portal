import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  svg: {
    width: 'auto',
    height: 30,
    filter: 'drop-shadow(0 0 4px #ff6ec7)',
  },
});

export const LogoIcon = () => {
  const classes = useStyles();

  return (
    <svg
      className={classes.svg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="10 6 29 36"
      aria-hidden="true"
    >
      <g fill="#ff82d0">
        <rect x="14" y="10" width="7" height="28" rx="1.5" />
        <rect x="14" y="10" width="21" height="7" rx="1.5" />
        <rect x="14" y="21" width="16" height="6.5" rx="1.5" />
      </g>
    </svg>
  );
};
