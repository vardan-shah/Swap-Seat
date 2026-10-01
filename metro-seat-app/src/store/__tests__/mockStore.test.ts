import { useAppStore } from "../mockStore";
import { SeatOpportunity, Match } from "../../types";
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";

describe("mockStore", () => {
  const initialState = useAppStore.getState();

  afterEach(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    useAppStore.setState(initialState, true);
    useAppStore.setState({
      opportunities: [],
      matches: [],
      currentUser: { id: "u1", displayName: "TestUser", reputation: 5.0 },
    });
  });

  describe("offerSeat", () => {
    it("creates a valid Northbound offer", () => {
      useAppStore.setState({
        currentUser: { id: "u1", displayName: "User", reputation: 5.0 },
        opportunities: [],
      });
      const res = useAppStore
        .getState()
        .offerSeat(
          "Northbound",
          "sabarmati",
          "motera-stadium",
          undefined,
          "train1",
        );
      expect(res.ok).toBe(true);
      expect(useAppStore.getState().opportunities[0]).toMatchObject({
        currentStationId: "sabarmati",
        handoffStationId: "motera-stadium",
      });
    });

    it("creates a valid Southbound offer", () => {
      useAppStore.setState({
        currentUser: { id: "u1", displayName: "User", reputation: 5.0 },
        opportunities: [],
      });
      const res = useAppStore
        .getState()
        .offerSeat(
          "Southbound",
          "motera-stadium",
          "sabarmati",
          undefined,
          "train1",
        );
      expect(res.ok).toBe(true);
      expect(useAppStore.getState().opportunities[0]).toMatchObject({
        currentStationId: "motera-stadium",
        handoffStationId: "sabarmati",
      });
    });

    it("rejects reversed stations", () => {
      useAppStore.setState({
        currentUser: { id: "u1", displayName: "User", reputation: 5.0 },
        opportunities: [],
      });
      const res = useAppStore
        .getState()
        .offerSeat(
          "Northbound",
          "motera-stadium",
          "sabarmati",
          undefined,
          "train1",
        );
      expect(res.ok).toBe(false);
      expect(res.reason).toBe("INVALID_STATIONS");
    });

    it("rejects equal stations", () => {
      useAppStore.setState({
        currentUser: { id: "u1", displayName: "User", reputation: 5.0 },
        opportunities: [],
      });
      const res = useAppStore
        .getState()
        .offerSeat(
          "Northbound",
          "motera-stadium",
          "motera-stadium",
          undefined,
          "train1",
        );
      expect(res.ok).toBe(false);
      expect(res.reason).toBe("INVALID_STATIONS");
    });

    it("rejects ALREADY_OFFERING and leaves state unchanged", () => {
      useAppStore.setState({
        currentUser: { id: "u1", displayName: "User", reputation: 5.0 },
        opportunities: [
          { giverId: "u1", status: "MATCHED" } as SeatOpportunity,
        ],
      });
      const res = useAppStore
        .getState()
        .offerSeat(
          "Northbound",
          "sabarmati",
          "motera-stadium",
          undefined,
          "train1",
        );
      expect(res.ok).toBe(false);
      expect(res.reason).toBe("ALREADY_OFFERING");
      expect(useAppStore.getState().opportunities).toHaveLength(1);
    });
  });

  describe("getCompatibleOpportunities", () => {
    it("matches valid Northbound offer", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "u1",
            currentStationId: "vadaj",
            handoffStationId: "sabarmati",
            direction: "Northbound",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
      });
      const matches = useAppStore
        .getState()
        .getCompatibleOpportunities("ranip", "motera-stadium", "Northbound");
      expect(matches).toHaveLength(1);
    });

    it("no match when handoff is after destination", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "u1",
            currentStationId: "vadaj",
            handoffStationId: "sabarmati",
            direction: "Northbound",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
      });
      const matches = useAppStore
        .getState()
        .getCompatibleOpportunities("apmc", "ranip", "Northbound");
      expect(matches).toHaveLength(0);
    });

    it("no match when handoff is before boarding", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "u1",
            currentStationId: "vadaj",
            handoffStationId: "sabarmati",
            direction: "Northbound",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
      });
      const matches = useAppStore
        .getState()
        .getCompatibleOpportunities(
          "motera-stadium",
          "koteshwar-road",
          "Northbound",
        );
      expect(matches).toHaveLength(0);
    });

    it("matches when handoff equals boarding station (boundary)", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "u1",
            currentStationId: "vadaj",
            handoffStationId: "sabarmati",
            direction: "Northbound",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
      });
      const matches = useAppStore
        .getState()
        .getCompatibleOpportunities(
          "sabarmati",
          "motera-stadium",
          "Northbound",
        );
      expect(matches).toHaveLength(1);
    });

    it("no match when handoff equals destination", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "u1",
            currentStationId: "vadaj",
            handoffStationId: "sabarmati",
            direction: "Northbound",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
      });
      const matches = useAppStore
        .getState()
        .getCompatibleOpportunities("ranip", "sabarmati", "Northbound");
      expect(matches).toHaveLength(0);
    });

    it("matches valid Southbound offer", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "u1",
            currentStationId: "sabarmati",
            handoffStationId: "vadaj",
            direction: "Southbound",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
      });
      const matches = useAppStore
        .getState()
        .getCompatibleOpportunities("aec", "usmanpura", "Southbound");
      expect(matches).toHaveLength(1);
    });
  });

  describe("requestSeat", () => {
    it("creates a PENDING match when requesting an ACTIVE opportunity", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
      });
      const res = useAppStore.getState().requestSeat("opp1", "seeker1");
      expect(res.ok).toBe(true);
      const matches = useAppStore.getState().matches;
      expect(matches.length).toBe(1);
      expect(matches[0].status).toBe("PENDING");
    });

    it("rejects duplicate requests", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: "m1",
            opportunityId: "opp1",
            seekerId: "seeker1",
            giverId: "giver1",
            status: "PENDING",
          } as Match,
        ],
      });
      const res = useAppStore.getState().requestSeat("opp1", "seeker1");
      expect(res.ok).toBe(false);
      expect(res.reason).toBe("DUPLICATE");
    });

    it("rejects request for own offer", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "seeker1",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
      });
      const res = useAppStore.getState().requestSeat("opp1", "seeker1");
      expect(res.ok).toBe(false);
      expect(res.reason).toBe("OWN_OFFER");
    });

    it("rejects request for non-ACTIVE opportunity", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "MATCHED",
          } as SeatOpportunity,
        ],
      });
      const res = useAppStore.getState().requestSeat("opp1", "seeker1");
      expect(res.ok).toBe(false);
      expect(res.reason).toBe("NOT_ACTIVE");
    });
    it("rejects request for unknown opportunity", () => {
      useAppStore.setState({ opportunities: [] });
      const res = useAppStore.getState().requestSeat("opp99", "seeker1");
      expect(res.ok).toBe(false);
      expect(res.reason).toBe("NOT_FOUND");
    });
  });

  describe("cancelOpportunity", () => {
    it("cascades cancellation to PENDING matches and sets cancelledBy", () => {
      useAppStore.setState({
        currentUser: { id: "giver1", displayName: "Giver", reputation: 5.0 },
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: "m1",
            opportunityId: "opp1",
            giverId: "giver1",
            seekerId: "s1",
            status: "PENDING",
          } as Match,
          {
            id: "m3",
            opportunityId: "opp1",
            giverId: "giver1",
            seekerId: "s3",
            status: "REJECTED",
          } as Match,
        ],
      });
      const success = useAppStore.getState().cancelOpportunity("opp1");
      expect(success).toBe(true);
      const state = useAppStore.getState();
      expect(state.opportunities[0].status).toBe("CANCELLED");

      const m1 = state.matches.find((m) => m.id === "m1")!;
      expect(m1.status).toBe("CANCELLED");
      expect(m1.cancelledBy).toBe("giver1");

      const m3 = state.matches.find((m) => m.id === "m3")!;
      expect(m3.status).toBe("REJECTED"); // Unaffected
    });

    it("allows withdrawing when no one has requested", () => {
      useAppStore.setState({
        currentUser: { id: "giver1", displayName: "Giver", reputation: 5.0 },
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
        matches: [],
      });
      const success = useAppStore.getState().cancelOpportunity("opp1");
      expect(success).toBe(true);
      expect(useAppStore.getState().opportunities[0].status).toBe("CANCELLED");
    });

    it("prevents withdrawing by non-owner", () => {
      useAppStore.setState({
        currentUser: {
          id: "some_other_guy",
          displayName: "Other",
          reputation: 5.0,
        },
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
        matches: [],
      });
      const success = useAppStore.getState().cancelOpportunity("opp1");
      expect(success).toBe(false);
      expect(useAppStore.getState().opportunities[0].status).toBe("ACTIVE");
    });

    it("prevents withdrawing non-ACTIVE offer", () => {
      useAppStore.setState({
        currentUser: { id: "giver1", displayName: "Giver", reputation: 5.0 },
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "COMPLETED",
          } as SeatOpportunity,
        ],
        matches: [],
      });
      const success = useAppStore.getState().cancelOpportunity("opp1");
      expect(success).toBe(false);
      expect(useAppStore.getState().opportunities[0].status).toBe("COMPLETED");
    });
  });

  describe("transition", () => {
    it("allows giver to ACCEPT and auto-rejects siblings", () => {
      useAppStore.setState({
        currentUser: { id: "giver1", displayName: "Giver", reputation: 5.0 },
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: "m1",
            opportunityId: "opp1",
            giverId: "giver1",
            seekerId: "s1",
            status: "PENDING",
          } as Match,
          {
            id: "m2",
            opportunityId: "opp1",
            giverId: "giver1",
            seekerId: "s2",
            status: "PENDING",
          } as Match,
        ],
      });
      const success = useAppStore.getState().acceptMatch("m1");
      expect(success).toBe(true);
      const state = useAppStore.getState();
      expect(state.opportunities[0].status).toBe("MATCHED");
      expect(state.matches.find((m) => m.id === "m1")?.status).toBe("ACCEPTED");
      expect(state.matches.find((m) => m.id === "m2")?.status).toBe("REJECTED");
    });

    it("allows giver to REJECT a match", () => {
      useAppStore.setState({
        currentUser: { id: "giver1", displayName: "Giver", reputation: 5.0 },
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: "m1",
            opportunityId: "opp1",
            giverId: "giver1",
            seekerId: "s1",
            status: "PENDING",
          } as Match,
        ],
      });
      const success = useAppStore.getState().rejectMatch("m1");
      expect(success).toBe(true);
      expect(useAppStore.getState().matches[0].status).toBe("REJECTED");
      expect(useAppStore.getState().opportunities[0].status).toBe("ACTIVE"); // Remains active
    });

    it("prevents seeker from ACCEPTING a match", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "ACTIVE",
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: "m1",
            opportunityId: "opp1",
            giverId: "giver1",
            seekerId: "s1",
            status: "PENDING",
          } as Match,
        ],
      });
      const success = useAppStore.getState().transition("m1", "s1", "ACCEPTED");
      expect(success).toBe(false);
      expect(useAppStore.getState().matches[0].status).toBe("PENDING"); // Unchanged
    });

    it("reopens the seat when an ACCEPTED match is CANCELLED by seeker and seat is not expired", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "MATCHED",
            expiresAt: Date.now() + 10000,
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: "m1",
            opportunityId: "opp1",
            giverId: "giver1",
            seekerId: "s1",
            status: "ACCEPTED",
          } as Match,
        ],
      });
      const success = useAppStore
        .getState()
        .transition("m1", "s1", "CANCELLED");
      expect(success).toBe(true);
      expect(useAppStore.getState().opportunities[0].status).toBe("ACTIVE");
    });

    it("expires the seat when an ACCEPTED match is CANCELLED by seeker and seat is expired", () => {
      jest.useFakeTimers();
      const now = Date.now();

      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "MATCHED",
            expiresAt: now - 10000,
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: "m1",
            opportunityId: "opp1",
            giverId: "giver1",
            seekerId: "s1",
            status: "ACCEPTED",
          } as Match,
        ],
      });

      jest.setSystemTime(now);
      const success = useAppStore
        .getState()
        .transition("m1", "s1", "CANCELLED");
      expect(success).toBe(true);
      expect(useAppStore.getState().opportunities[0].status).toBe("EXPIRED");
    });

    it("cancels the seat when an ACCEPTED match is CANCELLED by giver", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "MATCHED",
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: "m1",
            opportunityId: "opp1",
            giverId: "giver1",
            seekerId: "s1",
            status: "ACCEPTED",
          } as Match,
        ],
      });
      const success = useAppStore
        .getState()
        .transition("m1", "giver1", "CANCELLED");
      expect(success).toBe(true);
      expect(useAppStore.getState().opportunities[0].status).toBe("CANCELLED");
    });

    it("prevents seeker from completing a match", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "MATCHED",
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: "m1",
            opportunityId: "opp1",
            giverId: "giver1",
            seekerId: "s1",
            status: "ACCEPTED",
          } as Match,
        ],
      });
      const success = useAppStore
        .getState()
        .transition("m1", "s1", "COMPLETED");
      expect(success).toBe(false);
      expect(useAppStore.getState().matches[0].status).toBe("ACCEPTED"); // Unchanged
    });

    it("allows giver to complete a match and completes opportunity", () => {
      useAppStore.setState({
        currentUser: { id: "giver1", displayName: "Giver", reputation: 5.0 },
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "MATCHED",
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: "m1",
            opportunityId: "opp1",
            giverId: "giver1",
            seekerId: "s1",
            status: "ACCEPTED",
          } as Match,
        ],
      });
      const success = useAppStore
        .getState()
        .transition("m1", "giver1", "COMPLETED");
      expect(success).toBe(true);
      expect(useAppStore.getState().matches[0].status).toBe("COMPLETED");
      expect(useAppStore.getState().opportunities[0].status).toBe("COMPLETED");
    });

    it("prevents non-participant from cancelling a match", () => {
      useAppStore.setState({
        opportunities: [
          {
            id: "opp1",
            giverId: "giver1",
            status: "MATCHED",
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: "m1",
            opportunityId: "opp1",
            giverId: "giver1",
            seekerId: "s1",
            status: "ACCEPTED",
          } as Match,
        ],
      });
      const success = useAppStore
        .getState()
        .transition("m1", "random_guy", "CANCELLED");
      expect(success).toBe(false);
      expect(useAppStore.getState().matches[0].status).toBe("ACCEPTED"); // Unchanged
    });
  });

  describe("logout", () => {
    it("resets the state but keeps action functions", () => {
      useAppStore.setState({
        isAuthenticated: true,
        upiId: "test@upi",
        opportunities: [{ id: "1" } as any],
      });
      useAppStore.getState().logout();
      const state = useAppStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.upiId).toBe(null);
      expect(state.opportunities.length).toBe(0);
      expect(typeof state.login).toBe("function"); // Actions are preserved
    });
  });
});
