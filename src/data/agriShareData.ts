export interface Equipment {
  id: string;
  nameKey?: string;
  rawName?: string;
  typeKey: string;
  pricePerDay: number;
  ownerName: string;
  contactNumber: string;
  locationName: string;
  // Optional GPS for "detect location" feature.
  locationLatitude?: number;
  locationLongitude?: number;
  distanceKm: number;
  imageUrl: string;
  descriptionKey?: string;
  rawDescription?: string;
}

export const mockEquipments: Equipment[] = [
  {
    id: 'eq1',
    nameKey: 'agriShare.items.tractor.name',
    typeKey: 'agriShare.types.vehicle',
    pricePerDay: 1500,
    ownerName: 'Ramesh Patil',
    contactNumber: '+919876543210',
    locationName: 'Sangli, Maharashtra',
    distanceKm: 2.5,
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f23f66ee155?auto=format&fit=crop&q=80&w=800',
    descriptionKey: 'agriShare.items.tractor.desc',
  },
  {
    id: 'eq2',
    nameKey: 'agriShare.items.harvester.name',
    typeKey: 'agriShare.types.heavy',
    pricePerDay: 4000,
    ownerName: 'Suresh Kumar',
    contactNumber: '+918765432109',
    locationName: 'Solapur, Maharashtra',
    distanceKm: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1628131336906-8d11634ab92d?auto=format&fit=crop&q=80&w=800',
    descriptionKey: 'agriShare.items.harvester.desc',
  },
  {
    id: 'eq3',
    nameKey: 'agriShare.items.tiller.name',
    typeKey: 'agriShare.types.tool',
    pricePerDay: 800,
    ownerName: 'Ganesh More',
    contactNumber: '+917654321098',
    locationName: 'Kolhapur, Maharashtra',
    distanceKm: 1.2,
    imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800',
    descriptionKey: 'agriShare.items.tiller.desc',
  },
  {
    id: 'eq4',
    nameKey: 'agriShare.items.sprayer.name',
    typeKey: 'agriShare.types.tool',
    pricePerDay: 300,
    ownerName: 'Vinayak Deshmukh',
    contactNumber: '+916543210987',
    locationName: 'Miraj, Maharashtra',
    distanceKm: 3.8,
    imageUrl: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&q=80&w=800',
    descriptionKey: 'agriShare.items.sprayer.desc',
  },
];
