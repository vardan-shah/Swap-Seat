import gmrcData from '../data/gmrc-network.json';
import { Direction } from '../types';

export interface Train {
  id: string;
  direction: Direction;
  pattern: string;
  times: Record<string, string>;
}

export function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}


export function getISTMinutes(nowMs: number): number {
  return (Math.floor(nowMs / 60000) + 330) % 1440; // UTC+5:30
}

function getStops(train: Train): string[] | null {
  const pattern = gmrcData.service_patterns.find(p => p.id === train.pattern);
  if (!pattern) return null;
  return train.direction === 'Southbound' ? [...pattern.stops].reverse() : pattern.stops;
}

export function timeAt(train: Train, stationId: string): { min: number, max: number } | null {
  const stops = getStops(train);
  if (!stops) return null;
  
  const targetIdx = stops.indexOf(stationId);
  if (targetIdx === -1) return null;

  // Exact timing point
  if (train.times[stationId]) {
    const t = toMinutes(train.times[stationId]);
    return { min: t - 2, max: t + 2 };
  }

  // Interpolation
  let prevIdx = -1;
  let nextIdx = -1;
  for (let i = targetIdx - 1; i >= 0; i--) {
    if (train.times[stops[i]]) { prevIdx = i; break; }
  }
  for (let i = targetIdx + 1; i < stops.length; i++) {
    if (train.times[stops[i]]) { nextIdx = i; break; }
  }

  if (prevIdx === -1 || nextIdx === -1) return null; // Should not happen in well-formed data

  const prevTime = toMinutes(train.times[stops[prevIdx]]);
  const nextTime = toMinutes(train.times[stops[nextIdx]]);
  
  const totalStops = nextIdx - prevIdx;
  const stopsFromPrev = targetIdx - prevIdx;
  
  const fraction = stopsFromPrev / totalStops;
  const exactTime = prevTime + (nextTime - prevTime) * fraction;

  return { 
    min: Math.floor(exactTime) - 2, 
    max: Math.ceil(exactTime) + 2 
  };
}

export function servesLeg(train: Train, fromId: string, toId: string): boolean {
  const stops = getStops(train);
  if (!stops) return false;
  
  const fromIdx = stops.indexOf(fromId);
  const toIdx = stops.indexOf(toId);
  
  return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
}

export function isRunning(train: Train, nowMs: number): boolean {
  const stops = getStops(train);
  if (!stops) return false;
  
  const firstStation = stops[0];
  const lastStation = stops[stops.length - 1];
  
  const firstTime = timeAt(train, firstStation);
  const lastTime = timeAt(train, lastStation);
  
  if (!firstTime || !lastTime) return false;
  
  const now = getISTMinutes(nowMs);
  return now >= firstTime.min && now <= lastTime.max;
}

export function handoffExpiry(train: Train, handoffStationId: string, nowMs: number): number | null {
  const t = timeAt(train, handoffStationId);
  if (!t) return null;

  const istNowMs = nowMs + 330 * 60000;
  const istMidnightMs = istNowMs - (istNowMs % 86400000);
  
  const expiryIstMs = istMidnightMs + t.max * 60000;
  return expiryIstMs - 330 * 60000;
}

export function trainsRunningNow(direction: Direction, fromId: string, toId: string, nowMs: number, allTrains: Train[]): Train[] {
  return allTrains.filter(t => {
    if (t.direction !== direction) return false;
    if (!servesLeg(t, fromId, toId)) return false;
    if (!isRunning(t, nowMs)) return false;
    
    const tAt = timeAt(t, fromId);
    if (!tAt) return false;
    
    return tAt.max >= getISTMinutes(nowMs);
  });
}
export function getTrainsByDirection(direction: Direction, allTrains: Train[]): { label: string, value: string }[] {
  return allTrains.filter(t => t.direction === direction).map(t => {
     const stops = getStops(t);
     const firstTime = stops ? t.times[stops[0]] : '?';
     const origin = direction === 'Northbound' ? 'APMC' : 'Gandhinagar';
     const gift = t.pattern === 'RYV-GIFT' ? ' (GIFT)' : '';
     return { label: `Train starting from ${origin} at ${firstTime}${gift}`, value: t.id };
  });
}

export function getTrainLabel(trainId: string, allTrains: Train[]): string {
  const t = allTrains.find(x => x.id === trainId);
  if (!t) return 'Unknown Train';
  const stops = getStops(t);
  const firstTime = stops ? t.times[stops[0]] : '?';
  const origin = t.direction === 'Northbound' ? 'APMC' : 'Gandhinagar';
  const gift = t.pattern === 'RYV-GIFT' ? ' (GIFT)' : '';
  return `Train starting from ${origin} at ${firstTime}${gift}`;
}
