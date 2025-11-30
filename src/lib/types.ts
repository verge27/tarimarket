export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  priceXmr: number;
  category: string;
  images: string[];
  stock: number;
  shippingPriceXmr: number;
  status: 'active' | 'sold_out' | 'draft';
}

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalXmr: number;
  status: 'pending_payment' | 'paid' | 'shipped' | 'completed';
  createdAt: string;
}

export interface User {
  id: string;
  displayName: string;
  xmrAddress: string;
}
