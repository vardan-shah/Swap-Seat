# Feasibility Research: Ahmedabad-Gandhinagar Metro Seat Handoff

## 1. Verified Facts
- **Network Status:** The Ahmedabad-Gandhinagar Metro Phase 2 is fully commissioned and operational (as of early 2026).
- **Corridors:**
  - **Main Corridor (North-South):** Connects Motera Stadium to Mahatma Mandir (20+ stations including Koba Circle, GNLU, Infocity, Sachivalaya).
  - **Eastern Spur:** Connects GNLU to GIFT City.
- **Seating:** The metro uses longitudinal seating. There are designated priority seats for elderly, pregnant, and differently-abled passengers.
- **Ticketing & Access:** Passengers must have a valid ticket (QR, Mobile QR, Smart Card, NCMC) for the paid area. Ticketless travel attracts penalties.

## 2. Relevant Rules and Policies
- **Governing Law:** GMRC operations are governed by the Metro Railways (Operation and Maintenance) Act, 2002.
- **Unauthorized Commercial Activity:** It is strictly prohibited to conduct business, sell articles, or engage in unauthorized commercial activities on metro trains or premises. Violations attract fines (up to ₹500) and/or imprisonment.
- **Ticket Resale:** The unauthorized sale or resale of metro tickets is illegal.
- **Passenger Conduct:** Passengers are expected to maintain courteous conduct, allow deboarding passengers to exit first, and avoid obstructing doors.

## 3. Open Legal / Operational Questions
- Is a mobile application that merely facilitates communication between commuters without monetary exchange considered "unauthorized commercial activity"? (Likely no, but unconfirmed officially).
- How will the GMRC view a non-monetary seat handoff? It could be seen as a courtesy, but if it leads to crowding or disputes, it might violate general passenger conduct rules.

## 4. Product Implications & Feasibility Conclusion
Based on the research, the feasibility of the proposed product models is as follows:

- **Model A (Paid seat-handoff marketplace): NOT FEASIBLE / HIGHLY RISKY.** Charging money for a seat handoff inside the metro directly conflicts with the strict rules against unauthorized commercial activity and solicitation on metro premises.
- **Model B/C (Free/Courtesy coordination service): FEASIBLE.** A free service that helps commuters coordinate handoffs as a courtesy does not violate commercial activity rules, provided it does not lead to physical obstruction or disputes.

## 5. MVP Implementation Plan
- **What is safe to implement:** The core matching engine, real-time coordination, station-based availability tracking, and user messaging/handoff flows without any monetary transactions.
- **What must remain disabled:** All features related to proposing, negotiating, or facilitating monetary payments for seat handoffs must be completely hidden behind a feature flag and disabled in the default MVP build.
- **Safety Measures:** The app must explicitly state that it does not guarantee seats, does not sell tickets, and that users must not physically block or fight over seats. Priority seats must be excluded from the handoff system or clearly marked.
