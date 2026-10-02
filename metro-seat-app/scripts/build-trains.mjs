import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawDataPath = path.join(__dirname, '../src/data/raw/timetable-2026-05-18.txt');
const outPath = path.join(__dirname, '../src/data/trains.json');

const data = fs.readFileSync(rawDataPath, 'utf8');

const result = [];
const giftNbRows = [2, 5, 7, 11, 27, 30, 34, 37];
const giftSbRows = [3, 5, 7, 11, 27, 30, 34, 37];

const nbRyMmStations = ["apmc", "old-high-court", "motera-stadium", "koteshwar-road", "gnlu", "infocity", "sachivalaya", "mahatma-mandir"];
const nbGiftStations = ["apmc", "old-high-court", "motera-stadium", "koteshwar-road", "gnlu", "gift-city"];

const sbRyMmStations = [...nbRyMmStations].reverse();
const sbGiftStations = [...nbGiftStations].reverse();

data.trim().split('\n').forEach(line => {
  const t = line.trim().split(' ');
  const row = parseInt(t[0], 10);
  if (isNaN(row)) return;
  
  const isGiftNb = giftNbRows.includes(row);
  const isGiftSb = giftSbRows.includes(row);

  const nbLen = isGiftNb ? 6 : 8;
  const nbTimes = t.slice(1, 1 + nbLen);
  const sbTimes = t.slice(1 + nbLen);

  const nbStations = isGiftNb ? nbGiftStations : nbRyMmStations;
  const sbStations = isGiftSb ? sbGiftStations : sbRyMmStations;

  const nbTimesMap = {};
  nbStations.forEach((st, i) => { nbTimesMap[st] = nbTimes[i]; });

  const sbTimesMap = {};
  sbStations.forEach((st, i) => { sbTimesMap[st] = sbTimes[i]; });

  result.push({
    id: `NB-${nbTimes[0].replace(':','')}-${isGiftNb ? 'RYVGIFT' : 'RYMM'}`,
    direction: 'Northbound',
    pattern: isGiftNb ? 'RYV-GIFT' : 'RY-MM',
    times: nbTimesMap
  });

  result.push({
    id: `SB-${sbTimes[0].replace(':','')}-${isGiftSb ? 'RYVGIFT' : 'RYMM'}`,
    direction: 'Southbound',
    pattern: isGiftSb ? 'RYV-GIFT' : 'RY-MM',
    times: sbTimesMap
  });
});

fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
console.log('trains.json generated.');
