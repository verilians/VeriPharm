import mockPurchases from "../PurchasesSummary/mockPurchases";
import mockSales from "../Sales/mockSales";

// Generate stock movements from purchases and sales
export function getStockMovements() {
  const purchaseMovements = mockPurchases.flatMap((p) =>
    (p.itemsList || []).map((item) => ({
      branch: p.branch,
      item: item.name,
      date: p.date,
      quantity: item.quantity,
      type: "in",
      reason: "Purchase",
    }))
  );
  const salesMovements = mockSales.flatMap((s) =>
    (s.itemsList || []).map((item) => ({
      branch: s.branch,
      item: item.name,
      date: s.date,
      quantity: item.quantity,
      type: "out",
      reason: "Sale",
    }))
  );
  return [...purchaseMovements, ...salesMovements];
} 