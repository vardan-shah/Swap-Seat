import { Direction } from '../types';
import { STATIONS } from '../data/stations';

export function stationIndex(id: string): number {
  const index = STATIONS.findIndex(s => s.id === id);
  if (index === -1) throw new Error(`Unknown station: ${id}`);
  return index;
}

export function inferDirection(from: string, to: string): Direction | null {
  if (from === to) return null;
  return stationIndex(from) < stationIndex(to) ? 'Northbound' : 'Southbound';
}

export function isLegValid(from: string, to: string, dir: Direction): boolean {
  if (from === to) return false;
  return inferDirection(from, to) === dir;
}
