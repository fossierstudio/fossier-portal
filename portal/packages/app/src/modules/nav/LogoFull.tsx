import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  wordmark: {
    color: '#ffd6f0',
    fontSize: 21,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    whiteSpace: 'nowrap',
    textShadow:
      '0 0 3px #ffb3e6, 0 0 8px #ff6ec7, 0 0 18px #ff3eb5, 0 0 40px rgba(212, 0, 160, .6)',
  },
});

export const LogoFull = () => {
  const classes = useStyles();

  return <span className={classes.wordmark}>Fossier Studio</span>;
};
