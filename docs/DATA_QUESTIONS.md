# GMRC Metro Data Questions & Uncertainties

1. **Southbound GIFT departures:** `timing.first_departure.gift-city` in `gmrc-network.json` claims 08:37, but the tentative timetable PDF clearly shows Southbound trains departing GIFT City at 07:48, 08:37, 09:01, etc. We have ignored the JSON summary and parsed the PDF directly.
2. **Northbound GIFT trains:** The PDF table has no explicit column layout for Northbound trains turning off to GIFT City, but we inferred them by looking at which times aligned with the GIFT CITY column vs MAHATMA MANDIR. 
3. **Mid-line start (Koteshwar Road):** The JSON `timing.last_departure` mentioned a train starting from Koteshwar Road at 21:20. In the PDF, 21:20 is simply the arrival time at Koteshwar Road for the final Northbound train (20:45 from APMC). We assume no trains start mid-line.
4. **All Stops Assumed:** Both service patterns in `gmrc-network.json` specify `assumed_all_stops: true` with a note to "verify". The timetable provides only 9 timing points. We assume trains stop at all operational stations between these points.
5. **Southbound Offsets Symmetry:** Since only Southbound departure times are provided for all trains (with few timing points), we assume that Southbound travel times (offsets) mirror the Northbound travel times exactly (i.e. `total_trip_time - station_offset`).
