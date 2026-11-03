import { deploysPlugin } from './plugin';

describe('deploys', () => {
  it('should export plugin', () => {
    expect(deploysPlugin).toBeDefined();
  });
});
