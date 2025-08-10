export type Order = {
  createdAt: string | number | Date;
  _id: string;
  total?: number;
  cost?: number;
  orderId: string;
  status: string;
  payment: string
};

export type Customer = {
  _id: string;
};

export function getAnalyticsStats(orders: Order[], customers: Customer[]) {
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const orderCount = orders.length;
  const revenue = orders.reduce((sum, o) => sum + ((o.total || 0) - (o.cost || 0)), 0);
  const customerCount = customers.length;
  return { totalSales, orderCount, revenue, customerCount };
}
