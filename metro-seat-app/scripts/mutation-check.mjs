import fs from 'fs';
import { execSync } from 'child_process';

const STORE_FILE = 'src/store/mockStore.ts';
const originalStore = fs.readFileSync(STORE_FILE, 'utf8');

function restoreStore() {
  try {
    fs.writeFileSync(STORE_FILE, originalStore);
  } catch (e) {}
}

process.on('exit', restoreStore);
process.on('SIGINT', () => { restoreStore(); process.exit(); });
process.on('uncaughtException', (err) => { restoreStore(); console.error(err); process.exit(1); });

const mutations = [
  {
    name: "delete the servesLeg line",
    pattern: /if \(\!servesLeg\(train, currentStationId, destinationStationId\)\) return false;/,
    replacement: "if (false) console.log(servesLeg);"
  },
  {
    name: "delete the boardingStillAhead line",
    pattern: /if \(\!boardingStillAhead\(train, currentStationId, now\)\) return false;/,
    replacement: "if (false) console.log(boardingStillAhead);"
  },
  {
    name: "handoffBeforeDest = true",
    pattern: /const handoffBeforeDest = isLegValid\(\s*opp\.handoffStationId,\s*destinationStationId,\s*direction,?\s*\);/,
    replacement: "const handoffBeforeDest = true;"
  },
  {
    name: "handoffAfterCurrent = true",
    pattern: /const handoffAfterCurrent =[\s\S]*?direction,?\s*\);/,
    replacement: "const handoffAfterCurrent = true;"
  },
  {
    name: "delete the own-offer line",
    pattern: /if \(opp\.giverId === state\.currentUser\.id\) return false;/,
    replacement: "// deleted own-offer line"
  },
  {
    name: "delete the now > expiresAt line",
    pattern: /if \(now > opp\.expiresAt\) return false;/,
    replacement: "// deleted expiresAt line"
  },
  {
    name: "delete PRIORITY check",
    pattern: /if \(seatType === 'PRIORITY'\) \{\s*return \{ ok: false, reason: 'PRIORITY_SEAT' \};\s*\}/,
    replacement: "if (false) console.log(seatType);",
    testFile: 'src/store/__tests__/mockStore.test.ts',
    testName: "rejects PRIORITY seats with PRIORITY_SEAT"
  },
  {
    name: "delete coach range check",
    pattern: /if \(\!Number\.isInteger\(coach\) \|\| coach < 1 \|\| coach > COACHES_PER_TRAIN\) \{\s*return \{ ok: false, reason: 'INVALID_COACH' \};\s*\}/,
    replacement: "if (false) console.log(coach);",
    testFile: 'src/store/__tests__/mockStore.test.ts',
    testName: "rejects coach outside 1..COACHES_PER_TRAIN with INVALID_COACH"
  },
  {
    name: "delete requestSeat unknown station check",
    pattern: /if \(\!STATIONS\.find\(s => s\.id === seekerBoardingStationId\)\) \{\s*return \{ ok: false, reason: 'INVALID_STATIONS' \};\s*\}/,
    replacement: "if (false) console.log(seekerBoardingStationId);",
    testFile: 'src/store/__tests__/mockStore.test.ts',
    testName: "rejects unknown station with INVALID_STATIONS"
  },
  {
    name: "delete requestSeat handoff reachable check",
    pattern: /if \(\!isHandoffReachable\(seekerBoardingStationId, opp\.handoffStationId, opp\.direction\)\) \{\s*return \{ ok: false, reason: 'INVALID_STATIONS' \};\s*\}/,
    replacement: "if (false) console.log(isHandoffReachable);",
    testFile: 'src/store/__tests__/mockStore.test.ts',
    testName: "rejects handoff before boarding with INVALID_STATIONS"
  },
  {
    name: "delete requestSeat servesLeg check",
    pattern: /if \(\!train \|\| \!servesLeg\(train, seekerBoardingStationId, opp\.handoffStationId\)\) \{\s*return \{ ok: false, reason: 'TRAIN_NOT_ON_LEG' \};\s*\}/,
    replacement: "if (false) console.log(servesLeg);",
    testFile: 'src/store/__tests__/mockStore.test.ts',
    testName: "rejects train not serving leg with TRAIN_NOT_ON_LEG"
  },
  {
    name: "delete requestSeat boardingStillAhead check",
    pattern: /if \(\!boardingStillAhead\(train, seekerBoardingStationId, clockNow\(\)\)\) \{\s*return \{ ok: false, reason: 'TRAIN_NOT_RUNNING' \};\s*\}/,
    replacement: "if (false) console.log(boardingStillAhead);",
    testFile: 'src/store/__tests__/mockStore.test.ts',
    testName: "rejects train already passed with TRAIN_NOT_RUNNING"
  }
];

console.log("| Mutation | Status | Failed Test |");
console.log("|---|---|---|");

let hasErrors = false;

for (const mut of mutations) {
  try {
    const mutatedCode = originalStore.replace(mut.pattern, mut.replacement);
    
    if (mutatedCode === originalStore) {
      console.log(`| ${mut.name} | SKIP | Pattern not found |`);
      hasErrors = true;
      continue;
    }
    fs.writeFileSync(STORE_FILE, mutatedCode);
    
    try {
      const filter = mut.testFile ? `${mut.testFile} -t "${mut.testName}"` : 'src/store -t "getCompatibleOpportunities"';
      execSync(`npx jest ${filter} --silent`, { stdio: 'pipe' });
      console.log(`| ${mut.name} | FAIL | No tests failed! |`);
      hasErrors = true;
    } catch (e) {
      if (mut.testFile) {
         console.log(`| ${mut.name} | PASS | ${mut.testName} |`);
      } else {
         const output = e.stderr ? e.stderr.toString() : '';
         const matches = [...output.matchAll(/● mockStore › getCompatibleOpportunities › (.*)/g)];
         if (matches.length > 0) {
           const failedTests = matches.map(m => m[1].trim()).join(' AND ');
           console.log(`| ${mut.name} | PASS | ${failedTests} |`);
         } else {
           console.log(`| ${mut.name} | FAIL | Unknown test failed |`);
           hasErrors = true;
         }
      }
    }
  } finally {
    restoreStore();
  }
}

if (hasErrors) {
  process.exitCode = 1;
}
