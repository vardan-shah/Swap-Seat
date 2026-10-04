import data from './trains.json';
import { Train } from '../domain/trains';

export const trains: Train[] = data as unknown as Train[];
