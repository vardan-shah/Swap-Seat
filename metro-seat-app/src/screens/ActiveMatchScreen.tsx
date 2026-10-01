import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation";
import { useAppStore } from "../store/mockStore";
import { getStationById } from "../data/stations";
import { notify } from "../utils/dialog";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ActiveMatch">;
  route: RouteProp<RootStackParamList, "ActiveMatch">;
};

export default function ActiveMatchScreen({ navigation, route }: Props) {
  const { matchId } = route.params;
  const {
    matches,
    opportunities,
    currentUser,
    acceptMatch,
    rejectMatch,
    cancelMatch,
    completeMatch,
  } = useAppStore();

  const match = matches.find((m) => m.id === matchId);
  if (!match) {
    return (
      <View style={styles.container}>
        <Text>Match not found or completed.</Text>
      </View>
    );
  }

  const opp = opportunities.find((o) => o.id === match.opportunityId);
  const isGiver = match.giverId === currentUser.id;
  const handoffStation = getStationById(opp?.handoffStationId || "");

  const handleComplete = async () => {
    if (!completeMatch(match.id)) {
      await notify(
        "Not allowed",
        "Only the seat holder can confirm the handoff.",
      );
      return;
    }
    await notify("Success", "Handoff completed!");
    navigation.reset({ index: 0, routes: [{ name: "Tabs" }] });
  };

  const handleCancel = async () => {
    if (!cancelMatch(match.id)) {
      await notify("Error", "Unable to cancel this handoff.");
      return;
    }
    await notify("Cancelled", "Handoff cancelled.");
    navigation.reset({ index: 0, routes: [{ name: "Tabs" }] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Handoff at {handoffStation?.name}</Text>
        <Text style={styles.status}>Status: {match.status}</Text>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Instructions:</Text>
          {isGiver ? (
            <Text style={styles.instructionText}>
              A passenger is looking for your seat. They will meet you as you
              prepare to deboard at {handoffStation?.name}.
            </Text>
          ) : (
            <Text style={styles.instructionText}>
              Please proceed towards the passenger at {handoffStation?.name}.
              Remember to allow them to exit safely.
            </Text>
          )}
        </View>

        {opp?.price !== undefined && opp?.price > 0 && (
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Requested Amount</Text>
            <Text style={styles.priceValue}>₹{opp.price}</Text>
          </View>
        )}

        {match.status === "PENDING" && isGiver && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btn, styles.acceptBtn]}
              onPress={() => acceptMatch(match.id)}
            >
              <Text style={styles.btnText}>Accept Request</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.rejectBtn]}
              onPress={() => rejectMatch(match.id)}
            >
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {match.status === "PENDING" && !isGiver && (
          <Text style={styles.waitText}>
            Waiting for the seat holder to accept...
          </Text>
        )}

        {match.status === "ACCEPTED" && (
          <View style={styles.actionRow}>
            {isGiver ? (
              <TouchableOpacity
                style={[styles.btn, styles.acceptBtn]}
                onPress={handleComplete}
              >
                <Text style={styles.btnText}>Confirm Handoff</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.btn, styles.disabledBtn]}>
                <Text style={[styles.btnText, styles.disabledBtnText]}>
                  Waiting for Confirm
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.btn, styles.rejectBtn]}
              onPress={handleCancel}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#333" },
  status: {
    fontSize: 16,
    color: "#FF8200",
    fontWeight: "bold",
    marginBottom: 20,
  },
  instructions: {
    backgroundColor: "#f1f8ff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  instructionTitle: { fontWeight: "bold", marginBottom: 5 },
  instructionText: { color: "#444", lineHeight: 22 },
  priceBox: {
    backgroundColor: "#fff3cd",
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffe69c",
  },
  priceLabel: { fontSize: 14, color: "#664d03", marginBottom: 5 },
  priceValue: { fontSize: 24, fontWeight: "bold", color: "#664d03" },
  actionRow: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: "center" },
  acceptBtn: { backgroundColor: "#28a745" },
  rejectBtn: { backgroundColor: "#dc3545" },
  disabledBtn: {
    backgroundColor: "#e9ecef",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  disabledBtnText: { color: "#6c757d" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  waitText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 10,
  },
});
