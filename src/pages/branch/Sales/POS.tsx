import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiDollarSign,
  FiUser,
  FiCreditCard,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiPackage,
  FiAlertTriangle,
  FiInfo,
  FiBell,
  FiSettings,
  FiChevronDown,
  FiShoppingCart,
} from "react-icons/fi";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";
import { useTenantCurrency } from "../../../lib/hooks/useTenantCurrency";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";

// Types - Updated to match database schema
interface Product {
  id: string;
  name: string;
  manufacturer_name?: string;
  barcode?: string;
  price: number;
  cost_price: number;
  quantity: number;
  category_id: string; // Updated to use category_id
  status: string;
  tenant_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  tenant_id: string;
  branch_id: string;
  created_at: string;
}

interface Customer {
  id: string;
  first_name: string; // Updated to match schema
  last_name: string;  // Updated to match schema
  phone?: string;
  email?: string;
  tenant_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

interface CartItem extends Product {
  quantity: number;
  total: number;
}

interface Sale {
  id: string;
  tenant_id: string;
  branch_id: string;
  transaction_number: string; // Added to match schema
  customer_id?: string;
  cashier_id: string; // Updated to match schema
  sale_date: string;
  subtotal: number; // Added to match schema
  tax: number; // Added to match schema
  discount: number; // Added to match schema
  total_amount: number;
  payment_method: string;
  payment_status: string; // Added to match schema
  status: string;
  notes?: string; // Added to match schema
  created_at: string;
  updated_at: string;
}

interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string; // Added to match schema
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_price: number; // Added to match schema
  discount_amount: number; // Added to match schema
  created_at: string;
  updated_at: string;
}

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "error" | "success" | "warning" | "info";
}

interface ToastProps {
  isVisible: boolean;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

// Enhanced Error Modal Component
const ErrorModal: React.FC<ErrorModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = "error" 
}) => {
  if (!isOpen) return null;

  const icons = {
    error: FiAlertCircle,
    success: FiCheckCircle,
    warning: FiAlertTriangle,
    info: FiInfo,
  };

  const colors = {
    error: {
      bg: "bg-red-50",
      border: "border-red-500",
      icon: "text-red-600",
      text: "text-red-800",
      button: "bg-red-500 hover:bg-red-600",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-500",
      icon: "text-green-600",
      text: "text-green-800",
      button: "bg-green-500 hover:bg-green-600",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      icon: "text-yellow-600",
      text: "text-yellow-800",
      button: "bg-yellow-500 hover:bg-yellow-600",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      icon: "text-blue-600",
      text: "text-blue-800",
      button: "bg-blue-500 hover:bg-blue-600",
    },
  };

  const IconComponent = icons[type];
  const colorScheme = colors[type];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-5"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl p-8 max-w-md w-full border-2 ${colorScheme.border} shadow-2xl relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <FiX size={20} />
        </button>

        {/* Icon and Title */}
        <div className="text-center mb-5">
          <div
            className={`w-20 h-20 ${colorScheme.bg} rounded-full flex items-center justify-center mx-auto mb-5 border-3 ${colorScheme.border} shadow-lg`}
          >
            <IconComponent size={36} className={colorScheme.icon} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
        </div>

        {/* Message */}
        <div
          className={`${colorScheme.bg} p-5 rounded-xl mb-6 border ${colorScheme.border} bg-opacity-20`}
        >
          <p className={`${colorScheme.text} leading-relaxed text-sm whitespace-pre-line`}>
            {message}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full py-3 px-6 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${colorScheme.button}`}
        >
          {type === "success" ? "Continue" : "Close"}
        </button>
      </div>
    </div>
  );
};

// Toast Notification Component
const Toast: React.FC<ToastProps> = ({ 
  isVisible, 
  message, 
  type = "success", 
  onClose 
}) => {
  if (!isVisible) return null;

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1"
      >
        <FiX size={16} />
      </button>
    </div>
  );
};

const POS: React.FC = () => {
  const { user } = useAuthStore();
  const { formatCurrency } = useTenantCurrency();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Error modal states
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "error" | "success" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "error",
  });

  // Toast notification states
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    isVisible: false,
    message: "",
    type: "success",
  });

  // Customer search states
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper functions
  const showError = (title: string, message: string, type: "error" | "success" | "warning" | "info" = "error") => {
    setErrorModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const showSuccess = (title: string, message: string) => {
    setErrorModal({
      isOpen: true,
      title,
      message,
      type: "success",
    });
  };

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    setToast({
      isVisible: true,
      message,
      type,
    });
  };

  const closeModal = () => {
    setErrorModal({
      isOpen: false,
      title: "",
      message: "",
      type: "error",
    });
  };

  const closeToast = () => {
    setToast({
      isVisible: false,
      message: "",
      type: "success",
    });
  };

  // Load products, categories and customers
  useEffect(() => {
    const loadData = async () => {
      if (!user?.branch_id) {
        setLoading(false);
        return;
      }

      try {
        console.log("🔄 [POS] Loading products, categories and customers...");
        setLoading(true);

        // Load products for the current branch using service role
        const { data: productsData, error: productsError } = await supabaseAdmin
          .from('products')
          .select('*')
          .eq('branch_id', user.branch_id)
          .eq('status', 'active')
          .gt('quantity', 0);

        if (productsError) {
          console.error('Products error:', productsError);
          throw productsError;
        }

        // Load categories for the current branch using service role
        const { data: categoriesData, error: categoriesError } = await supabaseAdmin
          .from('categories')
          .select('*')
          .eq('branch_id', user.branch_id)
          .eq('status', 'active')
          .order('sort_order', { ascending: true });

        if (categoriesError) {
          console.error('Categories error:', categoriesError);
          // Don't throw error for categories, just log it
        }

        // Load customers for the current branch using service role
        const { data: customersData, error: customersError } = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('branch_id', user.branch_id);

        if (customersError) {
          console.error('Customers error:', customersError);
          throw customersError;
        }

        console.log("✅ [POS] Products loaded:", productsData?.length || 0);
        console.log("✅ [POS] Categories loaded:", categoriesData?.length || 0);
        console.log("✅ [POS] Customers loaded:", customersData?.length || 0);

        setProducts(productsData || []);
        setCategories(categoriesData || []);
        setCustomers(customersData || []);

        // Show friendly message if no products available
        if (!productsData || productsData.length === 0) {
          showError(
            "No Products Available", 
            "There are currently no products available for sale. Please add products to your inventory first.", 
            "info"
          );
        }
      } catch (error) {
        console.error("❌ [POS] Error loading data:", error);
        showError(
          "Unable to Load Data", 
          "We're having trouble connecting to load your products and customers. Please check your internet connection and try refreshing the page.",
          "warning"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.branch_id]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const productName = (product.name || "").toLowerCase();
    const productBarcode = product.barcode || "";
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      productName.includes(searchLower) || productBarcode.includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" || product.category_id === selectedCategory;
    const isActive = (product.status || "active") === "active";
    const hasStock = (product.quantity || 0) > 0;

    return matchesSearch && matchesCategory && isActive && hasStock;
  });

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  // Cart functions
  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      showError("Out of Stock", `${product.name} is currently out of stock.`);
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        showError(
          "Insufficient Stock",
          `Cannot add more ${product.name}. Only ${product.quantity} items available in stock.`
        );
        return;
      }

      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price,
              }
            : item
        )
      );
      showToast(`Added ${product.name} to cart`, "success");
    } else {
      setCart([...cart, { ...product, quantity: 1, total: product.price }]);
      showToast(`${product.name} added to cart`, "success");
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && newQuantity > product.quantity) {
      showError(
        "Insufficient Stock",
        `Cannot set quantity to ${newQuantity}. Only ${product.quantity} items available for ${product.name}.`
      );
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.price,
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  // Complete sale function
  const completeSale = async () => {
    if (cart.length === 0) {
      showError("Empty Cart", "Please add items to cart before completing sale.");
      return;
    }

    if (!user) {
      showError("Authentication Error", "Please log in to complete the sale.");
      return;
    }

    setProcessing(true);

    try {
      const totalAmount = getCartTotal();
      
      console.log("🔄 [Sale Completion] Starting sale completion...");
      console.log("👤 [Sale Completion] Current user:", { id: user.id, tenant_id: user.tenant_id, branch_id: user.branch_id });
      console.log("🛒 [Sale Completion] Cart items:", cart.length);
      console.log("💰 [Sale Completion] Total amount:", totalAmount);
      console.log("👥 [Sale Completion] Selected customer:", customer);

      // Create sale record
      const saleData = {
        tenant_id: user.tenant_id,
        branch_id: user.branch_id,
        transaction_number: `POS-${Date.now()}`, // Generate a unique transaction number
        customer_id: customer?.id || null, // Include selected customer
        cashier_id: user.id,
        sale_date: new Date().toISOString(),
        subtotal: totalAmount, // Assuming subtotal is the total amount for now
        tax: 0, // Placeholder for tax
        discount: 0, // Placeholder for discount
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: 'completed', // Assuming payment is completed immediately
        status: 'completed',
        notes: 'POS Sale',
      };
      
      console.log("📤 [Sale Completion] Inserting sale with data:", saleData);
      
      const { data: saleResult, error: saleError } = await supabaseAdmin
        .from('sales')
        .insert(saleData)
        .select()
        .single();

      console.log("📥 [Sale Completion] Sale insert result:", { saleResult, saleError });

      if (saleError) {
        console.error("❌ [Sale Completion] Error creating sale:", saleError);
        throw saleError;
      }

      // Create sale items
      const saleItems = cart.map((item) => ({
        sale_id: saleResult.id,
        product_id: item.id,
        product_name: item.name, // Add product name
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.total,
        cost_price: item.cost_price,
        discount_amount: 0, // Placeholder for discount amount
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update product quantities
      for (const item of cart) {
        // Find the current product to get its current quantity
        const currentProduct = products.find(p => p.id === item.id);
        if (currentProduct) {
          const newQuantity = currentProduct.quantity - item.quantity;
          const { error: updateError } = await supabaseAdmin
            .from('products')
            .update({ 
              quantity: Math.max(0, newQuantity) // Ensure quantity doesn't go negative
            })
            .eq('id', item.id);

          if (updateError) throw updateError;
        }
      }

      showSuccess("Sale Completed", `Sale completed successfully! Total: ${totalAmount.toLocaleString()} UGX`);
      setCart([]);
      setCustomer(null);
      
      // Reload products to reflect updated quantities
      const { data: updatedProducts } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('branch_id', user.branch_id)
        .eq('status', 'active')
        .gt('quantity', 0);

      setProducts(updatedProducts || []);

    } catch (error) {
      console.error("❌ [POS] Error completing sale:", error);
      showError("Error", "Failed to complete sale. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Price editing functions
  const startEditingPrice = (itemId: string, currentPrice: number) => {
    setEditingPrice(itemId);
    setTempPrice(currentPrice.toString());
  };

  const cancelEditingPrice = () => {
    setEditingPrice(null);
    setTempPrice("");
  };

  const saveEditedPrice = (itemId: string) => {
    const newPrice = parseFloat(tempPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      showError("Invalid Price", "Please enter a valid price.");
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === itemId
          ? {
              ...item,
              price: newPrice,
              total: newPrice * item.quantity,
            }
          : item
      )
    );

    setEditingPrice(null);
    setTempPrice("");
  };

  const handlePriceKeyPress = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === "Enter") {
      saveEditedPrice(itemId);
    } else if (e.key === "Escape") {
      cancelEditingPrice();
    }
  };

  // Customer search functions
  const handleCustomerSearch = (searchValue: string) => {
    setCustomerSearchTerm(searchValue);
    setShowCustomerDropdown(true);

    if (searchValue.trim() === "") {
      setFilteredCustomers([]);
      return;
    }

    const filtered = customers.filter((customer) =>
      customer.first_name.toLowerCase().includes(searchValue.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchValue.toLowerCase()) ||
      customer.phone?.includes(searchValue) ||
      customer.email?.toLowerCase().includes(searchValue.toLowerCase())
    );

    setFilteredCustomers(filtered);
  };

  const createNewCustomer = async (searchTerm: string) => {
    if (!user) {
      console.log("❌ [Customer Creation] No user found");
      return;
    }
    
    console.log("🔄 [Customer Creation] Starting customer creation process...");
    console.log("📝 [Customer Creation] Search term:", searchTerm);
    console.log("👤 [Customer Creation] Current user:", { id: user.id, tenant_id: user.tenant_id, branch_id: user.branch_id });
    
    setCreatingCustomer(true);
    try {
      // Parse name
      const nameParts = searchTerm.trim().split(' ');
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(' ');
      
      console.log("📝 [Customer Creation] Parsed name:", { first_name, last_name });

      // Check if customer already exists in this branch
      console.log("🔍 [Customer Creation] Checking for existing customer...");
      const { data: existing, error: existingError } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('branch_id', user.branch_id)
        .eq('first_name', first_name)
        .eq('last_name', last_name);
        
      console.log("🔍 [Customer Creation] Existing customer check result:", { existing, existingError });
      
      if (existingError) {
        console.error("❌ [Customer Creation] Error checking existing customer:", existingError);
        throw existingError;
      }
      
      if (existing && existing.length > 0) {
        console.log("✅ [Customer Creation] Customer already exists, selecting:", existing[0]);
        setCustomer(existing[0]);
        setCustomerSearchTerm(existing[0].first_name + ' ' + existing[0].last_name);
        setShowCustomerDropdown(false);
        showToast('Customer already exists and was selected.', 'info');
        return;
      }

      // Insert new customer
      const customerData = {
        first_name,
        last_name,
        tenant_id: user.tenant_id,
        branch_id: user.branch_id,
      };
      
      console.log("📤 [Customer Creation] Inserting new customer with data:", customerData);
      
      const { data: newCustomer, error } = await supabaseAdmin
        .from('customers')
        .insert(customerData)
        .select()
        .single();
        
      console.log("📥 [Customer Creation] Insert result:", { newCustomer, error });
      
      if (error) {
        console.error("❌ [Customer Creation] Error inserting customer:", error);
        throw error;
      }
      
      console.log("✅ [Customer Creation] Customer created successfully:", newCustomer);
      setCustomers([...customers, newCustomer]);
      setCustomer(newCustomer);
      setCustomerSearchTerm(newCustomer.first_name + ' ' + newCustomer.last_name);
      setShowCustomerDropdown(false);
      showToast('Customer created successfully', 'success');
    } catch (error) {
      console.error("❌ [Customer Creation] Final error:", error);
      showError('Error', 'Failed to create customer.');
    } finally {
      setCreatingCustomer(false);
    }
  };

  const selectCustomer = (selectedCustomer: Customer) => {
    setCustomer(selectedCustomer);
    setCustomerSearchTerm(selectedCustomer.first_name + ' ' + selectedCustomer.last_name);
    setShowCustomerDropdown(false);
  };

  const clearCustomer = () => {
    setCustomer(null);
    setCustomerSearchTerm("");
    setShowCustomerDropdown(false);
  };

  // Click outside handler for customer dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.customer-search-container')) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <BranchDashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-900 font-semibold text-lg mb-2">Setting up your POS system</p>
            <p className="text-gray-600">Loading products and customer data...</p>
          </div>
        </div>
      </BranchDashboardLayout>
    );
  }

  return (
    <BranchDashboardLayout>
      <div className="pos-container-wrapper">
        <div className="pos-layout">
        {/* Left Panel - Products */}
        <div className="pos-left-panel">
          {/* Search and Filters */}
          <div className="pos-search-section">
            <div className="pos-search-fields">
              {/* Product Search */}
              <div className="pos-input-group">
                <input
                  type="text"
                  placeholder="Search products or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pos-input"
                />
                <FiSearch className="pos-input-icon" />
              </div>
              
              {/* Customer Search */}
              <div className="pos-input-group">
                <input
                  type="text"
                  placeholder="Search or create customer..."
                  value={customerSearchTerm}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customerSearchTerm.trim() && !creatingCustomer) {
                      e.preventDefault();
                      createNewCustomer(customerSearchTerm);
                    }
                  }}
                  className="pos-input"
                />
                <FiUser className="pos-input-icon" />
                
                {showCustomerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => selectCustomer(customer)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        )}
                      </div>
                    ))}
                    {customerSearchTerm && filteredCustomers.length === 0 && (
                      <div
                        onClick={() => !creatingCustomer && createNewCustomer(customerSearchTerm)}
                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-indigo-600 ${creatingCustomer ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {creatingCustomer ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                            Creating...
                          </span>
                        ) : (
                          `+ Create "${customerSearchTerm}"`
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Category Filter */}
              <div className="pos-category-filter">
                <FiSearch className="text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pos-category-select"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="pos-products-grid">
            <div className="pos-products-container">
              {filteredProducts.length === 0 ? (
                <div className="pos-empty-products">
                  <div className="text-center py-12">
                    <FiPackage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {products.length === 0 ? "No Products Available" : "No Products Found"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {products.length === 0 
                        ? "Add products to your inventory to start making sales" 
                        : searchTerm 
                          ? `No products match "${searchTerm}". Try adjusting your search.`
                          : "No products match the selected category filter."
                      }
                    </p>
                    {products.length === 0 && (
                      <button
                        onClick={() => window.location.href = '/branch/stock/add-product'}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        <FiPlus className="mr-2 h-4 w-4" />
                        Add Products
                      </button>
                    )}
                    {searchTerm && products.length > 0 && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="pos-product-card"
                  >
                    {/* LOW Stock Badge */}
                    {product.quantity <= 5 && (
                      <div className="pos-low-stock-badge">
                        LOW
                      </div>
                    )}
                    
                    <div className="pos-product-name">
                      {product.name}
                    </div>
                    <div className="pos-product-category">
                      {getCategoryName(product.category_id)}
                    </div>
                    <div className="pos-product-price">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="pos-product-stock">
                      <FiPackage className="w-3 h-3" />
                      {product.quantity} left
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Current Sale */}
        <div className="pos-right-panel">
          <div className="pos-cart-header">
            <h2 className="pos-cart-title">Current Sale</h2>
          </div>
          
          <div className="pos-cart-content">
            {cart.length === 0 ? (
              <div className="pos-empty-cart">
                <div className="text-center py-8">
                  <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Cart is Empty</p>
                  <p className="text-gray-500 text-sm">
                    Add products by clicking on them or scanning barcodes
                  </p>
                </div>
              </div>
            ) : (
              <div className="pos-cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="pos-cart-item">
                    <div className="pos-cart-item-header">
                      <h4 className="pos-cart-item-name">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="pos-cart-item-remove"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="pos-cart-item-controls">
                      <div className="pos-quantity-controls">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="pos-quantity-btn"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="pos-quantity-value">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="pos-quantity-btn"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                      
                      <div className="pos-cart-item-price">
                        {editingPrice === item.id ? (
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onKeyDown={(e) => handlePriceKeyPress(e, item.id)}
                            onBlur={() => saveEditedPrice(item.id)}
                            className="w-20 text-right border border-gray-300 rounded px-2 py-1 text-sm"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => startEditingPrice(item.id, item.price)}
                            className="hover:text-indigo-600"
                          >
                            {formatCurrency(item.price)}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="pos-cart-item-total">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="pos-payment-section">
            <div className="pos-payment-methods">
              <label className="pos-payment-method">
                <span className="mr-2">Method:</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="credit">Credit</option>
                </select>
              </label>
            </div>

            <div className="pos-payment-total">
              <span>Total:</span>
              <span>{formatCurrency(getCartTotal())}</span>
            </div>

            <button
              onClick={completeSale}
              disabled={cart.length === 0 || processing}
              className="pos-complete-btn"
            >
              {processing ? "Processing..." : "Complete Sale"}
            </button>
          </div>
        </div>
      </div>

      {/* Modals and Toasts */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={closeModal}
        title={errorModal.title}
        message={errorModal.message}
        type={errorModal.type}
      />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
      </div>
    </BranchDashboardLayout>
  );
};

export default POS; 