const mockSales = [
  // Westside Branch sales
  {
    id: 1,
    branch: "Westside Branch",
    date: "2024-06-01",
    salesperson: "Evelyn Sales",
    total: 1200,
    items: 45,
    status: "Completed",
    itemsList: [
      { id: "IT101", name: "Paracetamol", price: 10, quantity: 10 },
      { id: "IT102", name: "Ibuprofen", price: 15, quantity: 5 },
    ],
  },
  {
    id: 2,
    branch: "Westside Branch",
    date: "2024-06-02",
    salesperson: "Henry West",
    total: 950,
    items: 38,
    status: "Completed",
    itemsList: [
      { id: "IT103", name: "Amoxicillin", price: 20, quantity: 8 },
      { id: "IT104", name: "Cough Syrup", price: 12, quantity: 4 },
    ],
  },
  {
    id: 3,
    branch: "Westside Branch",
    date: "2024-06-03",
    salesperson: "Ivy Chen",
    total: 1100,
    items: 41,
    status: "Pending",
    itemsList: [
      { id: "IT105", name: "Vitamin C", price: 8, quantity: 15 },
      { id: "IT106", name: "Antacid", price: 18, quantity: 5 },
    ],
  },
  // Eastside Branch sales
  {
    id: 4,
    branch: "Eastside Branch",
    date: "2024-06-01",
    salesperson: "Frank East",
    total: 980,
    items: 36,
    status: "Completed",
    itemsList: [
      { id: "IT107", name: "Loratadine", price: 14, quantity: 7 },
      { id: "IT108", name: "Cetirizine", price: 13, quantity: 6 },
    ],
  },
  {
    id: 5,
    branch: "Eastside Branch",
    date: "2024-06-02",
    salesperson: "Grace Lin",
    total: 1050,
    items: 39,
    status: "Completed",
    itemsList: [
      { id: "IT109", name: "Aspirin", price: 11, quantity: 9 },
      { id: "IT110", name: "Multivitamin", price: 16, quantity: 4 },
    ],
  },
  // Main Branch sales
  {
    id: 6,
    branch: "Main Branch",
    date: "2024-06-01",
    salesperson: "Jack Main",
    total: 1300,
    items: 48,
    status: "Completed",
    itemsList: [
      { id: "IT201", name: "Metformin", price: 22, quantity: 10 },
      { id: "IT202", name: "Lisinopril", price: 18, quantity: 6 },
    ],
  },
  {
    id: 7,
    branch: "Main Branch",
    date: "2024-06-02",
    salesperson: "Karen Lee",
    total: 1250,
    items: 44,
    status: "Completed",
    itemsList: [
      { id: "IT203", name: "Atorvastatin", price: 25, quantity: 8 },
      { id: "IT204", name: "Simvastatin", price: 20, quantity: 7 },
    ],
  },
  {
    id: 8,
    branch: "Main Branch",
    date: "2024-06-03",
    salesperson: "Liam Turner",
    total: 1280,
    items: 46,
    status: "Pending",
    itemsList: [
      { id: "IT205", name: "Amlodipine", price: 19, quantity: 9 },
      { id: "IT206", name: "Omeprazole", price: 17, quantity: 5 },
    ],
  },
];

export default mockSales;
