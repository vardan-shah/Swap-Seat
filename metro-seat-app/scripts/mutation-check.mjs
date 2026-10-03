import fs from 'fs';
import { execSync } from 'child_process';

const STORE_FILE = 'src/store/mockStore.ts';
const originalStore = fs.readFileSync(STORE_FILE, 'utf8');

const mutations = [
  {
    name: "delete the servesLeg line",
    pattern: "if (!servesLeg(train, currentStationId, destinationStationId)) return false;",
    replacement: "if (false) console.log(servesLeg);"
  },
  {
    name: "delete the boardingStillAhead line",
    pattern: "if (!boardingStillAhead(train, currentStationId, now)) return false;",
    replacement: "if (false) console.log(boardingStillAhead);"
  },
  {
    name: "handoffBeforeDest = true",
    pattern: "const handoffBeforeDest = isLegValid(opp.handoffStationId, destinationStationId, direction);",
    replacement: "const handoffBeforeDest = true;"
  },
  {
    name: "handoffAfterCurrent = true",
    pattern: "      const handoffAfterCurrent =\n        opp.handoffStationId === currentStationId ||\n        isLegValid(currentStationId, opp.handoffStationId, direction);",
    replacement: "      const handoffAfterCurrent = true;"
  },
  {
    name: "delete the own-offer line",
    pattern: "if (opp.giverId === state.currentUser.id) return false;",
    replacement: "// deleted own-offer line"
  },
  {
    name: "delete the now > expiresAt line",
    pattern: "if (now > opp.expiresAt) return false;",
    replacement: "// deleted expiresAt line"
  }
];

console.log("| Mutation | Status | Failed Test |");
console.log("|---|---|---|");

for (const mut of mutations) {
  try {
    let mutatedCode = originalStore.replace(mut.pattern, mut.replacement);
    
    if (mut.name === "handoffAfterCurrent = true" && mutatedCode === originalStore) {
      mutatedCode = originalStore.replace(/const handoffAfterCurrent =[\s\S]*?direction\);/, "const handoffAfterCurrent = true;");
    }

    if (mutatedCode === originalStore) {
      console.log(`| ${mut.name} | SKIP | Pattern not found |`);
      continue;
    }
    fs.writeFileSync(STORE_FILE, mutatedCode);
    
    try {
      execSync('npx jest src/store -t "getCompatibleOpportunities" --silent', { stdio: 'pipe' });
      console.log(`| ${mut.name} | FAIL | No tests failed! |`);
    } catch (e) {
      const output = e.stderr ? e.stderr.toString() : '';
      const matches = [...output.matchAll(/● mockStore › getCompatibleOpportunities › (.*)/g)];
      if (matches.length > 0) {
        const failedTests = matches.map(m => m[1].trim()).join(' AND ');
        console.log(`| ${mut.name} | PASS | ${failedTests} |`);
      } else {
        console.log(`| ${mut.name} | PASS | Unknown test failed |`);
      }
    }
  } finally {
    fs.writeFileSync(STORE_FILE, originalStore);
  }
}
