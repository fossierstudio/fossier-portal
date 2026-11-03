export interface Config {
  deploys: {
    /**
     * Directory of deploy history files written by scripts/export-deploys.mjs,
     * relative to the backend's working directory.
     */
    dataDir: string;
  };
}
