export type MemberRole = 'BUYER' | 'MANAGER';

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
  brandName: string;
  thumbnailUrl1?: string;
  thumbnailUrl2?: string;
  thumbnailUrl3?: string;
  detailUrl1?: string;
  detailUrl2?: string;
  detailUrl3?: string;
}

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderNo: string;
  memberId: number;
  status: string;
  shippingAddress: string;
  shippingZipCode: string;
  createdAt: string;
  items: OrderItem[];
}
