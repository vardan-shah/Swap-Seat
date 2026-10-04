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
      execSync('npx jest src/store -t "getCompatibleOpportunities" --silent', { stdio: 'pipe' });
      console.log(`| ${mut.name} | FAIL | No tests failed! |`);
      hasErrors = true;
    } catch (e) {
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
  } finally {
    restoreStore();
  }
}

if (hasErrors) {
  process.exitCode = 1;
}
