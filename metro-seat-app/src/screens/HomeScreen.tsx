import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useAppStore } from '../store/mockStore';
import { translations } from '../i18n';
import { notify } from '../utils/dialog';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'>;
};

export default function HomeScreen({ navigation }: Props) {
  const language = useAppStore(s => s.language);
  const currentUser = useAppStore(s => s.currentUser);
  const matches = useAppStore(s => s.matches);
  const opportunities = useAppStore(s => s.opportunities);
  const t = translations[language];
  
  const activeMatches = useMemo(() => 
    matches.filter(m => 
      (m.giverId === currentUser.id || m.seekerId === currentUser.id) && 
      (m.status === 'PENDING' || m.status === 'ACCEPTED')
    ), [matches, currentUser.id]
  );
  
  const myOpportunity = useMemo(() => 
    opportunities.find(o => 
      o.giverId === currentUser.id && (o.status === 'ACTIVE' || o.status === 'MATCHED')
    ), [opportunities, currentUser.id]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Hello, Commuter</Text>
          <Text style={styles.subtitle}>Ahmedabad-Gandhinagar Metro Phase 2</Text>
        </View>

        {activeMatches.length > 0 && (
          <View style={styles.activeCard}>
            <Text style={styles.activeCardTitle}>
              {activeMatches.length === 1 ? 'You have an active handoff!' : `You have ${activeMatches.length} active handoffs!`}
            </Text>
            {activeMatches.map(match => (
              <TouchableOpacity 
                key={match.id}
                style={[styles.primaryButton, { marginTop: 10 }]}
                onPress={() => navigation.navigate('ActiveMatch', { matchId: match.id })}
              >
                <Text style={styles.buttonText}>View Match ({match.status})</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {myOpportunity && (
          <View style={styles.activeCard}>
            <Text style={styles.activeCardTitle}>You are offering a seat.</Text>
            <Text style={styles.statusText}>Status: {myOpportunity.status}</Text>
            <Text style={styles.instructionText}>
              {activeMatches.length > 0 ? 'You have pending requests to review.' : 'Waiting for someone to request it...'}
            </Text>
            
            <TouchableOpacity 
              style={[styles.primaryButton, { marginTop: 10, backgroundColor: '#dc3545' }]}
              onPress={async () => {
                const success = useAppStore.getState().cancelOpportunity(myOpportunity.id);
                if (success) {
                  await notify('Cancelled', 'Your offer has been cancelled.');
                }
              }}
            >
              <Text style={styles.buttonText}>Withdraw Offer</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!myOpportunity && activeMatches.length === 0 && (
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

        {__DEV__ && (
          <View style={{ marginTop: 40, padding: 20, backgroundColor: '#ffeeba', borderRadius: 8 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>🛠 Dev Tools</Text>
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: '#6c757d' }]}
              onPress={() => {
                const store = useAppStore.getState();
                const isMe = store.currentUser.id === 'u_me';
                store.currentUser = {
                  id: isMe ? 'mock_seeker_2' : 'u_me',
                  displayName: isMe ? 'Mock Seeker' : 'Me',
                  reputation: 5.0
                };
                // force update
                useAppStore.setState({ currentUser: { ...store.currentUser } });
              }}
            >
              <Text style={styles.buttonText}>
                Toggle Role (Currently: {currentUser.displayName})
              </Text>
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
