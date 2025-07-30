import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Activity,
  Home,
} from "lucide-react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";

// Custom CSS for legend positioning
const legendStyle = `
  .recharts-legend-wrapper {
    top: 180px !important;
  }
`;

// Mock data for demonstration purposes
const mockData = {
  expenditure: [
    { month: "Jan", amount: 12000 },
    { month: "Feb", amount: 11500 },
    { month: "Mar", amount: 13000 },
    { month: "Apr", amount: 12500 },
    { month: "May", amount: 14000 },
    { month: "Jun", amount: 13500 },
    { month: "Jul", amount: 15000 },
    { month: "Aug", amount: 14500 },
    { month: "Sep", amount: 16000 },
    { month: "Oct", amount: 15500 },
    { month: "Nov", amount: 17000 },
    { month: "Dec", amount: 16500 },
  ],
  expenditureByCategory: [
    { name: "Salaries", value: 70000 },
    { name: "Rent", value: 24000 },
    { name: "Marketing", value: 15000 },
    { name: "Utilities", value: 8000 },
    { name: "Inventory", value: 35000 },
    { name: "Other", value: 10000 },
  ],
  profitLoss: [
    { month: "Jan", revenue: 25000, expenses: 12000, profit: 13000 },
    { month: "Feb", revenue: 24500, expenses: 11500, profit: 13000 },
    { month: "Mar", revenue: 26000, expenses: 13000, profit: 13000 },
    { month: "Apr", revenue: 25500, expenses: 12500, profit: 13000 },
    { month: "May", revenue: 27000, expenses: 14000, profit: 13000 },
    { month: "Jun", revenue: 26500, expenses: 13500, profit: 13000 },
    { month: "Jul", revenue: 28000, expenses: 15000, profit: 13000 },
    { month: "Aug", revenue: 27500, expenses: 14500, profit: 13000 },
    { month: "Sep", revenue: 29000, expenses: 16000, profit: 13000 },
    { month: "Oct", revenue: 28500, expenses: 15500, profit: 13000 },
    { month: "Nov", revenue: 30000, expenses: 17000, profit: 13000 },
    { month: "Dec", revenue: 29500, expenses: 16500, profit: 13000 },
  ],
  capital: {
    currentCapital: 150000,
    retainedEarnings: 120000,
    ownerContributions: 50000,
    ownerWithdrawals: 20000,
    capitalChanges: [
      { date: "2024-01-01", type: "Beginning Balance", amount: 140000 },
      { date: "2024-03-15", type: "Owner Contribution", amount: 10000 },
      { date: "2024-06-30", type: "Net Profit", amount: 15000 },
      { date: "2024-09-01", type: "Owner Withdrawal", amount: -5000 },
      { date: "2024-12-31", type: "Net Profit", amount: 10000 },
    ],
  },
};

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00c49f",
  "#ffbb28",
];

const KPICard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  unit = "",
}) => {
  const isPositive = trend === "up";
  const trendColor = isPositive ? "text-green-500" : "text-red-500";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        {Icon && <Icon className="text-blue-500 w-6 h-6" />}
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-2">
        {unit}
        {value.toLocaleString()}
      </div>
      {trend && (
        <div className={`flex items-center text-sm ${trendColor}`}>
          <TrendIcon className="w-4 h-4 mr-1" />
          <span>{trendValue}% vs last period</span>
        </div>
      )}
    </div>
  );
};

const Finance = () => {
  const currentMonthExpenditure =
    mockData.expenditure[mockData.expenditure.length - 1].amount;
  const previousMonthExpenditure =
    mockData.expenditure[mockData.expenditure.length - 2].amount;
  const expenditureTrend = (
    ((currentMonthExpenditure - previousMonthExpenditure) /
      previousMonthExpenditure) *
    100
  ).toFixed(2);

  const currentMonthProfitData =
    mockData.profitLoss[mockData.profitLoss.length - 1];
  const currentNetProfit = currentMonthProfitData.profit;
  const previousNetProfit =
    mockData.profitLoss[mockData.profitLoss.length - 2].profit;
  const profitTrend = (
    ((currentNetProfit - previousNetProfit) / previousNetProfit) *
    100
  ).toFixed(2);
  const profitMargin = (
    (currentNetProfit / currentMonthProfitData.revenue) *
    100
  ).toFixed(2);

  return (
    <TenantDashboardLayout>
      <style>{legendStyle}</style>
      <div className="w-full h-full flex-1">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center">
            Business Financial Overview
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Key financial metrics at a glance for informed decision-making.
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Total Expenditure (Last Month)"
            value={currentMonthExpenditure}
            unit="$"
            icon={DollarSign}
            trend={Number(expenditureTrend) >= 0 ? "up" : "down"}
            trendValue={Math.abs(Number(expenditureTrend))}
          />
          <KPICard
            title={`Net ${currentNetProfit >= 0 ? "Profit" : "Loss"} (Last Month)`}
            value={Math.abs(currentNetProfit)}
            unit="$"
            icon={CreditCard}
            trend={Number(profitTrend) >= 0 ? "up" : "down"}
            trendValue={Math.abs(Number(profitTrend))}
          />
          <KPICard
            title="Profit Margin (Last Month)"
            value={profitMargin}
            unit="%"
            icon={Activity}
            trend="up"
            trendValue={0}
          />
          <KPICard
            title="Total Capital / Owner's Equity"
            value={mockData.capital.currentCapital}
            unit="$"
            icon={Home}
            trend="up"
            trendValue={0}
          />
        </main>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expenditure Trend Over Time */}
          <div className="bg-white p-6 rounded-xl shadow-lg h-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Expenditure Trend (Last 12 Months)
            </h2>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart
                data={mockData.expenditure}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: "#ccc" }}
                />
                <YAxis
                  unit="$"
                  tickFormatter={(value) => value.toLocaleString()}
                  axisLine={{ stroke: "#ccc" }}
                />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Total Expenditure"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Expenditure by Category */}
          <div className="bg-white p-6 rounded-xl shadow-lg h-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Expenditure by Category (YTD)
            </h2>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={mockData.expenditureByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={window.innerWidth < 768 ? 85 : 105}
                  fill="#8884d8"
                  dataKey="value"
                  label={false}
                >
                  {mockData.expenditureByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  className="hidden md:block"
                  formatter={(value, entry, index) => {
                    const data = mockData.expenditureByCategory[index];
                    const total = mockData.expenditureByCategory.reduce(
                      (sum, item) => sum + item.value,
                      0
                    );
                    const percentage = ((data.value / total) * 100).toFixed(0);
                    return `${value} (${percentage}%)`;
                  }}
                />
                <Tooltip
                  {...({ className: "md:hidden" } as any)}
                  formatter={(value, name) => {
                    const data = mockData.expenditureByCategory.find(
                      (item) => item.name === name
                    );
                    const total = mockData.expenditureByCategory.reduce(
                      (sum, item) => sum + item.value,
                      0
                    );
                    const percentage = ((data.value / total) * 100).toFixed(0);
                    return [`${value} (${percentage}%)`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue, Expenses, and Profit/Loss Trend */}
          <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2 h-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Revenue, Expenses, & Profit/Loss (Last 12 Months)
            </h2>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart
                data={mockData.profitLoss}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: "#ccc" }}
                />
                <YAxis
                  unit="$"
                  tickFormatter={(value) => value.toLocaleString()}
                  axisLine={{ stroke: "#ccc" }}
                />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ff7300"
                  strokeWidth={2}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Net Profit/Loss"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Capital Changes Section */}
        <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Capital Changes
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg"
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockData.capital.capitalChanges.map((change, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {change.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {change.type}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${change.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {change.amount >= 0 ? "+" : ""}$
                      {change.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-gray-500 text-sm mt-8">
          Data updated: {new Date().toLocaleDateString()}
        </footer>
      </div>
    </TenantDashboardLayout>
  );
};

export default Finance;
 