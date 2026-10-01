import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation";
import { useAppStore } from "../store/mockStore";
import { getStationById } from "../data/stations";
import { ENABLE_PAYMENTS } from "../config/flags";
import { getTrainLabel } from "../data/timetable";
import { translations } from "../i18n";

import { notify } from "../utils/dialog";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "OpportunityList">;
  route: RouteProp<RootStackParamList, "OpportunityList">;
};

export default function OpportunityListScreen({ navigation, route }: Props) {
  const { currentStationId, destinationStationId, direction } = route.params;
  const {
    currentUser,
    getCompatibleOpportunities,
    requestSeat,
    getActiveMatchesForUser,
    language,
    users,
  } = useAppStore();
  const t = translations[language];

  const opportunities = getCompatibleOpportunities(
    currentStationId,
    destinationStationId,
    direction,
  );

  const handleRequest = async (oppId: string) => {
    // Check if user already has active match
    const existingMatches = getActiveMatchesForUser(currentUser.id);
    if (existingMatches.length > 0) {
      await notify("Error", "You already have an active match or request.");
      return;
    }

    const result = requestSeat(oppId, currentUser.id);
    if (!result.ok) {
      const msg =
        result.reason === "DUPLICATE"
          ? "You already have an active request."
          : result.reason === "OWN_OFFER"
            ? "You cannot request your own offer."
            : result.reason === "NOT_ACTIVE"
              ? "This seat is no longer available."
              : "Could not request this seat. It might be taken or expired.";
      await notify("Error", msg);
      return;
    }

    await notify(
      "Requested",
      "Your request has been sent. Wait for the giver to accept.",
    );
    navigation.popToTop();
  };

  const renderItem = ({ item }: { item: any }) => {
    const handoffStation = getStationById(item.handoffStationId);
    const giver = users[item.giverId];
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.stationText}>
            Becomes available at: {handoffStation?.name}
          </Text>
        </View>
        {item.trainId && (
          <Text style={styles.trainText}>
            {t.expectedTrain}: {getTrainLabel(item.trainId)}
          </Text>
        )}
        <Text style={styles.giverText}>
          {t.trustScore}:{" "}
          {giver && giver.reputation > 0 ? `${giver.reputation}/5.0` : "New"}
        </Text>

        {ENABLE_PAYMENTS && item.price !== undefined && (
          <Text style={styles.priceText}>
            {t.amount.replace(" (₹)", "")}: ₹{item.price}
          </Text>
        )}

        <TouchableOpacity
          style={styles.requestBtn}
          onPress={() => handleRequest(item.id)}
        >
          <Text style={styles.requestBtnText}>{t.requestHandoff}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {opportunities.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No matching seat opportunities found right now.
          </Text>
          <Text style={styles.emptySubtext}>Try again in a few minutes.</Text>
        </View>
      ) : (
        <FlatList
          data={opportunities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stationText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  timeText: { fontSize: 14, color: "#FF8200", fontWeight: "bold" },
  trainText: {
    fontSize: 14,
    color: "#0056b3",
    marginBottom: 4,
    fontWeight: "500",
  },
  giverText: { fontSize: 13, color: "#666", marginBottom: 16 },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: 16,
  },
  requestBtn: {
    backgroundColor: "#0056b3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  requestBtnText: { color: "#fff", fontWeight: "bold" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtext: { fontSize: 14, color: "#666" },
});
