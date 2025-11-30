import { Listing, Order, User } from './types';

export const DEMO_USERS: User[] = [
  {
    id: 'user1',
    displayName: 'CryptoArtisan',
    xmrAddress: '888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkRxbANsAnjyPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H'
  },
  {
    id: 'user2',
    displayName: 'PrivacyFirst',
    xmrAddress: '888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkRxbANsAnjyPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H'
  },
  {
    id: 'user3',
    displayName: 'TechAnon',
    xmrAddress: '888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkRxbANsAnjyPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H'
  }
];

export const DEMO_LISTINGS: Listing[] = [
  {
    id: 'listing1',
    sellerId: 'user1',
    title: 'Custom Leather Wallet',
    description: 'Handcrafted genuine leather wallet with RFID protection. Perfect for storing your cards securely. Made with premium Italian leather and includes multiple card slots.',
    priceXmr: 0.25,
    category: 'Physical',
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800'],
    stock: 5,
    shippingPriceXmr: 0.02,
    status: 'active'
  },
  {
    id: 'listing2',
    sellerId: 'user2',
    title: 'VPN Subscription 1 Year',
    description: 'Premium VPN service with no-logs policy. Unlimited bandwidth, 50+ countries, and 24/7 support. Perfect for maintaining your privacy online.',
    priceXmr: 0.15,
    category: 'Digital',
    images: ['https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800'],
    stock: 100,
    shippingPriceXmr: 0,
    status: 'active'
  },
  {
    id: 'listing3',
    sellerId: 'user1',
    title: 'Privacy Consultation 1hr',
    description: 'One-on-one privacy consultation with a security expert. Learn how to protect your digital footprint, secure your communications, and maintain anonymity online.',
    priceXmr: 0.3,
    category: 'Service',
    images: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'],
    stock: 10,
    shippingPriceXmr: 0,
    status: 'active'
  },
  {
    id: 'listing4',
    sellerId: 'user3',
    title: 'Mechanical Keyboard',
    description: 'Custom mechanical keyboard with Cherry MX switches. RGB backlight, aluminum case, and programmable keys. Perfect for privacy-focused professionals.',
    priceXmr: 0.85,
    category: 'Physical',
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=800'],
    stock: 3,
    shippingPriceXmr: 0.05,
    status: 'active'
  },
  {
    id: 'listing5',
    sellerId: 'user2',
    title: 'Digital Art Pack',
    description: 'Collection of 50 high-resolution digital artworks focused on privacy and cryptocurrency themes. Perfect for your projects or personal use.',
    priceXmr: 0.05,
    category: 'Digital',
    images: ['https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=800'],
    stock: 999,
    shippingPriceXmr: 0,
    status: 'active'
  },
  {
    id: 'listing6',
    sellerId: 'user3',
    title: 'Encrypted USB Drive 64GB',
    description: 'Hardware-encrypted USB drive with military-grade AES-256 encryption. Water and dust resistant. Perfect for storing sensitive data.',
    priceXmr: 0.18,
    category: 'Physical',
    images: ['https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=800'],
    stock: 8,
    shippingPriceXmr: 0.02,
    status: 'active'
  },
  {
    id: 'listing7',
    sellerId: 'user1',
    title: 'Privacy-Focused Phone Setup',
    description: 'Complete setup service for a privacy-focused mobile phone. Includes degoogled OS installation, secure apps configuration, and privacy training.',
    priceXmr: 0.45,
    category: 'Service',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
    stock: 5,
    shippingPriceXmr: 0,
    status: 'active'
  },
  {
    id: 'listing8',
    sellerId: 'user2',
    title: 'Cryptocurrency Trading Course',
    description: 'Comprehensive video course on anonymous cryptocurrency trading. Learn best practices, privacy tools, and trading strategies. 10+ hours of content.',
    priceXmr: 0.22,
    category: 'Digital',
    images: ['https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800'],
    stock: 999,
    shippingPriceXmr: 0,
    status: 'active'
  }
];

// LocalStorage helpers
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

export const getListings = (): Listing[] => {
  const listingsStr = localStorage.getItem('listings');
  if (!listingsStr) {
    localStorage.setItem('listings', JSON.stringify(DEMO_LISTINGS));
    return DEMO_LISTINGS;
  }
  return JSON.parse(listingsStr);
};

export const getListing = (id: string): Listing | undefined => {
  return getListings().find(l => l.id === id);
};

export const addListing = (listing: Listing): void => {
  const listings = getListings();
  listings.push(listing);
  localStorage.setItem('listings', JSON.stringify(listings));
};

export const updateListing = (id: string, updates: Partial<Listing>): void => {
  const listings = getListings();
  const index = listings.findIndex(l => l.id === id);
  if (index !== -1) {
    listings[index] = { ...listings[index], ...updates };
    localStorage.setItem('listings', JSON.stringify(listings));
  }
};

export const getOrders = (): Order[] => {
  const ordersStr = localStorage.getItem('orders');
  return ordersStr ? JSON.parse(ordersStr) : [];
};

export const getOrder = (id: string): Order | undefined => {
  return getOrders().find(o => o.id === id);
};

export const addOrder = (order: Order): void => {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
};

export const updateOrder = (id: string, updates: Partial<Order>): void => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates };
    localStorage.setItem('orders', JSON.stringify(orders));
  }
};
