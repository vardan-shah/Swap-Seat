# Product Specification: Metro Seat Handoff MVP

## 1. Objective
To validate the hypothesis that a free coordination network can successfully match seated metro passengers about to deboard with standing passengers looking for a seat, specifically on the Ahmedabad-Gandhinagar Metro Phase 2 network.

## 2. Core Value Proposition
- **For Seated Passengers (Sellers/Givers):** A frictionless way to offer their soon-to-be-vacated seat to someone who needs it.
- **For Standing Passengers (Seekers):** A predictable way to find an upcoming seat without awkwardly hovering over seated passengers.

## 3. Key Constraints & Principles
- **No Monetization (MVP):** Due to strict GMRC rules against unauthorized commercial activity, the MVP will operate strictly as a free courtesy network. Payment features are architected but completely disabled.
- **No Ownership Implied:** The app coordinates "seat opportunities", not guaranteed reservations.
- **Station-Based Logic:** Handoffs are anchored to specific metro stations, not continuous GPS tracking.
- **Ephemeral State:** Listings are short-lived and expire automatically after the target station is passed.
- **No Ticket Integration:** The app is strictly for seat handoffs; ticketing is the sole responsibility of the user.

## 4. Core User Flows

### Flow A: Offering a Seat Opportunity
1. User selects current route/direction (e.g., North-South, Towards Mahatma Mandir).
2. User selects their current station and their intended deboarding station (the "Handoff Station").
3. User confirms the offering. The listing goes live for compatible seekers.
4. As the handoff station approaches, the app notifies the user.
5. The listing automatically expires once the train departs the handoff station.

### Flow B: Requesting a Seat Opportunity
1. User selects their current station and destination station.
2. The app surfaces active seat opportunities that become available at or before the user's destination.
3. User requests a specific handoff.
4. If accepted by the giver, an ephemeral match is created.
5. App provides basic coordination instructions (e.g., "Meet near Door 2").
6. Both users confirm completion or cancellation.

## 5. Trust & Safety
- **Anonymity:** No personal phone numbers are shared.
- **Reporting:** Users can report no-shows or abusive behavior.
- **Limitations:** Only one active handoff per user at a time.
- **Disclaimers:** Prominent messaging reminding users not to argue over seats and to respect priority seating guidelines.

## 6. Target Implementation (MVP)
- **UI:** Mobile-first, single-page application feel. High contrast, large buttons for one-handed use.
- **Demo Mode:** Since live testing on a train may be difficult during development, a "Demo/Simulation Mode" is required to simulate train movement through stations and test the matching logic.
