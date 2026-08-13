import { seedIfEmpty } from './store.js';
import { seedFacilities, seedIncidents, seedBroadcasts } from './seedData.js';

export async function runSeed() {
  const facilities = await seedIfEmpty('facilities', seedFacilities);
  const incidents = await seedIfEmpty('incidents', seedIncidents);
  const broadcasts = await seedIfEmpty('broadcasts', seedBroadcasts);
  await seedIfEmpty('sos', []);
  await seedIfEmpty('family', []);
  return {
    facilities: facilities.length,
    incidents: incidents.length,
    broadcasts: broadcasts.length,
  };
}
