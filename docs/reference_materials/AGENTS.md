# Project Agent Instructions — Metro Seat Handoff

This workspace contains the product brief for a mobile application that coordinates temporary seat handoffs between metro passengers.

## Required startup behavior

Before making implementation decisions, read:

`METRO_SEAT_HANDOFF_MASTER_PROMPT.md`

Treat that document as the authoritative product brief for this project.

## Non-negotiable constraints

- Do not represent a metro seat as privately owned or officially reserved.
- Do not transfer, resell, or impersonate metro tickets.
- Do not imply affiliation or endorsement by GMRC unless verified and authorized.
- Research current GMRC rules and network information before hard-coding product assumptions.
- Keep any legally/operationally uncertain monetization behind a feature flag.
- Never store or expose secrets in source control.
- Prioritize station-based coordination over continuous precise location tracking.
- Build the smallest testable MVP before adding advanced features.
- Test the matching and handoff state machine thoroughly.

## Execution style

Act as a senior product + engineering team. Inspect the existing repository first, reuse established conventions where appropriate, document major decisions, run tests, fix defects you uncover, and do not claim completion until the core end-to-end flow works.
