# Canopy

Canopy handles staff scheduling for small counseling practices: client and staff
schedules, PTO, timesheets, and team messaging.

## Architecture

- **Clients:** a Next.js web app and an Expo mobile app, sharing a core package.
- **Backend:** self-hosted Supabase for Postgres, auth, Realtime, and edge
  functions, on single-node k3s.
- **Tests:** database behavior is covered with pgTAP.

## Delivery

GitHub Actions deploys through self-hosted runners, with Helm for orchestration
and Doppler for secrets. Mobile builds use EAS local builds and go to TestFlight
and Google Play testing.

More detail: [Canopy case study](https://fossier.studio/projects/canopy/).
