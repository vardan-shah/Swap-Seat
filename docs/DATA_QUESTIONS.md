# GMRC Metro Data Questions & Uncertainties

1. **Southbound GIFT departures:** `timing.first_departure.gift-city` in `gmrc-network.json` claims 08:37, but the tentative timetable PDF clearly shows Southbound trains departing GIFT City at 07:48, 08:37, 09:01, etc. We have ignored the JSON summary and parsed the PDF directly.
2. **Northbound GIFT trains:** The PDF table has no explicit column layout for Northbound trains turning off to GIFT City, but we inferred them by looking at which times aligned with the GIFT CITY column vs MAHATMA MANDIR. 
3. **Mid-line start (Koteshwar Road):** The JSON `timing.last_departure` mentioned a train starting from Koteshwar Road at 21:20. In the PDF, 21:20 is simply the arrival time at Koteshwar Road for the final Northbound train (20:45 from APMC). We assume no trains start mid-line.
4. **All Stops Assumed:** Both service patterns in `gmrc-network.json` specify `assumed_all_stops: true` with a note to "verify". The timetable provides only 9 timing points. We assume trains stop at all operational stations between these points.
5. **Southbound Offsets:** Unlike previously assumed, Southbound offsets DO NOT strictly mirror Northbound offsets. The PDF has concrete timing data for Southbound stations which occasionally take longer (e.g., GNLU->Koteshwar takes 17 mins southbound vs 14-16 northbound). We now extract and rely on exact timing values for both directions from the PDF.
6. **Timing Exceptions:** The PDF violates the provided bounds in a few specific segments. Verified exceptions:
    - old-high-court -> motera-stadium takes 19 mins (bound 18) for rows 5 and 16 NB, and row 6 SB.
    - gnlu -> koteshwar-road takes 17 mins (bound 14-16) for row 19 SB.
    - mahatma-mandir -> sachivalaya takes 13 mins (bound 11-12) for row 38 SB.
7. **Directional Segments Timing Bounds**: The `timing.directional_segments` section in `gmrc-network.json` lacks explicit official sources, so we have added a `basis` note stating it was derived from observations of the timetable PDF.
