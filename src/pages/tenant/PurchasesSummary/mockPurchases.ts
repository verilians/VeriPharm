const mockPurchases = [
  {
    id: 1,
    branch: "Main Branch",
    date: "2024-06-01",
    supplier: "Medico Ltd.",
    total: 900,
    items: 25,
    status: "Received",
    itemsList: [
      { name: "Paracetamol", price: 10, quantity: 10 },
      { name: "Ibuprofen", price: 15, quantity: 5 },
    ],
  },
  {
    id: 2,
    branch: "Westside Branch",
    date: "2024-06-01",
    supplier: "PharmaPro",
    total: 700,
    items: 18,
    status: "Pending",
    itemsList: [
      { name: "Amoxicillin", price: 20, quantity: 8 },
      { name: "Cough Syrup", price: 12, quantity: 4 },
    ],
  },
  {
    id: 3,
    branch: "Main Branch",
    date: "2024-06-02",
    supplier: "HealthPlus",
    total: 1200,
    items: 30,
    status: "Received",
    itemsList: [
      { name: "Vitamin C", price: 8, quantity: 15 },
      { name: "Antacid", price: 18, quantity: 5 },
    ],
  },
];

export default mockPurchases;
