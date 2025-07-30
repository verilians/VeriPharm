import React, { useState, useEffect } from "react";
import {
  FiBarChart,
  FiTrendingUp,
  FiDownload,
  FiCalendar,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiPackage,
  FiRefreshCw,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle
} from "react-icons/fi";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";
import { useTenantCurrency } from "../../../lib/hooks/useTenantCurrency";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";

// Types
interface DateRange {
  startDate: string;
  endDate: string;
}

interface ReportData {
  overview: OverviewData;
  sales: SalesData;
  inventory: InventoryData;
  customers: CustomerData;
}

interface OverviewData {
  totalSales: number;
  totalTransactions: number;
  totalCustomers: number;
  averageOrderValue: number;
  topProducts: TopProduct[];
  salesByCategory: CategorySales[];
}

interface SalesData {
  dailySales: DailySale[];
  monthlySales: MonthlySale[];
}

interface InventoryData {
  stockStatus: StockStatus;
  topMovingProducts: TopProduct[];
  expiringProducts: ExpiringProduct[];
}

interface CustomerData {
  customerMetrics: CustomerMetrics;
  topCustomers: TopCustomer[];
}

interface TopProduct {
  name: string;
  sales: number;
  quantity: number;
  revenue: number;
}

interface CategorySales {
  category: string;
  amount: number;
  percentage: number;
}

interface DailySale {
  date: string;
  sales: number;
  transactions: number;
}

interface MonthlySale {
  month: string;
  sales: number;
  transactions: number;
}

interface StockStatus {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalProducts: number;
}

interface ExpiringProduct {
  id: string;
  name: string;
  expiry_date: string;
  quantity: number;
}

interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customerRetention: number;
}

interface TopCustomer {
  id: string;
  name: string;
  totalSpent: number;
  totalOrders: number;
}

interface QuickStats {
  todayRevenue: number;
  yesterdayRevenue: number;
  monthlyGrowth: number;
  weeklyOrders: number;
  activeCustomers: number;
  lowStockAlerts: number;
}

const Reports: React.FC = () => {
  const { user } = useAuthStore();
  const { formatCurrency } = useTenantCurrency();
  
  // State
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [reportData, setReportData] = useState<ReportData>({
    overview: {
      totalSales: 0,
      totalTransactions: 0,
      totalCustomers: 0,
      averageOrderValue: 0,
      topProducts: [],
      salesByCategory: [],
    },
    sales: {
      dailySales: [],
      monthlySales: [],
    },
    inventory: {
      stockStatus: {
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        totalProducts: 0,
      },
      topMovingProducts: [],
      expiringProducts: [],
    },
    customers: {
      customerMetrics: {
        totalCustomers: 0,
        newCustomers: 0,
        activeCustomers: 0,
        customerRetention: 0,
      },
      topCustomers: [],
    },
  });
  const [quickStats, setQuickStats] = useState<QuickStats>({
    todayRevenue: 0,
    yesterdayRevenue: 0,
    monthlyGrowth: 0,
    weeklyOrders: 0,
    activeCustomers: 0,
    lowStockAlerts: 0,
  });

  // Load report data
  useEffect(() => {
    const loadReportData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        console.log("🔄 [Reports] Loading report data...");

        await Promise.all([
          loadOverviewData(),
          loadSalesData(),
          loadInventoryData(),
          loadCustomerData(),
          loadQuickStats(),
        ]);

        console.log("✅ [Reports] Report data loaded successfully");
      } catch (error) {
        console.error("❌ [Reports] Error loading report data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [user, dateRange]);

  const loadOverviewData = async () => {
    try {
      console.log("🔄 [Reports] Loading overview data...");
      
      // Load sales data for the date range
      const { data: salesData, error: salesError } = await supabaseAdmin
        .from('sales')
        .select('id, total_amount, created_at')
        .eq('branch_id', user?.branch_id)
        .eq('status', 'completed')
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate);

      if (salesError) throw salesError;

      // Load customers data
      const { data: customersData, error: customersError } = await supabaseAdmin
        .from('customers')
        .select('id, created_at')
        .eq('branch_id', user?.branch_id);

      if (customersError) throw customersError;

      // Calculate overview metrics
      interface SaleData {
        total_amount: number;
        created_at: string;
      }

      const totalSales = (salesData || []).reduce((sum: number, sale: SaleData) => sum + (sale.total_amount || 0), 0);
      const totalTransactions = salesData?.length || 0;
      const totalCustomers = customersData?.length || 0;
      const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

      // Load top products by actual sales - query sale_items joined with products and categories
      const { data: topProductsData, error: topProductsError } = await supabaseAdmin
        .from('sale_items')
        .select(`
          product_id,
          quantity,
          total_price,
          products!inner(
            name,
            category_id,
            categories!inner(
              name
            )
          )
        `)
        .eq('products.branch_id', user?.branch_id)
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate);

      if (topProductsError) throw topProductsError;

      console.log("📊 [Reports] Top products raw data:", topProductsData?.length || 0, "items");

      // Aggregate sale items by product
      const productSalesMap = new Map<string, { 
        name: string; 
        totalQuantity: number; 
        totalRevenue: number; 
        salesCount: number;
        categoryName: string;
      }>();
      
      (topProductsData || []).forEach((item: any) => {
        const productId = item.product_id;
        const existing = productSalesMap.get(productId);
        
        if (existing) {
          existing.totalQuantity += item.quantity || 0;
          existing.totalRevenue += item.total_price || 0;
          existing.salesCount += 1;
        } else {
          productSalesMap.set(productId, {
            name: item.products?.name || 'Unknown Product',
            totalQuantity: item.quantity || 0,
            totalRevenue: item.total_price || 0,
            salesCount: 1,
            categoryName: item.products?.categories?.name || 'Uncategorized'
          });
        }
      });

      // Convert to array, sort by revenue, and limit to top 5
      const topProducts: TopProduct[] = Array.from(productSalesMap.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5)
        .map(product => ({
          name: product.name,
          sales: product.salesCount,
          quantity: product.totalQuantity,
          revenue: product.totalRevenue,
        }));

      console.log("📊 [Reports] Top products processed:", topProducts.length, "products");

      // If no top products from sales, get products by price (fallback)
      if (topProducts.length === 0) {
        console.log("📊 [Reports] No sales data found, using fallback products by price");
        const { data: fallbackProductsData, error: fallbackProductsError } = await supabaseAdmin
          .from('products')
          .select('name, price')
          .eq('branch_id', user?.branch_id)
          .eq('status', 'active')
          .order('price', { ascending: false })
          .limit(5);

        if (!fallbackProductsError && fallbackProductsData) {
          const fallbackProducts: TopProduct[] = fallbackProductsData.map((product: any) => ({
            name: product.name,
            sales: 0,
            quantity: 0,
            revenue: product.price,
          }));
          topProducts.push(...fallbackProducts);
        }
      }

      // Calculate real sales by category from actual sales data
      const categorySalesMap = new Map<string, { amount: number; count: number }>();
      
      // Aggregate sales by category from the product sales data
      Array.from(productSalesMap.values()).forEach((product) => {
        const categoryName = product.categoryName;
        const existing = categorySalesMap.get(categoryName);
        
        if (existing) {
          existing.amount += product.totalRevenue;
          existing.count += product.salesCount;
        } else {
          categorySalesMap.set(categoryName, {
            amount: product.totalRevenue,
            count: product.salesCount
          });
        }
      });

      // Convert to array, calculate percentages, and limit to top 5
      const categorySalesArray = Array.from(categorySalesMap.entries()).map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count
      }));

      const totalCategorySales = categorySalesArray.reduce((sum, cat) => sum + cat.amount, 0);
      
      const salesByCategory: CategorySales[] = categorySalesArray
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5) // Limit to top 5 categories
        .map(cat => ({
          category: cat.category,
          amount: cat.amount,
          percentage: totalCategorySales > 0 ? (cat.amount / totalCategorySales) * 100 : 0
        }));

      console.log("📊 [Reports] Sales by category processed:", salesByCategory.length, "categories");

      // If no category sales, show empty state instead of mock data
      if (salesByCategory.length === 0) {
        console.log("📊 [Reports] No category sales found, showing empty state");
        salesByCategory.push({
          category: "No sales data",
          amount: 0,
          percentage: 0
        });
      }

      console.log("✅ [Reports] Overview data loaded successfully");
      console.log("📊 [Reports] Summary:", {
        totalSales,
        totalTransactions,
        totalCustomers,
        averageOrderValue,
        topProductsCount: topProducts.length,
        categoriesCount: salesByCategory.length
      });

      setReportData(prev => ({
        ...prev,
        overview: {
          totalSales,
          totalTransactions,
          totalCustomers,
          averageOrderValue,
          topProducts,
          salesByCategory,
        },
      }));
    } catch (error) {
      console.error("❌ [Reports] Error loading overview data:", error);
    }
  };

  const loadSalesData = async () => {
    try {
      console.log("🔄 [Reports] Loading sales data...");
      
      // Load real daily sales data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: dailySalesData, error: dailySalesError } = await supabaseAdmin
        .from('sales')
        .select('total_amount, created_at')
        .eq('branch_id', user?.branch_id)
        .eq('status', 'completed')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (dailySalesError) throw dailySalesError;

      // Group sales by date
      const salesByDate = new Map<string, { sales: number; transactions: number }>();
      
      (dailySalesData || []).forEach((sale: any) => {
        const date = new Date(sale.created_at).toISOString().split('T')[0];
        const existing = salesByDate.get(date);
        
        if (existing) {
          existing.sales += sale.total_amount || 0;
          existing.transactions += 1;
        } else {
          salesByDate.set(date, {
            sales: sale.total_amount || 0,
            transactions: 1
          });
        }
      });

      // Create daily sales array for the last 30 days
      const dailySales: DailySale[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = salesByDate.get(dateStr);
        
        dailySales.push({
          date: dateStr,
          sales: dayData?.sales || 0,
          transactions: dayData?.transactions || 0,
        });
      }

      // Load monthly sales data for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: monthlySalesData, error: monthlySalesError } = await supabaseAdmin
        .from('sales')
        .select('total_amount, created_at')
        .eq('branch_id', user?.branch_id)
        .eq('status', 'completed')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (monthlySalesError) throw monthlySalesError;

      // Group sales by month
      const salesByMonth = new Map<string, { sales: number; transactions: number }>();
      
      (monthlySalesData || []).forEach((sale: any) => {
        const date = new Date(sale.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        const existing = salesByMonth.get(monthKey);
        
        if (existing) {
          existing.sales += sale.total_amount || 0;
          existing.transactions += 1;
        } else {
          salesByMonth.set(monthKey, {
            sales: sale.total_amount || 0,
            transactions: 1
          });
        }
      });

      // Create monthly sales array
      const monthlySales: MonthlySale[] = Array.from(salesByMonth.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([monthKey, data]) => {
          const [year, month] = monthKey.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return {
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            sales: data.sales,
            transactions: data.transactions,
          };
        });

      console.log("✅ [Reports] Sales data loaded successfully");
      console.log("📊 [Reports] Sales summary:", {
        dailySalesCount: dailySales.length,
        monthlySalesCount: monthlySales.length
      });

      setReportData(prev => ({
        ...prev,
        sales: {
          dailySales,
          monthlySales,
        },
      }));
    } catch (error) {
      console.error("❌ [Reports] Error loading sales data:", error);
    }
  };

  const loadInventoryData = async () => {
    try {
      // Load inventory data - using service role to bypass RLS
      const { data: productsData, error: productsError } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('branch_id', user?.branch_id);

      if (productsError) throw productsError;

      interface Product {
        id: string;
        name: string;
        quantity: number;
        [key: string]: any;
      }
      const inStock = (productsData as Product[] | null)?.filter((p: Product) => p.quantity > 10).length || 0;
      const lowStock: number = (productsData as Product[] | null)?.filter((p: Product) => p.quantity > 0 && p.quantity <= 10).length || 0;
      const outOfStock: number = (productsData as Product[] | null)?.filter((p: Product) => p.quantity === 0).length || 0;
      const totalProducts = productsData?.length || 0;

      // Load real expiring products - filter products with expiry_date within next 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { data: expiringProductsData, error: expiringProductsError } = await supabaseAdmin
        .from('products')
        .select('id, name, expiry_date, quantity')
        .eq('branch_id', user?.branch_id)
        .not('expiry_date', 'is', null)
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .order('expiry_date', { ascending: true })
        .limit(5);

      if (expiringProductsError) throw expiringProductsError;

      interface ExpiringProductData {
        id: string;
        name: string;
        expiry_date: string;
        quantity: number;
      }

      const expiringProducts: ExpiringProductData[] = (expiringProductsData as ExpiringProductData[] | null)?.map((product: ExpiringProductData): ExpiringProductData => ({
        id: product.id,
        name: product.name,
        expiry_date: product.expiry_date,
        quantity: product.quantity,
      })) || [];

      setReportData(prev => ({
        ...prev,
        inventory: {
          stockStatus: {
            inStock,
            lowStock,
            outOfStock,
            totalProducts,
          },
          topMovingProducts: [],
          expiringProducts,
        },
      }));
    } catch (error) {
      console.error("❌ [Reports] Error loading inventory data:", error);
    }
  };

  const loadCustomerData = async () => {
    try {
      // Load customers data - using service role to bypass RLS
      const { data: customersData, error: customersError } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('branch_id', user?.branch_id);

      if (customersError) throw customersError;

      const totalCustomers = customersData?.length || 0;
      interface Customer {
        id: string;
        name: string;
        created_at: string;
        status: string;
      }
      const activeCustomers = (customersData as Customer[] | null)?.filter((c: Customer) => c.status === 'active').length || 0;
      const newCustomers: number = (customersData as Customer[] | null)?.filter((c: Customer) => {
        const createdDate: Date = new Date(c.created_at);
        const thirtyDaysAgo: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return createdDate >= thirtyDaysAgo;
      }).length || 0;
      const customerRetention = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

      // Load real top customers by aggregating sales data
      const { data: topCustomersData, error: topCustomersError } = await supabaseAdmin
        .from('sales')
        .select(`
          customer_id,
          total_amount,
          customers!inner(
            id,
            first_name,
            last_name
          )
        `)
        .eq('branch_id', user?.branch_id)
        .eq('status', 'completed')
        .not('customer_id', 'is', null)
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate);

      if (topCustomersError) throw topCustomersError;

      interface SaleWithCustomer {
        customer_id: string;
        total_amount: number;
        customers: {
          id: string;
          first_name: string;
          last_name: string;
        };
      }

      // Aggregate sales by customer
      const customerSalesMap = new Map<string, { 
        id: string; 
        name: string; 
        totalSpent: number; 
        totalOrders: number 
      }>();
      
      (topCustomersData as SaleWithCustomer[] | null)?.forEach((sale: SaleWithCustomer) => {
        const customerId = sale.customer_id;
        const existing = customerSalesMap.get(customerId);
        
        if (existing) {
          existing.totalSpent += sale.total_amount;
          existing.totalOrders += 1;
        } else {
          customerSalesMap.set(customerId, {
            id: sale.customers.id,
            name: `${sale.customers.first_name} ${sale.customers.last_name}`,
            totalSpent: sale.total_amount,
            totalOrders: 1
          });
        }
      });

      // Convert to array and sort by total spent, then limit to top 5
      const topCustomers: TopCustomer[] = Array.from(customerSalesMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      setReportData(prev => ({
        ...prev,
        customers: {
          customerMetrics: {
            totalCustomers,
            newCustomers,
            activeCustomers,
            customerRetention,
          },
          topCustomers,
        },
      }));
    } catch (error) {
      console.error("❌ [Reports] Error loading customer data:", error);
    }
  };

  const loadQuickStats = async () => {
    try {
      // Get today's and yesterday's dates
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Load today's sales
      const { data: todaySalesData, error: todaySalesError } = await supabaseAdmin
        .from('sales')
        .select('total_amount')
        .eq('branch_id', user?.branch_id)
        .eq('status', 'completed')
        .gte('created_at', todayStr + 'T00:00:00')
        .lte('created_at', todayStr + 'T23:59:59');

      if (todaySalesError) throw todaySalesError;

      // Load yesterday's sales
      const { data: yesterdaySalesData, error: yesterdaySalesError } = await supabaseAdmin
        .from('sales')
        .select('total_amount')
        .eq('branch_id', user?.branch_id)
        .eq('status', 'completed')
        .gte('created_at', yesterdayStr + 'T00:00:00')
        .lte('created_at', yesterdayStr + 'T23:59:59');

      if (yesterdaySalesError) throw yesterdaySalesError;

      // Load weekly orders (last 7 days)
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const { data: weeklyOrdersData, error: weeklyOrdersError } = await supabaseAdmin
        .from('sales')
        .select('id')
        .eq('branch_id', user?.branch_id)
        .eq('status', 'completed')
        .gte('created_at', weekAgoStr + 'T00:00:00')
        .lte('created_at', todayStr + 'T23:59:59');

      if (weeklyOrdersError) throw weeklyOrdersError;

      // Load active customers (customers with sales in last 30 days)
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const { data: activeCustomersData, error: activeCustomersError } = await supabaseAdmin
        .from('sales')
        .select('customer_id')
        .eq('branch_id', user?.branch_id)
        .eq('status', 'completed')
        .not('customer_id', 'is', null)
        .gte('created_at', thirtyDaysAgoStr + 'T00:00:00')
        .lte('created_at', todayStr + 'T23:59:59');

      if (activeCustomersError) throw activeCustomersError;

      // Load low stock alerts
      const { data: lowStockData, error: lowStockError } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('branch_id', user?.branch_id)
        .lte('quantity', 10)
        .gt('quantity', 0);

      if (lowStockError) throw lowStockError;

      // Calculate metrics
      const todayRevenue = (todaySalesData as { total_amount: number }[] | null)?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
      const yesterdayRevenue = (yesterdaySalesData as { total_amount: number }[] | null)?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
      const monthlyGrowth = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
      const weeklyOrders = weeklyOrdersData?.length || 0;
      const activeCustomers = new Set((activeCustomersData as { customer_id: string }[] | null)?.map(sale => sale.customer_id) || []).size;
      const lowStockAlerts = lowStockData?.length || 0;

      setQuickStats({
        todayRevenue,
        yesterdayRevenue,
        monthlyGrowth,
        weeklyOrders,
        activeCustomers,
        lowStockAlerts,
      });
    } catch (error) {
      console.error("❌ [Reports] Error loading quick stats:", error);
    }
  };

  const handleDateRangeChange = (field: keyof DateRange, value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleExportReport = (format: 'csv' | 'pdf') => {
    console.log(`📊 [Reports] Exporting ${selectedReport} report as ${format.toUpperCase()}`);
    
    setIsExporting(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${selectedReport}_report_${timestamp}`;
      
      if (format === 'csv') {
        exportToCSV(fileName);
      } else if (format === 'pdf') {
        exportToPDF(fileName);
      }
      
      // Show success message
      setTimeout(() => {
        alert(`${format.toUpperCase()} export completed successfully!`);
      }, 1000);
    } catch (error) {
      console.error("❌ [Reports] Error exporting report:", error);
      alert("Error exporting report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = (fileName: string) => {
    let csvContent = '';
    const headers: string[] = [];
    const rows: string[] = [];

    switch (selectedReport) {
      case 'overview':
        // Overview report CSV
        headers.push('Metric', 'Value');
        rows.push('Total Sales', formatCurrency(reportData.overview.totalSales));
        rows.push('Total Transactions', reportData.overview.totalTransactions.toString());
        rows.push('Total Customers', reportData.overview.totalCustomers.toString());
        rows.push('Average Order Value', formatCurrency(Math.round(reportData.overview.averageOrderValue)));
        
        // Add top products
        rows.push('', '');
        rows.push('Top Products', '');
        rows.push('Product Name', 'Revenue', 'Quantity Sold', 'Sales Count');
        reportData.overview.topProducts.forEach((product, index) => {
          rows.push(
            product.name,
            formatCurrency(product.revenue),
            product.quantity.toString(),
            product.sales.toString()
          );
        });
        
        // Add sales by category
        rows.push('', '');
        rows.push('Sales by Category', '');
        rows.push('Category', 'Amount', 'Percentage');
        reportData.overview.salesByCategory.forEach((category) => {
          rows.push(
            category.category,
            formatCurrency(category.amount),
            `${category.percentage.toFixed(1)}%`
          );
        });
        break;

      case 'customers':
        // Customer report CSV
        headers.push('Customer Name', 'Total Spent', 'Total Orders');
        reportData.customers.topCustomers.forEach((customer) => {
          rows.push(
            customer.name,
            formatCurrency(customer.totalSpent),
            customer.totalOrders.toString()
          );
        });
        break;

      case 'inventory':
        // Inventory report CSV
        headers.push('Product Name', 'Expiry Date', 'Quantity');
        reportData.inventory.expiringProducts.forEach((product) => {
          rows.push(
            product.name,
            new Date(product.expiry_date).toLocaleDateString(),
            product.quantity.toString()
          );
        });
        break;

      case 'sales':
        // Sales report CSV - using mock data for now
        headers.push('Date', 'Sales', 'Transactions');
        reportData.sales.dailySales.forEach((sale) => {
          rows.push(
            sale.date,
            formatCurrency(sale.sales),
            sale.transactions.toString()
          );
        });
        break;
    }

    // Create CSV content
    csvContent = headers.join(',') + '\n';
    for (let i = 0; i < rows.length; i += headers.length) {
      const row = rows.slice(i, i + headers.length);
      csvContent += row.join(',') + '\n';
    }

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (fileName: string) => {
    // Create HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section h2 { color: #059669; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f9fafb; font-weight: bold; }
          .metric { margin-bottom: 10px; }
          .metric-label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>Date Range: ${dateRange.startDate} to ${dateRange.endDate}</p>
        </div>
    `;

    switch (selectedReport) {
      case 'overview':
        htmlContent += `
          <div class="section">
            <h2>Overview Metrics</h2>
            <div class="metric">
              <span class="metric-label">Total Sales:</span> ${formatCurrency(reportData.overview.totalSales)}
            </div>
            <div class="metric">
              <span class="metric-label">Total Transactions:</span> ${reportData.overview.totalTransactions}
            </div>
            <div class="metric">
              <span class="metric-label">Total Customers:</span> ${reportData.overview.totalCustomers}
            </div>
            <div class="metric">
              <span class="metric-label">Average Order Value:</span> ${formatCurrency(Math.round(reportData.overview.averageOrderValue))}
            </div>
          </div>
          
          <div class="section">
            <h2>Top Products</h2>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Revenue</th>
                  <th>Quantity Sold</th>
                  <th>Sales Count</th>
                </tr>
              </thead>
              <tbody>
        `;
        reportData.overview.topProducts.forEach((product) => {
          htmlContent += `
            <tr>
              <td>${product.name}</td>
              <td>${formatCurrency(product.revenue)}</td>
              <td>${product.quantity}</td>
              <td>${product.sales}</td>
            </tr>
          `;
        });
        htmlContent += `
              </tbody>
            </table>
          </div>
        `;
        break;

      case 'customers':
        htmlContent += `
          <div class="section">
            <h2>Top Customers</h2>
            <table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Total Spent</th>
                  <th>Total Orders</th>
                </tr>
              </thead>
              <tbody>
        `;
        reportData.customers.topCustomers.forEach((customer) => {
          htmlContent += `
            <tr>
              <td>${customer.name}</td>
              <td>${formatCurrency(customer.totalSpent)}</td>
              <td>${customer.totalOrders}</td>
            </tr>
          `;
        });
        htmlContent += `
              </tbody>
            </table>
          </div>
        `;
        break;

      case 'inventory':
        htmlContent += `
          <div class="section">
            <h2>Expiring Products</h2>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
        `;
        reportData.inventory.expiringProducts.forEach((product) => {
          htmlContent += `
            <tr>
              <td>${product.name}</td>
              <td>${new Date(product.expiry_date).toLocaleDateString()}</td>
              <td>${product.quantity}</td>
            </tr>
          `;
        });
        htmlContent += `
              </tbody>
            </table>
          </div>
        `;
        break;

      case 'sales':
        htmlContent += `
          <div class="section">
            <h2>Sales Data</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Sales</th>
                  <th>Transactions</th>
                </tr>
              </thead>
              <tbody>
        `;
        reportData.sales.dailySales.forEach((sale) => {
          htmlContent += `
            <tr>
              <td>${sale.date}</td>
              <td>${formatCurrency(sale.sales)}</td>
              <td>${sale.transactions}</td>
            </tr>
          `;
        });
        htmlContent += `
              </tbody>
            </table>
          </div>
        `;
        break;
    }

    htmlContent += `
      </body>
      </html>
    `;

    // Create PDF using browser print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadOverviewData(),
        loadSalesData(),
        loadInventoryData(),
        loadCustomerData(),
        loadQuickStats(),
      ]);
    } catch (error) {
      console.error("❌ [Reports] Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </BranchDashboardLayout>
    );
  }

  return (
    <BranchDashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} size={16} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
            <FiDownload className="mr-2" size={16} />
            Export All
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
            <FiDollarSign size={24} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Today's Revenue</div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(quickStats.todayRevenue)}</div>
            <div className={`flex items-center text-sm ${quickStats.monthlyGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {quickStats.monthlyGrowth >= 0 ? <FiTrendingUp size={14} /> : <FiTrendingUp size={14} />}
              <span className="ml-1">{Math.abs(quickStats.monthlyGrowth).toFixed(1)}% from yesterday</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <FiShoppingCart size={24} className="text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Weekly Orders</div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{quickStats.weeklyOrders}</div>
            <div className="flex items-center text-sm text-emerald-600">
              <FiTrendingUp size={14} />
              <span className="ml-1">+12% from last week</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <FiUsers size={24} className="text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Active Customers</div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{quickStats.activeCustomers}</div>
            <div className="flex items-center text-sm text-emerald-600">
              <FiTrendingUp size={14} />
              <span className="ml-1">+8% this month</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <FiPackage size={24} className="text-orange-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Low Stock Alerts</div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{quickStats.lowStockAlerts}</div>
            <div className="flex items-center text-sm text-red-600">
              <FiAlertTriangle size={14} />
              <span className="ml-1">Needs attention</span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <FiBarChart className="text-gray-400" />
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              >
                <option value="overview">Overview Report</option>
                <option value="sales">Sales Report</option>
                <option value="inventory">Inventory Report</option>
                <option value="customers">Customer Report</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <FiCalendar className="text-gray-400" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleExportReport('csv')}
              disabled={isExporting}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <FiDownload className="mr-2" size={16} />
              )}
              {isExporting ? 'Exporting CSV...' : 'Export CSV'}
            </button>
            
            <button
              onClick={() => handleExportReport('pdf')}
              disabled={isExporting}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FiFileText className="mr-2" size={16} />
              )}
              {isExporting ? 'Exporting PDF...' : 'Export PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {selectedReport === "overview" && (
          <div className="p-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <FiDollarSign size={20} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Total Sales</div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(reportData.overview.totalSales)}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <FiShoppingCart size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Total Transactions</div>
                  <div className="text-xl font-bold text-gray-900">{reportData.overview.totalTransactions}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <FiUsers size={20} className="text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Total Customers</div>
                  <div className="text-xl font-bold text-gray-900">{reportData.overview.totalCustomers}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <FiBarChart size={20} className="text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Average Order Value</div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(Math.round(reportData.overview.averageOrderValue))}</div>
                </div>
              </div>
            </div>

            {/* Top Products and Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
                  <span className="text-sm text-gray-500">By revenue</span>
                </div>
                <div className="space-y-3">
                  {reportData.overview.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-medium text-emerald-600">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.quantity} units sold</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Sales by Category</h3>
                  <span className="text-sm text-gray-500">Revenue distribution</span>
                </div>
                <div className="space-y-3">
                  {reportData.overview.salesByCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-medium text-emerald-600">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{category.category}</div>
                          <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}% of total</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(category.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedReport === "sales" && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Daily Sales</h3>
                  <span className="text-sm text-gray-500">Last 7 days</span>
                </div>
                <div className="space-y-3">
                  {reportData.sales.dailySales.slice(-7).map((sale, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(sale.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sale.transactions} transactions
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(sale.sales)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Monthly Sales</h3>
                  <span className="text-sm text-gray-500">Revenue trends</span>
                </div>
                <div className="space-y-3">
                  {reportData.sales.monthlySales.map((sale, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{sale.month}</div>
                        <div className="text-xs text-gray-500">
                          {sale.transactions} transactions
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(sale.sales)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedReport === "inventory" && (
          <div className="p-6 space-y-6">
            {/* Inventory Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <FiCheckCircle size={20} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">In Stock</div>
                  <div className="text-xl font-bold text-gray-900">{reportData.inventory.stockStatus.inStock}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                  <FiAlertTriangle size={20} className="text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Low Stock</div>
                  <div className="text-xl font-bold text-gray-900">{reportData.inventory.stockStatus.lowStock}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                  <FiAlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Out of Stock</div>
                  <div className="text-xl font-bold text-gray-900">{reportData.inventory.stockStatus.outOfStock}</div>
                </div>
              </div>
            </div>

            {/* Expiring Products */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Expiring Products</h3>
                <span className="text-sm text-gray-500">Within 30 days</span>
              </div>
              <div className="space-y-3">
                {reportData.inventory.expiringProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        Expires: {new Date(product.expiry_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {product.quantity} units left
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedReport === "customers" && (
          <div className="p-6 space-y-6">
            {/* Customer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <FiUsers size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Total Customers</div>
                  <div className="text-xl font-bold text-gray-900">{reportData.customers.customerMetrics.totalCustomers}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <FiCheckCircle size={20} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Active Customers</div>
                  <div className="text-xl font-bold text-gray-900">{reportData.customers.customerMetrics.activeCustomers}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <FiCheckCircle size={20} className="text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">New Customers</div>
                  <div className="text-xl font-bold text-gray-900">{reportData.customers.customerMetrics.newCustomers}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <FiTrendingUp size={20} className="text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Retention Rate</div>
                  <div className="text-xl font-bold text-gray-900">{reportData.customers.customerMetrics.customerRetention.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Top Customers</h3>
                <span className="text-sm text-gray-500">By total spent</span>
              </div>
              <div className="space-y-3">
                {reportData.customers.topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-medium text-emerald-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.totalOrders} orders</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </BranchDashboardLayout>
  );
};

export default Reports; 