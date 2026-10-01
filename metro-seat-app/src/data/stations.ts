import { Station, Direction } from '../types';
import gmrcData from './gmrc-network.json';

// For the MVP demo, we will use the Red+Yellow through service (APMC to Mahatma Mandir)
const ryPattern = gmrcData.service_patterns.find(p => p.id === 'RY-MM');

if (!ryPattern) throw new Error('RY-MM service pattern not found');

function parseStatus(status: string | undefined): 'operational' | 'under_construction' | 'planned' {
  if (status === 'operational' || status === 'under_construction' || status === 'planned') {
    return status;
  }
  throw new Error(`Unknown station status: ${status}`);
}

// Map JSON stations into our simple array format, maintaining sequence based on RY-MM
export const STATIONS: Station[] = ryPattern.stops.map((stationId, index) => {
  const stationData = gmrcData.stations.find(s => s.id === stationId);
  return {
    id: stationId,
    name: stationData?.name || stationId,
    sequence: index + 1, // 1 to N
    status: parseStatus(stationData?.status),
  };
}).filter(s => s.status === 'operational');

export const getStationById = (id: string) => STATIONS.find(s => s.id === id);


