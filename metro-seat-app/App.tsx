import React, { useEffect } from 'react';
import AppNavigation from './src/navigation';
import { isStationAfter } from './src/data/stations';
import { useAppStore } from './src/store/mockStore';

export default function App() {
  useEffect(() => {
    // Run self-tests silently in the background (as requested by user)
    const runBackgroundTests = () => {
      console.log('--- Running Rules Self-Tests (Background) ---');
      let passed = 0;
      let total = 0;

      const assert = (name: string, condition: boolean) => {
        total++;
        if (condition) passed++;
        console.log(`[${condition ? 'PASS' : 'FAIL'}] ${name}`);
      };

      try {
        assert('Jivraj Park is after APMC (Northbound)', isStationAfter('jivraj-park', 'apmc', 'Northbound') === true);
        assert('APMC is NOT after Jivraj Park (Northbound)', isStationAfter('apmc', 'jivraj-park', 'Northbound') === false);
        assert('APMC is after Jivraj Park (Southbound)', isStationAfter('apmc', 'jivraj-park', 'Southbound') === true);

        const store = useAppStore.getState();
        const oppsNorth = store.getCompatibleOpportunities('koteshwar-road', 'mahatma-mandir', 'Northbound');
        assert('Store finds compatible opportunities Northbound', Array.isArray(oppsNorth));
        
        const oppsSouth = store.getCompatibleOpportunities('mahatma-mandir', 'gnlu', 'Southbound');
        assert('Store filters Southbound opportunities correctly', Array.isArray(oppsSouth));
        
        assert('Unopened Sabarmati Railway Station is excluded', !store.opportunities.some(o => o.handoffStationId === 'sabarmati-railway'));
        
        console.log(`--- Test Complete: ${passed}/${total} passing ---`);
      } catch (e) {
        console.error('Self-tests failed to execute', e);
      }
    };

    // Run them once on startup
    runBackgroundTests();
  }, []);

  return <AppNavigation />;
}
