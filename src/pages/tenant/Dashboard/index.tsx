import React, { useState, useMemo } from "react";
import TenantDashboardLayout from "./TenantDashboardLayout";
import mockSales from "../Sales/mockSales";
import mockPurchases from "../PurchasesSummary/mockPurchases";
import mockUsers from "../Users/mockUsers";
import { getStockMovements } from "../Stock/mockStockUtils";
import dayjs from "dayjs";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  BarChart2,
  PieChart,
  Gauge,
} from "lucide-react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const DashboardHome: React.FC = () => {
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filtered data based on date
  const filteredSales = useMemo(() => {
    return mockSales.filter((s) => {
      if (startDate && s.date < startDate) return false;
      if (endDate && s.date > endDate) return false;
      return true;
    });
  }, [startDate, endDate]);

  const filteredPurchases = useMemo(() => {
    return mockPurchases.filter((p) => {
      if (startDate && p.date < startDate) return false;
      if (endDate && p.date > endDate) return false;
      return true;
    });
  }, [startDate, endDate]);

  // KPIs
  const totalRevenue = filteredSales.reduce(
    (sum, s) => sum + (s.total || 0),
    0
  );
  const totalPurchases = filteredPurchases.reduce(
    (sum, p) => sum + (p.total || 0),
    0
  );
  const totalSales = filteredSales.length;
  const totalItemsSold = filteredSales.reduce(
    (sum, s) => sum + (s.items || 0),
    0
  );
  const activeUsers = mockUsers.filter((u) => u.status === "Active").length;
  const stockMovements = getStockMovements();
  const totalStockIn = stockMovements
    .filter((m) => m.type === "in")
    .reduce((sum, m) => sum + (m.quantity || 0), 0);
  const totalStockOut = stockMovements
    .filter((m) => m.type === "out")
    .reduce((sum, m) => sum + (m.quantity || 0), 0);
  const stockBalance = totalStockIn - totalStockOut;

  // Simulate expenses for Net Profit calculation
  const totalExpenses = useMemo(() => {
    // Example: 75% of revenue as expenses (for demo)
    return Math.round(totalRevenue * 0.75);
  }, [totalRevenue]);
  const netProfit = totalRevenue - totalExpenses;

  // Placeholder for trend calculation (to be implemented with previous period logic)
  const trend = {
    revenue: { up: true, percent: 8.2 },
    purchases: { up: false, percent: -3.1 },
    sales: { up: true, percent: 5.7 },
    stock: { up: true, percent: 2.4 },
  };

  // --- Profit and Loss Dynamics Data (last 12 months) ---
  const months = Array.from({ length: 12 }, (_, i) =>
    dayjs()
      .subtract(11 - i, "month")
      .format("MMM YYYY")
  );
  const pnlData = months.map((month, i) => {
    // Simulate revenue and expenses
    const revenue =
      12000 +
      Math.round(Math.sin(i / 2) * 2000) +
      Math.round(Math.random() * 1500);
    const expenses =
      9000 +
      Math.round(Math.cos(i / 2) * 1500) +
      Math.round(Math.random() * 1200);
    return {
      month,
      Revenue: revenue,
      Expenses: expenses,
      NetProfit: revenue - expenses,
    };
  });

  // Pie chart data: Sales by Branch
  const salesByBranch = useMemo(() => {
    const branchTotals: Record<string, number> = {};
    filteredSales.forEach((s) => {
      branchTotals[s.branch] = (branchTotals[s.branch] || 0) + (s.total || 0);
    });
    return Object.entries(branchTotals).map(([branch, total]) => ({
      name: branch,
      value: total,
    }));
  }, [filteredSales]);

  // Pie chart data: Purchases by Branch
  const purchasesByBranch = useMemo(() => {
    const branchTotals: Record<string, number> = {};
    filteredPurchases.forEach((p) => {
      branchTotals[p.branch] = (branchTotals[p.branch] || 0) + (p.total || 0);
    });
    return Object.entries(branchTotals).map(([branch, total]) => ({
      name: branch,
      value: total,
    }));
  }, [filteredPurchases]);

  // Line chart data: Sales & Purchases Over Time
  const salesPurchasesOverTime = useMemo(() => {
    // Collect all unique dates from sales and purchases
    const dateSet = new Set([
      ...filteredSales.map((s) => s.date),
      ...filteredPurchases.map((p) => p.date),
    ]);
    const dates = Array.from(dateSet).sort();
    return dates.map((date) => {
      const sales = filteredSales
        .filter((s) => s.date === date)
        .reduce((sum, s) => sum + (s.total || 0), 0);
      const purchases = filteredPurchases
        .filter((p) => p.date === date)
        .reduce((sum, p) => sum + (p.total || 0), 0);
      return { date, Sales: sales, Purchases: purchases };
    });
  }, [filteredSales, filteredPurchases]);

  // --- Expenditure by Category Data (YTD, simulated) ---
  const expenditureCategories = [
    { name: "Cost of Goods Sold (Drugs)", value: 60 },
    { name: "Salaries & Wages", value: 20 },
    { name: "Rent & Utilities", value: 8 },
    { name: "Marketing", value: 5 },
    { name: "Other Operating Expenses", value: 7 },
  ];

  // --- Salesperson Performance (Top 5) ---
  const salesByPerson = useMemo(() => {
    const salesMap: Record<
      string,
      { name: string; total: number; branch?: string; image?: string }
    > = {};
    filteredSales.forEach((s) => {
      if (!salesMap[s.salesperson]) {
        // Find user info for image and branch
        const user = mockUsers.find((u) => u.name === s.salesperson);
        salesMap[s.salesperson] = {
          name: s.salesperson,
          total: 0,
          branch: user?.branch,
          image: user?.image,
        };
      }
      salesMap[s.salesperson].total += s.total || 0;
    });
    return Object.values(salesMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredSales]);

  // --- Inventory Management & Efficiency ---
  // Simulate turnover ratio and current value
  const turnoverRatio = 4.2;
  const currentValue = 185000;
  // Simulate top 5 slow-moving/expiring items
  const slowMovingItems = [
    {
      name: "Paracetamol",
      branch: "Main Branch",
      exp: "2025-08-31",
      daysSinceSale: 120,
      value: 1500000,
    },
    {
      name: "Ibuprofen",
      branch: "Westside Branch",
      exp: "2025-07-15",
      daysSinceSale: 95,
      value: 900000,
    },
    {
      name: "Amoxicillin",
      branch: "Eastside Branch",
      exp: "2025-09-10",
      daysSinceSale: 80,
      value: 700000,
    },
    {
      name: "Cough Syrup",
      branch: "Main Branch",
      exp: "2025-06-20",
      daysSinceSale: 60,
      value: 500000,
    },
    {
      name: "Vitamin C",
      branch: "Westside Branch",
      exp: "2025-10-05",
      daysSinceSale: 45,
      value: 300000,
    },
  ];
  // Simulate prescription volume trend (last 12 months)
  const prescriptionVolume = months.map((month, i) => ({
    month,
    Prescriptions:
      120 + Math.round(Math.sin(i / 2) * 30) + Math.round(Math.random() * 20),
  }));

  return (
    <TenantDashboardLayout>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
        {/* Date Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-end mb-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
            placeholder="End Date"
          />
        </div>
        {/* --- Top KPIs Row --- */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start">
            <div className="flex items-center gap-1 mb-2 text-blue-700 text-sm font-medium truncate w-full">
              <DollarSign size={18} className="shrink-0" />
              <span className="truncate">Total Revenue</span>
            </div>
            <div className="text-2xl md:text-xl font-bold min-w-0 truncate">
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start">
            <div className="flex items-center gap-1 mb-2 text-green-700 text-sm font-medium truncate w-full">
              <ShoppingCart size={18} className="shrink-0" />
              <span className="truncate">Total Purchases</span>
            </div>
            <div className="text-2xl md:text-xl font-bold min-w-0 truncate">
              ${totalPurchases.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start">
            <div className="flex items-center gap-1 mb-2 text-purple-700 text-sm font-medium truncate w-full">
              <BarChart2 size={18} className="shrink-0" />
              <span className="truncate">Total Sales</span>
            </div>
            <div className="text-2xl md:text-xl font-bold min-w-0 truncate">
              {totalSales}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start">
            <div className="flex items-center gap-1 mb-2 text-pink-700 text-sm font-medium truncate w-full">
              <DollarSign size={18} className="shrink-0" />
              <span className="truncate">Net Profit</span>
            </div>
            <div className="text-2xl md:text-xl font-bold min-w-0 truncate">
              ${netProfit.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start">
            <div className="flex items-center gap-1 mb-2 text-yellow-700 text-sm font-medium truncate w-full">
              <Gauge size={18} className="shrink-0" />
              <span className="truncate">Stock Balance</span>
            </div>
            <div className="text-2xl md:text-xl font-bold min-w-0 truncate">
              {stockBalance}
            </div>
          </div>
        </div>

        {/* --- Row 2: Sales & Purchases Over Time and Branch Performance --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sales & Purchases Over Time */}
          <div className="bg-white rounded-xl shadow p-4 min-h-[320px] flex flex-col md:col-span-5">
            <div className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
              Sales & Purchases Over Time
            </div>
            <div className="flex-1 flex items-center justify-center min-w-0">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={salesPurchasesOverTime}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Sales"
                    stroke="#0088FE"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Purchases"
                    stroke="#00C49F"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Branch Performance (Donut Charts) */}
          <div className="bg-white rounded-xl shadow min-h-[320px] flex flex-col gap-4 md:col-span-7 p-0">
            <div className="font-semibold text-blue-700 mb-2 px-4 pt-4">
              Branch Performance
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full min-w-0 px-4 pb-4">
              {/* Sales by Branch Donut */}
              <div className="flex-1 flex flex-col items-center min-w-0">
                <div className="font-medium mb-1">Sales by Branch</div>
                <div className="w-full flex-1 flex items-center justify-center min-w-0">
                  <ResponsiveContainer width="100%" height={140}>
                    <RePieChart>
                      <Pie
                        data={salesByBranch}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={49}
                        label
                      >
                        {salesByBranch.map((entry, index) => (
                          <Cell
                            key={`cell-sales-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full mt-2 flex flex-wrap justify-center gap-2 text-xs sm:text-sm overflow-x-auto min-w-0">
                  {salesByBranch.map((entry, index) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-1 whitespace-nowrap"
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ background: COLORS[index % COLORS.length] }}
                      ></span>
                      <span>{entry.name}</span>
                      <span className="font-semibold ml-1">
                        ${entry.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Purchases by Branch Donut */}
              <div className="flex-1 flex flex-col items-center min-w-0">
                <div className="font-medium mb-1">Purchases by Branch</div>
                <div className="w-full flex-1 flex items-center justify-center min-w-0">
                  <ResponsiveContainer width="100%" height={140}>
                    <RePieChart>
                      <Pie
                        data={purchasesByBranch}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={49}
                        label
                      >
                        {purchasesByBranch.map((entry, index) => (
                          <Cell
                            key={`cell-purchases-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full mt-2 flex flex-wrap justify-center gap-2 text-xs sm:text-sm overflow-x-auto min-w-0">
                  {purchasesByBranch.map((entry, index) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-1 whitespace-nowrap"
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ background: COLORS[index % COLORS.length] }}
                      ></span>
                      <span>{entry.name}</span>
                      <span className="font-semibold ml-1">
                        ${entry.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Row 3: Profit and Loss Dynamics + Expenditure by Category --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-4 min-h-[320px] flex flex-col md:col-span-2">
            <div className="font-semibold text-blue-700 mb-2">
              Profit and Loss Dynamics
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1 flex flex-col">
                <div className="text-xs text-gray-500 mb-2">
                  Chart 1: Consolidated P&L Trend (Last 12 Months)
                </div>
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={pnlData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Revenue"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="Expenses"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="NetProfit"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex-1 flex flex-col border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-4">
                <div className="text-xs text-gray-500 mb-2">
                  Chart 2: Expenditure by Category (Consolidated ~ YTD)
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <ResponsiveContainer width="100%" height={180}>
                    <RePieChart>
                      <Pie
                        data={expenditureCategories}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        label
                      >
                        {expenditureCategories.map((entry, index) => (
                          <Cell
                            key={`cell-exp-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="w-full mt-2 flex flex-wrap justify-center gap-2 text-xs sm:text-sm overflow-x-auto min-w-0">
                    {expenditureCategories.map((entry, index) => (
                      <div
                        key={entry.name}
                        className="flex items-center gap-1 whitespace-nowrap"
                      >
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ background: COLORS[index % COLORS.length] }}
                        ></span>
                        <span>{entry.name}</span>
                        <span className="font-semibold ml-1">
                          {entry.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 min-h-[320px] flex flex-col md:col-span-1">
            <div className="font-semibold text-blue-700 mb-2">
              Salesperson Performance
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Top 5 Best Salespersons
            </div>
            <div className="flex-1 flex flex-col gap-3 justify-center">
              {salesByPerson.map((sp, idx) => (
                <div
                  key={sp.name}
                  className={`flex items-center gap-4 rounded-lg p-3 shadow-sm border transition-all ${
                    idx === 0
                      ? "border-2 border-yellow-400 bg-yellow-50 shadow-lg scale-[1.03]"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg ${idx === 0 ? "bg-yellow-400 text-white" : "bg-blue-100 text-blue-700"}`}
                  >
                    {idx + 1}
                  </div>
                  <img
                    src={
                      sp.image ||
                      "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(sp.name)
                    }
                    alt={sp.name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-blue-900 truncate">
                      {sp.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {sp.branch}
                    </div>
                  </div>
                  <div className="font-bold text-blue-700 text-base whitespace-nowrap">
                    ${sp.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Row 4: Inventory Management & Efficiency --- */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
              <div className="font-medium text-blue-700 mb-1">
                Turnover Ratio
              </div>
              <div className="text-xl font-bold">{turnoverRatio}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
              <div className="font-medium text-blue-700 mb-1">
                Current Value
              </div>
              <div className="text-xl font-bold">
                UGX {currentValue.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col">
              <div className="font-semibold text-blue-700 mb-2">
                Top 5 Slow-Moving/Expiring Items
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full text-xs md:text-sm">
                    <thead>
                      <tr className="bg-blue-100 text-blue-700">
                        <th className="px-2 py-2">Product Name</th>
                        <th className="px-2 py-2">Branch</th>
                        <th className="px-2 py-2">Expiration Date</th>
                        <th className="px-2 py-2">Days Since Last Sale</th>
                        <th className="px-2 py-2">Current Stock Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slowMovingItems.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-blue-50">
                          <td className="px-2 py-2 font-medium">{item.name}</td>
                          <td className="px-2 py-2">{item.branch}</td>
                          <td className="px-2 py-2">{item.exp}</td>
                          <td className="px-2 py-2">{item.daysSinceSale}</td>
                          <td className="px-2 py-2">
                            UGX {item.value.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="font-semibold text-blue-700 mb-2">
                Prescription Volume Trend (Last 12 Months)
              </div>
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart
                    data={prescriptionVolume}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Prescriptions"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TenantDashboardLayout>
  );
};

export default DashboardHome;
