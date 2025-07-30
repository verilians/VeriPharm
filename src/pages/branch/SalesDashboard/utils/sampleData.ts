/**
 * Sample Data for Dashboard Testing
 * This file provides sample data to test dashboard functionality
 */

import type { 
  SalesData, 
  ProductPerformance, 
  CustomerData, 
  StockAlert, 
  CategoryPerformance, 
  PaymentMethodData 
} from '../types/dashboard';

// Generate sample sales trends data for specified number of days (default 7)
export const generateSampleSalesData = (days: number = 7): SalesData[] => {
  const data: SalesData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic sales data with some variation
    // Weekend days typically have lower sales
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseRevenue = isWeekend ? 30000 + Math.random() * 60000 : 50000 + Math.random() * 100000;
    const baseSales = isWeekend ? 3 + Math.floor(Math.random() * 12) : 5 + Math.floor(Math.random() * 20);
    
    data.push({
      date: date.toISOString().split('T')[0],
      sales: baseSales,
      revenue: Math.floor(baseRevenue),
      transactions: baseSales
    });
  }
  
  return data;
};

// Generate sample top products data
export const generateSampleProductsData = (): ProductPerformance[] => {
  const products = [
    'Paracetamol 500mg',
    'Amoxicillin 250mg',
    'Ibuprofen 400mg',
    'Vitamin C Tablets',
    'Cough Syrup',
    'Bandages',
    'Antiseptic Solution',
    'Blood Pressure Monitor',
    'Thermometer',
    'Face Masks'
  ];
  
  return products.map((name, index) => ({
    name,
    sales: Math.floor(50 + Math.random() * 200),
    revenue: Math.floor(10000 + Math.random() * 50000),
    stock: Math.floor(10 + Math.random() * 500)
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
};

// Generate sample customer data
export const generateSampleCustomersData = (): CustomerData[] => {
  const customers = [
    'John Doe',
    'Jane Smith',
    'Michael Johnson',
    'Sarah Wilson',
    'David Brown',
    'Emily Davis',
    'Robert Miller',
    'Lisa Anderson'
  ];
  
  return customers.map(name => ({
    name,
    total_spent: Math.floor(50000 + Math.random() * 200000),
    transactions: Math.floor(5 + Math.random() * 25),
    last_purchase: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  })).sort((a, b) => b.total_spent - a.total_spent).slice(0, 5);
};

// Generate sample stock alerts
export const generateSampleStockAlerts = (): StockAlert[] => {
  const products = [
    'Insulin Pens',
    'Antibiotics',
    'Pain Relievers',
    'Vitamins',
    'First Aid Supplies'
  ];
  
  return products.map(product_name => {
    const current_stock = Math.floor(Math.random() * 15);
    const min_stock_level = 10;
    
    return {
      product_name,
      current_stock,
      min_stock_level,
      alert_type: current_stock === 0 ? 'out_of_stock' : 'low_stock'
    } as StockAlert;
  }).filter(alert => alert.current_stock <= alert.min_stock_level);
};

// Generate sample category performance data
export const generateSampleCategoryData = (): CategoryPerformance[] => {
  const categories = [
    'Medications',
    'Health & Wellness',
    'Medical Devices',
    'First Aid',
    'Vitamins & Supplements'
  ];
  
  const categoryData = categories.map(name => ({
    name,
    sales: Math.floor(100 + Math.random() * 500),
    revenue: Math.floor(50000 + Math.random() * 200000),
    percentage: 0
  }));
  
  // Calculate percentages
  const totalRevenue = categoryData.reduce((sum, cat) => sum + cat.revenue, 0);
  return categoryData.map(cat => ({
    ...cat,
    percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0
  })).sort((a, b) => b.revenue - a.revenue);
};

// Generate sample payment methods data
export const generateSamplePaymentMethodsData = (): PaymentMethodData[] => {
  const methods = [
    { method: 'cash', weight: 0.4 },
    { method: 'mobile_money', weight: 0.35 },
    { method: 'card', weight: 0.2 },
    { method: 'bank_transfer', weight: 0.05 }
  ];
  
  const totalAmount = 500000 + Math.random() * 1000000;
  
  const paymentData = methods.map(({ method, weight }) => {
    const amount = Math.floor(totalAmount * weight * (0.8 + Math.random() * 0.4));
    const count = Math.floor(amount / (5000 + Math.random() * 15000));
    
    return {
      method,
      count,
      amount,
      percentage: 0
    };
  });
  
  // Calculate percentages
  const totalPaymentAmount = paymentData.reduce((sum, pm) => sum + pm.amount, 0);
  return paymentData.map(pm => ({
    ...pm,
    percentage: totalPaymentAmount > 0 ? (pm.amount / totalPaymentAmount) * 100 : 0
  }));
};

// Combined sample data generator
export const generateAllSampleData = () => ({
  salesTrends: generateSampleSalesData(),
  topProducts: generateSampleProductsData(),
  customers: generateSampleCustomersData(),
  stockAlerts: generateSampleStockAlerts(),
  categories: generateSampleCategoryData(),
  paymentMethods: generateSamplePaymentMethodsData()
});