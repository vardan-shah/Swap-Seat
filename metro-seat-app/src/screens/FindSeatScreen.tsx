import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { notify } from '../utils/dialog';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { STATIONS } from '../data/stations';
import { isLegValid } from '../domain/route';
import { Direction } from '../types';
import SelectModal from '../components/SelectModal';
import { useAppStore } from '../store/mockStore';
import { translations } from '../i18n';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FindSeat'>;
};

export default function FindSeatScreen({ navigation }: Props) {
  const [direction, setDirection] = useState<Direction>('Northbound');
  const [currentStationId, setCurrentStationId] = useState<string>('');
  const [destinationStationId, setDestinationStationId] = useState<string>('');
  
  const lang = useAppStore(state => state.language);
  const t = translations[lang];

  const handleSearch = async () => {
    if (!currentStationId || !destinationStationId) {
      await notify('Error', 'Please select both stations.');
      return;
    }

    if (!isLegValid(destinationStationId, currentStationId, direction)) {
      await notify('Error', 'Destination must be AFTER your current station in the chosen direction.');
      return;
    }

    navigation.navigate('OpportunityList', {
      currentStationId,
      destinationStationId,
      direction
    });
  };

  const stationItems = useMemo(() => {
    const ordered = [...STATIONS].sort((a, b) => 
      direction === 'Northbound' ? a.sequence - b.sequence : b.sequence - a.sequence
    );
    return ordered.map(s => ({ label: s.name, value: s.id }));
  }, [direction]);

  const handleDirectionChange = (newDir: Direction) => {
    setDirection(newDir);
    setCurrentStationId('');
    setDestinationStationId('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>1. {t.travelingDir}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.toggleBtn, direction === 'Northbound' && styles.toggleBtnActive]}
          onPress={() => handleDirectionChange('Northbound')}
        >
          <Text style={[styles.toggleText, direction === 'Northbound' && styles.toggleTextActive]}>Northbound</Text>
          <Text style={styles.smallText}>(Towards Mahatma Mandir)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toggleBtn, direction === 'Southbound' && styles.toggleBtnActive]}
          onPress={() => handleDirectionChange('Southbound')}
        >
          <Text style={[styles.toggleText, direction === 'Southbound' && styles.toggleTextActive]}>Southbound</Text>
          <Text style={styles.smallText}>(Towards APMC)</Text>
        </TouchableOpacity>
      </View>

      <SelectModal 
        label={`2. ${t.whereAreYou}`}
        items={stationItems}
        selectedValue={currentStationId}
        onSelect={setCurrentStationId}
        placeholder={t.whereAreYou}
      />

      <SelectModal 
        label={`3. ${t.destStation}`}
        items={stationItems}
        selectedValue={destinationStationId}
        onSelect={setDestinationStationId}
        placeholder={t.destStation}
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSearch}>
        <Text style={styles.submitBtnText}>{t.findAvailable}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#333' },
  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  toggleBtn: { 
    flex: 1, padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, alignItems: 'center' 
  },
  toggleBtnActive: { backgroundColor: '#FF8200', borderColor: '#FF8200' },
  toggleText: { fontWeight: 'bold', color: '#555' },
  toggleTextActive: { color: '#fff' },
  smallText: { fontSize: 10, color: '#888', marginTop: 4, textAlign: 'center' },
  submitBtn: { 
    backgroundColor: '#0056b3', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 30 
  },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
