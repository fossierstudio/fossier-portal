import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';

// Anyone can sign in as a guest, so users only ever get to read. Permissions
// with no declared action are denied too. Backend plugins skip this policy, so
// catalog processing and TechDocs builds are unaffected.
export class ReadOnlyPolicy implements PermissionPolicy {
  async handle(request: PolicyQuery): Promise<PolicyDecision> {
    return {
      result:
        request.permission.attributes.action === 'read'
          ? AuthorizeResult.ALLOW
          : AuthorizeResult.DENY,
    };
  }
}

export default createBackendModule({
  pluginId: 'permission',
  moduleId: 'read-only-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint },
      async init({ policy }) {
        policy.setPolicy(new ReadOnlyPolicy());
      },
    });
  },
});
