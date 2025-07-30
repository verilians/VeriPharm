import { supabase } from '../../../../lib/supabase';
import type {
  SalesReport,
  InventoryReport,
  FinancialReport,
  CustomerReport,
  PurchaseReport,
  ReportFilters,
  ExportOptions,
  ApiResponse,
  ReportStats,
  DashboardSummary,
  TopProduct,
  TopCustomer,
  SalesByDay,
  StockMovementSummary,
  StockByCategory,
  TopSupplierPurchase,
  PaymentStatusSummary,
  CustomerSegment,
  RevenueByMonth
} from '../types';

export class ReportsService {
  private static getBranchId(): string {
    // In a real app, this would come from auth context
    return 'branch-123'; // Replace with actual branch ID
  }

  private static getUserId(): string {
    // In a real app, this would come from auth context
    return 'user-123'; // Replace with actual user ID
  }

  // Sales Reports
  static async generateSalesReport(filters: ReportFilters): Promise<ApiResponse<SalesReport>> {
    try {
      let query = supabase
        .from('sales')
        .select(`
          *,
          sale_items(
            *,
            products(name, category_id)
          ),
          customers(name)
        `)
        .eq('branch_id', this.getBranchId());

      // Apply date filters
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data: sales, error } = await query;

      if (error) throw error;

      // Calculate sales statistics
      const totalSales = sales?.length || 0;
      const totalRevenue = sales?.reduce((sum: number, sale: { total_amount: number }) => sum + sale.total_amount, 0) || 0;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Calculate top products
      const productSales = sales?.reduce((acc: Record<string, TopProduct>, sale: { sale_items: { quantity: number; total_price: number; products: { id: string; name: string; category_id: string; }; }[] }) => {
        sale.sale_items?.forEach((item: { quantity: number; total_price: number; products: { id: string; name: string; category_id: string; }; }) => {
          const productId = item.products.id;
          if (!acc[productId]) {
            acc[productId] = {
              product_id: productId,
              product_name: item.products.name,
              quantity_sold: 0,
              revenue: 0,
              percentage: 0,
            };
          }
          acc[productId].quantity_sold += item.quantity;
          acc[productId].revenue += item.total_price;
        });
        return acc;
      }, {} as Record<string, TopProduct>) || {};

      const topProducts = Object.values(productSales) as TopProduct[];

      // Calculate top customers
      const customerSales = sales?.reduce((acc: Record<string, TopCustomer>, sale: { customer_id: string; customers: { name: string; }; total_amount: number }) => {
        const customerId = sale.customer_id;
        if (!acc[customerId]) {
          acc[customerId] = {
            customer_id: customerId,
            customer_name: sale.customers?.name || 'Unknown',
            total_orders: 0,
            total_spent: 0,
            average_order_value: 0,
          };
        }
        acc[customerId].total_orders += 1;
        acc[customerId].total_spent += sale.total_amount;
        acc[customerId].average_order_value = acc[customerId].total_spent / acc[customerId].total_orders;
        return acc;
      }, {} as Record<string, TopCustomer>) || {};

      const topCustomers = Object.values(customerSales) as TopCustomer[];

      // Generate sales by day
      const salesByDay = sales?.reduce((acc: Record<string, SalesByDay>, sale: { created_at: string; sale_items: { length: number; }[]; total_amount: number }) => {
        const date = new Date(sale.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            sales_count: 0,
            revenue: 0,
            orders: 0,
          };
        }
        acc[date].sales_count += sale.sale_items?.length || 0;
        acc[date].revenue += sale.total_amount;
        acc[date].orders += 1;
        return acc;
      }, {} as Record<string, SalesByDay>) || {};

      const salesByDayArray = Object.values(salesByDay) as SalesByDay[];

      return {
        data: {
          id: `sales-${Date.now()}`,
          report_type: 'custom',
          date_from: filters.date_from || '',
          date_to: filters.date_to || '',
          total_sales: totalSales,
          total_revenue: totalRevenue,
          total_orders: totalSales,
          average_order_value: averageOrderValue,
          top_products: topProducts,
          top_customers: topCustomers,
          sales_by_day: salesByDayArray,
          sales_by_category: [], // Would need category data
          payment_methods: [], // Would need payment method data
          created_at: new Date().toISOString(),
        },
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate sales report',
        loading: false,
      };
    }
  }

  // Inventory Reports
  static async generateInventoryReport(filters: ReportFilters): Promise<ApiResponse<InventoryReport>> {
    try {
      // Get products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          suppliers(name)
        `)
        .eq('branch_id', this.getBranchId());

      if (productsError) throw productsError;

      // Get stock movements
      const { data: movements, error: movementsError } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('branch_id', this.getBranchId());

      if (movementsError) throw movementsError;

      // Calculate inventory statistics
      const totalProducts = products?.length || 0;
      const totalStockValue = products?.reduce((sum: number, product: { stock_quantity: number; unit_price: number }) => 
        sum + (product.stock_quantity * product.unit_price), 0) || 0;
      const lowStockProducts = products?.filter((p: { stock_quantity: number; min_stock_level: number }) => 
        p.stock_quantity <= p.min_stock_level && p.stock_quantity > 0).length || 0;
      const outOfStockProducts = products?.filter((p: { stock_quantity: number }) => p.stock_quantity === 0).length || 0;

      // Calculate stock movements
      const movementSummary = movements?.reduce((acc: Record<string, StockMovementSummary>, movement: { movement_type: string; quantity: number; unit_price: number; }) => {
        if (!acc[movement.movement_type]) {
          acc[movement.movement_type] = {
            movement_type: movement.movement_type as 'in' | 'out' | 'adjustment' | 'transfer',
            count: 0,
            total_quantity: 0,
            total_value: 0,
          };
        }
        acc[movement.movement_type].count += 1;
        acc[movement.movement_type].total_quantity += movement.quantity;
        acc[movement.movement_type].total_value += movement.quantity * (movement.unit_price || 0);
        return acc;
      }, {} as Record<string, StockMovementSummary>) || {};

      const stockMovements: StockMovementSummary[] = Object.values(movementSummary) as StockMovementSummary[];

      // Calculate stock by category
      const stockByCategory = products?.reduce((acc: Record<string, StockByCategory>, product: { category_id: string; stock_quantity: number; unit_price: number; min_stock_level: number; categories?: { name?: string } }) => {
        const categoryId = product.category_id;
        if (!acc[categoryId]) {
          acc[categoryId] = {
            category_id: categoryId,
            category_name: product.categories?.name || 'Uncategorized',
            product_count: 0,
            total_stock: 0,
            total_value: 0,
            low_stock_count: 0,
          };
        }
        acc[categoryId].product_count += 1;
        acc[categoryId].total_stock += product.stock_quantity;
        acc[categoryId].total_value += product.stock_quantity * product.unit_price;
        if (product.stock_quantity <= product.min_stock_level && product.stock_quantity > 0) {
          acc[categoryId].low_stock_count += 1;
        }
        return acc;
      }, {} as Record<string, StockByCategory>) || {};

      const stockByCategoryArray: StockByCategory[] = Object.values(stockByCategory) as StockByCategory[];

      return {
        data: {
          id: `inventory-${Date.now()}`,
          report_date: new Date().toISOString(),
          total_products: totalProducts,
          total_stock_value: totalStockValue,
          low_stock_products: lowStockProducts,
          out_of_stock_products: outOfStockProducts,
          stock_movements: stockMovements,
          stock_by_category: stockByCategoryArray,
          top_suppliers: [], // Would need supplier data
          stock_alerts: [], // Would need alert logic
        },
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate inventory report',
        loading: false,
      };
    }
  }

  // Financial Reports
  static async generateFinancialReport(filters: ReportFilters): Promise<ApiResponse<FinancialReport>> {
    try {
      // Get sales data
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('branch_id', this.getBranchId());

      if (salesError) throw salesError;

      // Get purchase data
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('branch_id', this.getBranchId());

      if (purchasesError) throw purchasesError;

      // Calculate financial metrics
      const totalRevenue = sales?.reduce((sum: number, sale: { total_amount: number }) => sum + sale.total_amount, 0) || 0;
      const totalExpenses = purchases?.reduce((sum: number, purchase: { total_amount: number }) => sum + purchase.total_amount, 0) || 0;
      const grossProfit = totalRevenue - totalExpenses;
      const netProfit = grossProfit; // Simplified calculation
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Calculate revenue by month
      const revenueByMonth = sales?.reduce((acc: Record<string, RevenueByMonth>, sale: { created_at: string; total_amount: number }) => {
        const month = new Date(sale.created_at).toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = {
            month,
            revenue: 0,
            orders: 0,
            growth_percentage: 0,
          };
        }
        acc[month].revenue += sale.total_amount;
        acc[month].orders += 1;
        return acc;
      }, {} as Record<string, RevenueByMonth>) || {};

      const revenueByMonthArray: RevenueByMonth[] = Object.values(revenueByMonth) as RevenueByMonth[];

      return {
        data: {
          id: `financial-${Date.now()}`,
          report_period: filters.date_from && filters.date_to 
            ? `${filters.date_from} to ${filters.date_to}` 
            : 'All time',
          total_revenue: totalRevenue,
          total_expenses: totalExpenses,
          gross_profit: grossProfit,
          net_profit: netProfit,
          profit_margin: profitMargin,
          revenue_by_month: revenueByMonthArray,
          expenses_by_category: [], // Would need expense categories
          profit_trends: [], // Would need historical data
          cash_flow: {
            opening_balance: 0,
            cash_in: totalRevenue,
            cash_out: totalExpenses,
            closing_balance: totalRevenue - totalExpenses,
            net_cash_flow: totalRevenue - totalExpenses,
          },
        },
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate financial report',
        loading: false,
      };
    }
  }

  // Customer Reports
  static async generateCustomerReport(filters: ReportFilters): Promise<ApiResponse<CustomerReport>> {
    try {
      // Get customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('branch_id', this.getBranchId());

      if (customersError) throw customersError;

      // Get sales data
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('branch_id', this.getBranchId());

      if (salesError) throw salesError;

      // Calculate customer metrics
      const totalCustomers = customers?.length || 0;
      const activeCustomers = sales?.reduce((acc: string[], sale: { customer_id: string }) => {
        if (!acc.includes(sale.customer_id)) {
          acc.push(sale.customer_id);
        }
        return acc;
      }, [] as string[]).length || 0;

      const customerSales = sales?.reduce((acc: Record<string, { total_orders: number; total_spent: number; first_order_date: string; last_order_date: string; }>, sale: { customer_id: string; created_at: string; total_amount: number }) => {
        if (!acc[sale.customer_id]) {
          acc[sale.customer_id] = {
            total_orders: 0,
            total_spent: 0,
            first_order_date: sale.created_at,
            last_order_date: sale.created_at,
          };
        }
        acc[sale.customer_id].total_orders += 1;
        acc[sale.customer_id].total_spent += sale.total_amount;
        if (new Date(sale.created_at) < new Date(acc[sale.customer_id].first_order_date)) {
          acc[sale.customer_id].first_order_date = sale.created_at;
        }
        if (new Date(sale.created_at) > new Date(acc[sale.customer_id].last_order_date)) {
          acc[sale.customer_id].last_order_date = sale.created_at;
        }
        return acc;
      }, {} as Record<string, { total_orders: number; total_spent: number; first_order_date: string; last_order_date: string; }>) || {};

      const totalRevenue = sales?.reduce((sum: number, sale: { total_amount: number }) => sum + sale.total_amount, 0) || 0;
      const averageCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

      // Calculate customer segments
      const customerSegments: CustomerSegment[] = [
        {
          segment: 'high_value',
          count: (Object.values(customerSales) as { total_spent: number }[]).filter((c: { total_spent: number }) => c.total_spent > 100000).length,
          total_revenue: (Object.values(customerSales) as { total_spent: number }[]).reduce((sum: number, c: { total_spent: number }) => 
            c.total_spent > 100000 ? sum + c.total_spent : sum, 0),
          average_order_value: 0,
          percentage: 0,
        },
        {
          segment: 'medium_value',
          count: (Object.values(customerSales) as { total_spent: number }[]).filter((c: { total_spent: number }) => 
            c.total_spent > 10000 && c.total_spent <= 100000).length,
          total_revenue: (Object.values(customerSales) as { total_spent: number }[]).reduce((sum: number, c: { total_spent: number }) => 
            c.total_spent > 10000 && c.total_spent <= 100000 ? sum + c.total_spent : sum, 0),
          average_order_value: 0,
          percentage: 0,
        },
        {
          segment: 'low_value',
          count: (Object.values(customerSales) as { total_spent: number }[]).filter((c: { total_spent: number }) => c.total_spent <= 10000).length,
          total_revenue: (Object.values(customerSales) as { total_spent: number }[]).reduce((sum: number, c: { total_spent: number }) => 
            c.total_spent <= 10000 ? sum + c.total_spent : sum, 0),
          average_order_value: 0,
          percentage: 0,
        },
      ];

      return {
        data: {
          id: `customer-${Date.now()}`,
          report_date: new Date().toISOString(),
          total_customers: totalCustomers,
          active_customers: activeCustomers,
          new_customers: 0, // Would need to calculate based on first order date
          customer_retention_rate: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0,
          average_customer_value: averageCustomerValue,
          customer_segments: customerSegments,
          customer_loyalty: [], // Would need loyalty calculation
          customer_growth: [], // Would need historical data
        },
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate customer report',
        loading: false,
      };
    }
  }

  // Purchase Reports
  static async generatePurchaseReport(filters: ReportFilters): Promise<ApiResponse<PurchaseReport>> {
    try {
      // Get purchase orders
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers(name)
        `)
        .eq('branch_id', this.getBranchId());

      if (purchasesError) throw purchasesError;

      // Calculate purchase metrics
      const totalPurchases = purchases?.length || 0;
      const totalSpent = purchases?.reduce((sum: number, purchase: { total_amount: number }) => sum + purchase.total_amount, 0) || 0;
      const averageOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

      // Calculate top suppliers
      const supplierPurchases = purchases?.reduce((acc: Record<string, TopSupplierPurchase>, purchase: { supplier_id: string; suppliers: { name: string; }; total_amount: number }) => {
        const supplierId = purchase.supplier_id;
        if (!acc[supplierId]) {
          acc[supplierId] = {
            supplier_id: supplierId,
            supplier_name: purchase.suppliers?.name || 'Unknown',
            total_orders: 0,
            total_spent: 0,
            average_order_value: 0,
            on_time_delivery_rate: 85, // Placeholder
          };
        }
        acc[supplierId].total_orders += 1;
        acc[supplierId].total_spent += purchase.total_amount;
        acc[supplierId].average_order_value = acc[supplierId].total_spent / acc[supplierId].total_orders;
        return acc;
      }, {} as Record<string, TopSupplierPurchase>) || {};

      const topSuppliers = (Object.values(supplierPurchases) as TopSupplierPurchase[]).sort((a, b) => b.total_spent - a.total_spent).slice(0, 10);

      // Calculate payment status summary
      const paymentStatusSummary = purchases?.reduce((acc: Record<string, PaymentStatusSummary>, purchase: { payment_status: string; total_amount: number }) => {
        const status = purchase.payment_status;
        if (!acc[status]) {
          acc[status] = {
            status: status as 'pending' | 'partial' | 'paid',
            count: 0,
            total_amount: 0,
            percentage: 0,
          };
        }
        acc[status].count += 1;
        acc[status].total_amount += purchase.total_amount;
        return acc;
      }, {} as Record<string, PaymentStatusSummary>) || {};

      (Object.values(paymentStatusSummary) as PaymentStatusSummary[]).forEach((status: PaymentStatusSummary) => {
        status.percentage = (status.count / totalPurchases) * 100;
      });

      return {
        data: {
          id: `purchase-${Date.now()}`,
          report_period: filters.date_from && filters.date_to 
            ? `${filters.date_from} to ${filters.date_to}` 
            : 'All time',
          total_purchases: totalPurchases,
          total_spent: totalSpent,
          average_order_value: averageOrderValue,
          top_suppliers: topSuppliers,
          purchases_by_category: [], // Would need category data
          payment_status_summary: Object.values(paymentStatusSummary),
        },
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate purchase report',
        loading: false,
      };
    }
  }

  // Export Reports
  static async exportReport(
    reportType: string,
    reportData: any,
    exportOptions: ExportOptions
  ): Promise<ApiResponse<string>> {
    try {
      // In a real implementation, this would generate the actual file
      const fileName = `${reportType}_report_${Date.now()}.${exportOptions.format}`;
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        data: fileName,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to export report',
        loading: false,
      };
    }
  }

  // Get Report Statistics
  static async getReportStats(): Promise<ApiResponse<ReportStats>> {
    try {
      // In a real implementation, this would fetch actual statistics
      return {
        data: {
          total_reports_generated: 150,
          reports_this_month: 25,
          most_popular_report: 'sales',
          average_generation_time: 2.5,
          export_formats_used: {
            pdf: 80,
            excel: 45,
            csv: 25,
          },
        },
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch report statistics',
        loading: false,
      };
    }
  }

  // Get Dashboard Summary
  static async getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
    try {
      // Get sales data
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('branch_id', this.getBranchId());

      if (salesError) throw salesError;

      // Get products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('branch_id', this.getBranchId());

      if (productsError) throw productsError;

      // Get customers data
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('branch_id', this.getBranchId());

      if (customersError) throw customersError;

      // Calculate summary metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const todayRevenue = sales?.filter((s: { created_at: string; total_amount: number }) => new Date(s.created_at) >= today)
        .reduce((sum: number, s: { total_amount: number }) => sum + s.total_amount, 0) || 0;
      
      const thisWeekRevenue = sales?.filter((s: { created_at: string; total_amount: number }) => new Date(s.created_at) >= thisWeek)
        .reduce((sum: number, s: { total_amount: number }) => sum + s.total_amount, 0) || 0;
      
      const thisMonthRevenue = sales?.filter((s: { created_at: string; total_amount: number }) => new Date(s.created_at) >= thisMonth)
        .reduce((sum: number, s: { total_amount: number }) => sum + s.total_amount, 0) || 0;

      const totalRevenue = sales?.reduce((sum: number, s: { total_amount: number }) => sum + s.total_amount, 0) || 0;
      const totalExpenses = 0; // Would need purchase data
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        data: {
          sales_summary: {
            today_revenue: todayRevenue,
            this_week_revenue: thisWeekRevenue,
            this_month_revenue: thisMonthRevenue,
            growth_rate: thisMonthRevenue > 0 ? ((thisMonthRevenue - thisWeekRevenue) / thisWeekRevenue) * 100 : 0,
          },
          inventory_summary: {
            total_products: products?.length || 0,
            low_stock_count: products?.filter((p: { stock_quantity: number; min_stock_level: number }) => p.stock_quantity <= p.min_stock_level && p.stock_quantity > 0).length || 0,
            out_of_stock_count: products?.filter((p: { stock_quantity: number }) => p.stock_quantity === 0).length || 0,
            total_stock_value: products?.reduce((sum: number, p: { stock_quantity: number; unit_price: number }) => sum + (p.stock_quantity * p.unit_price), 0) || 0,
          },
          customer_summary: {
            total_customers: customers?.length || 0,
            new_customers_this_month: customers?.filter((c: { created_at: string; }) => new Date(c.created_at) >= thisMonth).length || 0,
            active_customers: sales?.reduce((acc: string[], s: { customer_id: string; }) => {
              if (!acc.includes(s.customer_id)) acc.push(s.customer_id);
              return acc;
            }, [] as string[]).length || 0,
            average_customer_value: customers?.length > 0 ? totalRevenue / customers.length : 0,
          },
          financial_summary: {
            total_revenue: totalRevenue,
            total_expenses: totalExpenses,
            net_profit: netProfit,
            profit_margin: profitMargin,
          },
        },
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard summary',
        loading: false,
      };
    }
  }
} 