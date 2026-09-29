import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { STATIONS } from '../data/stations';
import { Direction } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FindSeat'>;
};

export default function FindSeatScreen({ navigation }: Props) {
  const [direction, setDirection] = useState<Direction>('Northbound');
  const [currentStationId, setCurrentStationId] = useState<string>('');
  const [destinationStationId, setDestinationStationId] = useState<string>('');
  
  const handleSearch = () => {
    if (!currentStationId || !destinationStationId) {
      Alert.alert('Error', 'Please select both stations.');
      return;
    }
    navigation.navigate('OpportunityList', {
      currentStationId,
      destinationStationId,
      direction
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>1. Traveling Direction</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.toggleBtn, direction === 'Northbound' && styles.toggleBtnActive]}
          onPress={() => setDirection('Northbound')}
        >
          <Text style={[styles.toggleText, direction === 'Northbound' && styles.toggleTextActive]}>Northbound</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toggleBtn, direction === 'Southbound' && styles.toggleBtnActive]}
          onPress={() => setDirection('Southbound')}
        >
          <Text style={[styles.toggleText, direction === 'Southbound' && styles.toggleTextActive]}>Southbound</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>2. Current Station</Text>
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

      <Text style={styles.label}>3. Destination Station</Text>
      <View style={styles.grid}>
        {STATIONS.filter(s => s.sequence > 10).map(station => (
          <TouchableOpacity 
            key={`dest-${station.id}`} 
            style={[styles.stationBtn, destinationStationId === station.id && styles.stationBtnActive]}
            onPress={() => setDestinationStationId(station.id)}
          >
            <Text style={[styles.stationText, destinationStationId === station.id && styles.stationTextActive]}>{station.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSearch}>
        <Text style={styles.submitBtnText}>Find Available Seats</Text>
      </TouchableOpacity>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stationBtn: { 
    paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 16 
  },
  stationBtnActive: { backgroundColor: '#0056b3', borderColor: '#0056b3' },
  stationText: { color: '#333' },
  stationTextActive: { color: '#fff' },
  submitBtn: { 
    backgroundColor: '#0056b3', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 40 
  },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
