import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useAppStore } from '../store/mockStore';
import { translations } from '../i18n';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'>;
};

export default function HomeScreen({ navigation }: Props) {
  const { currentUser, getActiveMatchForUser, getMyOpportunity, language } = useAppStore();
  const t = translations[language];
  
  const activeMatch = getActiveMatchForUser(currentUser.id);
  const myOpportunity = getMyOpportunity(currentUser.id);

  useEffect(() => {
    // If the user has an active match, we can redirect or show it prominently.
  }, [activeMatch, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Hello, Commuter</Text>
          <Text style={styles.subtitle}>Ahmedabad-Gandhinagar Metro Phase 2</Text>
          
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              Note: This is a free courtesy network. We do NOT sell tickets or guarantee seats. 
              Please yield priority seats to elderly or disabled passengers.
            </Text>
          </View>
        </View>

        {activeMatch ? (
          <View style={styles.activeCard}>
            <Text style={styles.activeCardTitle}>You have an active handoff!</Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('ActiveMatch', { matchId: activeMatch.id })}
            >
              <Text style={styles.buttonText}>View Active Match</Text>
            </TouchableOpacity>
          </View>
        ) : myOpportunity ? (
          <View style={styles.activeCard}>
            <Text style={styles.activeCardTitle}>You are offering a seat.</Text>
            <Text style={styles.statusText}>Status: {myOpportunity.status}</Text>
            <Text style={styles.instructionText}>Waiting for someone to request it...</Text>
          </View>
        ) : (
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.largeButton}
              onPress={() => navigation.navigate('FindSeat')}
            >
              <Text style={styles.largeButtonTitle}>{t.findSeat}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.largeButton, styles.secondaryButton]}
              onPress={() => navigation.navigate('OfferSeat')}
            >
              <Text style={styles.largeButtonTitle}>{t.offerSeat}</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 20 },
  header: { marginBottom: 30 },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  disclaimerBox: { 
    marginTop: 16, 
    padding: 12, 
    backgroundColor: '#fff3cd', 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffe69c'
  },
  disclaimerText: { fontSize: 12, color: '#664d03', lineHeight: 18 },
  actionContainer: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  largeButton: {
    backgroundColor: '#0056b3',
    padding: 24,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: { backgroundColor: '#28a745' },
  largeButtonTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  largeButtonSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  activeCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  activeCardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  primaryButton: {
    backgroundColor: '#FF8200',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  statusText: { fontSize: 16, fontWeight: 'bold', color: '#0056b3', marginBottom: 8 },
  instructionText: { fontSize: 14, color: '#666' }
});
