# MetaMatching

MetaMatching is a synchronous three-player experiment platform built for a
behavioral science PhD dissertation.

## Design

- **Experiment control:** counterbalanced trial schedules that follow the
  dissertation's design.
- **Reliability:** sessions survive a page refresh.
- **Data:** per-round export for analysis.

## Stack

Node.js, Express, Socket.IO, and MongoDB, run as a hardened systemd service.

More detail: [MetaMatching case study](https://fossier.studio/projects/metamatching/).
