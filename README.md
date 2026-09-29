# Metro Seat Handoff MVP

This is a prototype mobile application designed to validate the hypothesis that seated metro passengers can coordinate seat handoffs with standing passengers. It is specifically designed for the **Ahmedabad-Gandhinagar Metro Phase 2**.

## ⚠️ Important Legal & Product Context
As researched during the Discovery Phase (see `/docs/FEASIBILITY.md`):
- **Monetization is Disabled:** Direct payments for seat handoffs are highly likely to violate GMRC's rules against unauthorized commercial activity. Therefore, this MVP functions strictly as a **free courtesy network**.
- **No Official Affiliation:** This app is not affiliated with, endorsed by, or operated by GMRC.
- **Seat Opportunities, Not Reservations:** Users coordinate expected availabilities. The app does not imply ownership of a seat or transfer of tickets.

## Features Built
1. **Core Matching Engine:** Station-based logic that correctly filters incompatible journeys based on direction and station sequence.
2. **Offer a Seat:** Seated passengers can specify where they are getting off to create an ephemeral listing.
3. **Find a Seat:** Standing passengers can input their destination to see upcoming availability.
4. **Handoff Coordination:** Secure matching that provides meeting instructions without revealing phone numbers.
5. **State Management:** Handled locally via Zustand to simulate real-time updates and expiry.

## Getting Started (Demo Mode)

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo CLI

### Installation
1. Clone this repository.
2. Navigate to the app directory:
   ```bash
   cd metro-seat-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Expo server:
   ```bash
   npm start
   ```

### Running the Demo
- Press `w` in the terminal to open the web preview (simplest way to test).
- Or use the Expo Go app on iOS/Android to scan the QR code.
- The app comes pre-seeded with a Mock User and two active seat opportunities for testing the matching logic.

## Project Structure
- `/docs/`: Product specification, architecture, and feasibility research.
- `/src/data/`: Static GMRC Phase 2 station data.
- `/src/store/`: Mock state manager (Zustand) simulating backend database interactions.
- `/src/screens/`: React Native screens for the core MVP loop.
- `/src/navigation/`: App routing.

## Future Development
If the free coordination model is validated through user testing, future phases would integrate:
- A production Supabase backend for real-time multiplayer state.
- Live GMRC train telemetry (if an API becomes available).
- Phone number verification to prevent abuse and spam.
