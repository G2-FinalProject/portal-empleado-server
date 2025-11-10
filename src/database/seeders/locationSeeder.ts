import { Location } from '../../models/locationModel.js';

export async function seedLocations() {
  console.log('Seeding locations...');

  const locations = [
    { id: 1, location_name: 'Madrid' },
    { id: 2, location_name: 'Barcelona' },
    { id: 3, location_name: 'Pontevedra' },
  ];

  for (const location of locations) {
    await Location.findOrCreate({
      where: { id: location.id },
      defaults: location as any,
    });
  }

  console.log('Locations seeded successfully');
}