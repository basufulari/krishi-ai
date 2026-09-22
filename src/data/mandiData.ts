export interface MarketPrice {
  id: string;
  cropKey: string;
  marketKey: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number; // Value change since yesterday
  date: string;
}

export const mockMarketPrices: MarketPrice[] = [
  {
    id: 'm1',
    cropKey: 'crops.rice.label',
    marketKey: 'mandi.markets.sangli',
    minPrice: 2800,
    maxPrice: 3200,
    modalPrice: 3100,
    trend: 'up',
    trendValue: 120,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'm2',
    cropKey: 'crops.wheat.label',
    marketKey: 'mandi.markets.kolhapur',
    minPrice: 2100,
    maxPrice: 2500,
    modalPrice: 2450,
    trend: 'down',
    trendValue: 40,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'm3',
    cropKey: 'crops.tomato.label',
    marketKey: 'mandi.markets.pune',
    minPrice: 1200,
    maxPrice: 1800,
    modalPrice: 1500,
    trend: 'up',
    trendValue: 200,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'm4',
    cropKey: 'crops.cotton.label',
    marketKey: 'mandi.markets.solapur',
    minPrice: 6500,
    maxPrice: 7200,
    modalPrice: 6900,
    trend: 'stable',
    trendValue: 0,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'm5',
    cropKey: 'crops.potato.label',
    marketKey: 'mandi.markets.satara',
    minPrice: 1800,
    maxPrice: 2200,
    modalPrice: 2000,
    trend: 'down',
    trendValue: 50,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'm6',
    cropKey: 'crops.rice.label',
    marketKey: 'mandi.markets.pune',
    minPrice: 2900,
    maxPrice: 3400,
    modalPrice: 3200,
    trend: 'up',
    trendValue: 80,
    date: new Date().toISOString().split('T')[0],
  },
];
