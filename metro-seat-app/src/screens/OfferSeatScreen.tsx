import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { STATIONS, ENABLE_PAYMENTS } from '../data/stations';
import { useAppStore } from '../store/mockStore';
import { Direction } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OfferSeat'>;
};

export default function OfferSeatScreen({ navigation }: Props) {
  const [direction, setDirection] = useState<Direction>('Northbound');
  const [currentStationId, setCurrentStationId] = useState<string>('');
  const [handoffStationId, setHandoffStationId] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  
  const offerSeat = useAppStore(state => state.offerSeat);

  const handleSubmit = () => {
    if (!currentStationId || !handoffStationId) {
      Alert.alert('Error', 'Please select both stations.');
      return;
    }
    if (currentStationId === handoffStationId) {
      Alert.alert('Error', 'Current and handoff stations cannot be the same.');
      return;
    }
    
    // In a real app, validate that handoff is actually after current based on direction
    const priceNum = ENABLE_PAYMENTS && price ? parseInt(price, 10) : undefined;
    offerSeat(direction, currentStationId, handoffStationId, priceNum);
    Alert.alert('Success', 'Your seat opportunity is now active!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  // Simple dropdown alternative for MVP since react-native-picker requires native modules sometimes
  // We'll just map a few stations to buttons for the demo
  const displayStations = STATIONS.filter(s => 
    direction === 'Northbound' ? s.sequence % 3 === 0 || s.sequence === 1 || s.sequence === 20 : true
  ).slice(0, 5); // Just picking a subset for easy selection in demo

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>1. Traveling Direction</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.toggleBtn, direction === 'Northbound' && styles.toggleBtnActive]}
          onPress={() => setDirection('Northbound')}
        >
          <Text style={[styles.toggleText, direction === 'Northbound' && styles.toggleTextActive]}>Northbound</Text>
          <Text style={styles.smallText}>(Towards Mahatma Mandir)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toggleBtn, direction === 'Southbound' && styles.toggleBtnActive]}
          onPress={() => setDirection('Southbound')}
        >
          <Text style={[styles.toggleText, direction === 'Southbound' && styles.toggleTextActive]}>Southbound</Text>
          <Text style={styles.smallText}>(Towards Motera Stadium)</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>2. Where are you now?</Text>
      <View style={styles.grid}>
        {STATIONS.filter(s => s.sequence % 4 === 1).map(station => (
          <TouchableOpacity 
            key={`curr-${station.id}`} 
            style={[styles.stationBtn, currentStationId === station.id && styles.stationBtnActive]}
            onPress={() => setCurrentStationId(station.id)}
          >
            <Text style={[styles.stationText, currentStationId === station.id && styles.stationTextActive]}>{station.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>3. Where will you vacate the seat?</Text>
      <View style={styles.grid}>
        {displayStations.map(station => (
          <TouchableOpacity 
            key={`hand-${station.id}`} 
            style={[styles.stationBtn, handoffStationId === station.id && styles.stationBtnActive]}
            onPress={() => setHandoffStationId(station.id)}
          >
            <Text style={[styles.stationText, handoffStationId === station.id && styles.stationTextActive]}>{station.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {ENABLE_PAYMENTS && (
        <>
          <Text style={styles.label}>4. Requested Amount (₹)</Text>
          <TextInput 
            style={styles.input}
            keyboardType="number-pad"
            placeholder="e.g. 20"
            value={price}
            onChangeText={setPrice}
          />
        </>
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>Offer Seat Opportunity</Text>
      </TouchableOpacity>
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#333' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: { 
    flex: 1, padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, alignItems: 'center' 
  },
  toggleBtnActive: { backgroundColor: '#FF8200', borderColor: '#FF8200' },
  toggleText: { fontWeight: 'bold', color: '#555' },
  toggleTextActive: { color: '#fff' },
  smallText: { fontSize: 10, color: '#888', marginTop: 4, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stationBtn: { 
    paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 16 
  },
  stationBtnActive: { backgroundColor: '#0056b3', borderColor: '#0056b3' },
  stationText: { color: '#333' },
  stationTextActive: { color: '#fff' },
  submitBtn: { 
    backgroundColor: '#28a745', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 40 
  },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16 }
});
