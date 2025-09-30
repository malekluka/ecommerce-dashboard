export type Order = {
  _id: string;
  orderId: string;
  customer?: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    customerId?: string;
  };
  products: Array<{
    product: string | {
      _id: string;
      name: string;
      price: number;
      productId?: string;
    };
    quantity: number;
  }>;
  status: string;
  payment: string;
  total?: number;
  discount?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
};

export type Customer = {
  _id: string;
  customerId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export function getAnalyticsStats(orders: Order[], customers: Customer[]) {
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const orderCount = orders.length;
  
  // Revenue = total sales (since we don't track order-level cost)
  const revenue = totalSales;
  
  const customerCount = customers.length;
  return { totalSales, orderCount, revenue, customerCount };
}