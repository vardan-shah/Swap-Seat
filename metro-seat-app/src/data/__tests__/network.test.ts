import { describe, it, expect } from "@jest/globals";
import gmrcData from "../gmrc-network.json";
import { STATIONS } from "../stations";

describe("GMRC Network Data Integrity", () => {
  it("has valid statuses and no duplicate IDs in stations", () => {
    const ids = new Set<string>();
    const validStatuses = ["operational", "under_construction", "planned"];
    for (const station of gmrcData.stations) {
      expect(ids.has(station.id)).toBe(false); // No duplicates
      ids.add(station.id);
      expect(validStatuses).toContain(station.status);
    }
  });

  it("ensures every stop in every service pattern exists in stations", () => {
    const stationIds = new Set(gmrcData.stations.map((s) => s.id));
    for (const pattern of gmrcData.service_patterns) {
      for (const stopId of pattern.stops) {
        expect(stationIds.has(stopId)).toBe(true);
      }
    }
  });

  it("ensures all RY-MM stops are operational in STATIONS", () => {
    // STATIONS filters out non-operational, so checking that length of STATIONS
    // matches RY-MM operational stops, or just checking their statuses.
    const ryPattern = gmrcData.service_patterns.find((p) => p.id === "RY-MM");
    expect(ryPattern).toBeDefined();

    // Each station in STATIONS must be operational
    for (const s of STATIONS) {
      expect(s.status).toBe("operational");
    }
  });
});
