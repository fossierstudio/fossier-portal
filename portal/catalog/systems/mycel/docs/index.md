# Mycel

Mycel watches GitHub Actions and alerts only when a run changes state. It also
tracks self-hosted runners and Actions billing, and explains failures with
on-device AI.

## How it fits together

- **Clients:** a native macOS menu bar app, with iOS and Android companions. A
  Windows app is in progress.
- **Polling:** every repo is polled every 30 seconds, using conditional requests
  to stay within the GitHub REST API rate limit.
- **Failure analysis:** runs on the device with Apple Foundation Models or
  Ollama.
- **Push:** a Cloudflare Worker relays iPhone notifications and Live Activities
  through APNs.

## Delivery

iOS builds archive on a self-hosted Mac and go to TestFlight. Android builds
submit to Google Play testing.

More detail: [Mycel case study](https://fossier.studio/projects/mycel/).
