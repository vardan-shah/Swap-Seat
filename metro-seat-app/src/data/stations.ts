import { Station } from '../types';
import gmrcData from './gmrc-network.json';

// For the MVP demo, we will use the Red+Yellow through service (APMC to Mahatma Mandir)
const ryPattern = gmrcData.service_patterns.find(p => p.id === 'RY-MM');

if (!ryPattern) throw new Error('RY-MM service pattern not found');

// Map JSON stations into our simple array format, maintaining sequence based on RY-MM
export const STATIONS: Station[] = ryPattern.stops.map((stationId, index) => {
  const stationData = gmrcData.stations.find(s => s.id === stationId);
  return {
    id: stationId,
    name: stationData?.name || stationId,
    sequence: index + 1, // 1 to N
    status: (stationData?.status as 'operational' | 'under-construction' | 'planned') || 'operational',
  };
}).filter(s => s.status === 'operational');

export const getStationById = (id: string) => STATIONS.find(s => s.id === id);

// Northbound goes towards Mahatma Mandir (sequence increases)
// Southbound goes towards APMC (sequence decreases)
export const isStationAfter = (station1Id: string, station2Id: string, direction: 'Northbound' | 'Southbound') => {
  const s1 = getStationById(station1Id);
  const s2 = getStationById(station2Id);
  if (!s1 || !s2) return false;
  
  if (direction === 'Northbound') {
    return s1.sequence > s2.sequence;
  } else {
    return s1.sequence < s2.sequence;
  }
};

