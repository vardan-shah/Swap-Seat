# Architecture Document: Metro Seat Handoff MVP

## 1. Tech Stack Overview
- **Frontend / Client:** React Native with Expo (TypeScript). This allows for rapid cross-platform mobile development with a native feel, suitable for the UI constraints.
- **Backend / Database:** Supabase (PostgreSQL + Go/PostgREST). Supabase provides real-time subscriptions, secure auth, and a robust relational database out of the box, which is ideal for the ephemeral matching logic.
- **State Management:** React Context or Zustand for local state; React Query for remote data fetching.
- **Routing:** Expo Router.

*(Note: Since this is an MVP build within a single workspace, we will start with a mock backend/local state simulation before wiring up a real Supabase instance, to ensure rapid iteration of the core logic and UI as requested).*

## 2. Data Schema (Logical)

### `users`
- `id` (UUID, PK)
- `display_name` (String)
- `created_at` (Timestamp)

### `stations` (Static Data)
- `id` (String/UUID, PK)
- `name` (String)
- `sequence_number` (Int) - Used for matching logic (e.g., Station 5 is after Station 3).
- `line` (String) - e.g., 'North-South'

### `seat_opportunities`
- `id` (UUID, PK)
- `giver_id` (UUID, FK to users)
- `line` (String)
- `direction` (String) - e.g., 'Northbound'
- `current_station_id` (FK to stations)
- `handoff_station_id` (FK to stations)
- `status` (Enum: ACTIVE, MATCHED, COMPLETED, CANCELLED, EXPIRED)
- `created_at` (Timestamp)

### `matches`
- `id` (UUID, PK)
- `opportunity_id` (UUID, FK to seat_opportunities)
- `seeker_id` (UUID, FK to users)
- `status` (Enum: PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED)
- `created_at` (Timestamp)

## 3. Matching Logic Module
The matching algorithm evaluates compatibility based on:
1. **Line & Direction:** Must match exactly.
2. **Station Sequence:**
   - The Handoff Station must be *after* the seeker's Current Station (or the same, if they are waiting).
   - The Handoff Station must be *before* or *at* the seeker's Destination Station.
3. **Status:** The opportunity must be `ACTIVE`.

## 4. Feature Flags
- `ENABLE_PAYMENTS`: `false` (Hardcoded for MVP to comply with GMRC feasibility findings).

## 5. Development Phases
1. **Setup:** Initialize Expo project with TypeScript.
2. **Static Data:** Define the Ahmedabad-Gandhinagar Phase 2 stations.
3. **Mock Backend:** Create a local state manager (or mocked Supabase client) to handle CRUD for opportunities and matches without needing network connectivity initially.
4. **UI Implementation:** Build the core screens (Home, Offer Seat, Find Seat, Active Match).
5. **Simulation Mode:** Add tools to manually trigger state changes (e.g., "Arrive at Station X") to test expiration and matching.
