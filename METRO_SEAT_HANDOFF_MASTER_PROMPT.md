# MASTER PROMPT — AHMEDABAD–GANDHINAGAR METRO SEAT-HANDOFF APP

## 0. Mission

You are the lead product strategist, UX designer, software architect, full-stack/mobile engineer, QA engineer, and technical project manager for this project.

I want you to turn the product idea below into a serious, working mobile-app MVP rather than merely describing it.

Do not blindly code from assumptions. First inspect the workspace, research the current Ahmedabad–Gandhinagar Metro / Gujarat Metro Rail Corporation (GMRC) network, passenger rules, station information, and any constraints relevant to this concept. Use official sources wherever possible. Clearly distinguish verified facts from assumptions.

The objective is to validate and prototype the core marketplace interaction: a passenger who is about to leave a train can signal that the seat they are occupying will become available at a particular station, allowing another passenger to coordinate taking that seat for the remainder of the journey.

The central product hypothesis is:

> In a crowded metro, passengers who are already seated and passengers who want a seat have a temporary coordination problem. The app matches those two people at the moment a seat is about to be vacated.

This is a **seat-opportunity handoff**, not ownership of a public seat and not a transfer or resale of a metro ticket.

---

# 1. Problem Context

I live in Ahmedabad and frequently commute to Gandhinagar for college using the Gujarat Metro service.

During rush/office hours, trains are often crowded and finding a seat is difficult. Many passengers have to stand for a substantial part of the journey even though seats continuously become available when other passengers deboard.

The problem is not necessarily the absence of seats. It is the lack of real-time coordination between:

1. A passenger who is currently occupying a seat and knows when they will leave it.
2. A passenger who is currently standing and wants to sit after that seat becomes available.

### Example

Imagine five stations:

A → B → C → D → E

Passenger S boards at A and gets a seat. S plans to deboard at C.

Passenger B is standing and wants to travel from C to E.

The app could allow S to publish:

> "My seat will become available at C."

Passenger B could discover that opportunity and request the handoff.

If the concept is legally and operationally permissible, the parties may agree on an amount for the convenience/seat-opportunity coordination. However, **do not implement or facilitate any real-money transaction until the relevant GMRC rules and applicable law have been researched and the product design has been adjusted accordingly.**

---

# 2. Product Principle

The app must never imply:

- that a passenger owns a particular metro seat;
- that a passenger can reserve a seat officially through GMRC;
- that a metro ticket can be transferred to another person;
- that paying guarantees a seat;
- that the app is officially affiliated with, endorsed by, or operated by GMRC unless such authorization actually exists.

Use language such as:

- "seat opportunity"
- "seat handoff"
- "seat becoming available"
- "request a handoff"
- "expected availability"

Avoid language such as:

- "seat ownership"
- "reserved metro seat"
- "official booking"
- "guaranteed seat"
- "transfer my ticket"

Every user must remain independently responsible for having a valid metro ticket/fare entitlement for their own journey.

---

# 3. Research / Validation Phase — REQUIRED BEFORE CODING

Before implementing the core marketplace, research and document:

### GMRC / Metro facts

- Current Ahmedabad–Gandhinagar metro network and operational stations.
- Current Phase 2 / relevant corridor station sequence.
- Current operating/timetable information where relevant.
- Publicly available passenger rules.
- Rules relating to seating, passenger conduct, solicitation, commercial activity, resale, ticket transfer, payment between passengers, and use of mobile applications in stations/trains.
- Any official contact or grievance channel that could be used to seek clarification.

### Product/legal feasibility

Determine whether this concept can plausibly operate as:

A. a paid seat-handoff marketplace,
B. a free coordination service,
C. a non-monetary courtesy/priority coordination service,
D. or some other safer/legal formulation.

Do not provide a legal conclusion unless supported by an authoritative source. Where the answer is unclear, explicitly mark the issue as unresolved.

### Research output

Create a concise `docs/FEASIBILITY.md` containing:

- Verified facts.
- Relevant rules/policies.
- Open legal/operational questions.
- Product implications.
- What is safe to implement in an MVP.
- What must remain disabled pending clarification.

Do not stop the project merely because one question is unresolved. Build the product architecture so the disputed component can be enabled/disabled without rewriting the application.

---

# 4. Target Users

### User Type A — Seat Holder / Handoff Seller

A passenger who is currently seated and expects to deboard soon.

They want to:

- announce the station where their seat is expected to become available;
- optionally specify the direction/line and relevant train context;
- receive a request from a nearby passenger;
- coordinate the handoff with minimal friction.

### User Type B — Seat Seeker / Buyer

A passenger who is standing and wants to sit for part of the journey.

They want to:

- specify their current station and destination;
- see available seat opportunities;
- request one;
- receive clear station-by-station instructions;
- know that the seat is only an expected opportunity, not a guaranteed reservation.

Both roles can be used by the same account.

---

# 5. Core MVP User Journey

## Flow A — Passenger offers a seat opportunity

1. User opens the app.
2. App identifies/selects the current metro corridor and direction.
3. User taps `Offer Seat Handoff`.
4. User selects:
   - current station / boarding context;
   - expected handoff station;
   - destination or direction;
   - optional coach/car identifier if operationally useful and legally/safely appropriate;
   - optional approximate seat location such as left/right/window/aisle only if such information is meaningful on this metro system.
5. User sets a proposed amount only if the feasibility review permits monetary offers. Otherwise the amount field is hidden/disabled.
6. The listing becomes active for a short time window.
7. The app surfaces it to compatible seat seekers.
8. As the handoff station approaches, the listing transitions from `Upcoming` → `Arriving` → `Ready for Handoff`.
9. After the stated station, the listing automatically expires.

## Flow B — Passenger requests a seat opportunity

1. User opens the app.
2. User enters/selects:
   - where they are now;
   - where they want to travel to;
   - optional desired handoff station.
3. App shows compatible opportunities.
4. User views:
   - handoff station;
   - expected availability time;
   - route/direction;
   - any available coach information;
   - proposed amount, only where permitted;
   - trust/reputation indicators.
5. User requests a handoff.
6. Seat holder accepts/rejects.
7. The app establishes an ephemeral match.
8. Both parties receive simple instructions for meeting at the correct coach/door/station area without requiring them to reveal personal phone numbers.
9. At the handoff station, both users confirm the handoff.
10. The opportunity closes automatically.

---

# 6. Critical Product Constraint: Real-Time Reliability

This product only works if the app handles the fact that:

- trains may be late;
- passengers may leave earlier/later than expected;
- a passenger may lose the seat before the intended station;
- another passenger may take the seat;
- the train may be too crowded for a practical handoff;
- mobile internet may be unreliable;
- GPS may be inaccurate inside a metro/train;
- users may simply fail to cooperate.

Therefore, the system must support:

- short-lived listings;
- automatic expiration;
- explicit status states;
- quick cancellation;
- "seat no longer available" reporting;
- abuse/dispute reporting;
- no guarantee language;
- matching that tolerates small timing discrepancies.

Do not design this as a conventional long-lived marketplace listing.

---

# 7. Marketplace / Matching Logic

Create a matching engine based on:

- route/corridor;
- travel direction;
- current station;
- handoff station;
- destination compatibility;
- expected timing;
- listing freshness;
- user reliability/reputation;
- optional price, where legally permitted.

Example:

Seller journey: A → C → E
Seat available at: C
Buyer journey: C → E

This is a strong compatibility match.

Buyer travelling C → D should also be compatible.

Buyer travelling B → E should not be treated as a direct match for a C handoff unless the user experience explicitly supports meeting at C.

Seller journey A → C
Buyer journey D → E is incompatible.

Build matching logic as a standalone service/module so it can evolve independently of the UI.

---

# 8. Trust, Safety and Anti-Abuse

Assume that once money or scarce seats are involved, abuse will occur.

Design for:

- fake listings;
- users claiming seats they do not have;
- premature cancellation;
- no-shows;
- harassment;
- repeated spam;
- fraudulent payment claims;
- attempts to pressure or intimidate passengers;
- impersonation;
- inappropriate messages;
- exploiting children, elderly passengers, disabled passengers, or other protected/vulnerable users;
- users trying to block multiple seats.

The product must include:

- reporting;
- block/mute functionality;
- rate limits;
- listing TTL;
- one active handoff per seat-holder at a time;
- confirmation states;
- basic reputation signals;
- audit/event logging;
- clear safety copy;
- emergency guidance that directs users to official authorities rather than making the app an emergency service.

Never design features that encourage passengers to physically fight, reserve seats with belongings, obstruct boarding, or deceive metro staff.

---

# 9. Accessibility and Public-Transit Ethics

The UI must explicitly avoid competing with accessibility priorities.

Do not position the marketplace as a way to monetize seats that are designated or functionally needed for:

- persons with disabilities;
- elderly passengers;
- pregnant passengers;
- other priority/passenger assistance categories defined by official rules.

Where official reserved seating or priority rules apply, the app should exclude those seats/opportunities from monetization and clearly communicate the policy.

Prioritize simple, high-contrast, one-handed interactions because users may be standing in crowded trains.

---

# 10. UX Direction

The UI should feel like a modern Indian consumer mobility app, not a generic dashboard.

Design goals:

- extremely fast to understand;
- usable with one hand;
- large primary actions;
- minimal text during active journeys;
- strong station/direction hierarchy;
- clear countdowns;
- obvious active/inactive states;
- excellent dark/light mode support;
- accessible typography;
- lightweight animations only where useful.

Core screens:

1. Onboarding
2. Home / Live Journey
3. Find a Seat
4. Offer a Seat Handoff
5. Opportunity Detail
6. Active Match
7. Handoff Confirmation
8. Match History
9. Reputation / Profile
10. Reports & Safety
11. Settings
12. Feasibility / informational disclaimer page where appropriate

The home screen should answer within seconds:

> "What can I do right now?"

Potential primary actions:

- `Find a Seat`
- `Offer My Seat`

---

# 11. Suggested UX for the Home Screen

The home screen should be contextual rather than overloaded.

Example states:

### Not travelling
"Where are you going?"

### Travelling and standing
"Looking for a seat?"

### Travelling and seated
"Getting off soon? Offer your seat opportunity."

### Active handoff
"Your handoff is approaching — C Station in ~3 min."

Use realistic timing where data permits. Otherwise clearly label estimates as estimates.

---

# 12. Data Model

Design a relational data model suitable for a production MVP.

At minimum consider:

### User
- id
- display_name
- avatar
- verified status
- reputation score/signals
- created_at
- safety status

### Journey
- id
- user_id
- route_id
- direction
- origin_station
- destination_station
- train context if available
- created_at
- status

### SeatOpportunity
- id
- seller_user_id
- route_id
- direction
- current_context
- handoff_station
- destination_station
- expected_handoff_time
- optional coach/car context
- optional seat-description field
- price/offer field, gated by feasibility flag
- status
- expires_at
- created_at

### Match
- id
- opportunity_id
- seeker_user_id
- seller_user_id
- status
- requested_at
- accepted_at
- handoff_station
- completed_at
- cancelled_at

### Report
- id
- reporter_user_id
- reported_user_id
- match_id/opportunity_id
- reason
- notes
- status
- created_at

### EventLog
Capture important state transitions for debugging and abuse investigations.

Use proper indexes for route + direction + station + active status + expected time queries.

---

# 13. Payments Architecture

Treat payments as a feature flag / replaceable module.

Do NOT activate live monetary transactions before the feasibility review supports them.

Architect the application so the payment layer can later support:

- amount calculation;
- payment intent creation;
- escrow/hold if appropriate;
- successful handoff confirmation;
- cancellation/refund rules;
- transaction ledger;
- fraud controls;
- fees/taxes if applicable.

For the initial development environment, use a safe mock/test payment flow if needed.

Never store raw card details.

Do not create a fake sense that money was actually transferred in production.

---

# 14. Technical Direction

Unless the existing workspace dictates otherwise, prefer a practical cross-platform mobile stack such as:

- React Native + Expo + TypeScript
- modern component-based architecture
- a managed backend such as Supabase/Postgres or another production-suitable relational backend
- server-side validation
- secure authentication
- push notifications
- real-time subscriptions where useful

However, do not force this stack if the existing workspace already has a better-established architecture. Inspect the repository first.

Technical requirements:

- TypeScript with strict typing.
- Environment variables for secrets.
- No secrets committed to git.
- Form and schema validation.
- Clean separation of UI, domain logic, data access, and integrations.
- Reusable components.
- Automated tests for matching/state-transition logic.
- Robust error/loading/empty states.
- Offline-tolerant UX for critical active-journey information where feasible.
- Analytics/event instrumentation designed with privacy minimization.

---

# 15. Location and Transit Data

Do not assume GPS is sufficient for determining a user's station.

Use station-based state whenever possible.

The station list, route order, and other transit metadata should be maintained in a structured data source rather than scattered through the UI code.

Use official GMRC information as the authoritative starting point for current station/network information. If official real-time train data is unavailable, create a clearly separated mock/simulation layer rather than pretending live data exists.

---

# 16. Privacy

Collect the minimum information required.

Do not expose:

- phone number by default;
- exact home location;
- personal email to other users;
- continuous precise location history;
- unnecessary identity information.

Use ephemeral proximity/match information where possible.

Explain clearly what location data is used for and when it is used.

The app should not become a surveillance product for commuters.

---

# 17. Business Model — Keep Separate From Core Validation

The initial product question is whether users will coordinate seat handoffs successfully.

Do not overbuild monetization before validating that loop.

Potential future models may include:

- transaction fee if lawful;
- subscription for frequent commuters;
- convenience credits;
- B2B / campus commuter programs;
- partnerships.

Treat these as future hypotheses, not requirements for the MVP.

---

# 18. MVP Definition

The first functioning version should prove this loop:

> seated passenger announces upcoming seat availability → standing passenger discovers it → parties match → handoff is coordinated at a station → listing expires.

The MVP does NOT need:

- a large social network;
- complex gamification;
- advanced AI;
- nationwide metro support;
- elaborate loyalty programs;
- complex payment infrastructure;
- perfect live train telemetry.

The MVP DOES need:

- real station-based matching;
- reliable state transitions;
- polished mobile UI;
- authentication;
- safe ephemeral communication/match state;
- realistic seeded/demo data;
- tests;
- clear disclaimers;
- the ability to disable any legally uncertain feature.

---

# 19. Demo / Simulation Mode

Because a real metro environment may not be available during development, create a developer/demo mode that can simulate:

- station movement;
- time passing;
- seat opportunity creation;
- matching;
- acceptance/rejection;
- handoff completion;
- cancellation;
- train delay;
- missed handoff.

The demo should make the core concept easy to demonstrate to a friend, potential cofounder, college evaluator, or investor.

Do not mix demo data with production data.

---

# 20. Build Workflow

Work in this order:

### Phase 1 — Discovery
- Inspect current workspace/repository.
- Identify existing stack and reusable code.
- Research GMRC information and feasibility.
- Produce `docs/FEASIBILITY.md`.
- Produce `docs/PRODUCT_SPEC.md`.
- Produce `docs/ARCHITECTURE.md`.

### Phase 2 — UX
- Create screen map and user flows.
- Establish visual system.
- Implement responsive mobile UI.

### Phase 3 — Core data layer
- Schema/migrations.
- Auth.
- Seed data.
- Station/route data.

### Phase 4 — Core product loop
- Offer seat opportunity.
- Discover opportunities.
- Match.
- Accept/reject.
- Handoff states.
- Expiry.
- Cancellation.

### Phase 5 — Safety
- Reports.
- Blocking.
- Rate limits.
- Audit events.
- Abuse protections.

### Phase 6 — Payments abstraction
- Build interface and mock/test implementation only unless feasibility permits live payments.

### Phase 7 — QA
- Unit tests.
- Integration tests.
- End-to-end test of core flows.
- Edge cases.
- Accessibility pass.
- Mobile UI review.

### Phase 8 — Demo and documentation
- Seed realistic Ahmedabad/Gandhinagar examples.
- Add a demo mode.
- Document local setup.
- Document known limitations.
- Produce final build/run instructions.

---

# 21. Acceptance Criteria

The project is not complete merely because the app compiles.

A successful MVP must demonstrate all of the following:

1. A user can create a seat-opportunity handoff tied to a station and direction.
2. Another user can discover compatible opportunities.
3. Matching logic correctly filters incompatible journeys.
4. A user can request an opportunity.
5. The seat holder can accept or reject.
6. Both parties can see the current handoff state.
7. The opportunity expires automatically.
8. Cancellation works correctly.
9. The app handles missed handoffs.
10. Users can report/block abusive behavior.
11. No feature falsely represents a seat as officially reserved by the metro operator.
12. Metro ticketing remains separate from seat matching.
13. Any legally uncertain paid feature can be disabled without breaking the core app.
14. Tests cover the matching algorithm and major state transitions.
15. The core flow can be demonstrated end-to-end using seeded data.

---

# 22. Quality Bar

Act like a senior product and engineering team, not a code generator.

Before declaring completion:

- inspect your own implementation;
- find edge cases;
- run tests;
- fix obvious UX defects;
- remove dead code;
- verify error states;
- check loading/empty states;
- check accessibility basics;
- check mobile responsiveness;
- check security-sensitive code;
- check that secrets are not exposed;
- ensure the README is accurate;
- ensure the app can be set up by another developer.

Do not stop at the first working implementation. Iterate after testing.

---

# 23. Important Product Questions To Investigate

Before finalizing the design, explicitly evaluate:

1. Will people actually wait for a specific stranger's seat to become available?
2. How do we prevent two seekers from approaching the same seat?
3. How do we establish that the correct seller and seeker found each other without requiring phone-number disclosure?
4. How much price friction is acceptable?
5. Does monetization fundamentally conflict with metro rules or social expectations?
6. Would a free coordination model create enough value to validate demand first?
7. Is coach-level information useful or too difficult/unreliable?
8. How much location precision is actually needed?
9. What happens when the seller leaves earlier than expected?
10. What happens when someone else takes the seat?
11. Could the app create unsafe crowding around a person who is deboarding?
12. How should the product behave around priority/reserved seats?
13. Could this be better positioned as a commuter coordination network instead of a seat marketplace?

Do not hide weaknesses. Record them in the product documentation.

---

# 24. Non-Negotiable Product Philosophy

Build the smallest product that can prove or disprove the core hypothesis.

Do not add features simply because they are technically interesting.

Prefer deterministic, explainable matching over unnecessary AI.

Prefer station-based coordination over intrusive continuous tracking.

Prefer reversible architecture over premature commitment.

Prefer a legally conservative MVP over a flashy but questionable implementation.

Most importantly:

> The app should solve a real commuter coordination problem without pretending that users own public infrastructure or that the app has authority over metro seating.

---

# 25. Your First Response / First Execution

When you receive this master prompt, do NOT immediately start coding.

First:

1. Inspect the current workspace.
2. Summarize what already exists.
3. Research and verify the relevant GMRC/metro information.
4. Identify legal/operational constraints.
5. Produce a concrete implementation plan.
6. Flag any assumptions that must remain configurable.
7. Then begin implementation in logical phases without waiting for unnecessary confirmation.

When implementation is underway, report meaningful progress through artifacts, documentation, and working code—not vague promises.

The final result should be a runnable, polished MVP that makes the seat-handoff concept tangible and testable.
