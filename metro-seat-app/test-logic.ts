import { useAppStore } from './src/store/mockStore';
import { isStationAfter } from './src/data/stations';
import assert from 'assert';

console.log('Testing station sequence logic...');
assert.strictEqual(isStationAfter('jivraj-park', 'apmc', 'Northbound'), true, 'jivraj-park is after apmc Northbound');
assert.strictEqual(isStationAfter('apmc', 'jivraj-park', 'Northbound'), false, 'apmc is not after jivraj-park Northbound');
assert.strictEqual(isStationAfter('apmc', 'jivraj-park', 'Southbound'), true, 'apmc is after jivraj-park Southbound');
assert.strictEqual(isStationAfter('jivraj-park', 'apmc', 'Southbound'), false, 'jivraj-park is not after apmc Southbound');

console.log('Testing matching logic...');
// Get initial state
const state = useAppStore.getState();

// Opp 1 is at motera-stadium, handoff at gnlu, Northbound
// Opp 2 is at narmada-canal, handoff at sachivalaya, Northbound

// Seeker at koteshwar-road, going to mahatma-mandir, Northbound
let compatible = state.getCompatibleOpportunities('koteshwar-road', 'mahatma-mandir', 'Northbound');
assert.strictEqual(compatible.length, 2, 'Should find both opportunities');

// Seeker at raysan, going to mahatma-mandir, Northbound
compatible = state.getCompatibleOpportunities('raysan', 'mahatma-mandir', 'Northbound');
assert.strictEqual(compatible.length, 1, 'Should find only Opp 2');
assert.strictEqual(compatible[0].id, 'opp2');

// Seeker at koteshwar-road, going to koba-gam, Northbound
compatible = state.getCompatibleOpportunities('koteshwar-road', 'koba-gam', 'Northbound');
assert.strictEqual(compatible.length, 0, 'Should find no opportunities');

console.log('Testing active match limits...');
state.requestSeat('opp2', 'seeker1');
const activeMatch = state.getActiveMatchForUser('seeker1');
assert.ok(activeMatch, 'Seeker should have active match');
assert.strictEqual(activeMatch.status, 'PENDING');

console.log('All tests passed!');
