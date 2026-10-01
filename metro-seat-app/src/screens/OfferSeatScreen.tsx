import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { notify } from '../utils/dialog';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { STATIONS, isStationAfter } from '../data/stations';
import { ENABLE_PAYMENTS } from '../config/flags';
import { useAppStore } from '../store/mockStore';
import { Direction } from '../types';
import SelectModal from '../components/SelectModal';
import { getTrainsByDirection } from '../data/timetable';
import { translations } from '../i18n';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OfferSeat'>;
};

export default function OfferSeatScreen({ navigation }: Props) {
  const [direction, setDirection] = useState<Direction>('Northbound');
  const [currentStationId, setCurrentStationId] = useState<string>('');
  const [handoffStationId, setHandoffStationId] = useState<string>('');
  const [trainId, setTrainId] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  
  const offerSeat = useAppStore(state => state.offerSeat);
  const lang = useAppStore(state => state.language);
  const t = translations[lang];

  const handleSubmit = async () => {
    if (!currentStationId || !handoffStationId || !trainId) {
      await notify('Error', 'Please select a train and both stations.');
      return;
    }
    if (currentStationId === handoffStationId) {
      await notify('Error', 'Current and handoff stations cannot be the same.');
      return;
    }
    
    if (ENABLE_PAYMENTS && !price.trim()) {
      await notify('Error', 'Please enter a requested amount.');
      return;
    }
    
    if (!isStationAfter(handoffStationId, currentStationId, direction)) {
      await notify('Error', 'Handoff station must be AFTER your current station in the chosen direction.');
      return;
    }
    
    const priceNum = ENABLE_PAYMENTS && price ? parseInt(price, 10) : undefined;
    offerSeat(direction, currentStationId, handoffStationId, priceNum, trainId);
    
    await notify('Success', 'Your seat opportunity is now active!');
    navigation.goBack();
  };

  const stationItems = useMemo(() => {
    // Show stations based on direction order
    const ordered = [...STATIONS].sort((a, b) => 
      direction === 'Northbound' ? a.sequence - b.sequence : b.sequence - a.sequence
    );
    return ordered.map(s => ({ label: s.name, value: s.id }));
  }, [direction]);

  const trainItems = useMemo(() => getTrainsByDirection(direction), [direction]);

  const handleDirectionChange = (newDir: Direction) => {
    setDirection(newDir);
    setCurrentStationId('');
    setHandoffStationId('');
    setTrainId('');
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
        label={`2. ${t.expectedTrain}`}
        items={trainItems}
        selectedValue={trainId}
        onSelect={setTrainId}
        placeholder={t.expectedTrain + "..."}
      />

      <SelectModal 
        label={`3. ${t.whereAreYou}`}
        items={stationItems}
        selectedValue={currentStationId}
        onSelect={setCurrentStationId}
        placeholder={t.whereAreYou}
      />

      <SelectModal 
        label={`4. ${t.whereVacate}`}
        items={stationItems}
        selectedValue={handoffStationId}
        onSelect={setHandoffStationId}
        placeholder={t.whereVacate}
      />

      {ENABLE_PAYMENTS && (
        <View style={styles.priceContainer}>
          <Text style={styles.label}>5. {t.amount}</Text>
          <TextInput 
            style={styles.input}
            keyboardType="number-pad"
            maxLength={3}
            placeholder="e.g. 20"
            value={price}
            onChangeText={t => setPrice(t.replace(/\D/g, ''))}
          />
        </View>
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>{t.offerSeat}</Text>
      </TouchableOpacity>
      <View style={{height: 40}} />
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
  priceContainer: { marginTop: 10 },
  submitBtn: { 
    backgroundColor: '#28a745', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 30 
  },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16 }
});
