
Note: EXPO_PUBLIC_DEMO_MODE must never be set for a public build as it hardcodes the OTP to 1234.

To run locally, you must create a .env.local file. Run:
cp .env.example .env.local

## Environment Variables

- `EXPO_PUBLIC_DEMO_TIME`: Set to an ISO timestamp (e.g., `2026-10-05T07:30:00+05:30`) to initialize the app's clock to a specific time for testing or demo purposes. The clock will still tick normally from that point forward.
