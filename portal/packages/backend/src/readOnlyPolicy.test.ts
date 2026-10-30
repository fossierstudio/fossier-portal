import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { ReadOnlyPolicy } from './readOnlyPolicy';

const decide = (action?: 'create' | 'read' | 'update' | 'delete') =>
  new ReadOnlyPolicy().handle({
    permission: {
      type: 'basic',
      name: 'test.permission',
      attributes: { action },
    },
  });

describe('ReadOnlyPolicy', () => {
  it('allows reads', async () => {
    await expect(decide('read')).resolves.toEqual({
      result: AuthorizeResult.ALLOW,
    });
  });

  it.each(['create', 'update', 'delete', undefined] as const)(
    'denies %s',
    async action => {
      await expect(decide(action)).resolves.toEqual({
        result: AuthorizeResult.DENY,
      });
    },
  );
});
