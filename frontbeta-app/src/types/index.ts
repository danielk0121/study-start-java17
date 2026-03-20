export type MemberRole = 'BUYER' | 'SELLER';

export interface Member {
  id: number;
  email: string;
  name: string;
  role: MemberRole;
}

export interface Address {
  id: number;
  nickname: string;
  address: string;
  zipCode: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  sellerId: number;
  sellerName: string;
  brandName?: string;
  brandThumbnailUrl?: string;
  thumbnailUrl1?: string;
  thumbnailUrl2?: string;
  thumbnailUrl3?: string;
  detailUrl1?: string;
  detailUrl2?: string;
  detailUrl3?: string;
  salesCount: number;
}

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface OrderStatusHistory {
  id: number;
  status: string;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNo: string;
  memberId: number;
  status: string;
  shippingNickname?: string;
  shippingAddress: string;
  shippingZipCode: string;
  shippingCost: number;
  createdAt: string;
  items: OrderItem[];
}
