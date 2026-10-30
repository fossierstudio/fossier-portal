# Bramble

Bramble is a community platform with real-time chat, voice and video channels,
and screen share, on the web, iPhone, and desktop.

## Architecture

- **Gateway:** a WebSocket gateway written from scratch. It resumes dropped
  sessions, sheds slow clients, and staggers reconnects.
- **Voice:** moves from peer-to-peer to a mediasoup SFU as calls grow, with
  coturn for relay.
- **Data:** Postgres 16, with Redis for presence and the event bus.

## Delivery

Production runs on a Hetzner server behind nginx. Deploys are blue/green, with
health checks and connection drain, and migrations are rehearsed on a copy of
the live database. Development and staging run the same stack on a
studio-owned Linux machine.

## Operations

Prometheus alert rules and Grafana dashboards live as code next to the service.
Sentry covers the server and clients. Backups are nightly, offsite, and
object-locked, and restores are rehearsed.

More detail: [Bramble case study](https://fossier.studio/projects/bramble/).
