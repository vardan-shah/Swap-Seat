# GMRC Network Data — Ahmedabad–Gandhinagar Metro
*Companion data file for the Metro Seat-Handoff MVP · prepared 29 Sep 2026*

**How to use this file (Antigravity):** save it as `docs/GMRC_NETWORK_DATA.md`. Section 14 is a machine-readable JSON block: extract it to `src/data/gmrc-network.json` and use it as the single source for stations, lines, interchanges and service patterns, replacing any older Phase-2-only station data. Facts were checked against GMRC web pages dated 22–28 Sep 2026 unless tagged otherwise. GMRC updates its route-planner list whenever a station opens, so re-verify before any public release.

**Confidence tags used below**

| Tag | Meaning |
|---|---|
| `[GMRC]` | Text published on gujaratmetrorail.com |
| `[GMRC-PDF]` | GMRC timetable PDF (file name says "Tentative"; the site banner says "Testing") |
| `[DERIVED]` | Worked out from GMRC data (counts, sequences, timing gaps) |
| `[NEWS]` | News reporting (mainly DeshGujarat; one india.com item) |
| `[WIKI]` | Wikipedia (secondary, useful but not authoritative) |
| `[UNVERIFIED]` | Could not be confirmed from a readable source |

---

## 1. Ten things that change the design

1. **Four lines, not three.** Blue (East–West), Red (North–South), Yellow (Motera Stadium → Mahatma Mandir, the northward extension of the North–South corridor) and Violet (GNLU → PDEU → GIFT City spur). Colour names come from GMRC's timetable colour coding as reported by DeshGujarat (13 Jan 2026) [NEWS] and Wikipedia [WIKI]. GMRC's own text pages never state colours; its map legend is an image.
2. **54 stations, 53 operational.** GMRC counts 32 in Phase 1 (31 operational) and 22 in Phase 2 (all operational) [GMRC]. Only Sabarmati Railway Station (Red) is still "work in progress".
3. **Three interchanges:** Old High Court (Red ⇄ Blue), Motera Stadium (Red ⇄ Yellow) and GNLU (Yellow ⇄ Violet) [WIKI]. GMRC's own entry-exit page labels only Old High Court as an "Interchange Station" [GMRC]. A fourth is planned at Koteshwar Road for the Airport Line.
4. **Red and Yellow run as one through service.** Trains start at APMC and run to Mahatma Mandir or GIFT City with no change at Motera Stadium [GMRC-PDF, NEWS]. Model *service patterns*, not just lines (section 5).
5. **Blue Line riders heading to Gandhinagar must change at Old High Court** onto a Red/Yellow through train [DERIVED].
6. **Trains are 3-coach sets** (Hyundai Rotem) [WIKI]. Small enough for simple "Coach 1/2/3" hints if coach-level info is ever used. Verify with GMRC.
7. **Service hours (Red/Yellow/Violet):** first departure from APMC 06:20 and from Mahatma Mandir 06:40; last from APMC 20:45 and from Mahatma Mandir 21:00 [GMRC-PDF]. Evening gaps widen sharply after about 19:00. Blue Line last trains run at 23:00 from both ends [NEWS].
8. **Ticketing quirks:** a QR ticket only works at the fare gate of the station it was bought for; token and GMRC smart cards cannot cross the Phase 1 / Phase 2 boundary (Motera Stadium | Koteshwar Road) [GMRC].
9. **The passenger-rule pages are images.** GMRC's Do's and Don'ts, prohibited items and frequency timetable could not be read as text, and no GMRC text on seat swapping, passenger-to-passenger payments or solicitation was found [UNVERIFIED]. See sections 7 and 12.
10. **Name collisions:** two stations are called "Shahpur" (one operational in Ahmedabad, one planned near Gandhinagar). Always key on station `id`, never on display name.

---

## 2. Lines at a glance

| Line | Axis | Termini | Stations (incl. shared) | Operational | Length [GMRC] | Opened |
|---|---|---|---:|---:|---|---|
| **Blue** | East–West (Phase 1) | Thaltej Gam ⇄ Vastral Gam | 18 | 18 | 21.16 km | Mar 2019 → Dec 2024 |
| **Red** | North–South (Phase 1) | APMC ⇄ Motera Stadium | 15 | 14 | 18.87 km | Oct 2022 |
| **Yellow** | North–South extension (Phase 2, Corridor 1) | Motera Stadium ⇄ Mahatma Mandir | 21 | 21 | 22.8 km | Sep 2024 → Jan 2026 |
| **Violet** | Spur off Yellow at GNLU (Phase 2, Corridor 2) | GNLU ⇄ GIFT City | 3 | 3 | 5.4 km | Sep 2024 |

GMRC counts each interchange once: East–West 17 + North–South 15 = 32 (Phase 1, of which 31 operational); Motera → Mahatma Mandir 20 + GNLU → GIFT City 2 = 22 (Phase 2) [GMRC]. The table above counts shared stations on every line they serve, so Blue shows 18 (including Old High Court) and the four lines add up to more than 54.

Phase 2 milestones [GMRC]: Motera–Sector-1 and GNLU–GIFT City sections inaugurated 16 Sep 2024 (public from 17 Sep 2024); final section to Mahatma Mandir inaugurated 11 Jan 2026 (commercial service reported from 16 Jan 2026 [NEWS]).

**Schematic**

```
BLUE (east–west)
Thaltej Gam ─ … ─ SP Stadium ─ [OLD HIGH COURT] ─ Shahpur ─ Gheekanta ─ Kalupur ─ Kankaria East ─ … ─ Vastral Gam
                                      │
RED (north–south)                     │ interchange
APMC ─ … ─ Paldi ─ Gandhigram ─ [OLD HIGH COURT] ─ Usmanpura ─ … ─ AEC ─ Sabarmati ─ [MOTERA STADIUM]
                                                                                       │ Phase 1 | Phase 2 boundary
YELLOW (extension, through-running with Red)                                          │
[MOTERA STADIUM] ─ Koteshwar Road ─ … ─ Koba Gam ─ [GNLU] ─ Raysan ─ … ─ Sector-1 ─ Sachivalaya ─ … ─ Mahatma Mandir
                                                     │
VIOLET (spur)                                        └─ PDEU ─ GIFT City
```

**Route order (for adjacency and direction logic)**

- **Blue, west → east (18):** Thaltej Gam → Thaltej → Doordarshan Kendra → Gurukul Road → Gujarat University → Commerce Six Road → SP Stadium → Old High Court → Shahpur → Gheekanta → Kalupur Metro Station → Kankaria East → Apparel Park → Amraivadi → Rabari Colony → Vastral → Nirant Cross Road → Vastral Gam
- **Red + Yellow trunk, south → north (35, with Sabarmati Railway Station not yet open):** APMC → Jivraj Park → Rajivnagar → Shreyas → Paldi → Gandhigram → Old High Court → Usmanpura → Vijaynagar → Vadaj → Ranip → Sabarmati Railway Station → AEC → Sabarmati → Motera Stadium → Koteshwar Road → Vishwakarma College → Tapovan Circle → Narmada Canal → Koba Circle → Juna Koba → Koba Gam → GNLU → Raysan → Randesan → Dholakuva Circle → Infocity → Sector-1 → Sector 10A → Sachivalaya → Akshardham → Juna Sachivalaya → Sector-16 → Sector-24 → Mahatma Mandir
- **Violet spur:** GNLU → PDEU → GIFT City

Direction labels: name directions by terminus, for example "towards Mahatma Mandir / GIFT City" versus "towards APMC", and "towards Vastral Gam" versus "towards Thaltej Gam" [WIKI]. GMRC's route-planner dropdown lists Blue from Vastral Gam to Thaltej Gam and Red from APMC to Motera; its Phase 2 order follows opening dates, not route order, so do not use dropdown order as sequence.

---

## 3. Interchanges

| Station | Lines | What it means for a rider |
|---|---|---|
| **Old High Court** | Red ⇄ Blue | Passengers change trains between Red and Blue. GMRC's entry-exit page labels it an interchange station. |
| **Motera Stadium** | Red ⇄ Yellow | Phase 1 / Phase 2 boundary. Red and Yellow trains run through, so no change is needed on the main service pattern. Token and smart-card fares cannot cross this boundary. |
| **GNLU** | Yellow ⇄ Violet | Branch junction for PDEU and GIFT City. Whether a passenger from north of GNLU (Raysan to Mahatma Mandir) has a direct train to GIFT City is not shown in the extracted timetable; assume a change at GNLU until verified. |
| Koteshwar Road (planned) | Yellow ⇄ Airport Line | Phase 2A is approved but not built; the Airport Line will branch here [WIKI]. |

Terminal stations: Thaltej Gam, Vastral Gam, APMC, Mahatma Mandir, GIFT City. Motera Stadium is the Phase 1 terminus of Red as infrastructure but not an operating terminus.

---

## 4. Every station, line by line

Route-planner spelling is used as the display name. Alternative spellings are in section 11. Layout: GMRC states Phase 1 has 28 elevated and 4 underground stations and all 22 Phase 2 stations are elevated [GMRC]; the four underground stations are Kankaria East, Kalupur, Gheekanta and Shahpur (Ahmedabad) [GMRC gate page]. "Opened" uses GMRC's month/year granularity where GMRC gives it and Wikipedia's dates otherwise.

### 4.1 Blue Line (East–West), Thaltej Gam → Vastral Gam

| # | Station (GMRC route-planner spelling) | Layout | Status | Opened | Notes |
|---:|---|---|---|---|---|
| 1 | Thaltej Gam | Elevated | Operational | Dec 2024 | Terminus |
| 2 | Thaltej | Elevated | Operational | Oct 2022 |  |
| 3 | Doordarshan Kendra | Elevated | Operational | Oct 2022 |  |
| 4 | Gurukul Road | Elevated | Operational | Oct 2022 |  |
| 5 | Gujarat University | Elevated | Operational | Oct 2022 | MMI: BRTS: Entry/Exit 1, footpath to the BRTS station |
| 6 | Commerce Six Road | Elevated | Operational | Oct 2022 |  |
| 7 | SP Stadium | Elevated | Operational | Oct 2022 |  |
| 8 | Old High Court | Elevated | Operational | Oct 2022 | **Interchange: Red ⇄ Blue** · GMRC's entry-exit page labels it 'Interchange Station'. Red platform is an island platform, Blue platforms are side platforms [WIKI]. |
| 9 | Shahpur | Underground | Operational | Oct 2022 | Not the planned Phase 2B 'Shahpur' near Gandhinagar (id shahpur-gandhinagar). Same display name, different station. |
| 10 | Gheekanta | Underground | Operational | Oct 2022 |  |
| 11 | Kalupur Metro Station | Underground | Operational | Oct 2022 | MMI: Indian Railways and NHSRCL: subway to Kalupur High Speed Railway Station |
| 12 | Kankaria East | Underground | Operational | Mar 2024 | Opening date conflict: Wikipedia's main article says 5 Mar 2024, its station list says 30 Sep 2022. GMRC gives no station-level date. Verify. |
| 13 | Apparel Park | Elevated | Operational | Mar 2019 |  |
| 14 | Amraivadi | Elevated | Operational | May 2019 |  |
| 15 | Rabari Colony | Elevated | Operational | Mar 2021 |  |
| 16 | Vastral | Elevated | Operational | Mar 2021 |  |
| 17 | Nirant Cross Road | Elevated | Operational | Apr 2019 |  |
| 18 | Vastral Gam | Elevated | Operational | Mar 2019 | Terminus |

### 4.2 Red Line (North–South), APMC → Motera Stadium

| # | Station (GMRC route-planner spelling) | Layout | Status | Opened | Notes |
|---:|---|---|---|---|---|
| 1 | APMC | Elevated | Operational | Oct 2022 | Terminus · MMI: GSRTC: Entry/Exit 1, footpath to the GSRTC bus terminal |
| 2 | Jivraj Park | Elevated | Operational | Oct 2022 |  |
| 3 | Rajivnagar | Elevated | Operational | Oct 2022 |  |
| 4 | Shreyas | Elevated | Operational | Oct 2022 |  |
| 5 | Paldi | Elevated | Operational | Oct 2022 |  |
| 6 | Gandhigram | Elevated | Operational | Oct 2022 | MMI: Indian Railways: Entry/Exit 3, stairs and lift to the railway station |
| 7 | Old High Court | Elevated | Operational | Oct 2022 | **Interchange: Red ⇄ Blue** · GMRC's entry-exit page labels it 'Interchange Station'. Red platform is an island platform, Blue platforms are side platforms [WIKI]. |
| 8 | Usmanpura | Elevated | Operational | Oct 2022 |  |
| 9 | Vijaynagar | Elevated | Operational | Oct 2022 |  |
| 10 | Vadaj | Elevated | Operational | Oct 2022 | MMI: BRTS: Entry/Exit 5, lift and skywalk |
| 11 | Ranip | Elevated | Operational | Oct 2022 | MMI: GSRTC (Entry/Exit 2, footpath) and BRTS (Entry/Exit 3, lift and skywalk) |
| 12 | Sabarmati Railway Station | Elevated | **Under construction** | — | Shown as WORK IN PROGRESS on GMRC's route planner (page dated 22 Sep 2026). Exclude from matching and station pickers until GMRC lists it as operational. |
| 13 | AEC | Elevated | Operational | Oct 2022 | MMI: BRTS (Entry/Exit 5, lift and skywalk), Indian Railways, NHSRCL (skywalk to Sabarmati High Speed Railway station) |
| 14 | Sabarmati | Elevated | Operational | Oct 2022 | MMI: BRTS: Entry/Exit 3, lift and skywalk · Do not confuse with 'Sabarmati Railway Station' (Red, not yet open) or the planned 'Sabarmati River' (Airport Line). |
| 15 | Motera Stadium | Elevated | Operational | Oct 2022 | **Interchange: Red ⇄ Yellow** · End of Phase 1 / start of Phase 2. Through trains continue north without a change [GMRC-PDF]. Token and GMRC smart card cannot be used across the Phase 1 / Phase 2 boundary [GMRC]. |

### 4.3 Yellow Line (Phase 2, Corridor 1), Motera Stadium → Mahatma Mandir

| # | Station (GMRC route-planner spelling) | Layout | Status | Opened | Notes |
|---:|---|---|---|---|---|
| 1 | Motera Stadium | Elevated | Operational | Oct 2022 | **Interchange: Red ⇄ Yellow** · End of Phase 1 / start of Phase 2. Through trains continue north without a change [GMRC-PDF]. Token and GMRC smart card cannot be used across the Phase 1 / Phase 2 boundary [GMRC]. |
| 2 | Koteshwar Road | Elevated | Operational | Apr 2025 | Planned interchange with the Phase 2A Airport Line (not built) [WIKI, GMRC]. |
| 3 | Vishwakarma College | Elevated | Operational | Apr 2025 |  |
| 4 | Tapovan Circle | Elevated | Operational | Apr 2025 |  |
| 5 | Narmada Canal | Elevated | Operational | Apr 2025 |  |
| 6 | Koba Circle | Elevated | Operational | Apr 2025 |  |
| 7 | Juna Koba | Elevated | Operational | Sep 2025 |  |
| 8 | Koba Gam | Elevated | Operational | Sep 2025 |  |
| 9 | GNLU | Elevated | Operational | Sep 2024 | **Interchange: Yellow ⇄ Violet** · Junction where the Violet Line branches to PDEU and GIFT City. |
| 10 | Raysan | Elevated | Operational | Sep 2024 |  |
| 11 | Randesan | Elevated | Operational | Sep 2024 |  |
| 12 | Dholakuva Circle | Elevated | Operational | Sep 2024 |  |
| 13 | Infocity | Elevated | Operational | Sep 2024 |  |
| 14 | Sector-1 | Elevated | Operational | Sep 2024 |  |
| 15 | Sector 10A | Elevated | Operational | Apr 2025 |  |
| 16 | Sachivalaya | Elevated | Operational | Apr 2025 |  |
| 17 | Akshardham | Elevated | Operational | Jan 2026 |  |
| 18 | Juna Sachivalaya | Elevated | Operational | Jan 2026 |  |
| 19 | Sector-16 | Elevated | Operational | Jan 2026 |  |
| 20 | Sector-24 | Elevated | Operational | Jan 2026 |  |
| 21 | Mahatma Mandir | Elevated | Operational | Jan 2026 | Terminus · MMI: Indian Railways: 335 m foot-over-bridge with travellators to Gandhinagar Capital Railway Station · GMRC's route planner spells it 'Mahatama Mandir' (typo). Its own project pages use 'Mahatma Mandir'. |

### 4.4 Violet Line (Phase 2, Corridor 2), GNLU → GIFT City

| # | Station (GMRC route-planner spelling) | Layout | Status | Opened | Notes |
|---:|---|---|---|---|---|
| 1 | GNLU | Elevated | Operational | Sep 2024 | **Interchange: Yellow ⇄ Violet** · Junction where the Violet Line branches to PDEU and GIFT City. |
| 2 | PDEU | Elevated | Operational | Sep 2024 |  |
| 3 | GIFT City | Elevated | Operational | Sep 2024 | Terminus |

Entry/exit gate numbers and lift positions for every station (official, updated 10 Sep 2026) are on `https://www.gujaratmetrorail.com/ahmedabad/information-of-entry-exit-gate-at-entrance/`. They are not embedded here.

---

## 5. Services and timetable

### 5.1 Service patterns [DERIVED]

| Id | Pattern | Stops modelled |
|---|---|---:|
| `RY-MM` | APMC ⇄ Mahatma Mandir (Red + Yellow through service) | 34 |
| `RYV-GIFT` | APMC ⇄ GIFT City (Red + Yellow to GNLU, then Violet) | 24 |
| `BLUE` | Thaltej Gam ⇄ Vastral Gam | 18 |

- Evidence for through-running: the GMRC timetable PDF lists single trips from APMC through Old High Court, Motera Stadium, Koteshwar Road, GNLU, Info City and Sachivalaya to Mahatma Mandir, and separate trips from GNLU to GIFT City [GMRC-PDF]. DeshGujarat (16 May 2026) reports the last Mahatma Mandir train continues to APMC via Koteshwar [NEWS]. GMRC also issued a press note in Feb 2025 about direct trains to Gandhinagar [GMRC, via giftgujarat.in].
- "All stops" is an assumption. The PDF only publishes 9 timing points.
- Which trips go to GIFT City rather than Mahatma Mandir was inferred from blank cells in the PDF text; roughly 8 of the 42 numbered APMC departures appear to run to GIFT City [DERIVED, verify against GMRC's image timetable].
- The PDF file name says "Tentative" and GMRC's banner says "Testing" for the 18 May 2026 timetable. Treat all timings as provisional.
- Blue Line timetable: not extracted (image only).

### 5.2 Typical minutes between timing points [DERIVED from GMRC-PDF]

| From ⇄ To | Minutes |
|---|---|
| APMC ⇄ Old High Court | 13–15 |
| Old High Court ⇄ Motera Stadium | 18 |
| Motera Stadium ⇄ Koteshwar Road | 3 |
| Koteshwar Road ⇄ GNLU | 14–16 |
| GNLU ⇄ Infocity | 9–12 |
| Infocity ⇄ Sachivalaya | 7–8 |
| Sachivalaya ⇄ Mahatma Mandir | 11–12 |
| GNLU ⇄ GIFT City | 6–7 |

End to end, APMC → Mahatma Mandir takes about 78–83 minutes; Motera Stadium → Mahatma Mandir about 46–51 minutes. Per-station times are not published; the app should interpolate between timing points and label every time as an estimate.

### 5.3 Hours and headways (Red / Yellow / Violet) [GMRC-PDF, DERIVED]

- First departures: APMC 06:20, Mahatma Mandir 06:40, GIFT City 08:37.
- Last departures: APMC 20:45 (arrives Mahatma Mandir 22:03), Koteshwar Road towards Mahatma Mandir 21:20, Mahatma Mandir 21:00 (arrives APMC 22:22), GIFT City 19:13.
- The timetable has 42 numbered services. From APMC, peak-period departures (about 07:00–09:20 and 15:00–18:20) come in clusters 8–16 minutes apart separated by gaps of about 25 minutes; midday gaps are a steady 23–26 minutes. After the 18:43 departure the gaps grow to 25, 34 and then 63 minutes (departures at 19:08, 19:42 and 20:45).
- Blue Line: last trains at 23:00 from both Vastral Gam and Thaltej Gam from 18 May 2026, with extra services from Vastral Gam at 22:20 and 22:40 [NEWS].
- One third-party guide says the same timetable runs every day including Sundays and holidays; GMRC's readable pages do not confirm this [UNVERIFIED].

### 5.4 Scale [WIKI, citing GMRC]

About 5.1 crore passengers in FY 2025-26 and an average of about 1,53,871 a day in Jan 2026. Rolling stock: 3-coach Hyundai Rotem trains on Phase 1 (96 coaches ordered) and Titagarh Rail Systems trains for Phase 2.

---

## 6. Ticketing and fare rules that touch the app [GMRC, Fare Rules page, 10 Sep 2026]

Paraphrased from GMRC. The point for the product: **ticketing is entirely separate from seat matching**, each rider must hold their own valid fare, and nothing in the app should touch tickets.

- **Fare media:** QR tickets (paper and in the official app), contactless smart token, GMRC smart card, NCMC, temporary paper tickets when the gates fail, and special-event paper tickets. Products: single, return, and group tickets (more than 9 people). Two children under 3 ft ride free with an adult.
- **QR validity:** paper QR is valid for 30 minutes and mobile QR for 180 minutes from issue, and only through the fare gate of the station it was issued for. A screenshot, photo or photocopy is not a valid ticket, and phone hangs, dead batteries or no network do not excuse a missing ticket.
- **Time limits in the paid area:** 20 minutes if exiting at the same station, 240 minutes if exiting elsewhere (QR).
- **Phase boundary:** token and GMRC smart card work only within Phase 1 (Thaltej Gam–Vastral Gam and APMC–Motera Stadium). They cannot be used between Phase 1 and Phase 2 (Koteshwar Road–Mahatma Mandir and GNLU–GIFT City).
- **Direction:** travelling back from the destination without exiting is not allowed; the passenger must exit and pay a fresh fare.
- **NCMC:** 10% discount on completed journeys; the exit gate will not open if the balance is short.
- **Penalties cited by GMRC:** ₹50 plus the maximum fare for having no valid ticket in the paid area (Section 69, Metro Railways (Operation and Maintenance) Act, 2002); ₹150 for a wrong entry/exit sequence on a mobile QR ticket (Section 64(1)); ₹10 an hour (maximum ₹50) for overstaying; ₹200 for taking a token out; fare difference for overstepping, plus ₹50 for tailgating or jumping the gate.
- **Luggage:** up to 25 kg and 80 × 50 × 30 cm.
- **Fares themselves:** no static fare table is published; GMRC's Route and Fares page is a JavaScript calculator. Do not hard-code fares.

---

## 7. Rules, safety and what is still unresolved (inputs for `docs/FEASIBILITY.md`)

This is not legal advice. It records what could and could not be verified.

**Established from readable sources**

- The Ahmedabad Metro operates under the Metro Railways (Operation and Maintenance) Act, 2002; GMRC's own Fare Rules cite Sections 64(1) and 69 of it [GMRC].
- Section titles in that Act that a lawyer should read for this concept: 59 (drunkenness or nuisance), 62 (prohibition of demonstrations), 68 (obstructing a metro railway official), 72 (defacing public notices), 73 ("any sale of articles on metro railway") and 75 (penalty for unauthorised sale of tickets) [statute contents list, crs.gov.in]. Whether any of them reaches a seat handoff is **unresolved**.
- Press reported in Apr 2026 that the Jan Vishwas (Amendment of Provisions) Bill, 2026 converts the Section 73 penalty into a civil penalty of up to ₹5,000, in a Delhi Metro context [NEWS, india.com]. Applicability to Ahmedabad not confirmed.
- GMRC states 24×7 CCTV at all operational stations and on trains, plus passenger emergency alarms and station helplines [GMRC]. The app must not present itself as an emergency channel.
- GMRC lists reserved space for wheelchairs in trains and seating chairs at stations [GMRC]. No text on reserved or priority seats inside trains was found; the Do's and Don'ts page is images.

**Not found [UNVERIFIED]:** any GMRC statement on seat swapping or resale, payments between passengers, soliciting other passengers, or third-party apps used inside stations and trains.

**Suggested next step:** write to GMRC's passenger care address (section 10) asking, in plain words, whether a free, non-commercial app that lets a departing passenger signal that a seat will free up is acceptable, and whether any payment element would be prohibited. An RTI request is also possible; the Public Information Officer details are on GMRC's website.

---

## 8. Multi-modal integration (official table for Phase 1, plus Mahatma Mandir) [GMRC MMI page]


| Station | Integration (official, GMRC MMI page) |
|---|---|
| Gujarat University | BRTS: Entry/Exit 1, footpath to the BRTS station |
| Kalupur Metro Station | Indian Railways and NHSRCL: subway to Kalupur High Speed Railway Station |
| APMC | GSRTC: Entry/Exit 1, footpath to the GSRTC bus terminal |
| Gandhigram | Indian Railways: Entry/Exit 3, stairs and lift to the railway station |
| Vadaj | BRTS: Entry/Exit 5, lift and skywalk |
| Ranip | GSRTC (Entry/Exit 2, footpath) and BRTS (Entry/Exit 3, lift and skywalk) |
| AEC | BRTS (Entry/Exit 5, lift and skywalk), Indian Railways, NHSRCL (skywalk to Sabarmati High Speed Railway station) |
| Sabarmati | BRTS: Entry/Exit 3, lift and skywalk |
| Mahatma Mandir | Indian Railways: 335 m foot-over-bridge with travellators to Gandhinagar Capital Railway Station |

Other Phase 2 stations are described only as universally accessible with footpaths, cycle tracks, drop-off bays, bus bays and parking; PDEU is noted for parking and future bicycle sharing [GMRC].

---

## 9. Planned and under-construction stations (do not offer in live pickers)

| Project | Stations | Status |
|---|---|---|
| Phase 1, Red Line | Sabarmati Railway Station | Work in progress [GMRC] |
| Phase 2A, Airport Line (branches off Yellow at Koteshwar Road, 6.032 km, 5 stations, 1 underground) | Ashram Road, Koteshwar Prachin Mandir, Sabarmati River, Sardarnagar, Airport | Listed as under implementation by GMRC; Union Cabinet approval reported June 2026 [WIKI]. Route order not confirmed. |
| Phase 2B, Violet Line extension (3.33 km, 3 elevated stations) | GIFT City House, Gujarat Biotechnology University, Shahpur (near Gandhinagar) | Under implementation; bids invited Apr 2026 [GMRC, WIKI] |
| Phase 3A, Blue Line extension to Godhavi (9 stations) | Not named | Planned, appears only on Wikipedia [WIKI] |

GMRC groups Phases 2A and 2B as 8 stations (7 elevated, 1 underground) and 9.36 km, sanctioned 2026 [GMRC].

---

## 10. Contacts and grievance channels [GMRC]

| Purpose | Details |
|---|---|
| Passenger correspondence (operational matters) | +91-79-22960123 · care@gujaratmetrorail.com · complaint or suggestion form handed in at any operational station |
| General correspondence | +91-79-23248572 · info@gujaratmetrorail.com |
| Feedback / grievance form | https://www.gujaratmetrorail.com/feedback/ |
| Registered office | Gujarat Metro Rail Corporation (GMRC) Limited, Block No. 1, First Floor, Karmayogi Bhavan, Sector 10/A, Gandhinagar 382010 (CIN U60200GJ2010SGC059407) |
| Ahmedabad operations and maintenance office | Apparel Park Depot, Rajpur Hirpur, Gomtipur, Ahmedabad 380021 |
| Social | X: @MetroGMRC |
| Official app | "Ahmedabad Metro (Official)": Google Play `com.gujaratmetrorail.gmrcamddigitalticketing`; App Store id6670203895 |

---

## 11. Data-quality notes and discrepancies

1. **Spelling varies even inside GMRC's site.** The route planner says Rajivnagar, Vijaynagar, Amraivadi and Koba Gam; the entry-exit page says Rajiv Nagar, Vijay Nagar, Amraiwadi and Koba Gaam. Keep a search index over all variants:


| Canonical name used here | Other spellings seen (GMRC pages, press, Wikipedia) |
|---|---|
| Commerce Six Road | Commerce Six Roads |
| SP Stadium | S P Stadium; S.P. Stadium |
| Gheekanta | Ghee Kanta |
| Kalupur Metro Station | Kalupur Railway Station; Kalupur Rly. Station |
| Amraivadi | Amraiwadi |
| Rajivnagar | Rajiv Nagar; Rajiv Nagar Metro Station |
| Vijaynagar | Vijay Nagar |
| Koba Gam | Koba Gaam |
| GNLU | Gujarat National Law University |
| Infocity | Info City |
| Sector 10A | Sector-10A; Sector-10/A |
| Mahatma Mandir | Mahatama Mandir |
| PDEU | Pandit Deendayal Energy University |

2. **Counts:** GMRC lists East–West as 17 stations, but the line physically has 18 because Old High Court is counted under North–South (which is why North–South shows 15). Wikipedia's per-line lengths and station counts do not match GMRC's; prefer GMRC (for example Blue 21.16 km, not 20.30 km).
3. **Yellow Line length:** GMRC gives 22.8 km for Motera Stadium → Mahatma Mandir; Wikipedia's line page says 23.84 km. Use GMRC.
4. **Sector names:** press in Sep 2025 called the two stations between Juna Sachivalaya and Mahatma Mandir "Sector 15" and "Sector 14" [NEWS]. GMRC's current planner and Wikipedia use **Sector-16** and **Sector-24**. The old-to-new mapping is not confirmed; use the GMRC names.
5. **Kankaria East** opening date differs inside Wikipedia (see section 4.1). GMRC gives no station-level date.
6. **"20.8 km with 8 stations"** in GMRC's Phase 2 text describes the sections opened on 16 Sep 2024, not the station total.
7. **Timetable status:** the PDF is called "Tentative", the banner says "Testing", and the Train Information page carries an image version dated the same day. Cross-check when GMRC publishes a final version.
8. **Colours:** the four colour names are consistent across DeshGujarat and Wikipedia but are not stated in GMRC's page text. The hex values in the JSON are UI suggestions, not official.
9. **Old High Court platform details** and the 3-coach train length are Wikipedia-only.
10. **Gujarati names** come from Wikipedia and should be checked by a Gujarati speaker before display.

---

## 12. What could not be extracted (and where to look)

| Item | Why | Where |
|---|---|---|
| Do's and Don'ts, prohibited items | Published as images | https://www.gujaratmetrorail.com/ahmedabad/dos-and-donts/ |
| Frequency timetable, Blue Line first and last trains | Image only | https://www.gujaratmetrorail.com/ahmedabad/train-information/ |
| Fare matrix | JavaScript calculator, no static table | https://www.gujaratmetrorail.com/ahmedabad/route-and-fares/ |
| Line colour legend, alignment maps | Images | https://www.gujaratmetrorail.com/project-overview2/ |
| Station coordinates | Only inside GMRC's Google My Map | https://www.google.com/maps/d/u/1/edit?mid=1ebnAmbRUbMyI_quB06reRZWcyfcLF8M (open it in a browser; My Maps offers a KML/KMZ export) |
| "Know Your Station" pop-ups, coach layouts, seat maps, reserved-seat counts | Not exposed as text | GMRC app or station visit |

---

## 13. Modelling recommendations for the build

1. Key everything on the station `id`; keep a name and variant index (English and Gujarati) for search.
2. Build the graph from `service_patterns` plus interchange transfer edges, not from lines alone. Trips that start on Blue and end on Yellow need a transfer at Old High Court.
3. Gate every picker and every match on `status == "operational"`. `sabarmati-railway-station` and everything in `planned_stations_not_operational` must not appear as live options.
4. Treat all times as estimates: only 9 timing points are published, the timetable is provisional, and trains run late.
5. Encode the end-of-service reality: after about 19:00 the gaps between trains grow, so a "seat becoming available" listing needs a sensible expiry when no train is due.
6. Coach-level hints are feasible with 3-coach trains, but keep them optional until GMRC's coach identification is confirmed.
7. Hypothesis to test, not a fact: stations where many people alight (interchanges, and stations with rail, BRTS or bus integration listed in section 8) are likely the best places for seat opportunities. Validate with rider observation before designing around it.
8. Keep ticketing fully outside the app (no ticket data, no QR handling), keep monetisation behind its feature flag (off), and keep the "not affiliated with GMRC" disclaimer.
9. Re-check GMRC's route-planner dropdown periodically; it is the quickest signal that a station has opened or been renamed.

---

## 14. Machine-readable data

Extract to `src/data/gmrc-network.json`. Every station appears once; `lines` maps a line id to the station's position on that line (1 = first station in the order in section 2); `phase` supports the token/smart-card boundary rule; `opened` is year-month.

```json

{
"meta": {"generated": "2026-09-29", "network_status_as_of": "2026-09-28", "total_stations": 54, "operational_stations": 53, "note": "Station names follow GMRC's route planner; line colours per GMRC timetable as reported by DeshGujarat and Wikipedia; hex codes are suggestions only."},
"lines": [
  {"id": "blue", "name": "Blue Line", "axis": "East–West", "corridor": "East–West corridor (Phase 1)", "termini": ["thaltej-gam", "vastral-gam"], "length_km_gmrc": 21.16, "phase": 1, "station_ids_in_order": ["thaltej-gam", "thaltej", "doordarshan-kendra", "gurukul-road", "gujarat-university", "commerce-six-road", "sp-stadium", "old-high-court", "shahpur-ahmedabad", "gheekanta", "kalupur", "kankaria-east", "apparel-park", "amraivadi", "rabari-colony", "vastral", "nirant-cross-road", "vastral-gam"], "suggested_ui_hex_not_official": "#1976D2"},
  {"id": "red", "name": "Red Line", "axis": "North–South", "corridor": "North–South corridor (Phase 1)", "termini": ["apmc", "motera-stadium"], "length_km_gmrc": 18.87, "phase": 1, "station_ids_in_order": ["apmc", "jivraj-park", "rajivnagar", "shreyas", "paldi", "gandhigram", "old-high-court", "usmanpura", "vijaynagar", "vadaj", "ranip", "sabarmati-railway-station", "aec", "sabarmati", "motera-stadium"], "suggested_ui_hex_not_official": "#D32F2F"},
  {"id": "yellow", "name": "Yellow Line", "axis": "North–South (extension)", "corridor": "Phase 2, Corridor 1: northward extension of the North–South corridor", "termini": ["motera-stadium", "mahatma-mandir"], "length_km_gmrc": 22.8, "phase": 2, "station_ids_in_order": ["motera-stadium", "koteshwar-road", "vishwakarma-college", "tapovan-circle", "narmada-canal", "koba-circle", "juna-koba", "koba-gam", "gnlu", "raysan", "randesan", "dholakuva-circle", "infocity", "sector-1", "sector-10a", "sachivalaya", "akshardham", "juna-sachivalaya", "sector-16", "sector-24", "mahatma-mandir"], "suggested_ui_hex_not_official": "#F9A825"},
  {"id": "violet", "name": "Violet Line", "axis": "Branch (spur)", "corridor": "Phase 2, Corridor 2: branch off the extension at GNLU", "termini": ["gnlu", "gift-city"], "length_km_gmrc": 5.4, "phase": 2, "station_ids_in_order": ["gnlu", "pdeu", "gift-city"], "suggested_ui_hex_not_official": "#7B1FA2"}
 ],
"stations": [
  {"id": "thaltej-gam", "name": "Thaltej Gam", "gu": "થલતેજ ગામ", "lines": {"blue": 1}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2024-12", "flags": ["terminus"]},
  {"id": "thaltej", "name": "Thaltej", "gu": "થલતેજ", "lines": {"blue": 2}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10"},
  {"id": "doordarshan-kendra", "name": "Doordarshan Kendra", "gu": "દૂરદર્શન કેન્દ્ર", "lines": {"blue": 3}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10"},
  {"id": "gurukul-road", "name": "Gurukul Road", "gu": "ગુરુકુળ રોડ", "lines": {"blue": 4}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10"},
  {"id": "gujarat-university", "name": "Gujarat University", "gu": "ગુજરાત યુનિવર્સિટી", "lines": {"blue": 5}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10", "mmi": "BRTS: Entry/Exit 1, footpath to the BRTS station"},
  {"id": "commerce-six-road", "name": "Commerce Six Road", "gu": "કોમર્સ છ રસ્તા", "alt": ["Commerce Six Roads"], "lines": {"blue": 6}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10"},
  {"id": "sp-stadium", "name": "SP Stadium", "gu": "એસ પી સ્ટેડિયમ", "alt": ["S P Stadium", "S.P. Stadium"], "lines": {"blue": 7}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10"},
  {"id": "old-high-court", "name": "Old High Court", "gu": "જૂની હાઇ કોર્ટ", "lines": {"blue": 8, "red": 7}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10", "flags": ["interchange"], "note": "GMRC's entry-exit page labels it 'Interchange Station'. Red platform is an island platform, Blue platforms are side platforms [WIKI]."},
  {"id": "shahpur-ahmedabad", "name": "Shahpur", "gu": "શાહપુર", "lines": {"blue": 9}, "phase": 1, "layout": "underground", "status": "operational", "opened": "2022-10", "note": "Not the planned Phase 2B 'Shahpur' near Gandhinagar (id shahpur-gandhinagar). Same display name, different station."},
  {"id": "gheekanta", "name": "Gheekanta", "gu": "ઘીકાંટા", "alt": ["Ghee Kanta"], "lines": {"blue": 10}, "phase": 1, "layout": "underground", "status": "operational", "opened": "2022-10"},
  {"id": "kalupur", "name": "Kalupur Metro Station", "gu": "કાલુપુર રેલ્વે સ્ટેશન", "alt": ["Kalupur Railway Station", "Kalupur Rly. Station"], "lines": {"blue": 11}, "phase": 1, "layout": "underground", "status": "operational", "opened": "2022-10", "mmi": "Indian Railways and NHSRCL: subway to Kalupur High Speed Railway Station"},
  {"id": "kankaria-east", "name": "Kankaria East", "gu": "કાંકરિયા પૂર્વ", "lines": {"blue": 12}, "phase": 1, "layout": "underground", "status": "operational", "opened": "2024-03", "note": "Opening date conflict: Wikipedia's main article says 5 Mar 2024, its station list says 30 Sep 2022. GMRC gives no station-level date. Verify."},
  {"id": "apparel-park", "name": "Apparel Park", "gu": "એપેરલ પાર્ક", "lines": {"blue": 13}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2019-03"},
  {"id": "amraivadi", "name": "Amraivadi", "gu": "અમરાઈવાડી", "alt": ["Amraiwadi"], "lines": {"blue": 14}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2019-05"},
  {"id": "rabari-colony", "name": "Rabari Colony", "gu": "રબારી કોલોની", "lines": {"blue": 15}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2021-03"},
  {"id": "vastral", "name": "Vastral", "gu": "વસ્ત્રાલ", "lines": {"blue": 16}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2021-03"},
  {"id": "nirant-cross-road", "name": "Nirant Cross Road", "gu": "નિરાંત ક્રોસ રોડ", "lines": {"blue": 17}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2019-04"},
  {"id": "vastral-gam", "name": "Vastral Gam", "gu": "વસ્ત્રાલ ગામ", "lines": {"blue": 18}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2019-03", "flags": ["terminus"]},
  {"id": "apmc", "name": "APMC", "gu": "એ પી એમ સી", "lines": {"red": 1}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10", "flags": ["terminus"], "mmi": "GSRTC: Entry/Exit 1, footpath to the GSRTC bus terminal"},
  {"id": "jivraj-park", "name": "Jivraj Park", "gu": "જીવરાજ પાર્ક", "lines": {"red": 2}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10"},
  {"id": "rajivnagar", "name": "Rajivnagar", "gu": "રાજીવ નગર", "alt": ["Rajiv Nagar", "Rajiv Nagar Metro Station"], "lines": {"red": 3}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10"},
  {"id": "shreyas", "name": "Shreyas", "gu": "શ્રેયસ", "lines": {"red": 4}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10"},
  {"id": "paldi", "name": "Paldi", "gu": "પાલડી", "lines": {"red": 5}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10"},
  {"id": "gandhigram", "name": "Gandhigram", "gu": "ગાંધીગ્રામ", "lines": {"red": 6}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10", "mmi": "Indian Railways: Entry/Exit 3, stairs and lift to the railway station"},
  {"id": "usmanpura", "name": "Usmanpura", "gu": "ઉસ્માનપુરા", "lines": {"red": 8}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10"},
  {"id": "vijaynagar", "name": "Vijaynagar", "gu": "વિજય નગર", "alt": ["Vijay Nagar"], "lines": {"red": 9}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10"},
  {"id": "vadaj", "name": "Vadaj", "gu": "વાડજ", "lines": {"red": 10}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10", "mmi": "BRTS: Entry/Exit 5, lift and skywalk"},
  {"id": "ranip", "name": "Ranip", "gu": "રાણીપ", "lines": {"red": 11}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10", "mmi": "GSRTC (Entry/Exit 2, footpath) and BRTS (Entry/Exit 3, lift and skywalk)"},
  {"id": "sabarmati-railway-station", "name": "Sabarmati Railway Station", "gu": "સાબરમતી રેલવે સ્ટેશન", "lines": {"red": 12}, "phase": 1, "layout": "elevated", "status": "under_construction", "note": "Shown as WORK IN PROGRESS on GMRC's route planner (page dated 22 Sep 2026). Exclude from matching and station pickers until GMRC lists it as operational."},
  {"id": "aec", "name": "AEC", "gu": "એ ઇ સી", "lines": {"red": 13}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10", "mmi": "BRTS (Entry/Exit 5, lift and skywalk), Indian Railways, NHSRCL (skywalk to Sabarmati High Speed Railway station)"},
  {"id": "sabarmati", "name": "Sabarmati", "gu": "સાબરમતી", "lines": {"red": 14}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10", "mmi": "BRTS: Entry/Exit 3, lift and skywalk", "note": "Do not confuse with 'Sabarmati Railway Station' (Red, not yet open) or the planned 'Sabarmati River' (Airport Line)."},
  {"id": "motera-stadium", "name": "Motera Stadium", "gu": "મોટેરા સ્ટેડિયમ", "lines": {"red": 15, "yellow": 1}, "phase": 1, "layout": "elevated", "status": "operational", "opened": "2022-10", "flags": ["interchange"], "note": "End of Phase 1 / start of Phase 2. Through trains continue north without a change [GMRC-PDF]. Token and GMRC smart card cannot be used across the Phase 1 / Phase 2 boundary [GMRC]."},
  {"id": "koteshwar-road", "name": "Koteshwar Road", "gu": "કોટેશ્વર રોડ", "lines": {"yellow": 2}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2025-04", "note": "Planned interchange with the Phase 2A Airport Line (not built) [WIKI, GMRC]."},
  {"id": "vishwakarma-college", "name": "Vishwakarma College", "gu": "વિશ્વકર્મા કોલેજ", "lines": {"yellow": 3}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2025-04"},
  {"id": "tapovan-circle", "name": "Tapovan Circle", "gu": "તપોવન સર્કલ", "lines": {"yellow": 4}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2025-04"},
  {"id": "narmada-canal", "name": "Narmada Canal", "gu": "નર્મદા કેનાલ", "lines": {"yellow": 5}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2025-04"},
  {"id": "koba-circle", "name": "Koba Circle", "gu": "કોબા સર્કલ", "lines": {"yellow": 6}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2025-04"},
  {"id": "juna-koba", "name": "Juna Koba", "gu": "જૂના કોબા", "lines": {"yellow": 7}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2025-09"},
  {"id": "koba-gam", "name": "Koba Gam", "gu": "કોબા ગામ", "alt": ["Koba Gaam"], "lines": {"yellow": 8}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2025-09"},
  {"id": "gnlu", "name": "GNLU", "gu": "જી એન એલ યુ", "alt": ["Gujarat National Law University"], "lines": {"yellow": 9, "violet": 1}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2024-09", "flags": ["interchange", "junction"], "note": "Junction where the Violet Line branches to PDEU and GIFT City."},
  {"id": "raysan", "name": "Raysan", "gu": "રાયસણ", "lines": {"yellow": 10}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2024-09"},
  {"id": "randesan", "name": "Randesan", "gu": "રાંદેસણ", "lines": {"yellow": 11}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2024-09"},
  {"id": "dholakuva-circle", "name": "Dholakuva Circle", "gu": "ધોળાકુવા સર્કલ", "lines": {"yellow": 12}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2024-09"},
  {"id": "infocity", "name": "Infocity", "gu": "ઇન્ફોસિટી", "alt": ["Info City"], "lines": {"yellow": 13}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2024-09"},
  {"id": "sector-1", "name": "Sector-1", "gu": "સેક્ટર-1", "lines": {"yellow": 14}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2024-09"},
  {"id": "sector-10a", "name": "Sector 10A", "gu": "સેક્ટર-10એ", "alt": ["Sector-10A", "Sector-10/A"], "lines": {"yellow": 15}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2025-04"},
  {"id": "sachivalaya", "name": "Sachivalaya", "gu": "સચિવાલય", "lines": {"yellow": 16}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2025-04"},
  {"id": "akshardham", "name": "Akshardham", "gu": "અક્ષરધામ", "lines": {"yellow": 17}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2026-01"},
  {"id": "juna-sachivalaya", "name": "Juna Sachivalaya", "gu": "જૂના સચિવાલય", "lines": {"yellow": 18}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2026-01"},
  {"id": "sector-16", "name": "Sector-16", "gu": "સેક્ટર-16", "lines": {"yellow": 19}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2026-01"},
  {"id": "sector-24", "name": "Sector-24", "gu": "સેક્ટર-24", "lines": {"yellow": 20}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2026-01"},
  {"id": "mahatma-mandir", "name": "Mahatma Mandir", "gu": "મહાત્મા મંદિર", "alt": ["Mahatama Mandir"], "lines": {"yellow": 21}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2026-01", "flags": ["terminus"], "mmi": "Indian Railways: 335 m foot-over-bridge with travellators to Gandhinagar Capital Railway Station", "note": "GMRC's route planner spells it 'Mahatama Mandir' (typo). Its own project pages use 'Mahatma Mandir'."},
  {"id": "pdeu", "name": "PDEU", "gu": "પી ડી ઈ યુ", "alt": ["Pandit Deendayal Energy University"], "lines": {"violet": 2}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2024-09"},
  {"id": "gift-city", "name": "GIFT City", "gu": "ગિફ્ટ સિટી", "lines": {"violet": 3}, "phase": 2, "layout": "elevated", "status": "operational", "opened": "2024-09", "flags": ["terminus"]}
 ],
"interchanges": [
  {"station": "old-high-court", "lines": ["red", "blue"], "kind": "line_change"},
  {"station": "motera-stadium", "lines": ["red", "yellow"], "kind": "phase_boundary_through_running"},
  {"station": "gnlu", "lines": ["yellow", "violet"], "kind": "branch_junction"},
  {"station": "koteshwar-road", "lines": ["yellow", "airport (planned)"], "kind": "planned_interchange", "status": "not_built"}
 ],
"service_patterns": [
  {"id": "RY-MM", "name": "APMC ⇄ Mahatma Mandir (Red + Yellow through service)", "lines": ["red", "yellow"], "stops": ["apmc", "jivraj-park", "rajivnagar", "shreyas", "paldi", "gandhigram", "old-high-court", "usmanpura", "vijaynagar", "vadaj", "ranip", "aec", "sabarmati", "motera-stadium", "koteshwar-road", "vishwakarma-college", "tapovan-circle", "narmada-canal", "koba-circle", "juna-koba", "koba-gam", "gnlu", "raysan", "randesan", "dholakuva-circle", "infocity", "sector-1", "sector-10a", "sachivalaya", "akshardham", "juna-sachivalaya", "sector-16", "sector-24", "mahatma-mandir"], "assumed_all_stops": true, "basis": "GMRC-PDF timing points + DeshGujarat; verify"},
  {"id": "RYV-GIFT", "name": "APMC ⇄ GIFT City (Red + Yellow to GNLU, then Violet)", "lines": ["red", "yellow", "violet"], "stops": ["apmc", "jivraj-park", "rajivnagar", "shreyas", "paldi", "gandhigram", "old-high-court", "usmanpura", "vijaynagar", "vadaj", "ranip", "aec", "sabarmati", "motera-stadium", "koteshwar-road", "vishwakarma-college", "tapovan-circle", "narmada-canal", "koba-circle", "juna-koba", "koba-gam", "gnlu", "pdeu", "gift-city"], "assumed_all_stops": true, "basis": "GMRC-PDF timing points (inferred from blank cells); verify"},
  {"id": "BLUE", "name": "Thaltej Gam ⇄ Vastral Gam (Blue)", "lines": ["blue"], "stops": ["thaltej-gam", "thaltej", "doordarshan-kendra", "gurukul-road", "gujarat-university", "commerce-six-road", "sp-stadium", "old-high-court", "shahpur-ahmedabad", "gheekanta", "kalupur", "kankaria-east", "apparel-park", "amraivadi", "rabari-colony", "vastral", "nirant-cross-road", "vastral-gam"], "assumed_all_stops": true, "basis": "GMRC route planner; Blue timetable not extracted"}
 ],
"timing": {"unit": "minutes", "basis": "Derived from GMRC 'Tentative' timetable PDF w.e.f. 18 May 2026; only 9 timing points are published, not every station. Interpolate and label as estimates.", "segments": [{"from": "apmc", "to": "old-high-court", "min": 13, "max": 15}, {"from": "old-high-court", "to": "motera-stadium", "min": 18, "max": 18}, {"from": "motera-stadium", "to": "koteshwar-road", "min": 3, "max": 3}, {"from": "koteshwar-road", "to": "gnlu", "min": 14, "max": 16}, {"from": "gnlu", "to": "infocity", "min": 9, "max": 12}, {"from": "infocity", "to": "sachivalaya", "min": 7, "max": 8}, {"from": "sachivalaya", "to": "mahatma-mandir", "min": 11, "max": 12}, {"from": "gnlu", "to": "gift-city", "min": 6, "max": 7}], "first_departure": {"apmc": "06:20", "mahatma-mandir": "06:40", "gift-city": "08:37"}, "last_departure": {"apmc": "20:45", "koteshwar-road_to_mahatma-mandir": "21:20", "mahatma-mandir": "21:00", "gift-city": "19:13", "blue_both_termini_per_news": "23:00"}},
"ticketing": {"source": "GMRC Fare Rules page, 10 Sep 2026", "token_or_gmrc_csc_valid_across_phase1_phase2": false, "qr_paper_ticket_valid_minutes": 30, "qr_mobile_ticket_valid_minutes": 180, "max_time_in_paid_area_same_station_exit_min": 20, "max_time_in_paid_area_other_station_exit_min": 240, "ncmc_discount_percent": 10, "luggage_max_kg": 25, "qr_valid_only_at_originating_station_gate": true, "reverse_travel_without_exit_allowed": false},
"planned_stations_not_operational": [
  {"id": "koteshwar-prachin-mandir", "name": "Koteshwar Prachin Mandir", "project": "Phase 2A Airport Line"},
  {"id": "sabarmati-river", "name": "Sabarmati River", "project": "Phase 2A Airport Line"},
  {"id": "ashram-road", "name": "Ashram Road", "project": "Phase 2A Airport Line"},
  {"id": "sardar-nagar", "name": "Sardarnagar", "project": "Phase 2A Airport Line", "alt": ["Sardar Nagar"]},
  {"id": "airport", "name": "Airport", "project": "Phase 2A Airport Line", "note": "Underground, the only underground station of Phase 2A"},
  {"id": "gift-city-house", "name": "GIFT City House", "project": "Phase 2B Violet Line extension"},
  {"id": "gujarat-biotechnology-university", "name": "Gujarat Biotechnology University", "project": "Phase 2B Violet Line extension"},
  {"id": "shahpur-gandhinagar", "name": "Shahpur", "project": "Phase 2B Violet Line extension", "note": "Same name as the operational Blue Line 'Shahpur' in Ahmedabad (id shahpur-ahmedabad). Always use ids."}
 ],
"contacts": {"passenger_care_phone": "+91-79-22960123", "passenger_care_email": "care@gujaratmetrorail.com", "general_phone": "+91-79-23248572", "general_email": "info@gujaratmetrorail.com", "feedback_form": "https://www.gujaratmetrorail.com/feedback/", "registered_office": "Block No. 1, First Floor, Karmayogi Bhavan, Sector 10/A, Gandhinagar 382010"}
}
```

---

## 15. Sources (accessed 29 Sep 2026)

**GMRC (official)**
- Home: https://www.gujaratmetrorail.com/ (updated 28 Sep 2026)
- Project overview: https://www.gujaratmetrorail.com/project-overview2/ (updated 25 Sep 2026)
- Ahmedabad passenger page and route planner: https://www.gujaratmetrorail.com/ahmedabad/ (updated 22 Sep 2026)
- Fare rules: https://www.gujaratmetrorail.com/ahmedabad/fare-rules/
- Entry-exit gates and station types: https://www.gujaratmetrorail.com/ahmedabad/information-of-entry-exit-gate-at-entrance/
- Multi-modal integration: https://www.gujaratmetrorail.com/mmi-2/
- Safety and security: https://www.gujaratmetrorail.com/ahmedabad/safety-and-security/
- Facilities: https://www.gujaratmetrorail.com/ahmedabad/facilities-for-passenger/
- Customer care and contact: https://www.gujaratmetrorail.com/ahmedabad/customer-care/ and https://www.gujaratmetrorail.com/contact-us/
- Timetable PDF (18 May 2026): https://www.gujaratmetrorail.com/ahmedabad/wp-content/uploads/2026/04/Tentative-TT-18.05.26.pdf

**Secondary**
- Wikipedia: Ahmedabad Metro; List of Ahmedabad Metro stations; Red, Yellow and Violet Line pages; Old High Court metro station
- DeshGujarat: timetable and colour coding (13 Jan 2026); revised timings from 18 May (16 May 2026); station status (27 Sep 2025)
- Metro Railways (Operation and Maintenance) Act, 2002 (contents list): https://crs.gov.in/wp-content/uploads/2024/03/THE-METRO-RAILWAYS-OPERATION-AND-MAINTENANCE-ACT-2002.pdf
- Jan Vishwas (Amendment of Provisions) Bill, 2026 report: india.com, 5 Apr 2026
