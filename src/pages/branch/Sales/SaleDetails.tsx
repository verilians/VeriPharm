import React, { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit,
  FiPrinter,
  FiDownload,
  FiShare2,
  FiMessageCircle,
} from "react-icons/fi";
import { useSupabaseQuery } from "../../../lib/hooks/useSupabaseQuery";
import { useAuthStore } from "../../../stores/authStore";
import { useTenantCurrency } from "../../../lib/hooks/useTenantCurrency";
import { formatDateTime } from "../../../lib/utils";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard, DashboardCard } from "../../../components/UI";

interface Product {
  id: string;
  name: string;
  price: number;
  cost_price: number;
  quantity: number;
  manufacturer?: string;
  description?: string;
  barcode?: string;
  category_id?: string;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
}

interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_price: number;
  discount_amount: number;
  product: Product;
}

interface Sale {
  id: string;
  transaction_number: string;
  sale_date: string;
  customer_id?: string;
  cashier_id: string;
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  notes?: string;
  created_at: string;
  customer?: Customer;
  cashier?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  tenant?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  sale_items?: SaleItem[];
}

const SaleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { formatCurrency } = useTenantCurrency();

  // Memoize filters to prevent infinite re-renders
  const filters = useMemo(() => ({
    id: id,
    tenant_id: user?.tenant_id,
    branch_id: user?.branch_id
  }), [id, user?.tenant_id, user?.branch_id]);

  const {
    data: saleData,
    loading,
    error,
  } = useSupabaseQuery<Sale[]>(
    "sales",
    `*,
     customer:customers(id, first_name, last_name, email, phone, address),
     cashier:users!sales_cashier_id_fkey(id, first_name, last_name, email),
     tenant:tenants(id, name),
     branch:branches(id, name),
     sale_items(
       id, sale_id, product_id, product_name, quantity, unit_price, total_price, cost_price, discount_amount,
       product:products(id, name, price, cost_price, quantity, manufacturer, description, barcode)
     )`,
    {
      filters,
      useAdminClient: true
    }
  );

  const sale = saleData?.[0];

  // Debug logging
  useEffect(() => {
    if (error) {
      console.error("❌ SaleDetails query error:", error);
    }
    if (saleData) {
      console.log("✅ SaleDetails data loaded:", saleData);
    }
  }, [error, saleData]);

  // Prevent infinite re-renders by checking if we have the required data
  useEffect(() => {
    if (!id || !user?.tenant_id || !user?.branch_id) {
      console.log("⚠️ Missing required data for query:", { id, tenant_id: user?.tenant_id, branch_id: user?.branch_id });
    }
  }, [id, user?.tenant_id, user?.branch_id]);

  const summary = useMemo(() => {
    if (!sale?.sale_items) return null;
    
    const totalItems = sale.sale_items.reduce((sum, item) => sum + item.quantity, 0);
    const totalProfit = sale.sale_items.reduce(
      (sum, item) => sum + ((item.unit_price - item.cost_price) * item.quantity - item.discount_amount), 
      0
    );
    const profitMargin = sale.total_amount > 0 ? (totalProfit / sale.total_amount) * 100 : 0;

    return {
      totalItems,
      totalProfit,
      profitMargin,
    };
  }, [sale]);

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    navigate(`/branch/sales/edit/${id}`);
  };

  // WhatsApp sharing state
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);

  // Add after WhatsApp sharing state:
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailAttachmentType, setEmailAttachmentType] = useState<'txt' | 'pdf'>('pdf');

  const generateReceiptContent = (sale: Sale) => {
    const customer = sale.customer;
    const saleItems = sale.sale_items || [];
    
    // Get tenant and branch names from the sale data
    const tenantName = sale.tenant?.name || 'VeriPharm';
    const branchName = sale.branch?.name || 'Branch';
    
    let content = '';
    content += '='.repeat(40) + '\n';
    content += `        ${tenantName.toUpperCase()}\n`;
    content += `        ${branchName.toUpperCase()} RECEIPT\n`;
    content += '='.repeat(40) + '\n\n';
    
    content += `Transaction: ${sale.transaction_number}\n`;
    content += `Date: ${formatDateTime(sale.sale_date)}\n`;
    content += `Cashier: ${sale.cashier ? `${sale.cashier.first_name} ${sale.cashier.last_name}` : 'N/A'}\n`;
    
    if (customer) {
      content += `Customer: ${customer.first_name} ${customer.last_name}\n`;
      if (customer.phone) content += `Phone: ${customer.phone}\n`;
      if (customer.email) content += `Email: ${customer.email}\n`;
    }
    
    content += '\n' + '-'.repeat(40) + '\n';
    content += 'ITEMS:\n';
    content += '-'.repeat(40) + '\n';
    
    saleItems.forEach((item, index) => {
      content += `${index + 1}. ${item.product_name}\n`;
      content += `   Qty: ${item.quantity} x ${formatCurrency(item.unit_price)}\n`;
      if (item.discount_amount > 0) {
        content += `   Discount: -${formatCurrency(item.discount_amount)}\n`;
      }
      content += `   Total: ${formatCurrency(item.total_price)}\n\n`;
    });
    
    content += '-'.repeat(40) + '\n';
    content += `Subtotal: ${formatCurrency(sale.subtotal)}\n`;
    content += `Tax: ${formatCurrency(sale.tax)}\n`;
    content += `Discount: -${formatCurrency(sale.discount)}\n`;
    content += `TOTAL: ${formatCurrency(sale.total_amount)}\n`;
    content += '-'.repeat(40) + '\n';
    
    content += `Payment Method: ${sale.payment_method?.replace('_', ' ').toUpperCase()}\n`;
    content += `Status: ${sale.payment_status?.toUpperCase()}\n`;
    
    if (sale.notes) {
      content += `\nNotes: ${sale.notes}\n`;
    }
    
    content += '\n' + '='.repeat(40) + '\n';
    content += '           THANK YOU!\n';
    content += '='.repeat(40) + '\n';
    
    return content;
  };

  const generateHTMLReceipt = (sale: Sale) => {
    const customer = sale.customer;
    const saleItems = sale.sale_items || [];
    
    // Get tenant and branch names from the sale data
    const tenantName = sale.tenant?.name || 'VeriPharm';
    const branchName = sale.branch?.name || 'Branch';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${sale.transaction_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .receipt-info { margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f5f5f5; }
          .total-section { border-top: 2px solid #000; padding-top: 10px; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .footer { text-align: center; margin-top: 30px; border-top: 2px solid #000; padding-top: 10px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${tenantName.toUpperCase()}</h1>
          <h2>${branchName.toUpperCase()} RECEIPT</h2>
        </div>
        
        <div class="receipt-info">
          <p><strong>Transaction:</strong> ${sale.transaction_number}</p>
          <p><strong>Date:</strong> ${formatDateTime(sale.sale_date)}</p>
          <p><strong>Cashier:</strong> ${sale.cashier ? `${sale.cashier.first_name} ${sale.cashier.last_name}` : 'N/A'}</p>
          ${customer ? `
            <p><strong>Customer:</strong> ${customer.first_name} ${customer.last_name}</p>
            ${customer.phone ? `<p><strong>Phone:</strong> ${customer.phone}</p>` : ''}
            ${customer.email ? `<p><strong>Email:</strong> ${customer.email}</p>` : ''}
          ` : ''}
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Discount</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${saleItems.map((item, index) => `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unit_price)}</td>
                <td>${item.discount_amount > 0 ? formatCurrency(item.discount_amount) : '-'}</td>
                <td>${formatCurrency(item.total_price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(sale.subtotal)}</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>${formatCurrency(sale.tax)}</span>
          </div>
          <div class="total-row">
            <span>Discount:</span>
            <span>-${formatCurrency(sale.discount)}</span>
          </div>
          <div class="total-row" style="font-weight: bold; font-size: 1.2em;">
            <span>TOTAL:</span>
            <span>${formatCurrency(sale.total_amount)}</span>
          </div>
        </div>
        
        <div class="receipt-info">
          <p><strong>Payment Method:</strong> ${sale.payment_method?.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Status:</strong> ${sale.payment_status?.toUpperCase()}</p>
          ${sale.notes ? `<p><strong>Notes:</strong> ${sale.notes}</p>` : ''}
        </div>
        
        <div class="footer">
          <p><strong>Thank you for your purchase!</strong></p>
        </div>
      </body>
      </html>
    `;
  };

  const downloadReceipt = () => {
    if (!sale) return;

    // Create receipt content
    const receiptContent = generateReceiptContent(sale);
    
    // Create and download the file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${sale.transaction_number}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDFReceipt = () => {
    if (!sale) return;

    // Create a formatted HTML that can be printed as PDF
    const htmlContent = generateHTMLReceipt(sale);
    
    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleWhatsAppShare = () => {
    if (!sale) return;
    
    const customer = sale.customer;
    if (!customer) {
      alert('No customer associated with this sale');
      return;
    }

    // Check if customer has phone number
    if (!customer.phone) {
      setShowWhatsAppModal(true);
      setCustomerPhone('');
      return;
    }

    // If customer has phone, proceed with sharing
    shareReceiptViaWhatsApp(customer.phone);
  };

  const handleEmailShare = () => {
    if (!sale) return;
    const customer = sale.customer;
    if (!customer) {
      alert('No customer associated with this sale');
      return;
    }
    if (!customer.email) {
      setShowEmailModal(true);
      setCustomerEmail('');
      return;
    }
    // If customer has email, proceed
    setCustomerEmail(customer.email);
    setShowEmailModal(true);
  };

  const shareReceiptViaWhatsApp = async (phoneNumber: string) => {
    if (!sale) return;

    try {
      // Create WhatsApp message with receipt details embedded
      const receiptDetails = generateReceiptContent(sale);
      const message = `Hello ${sale.customer?.first_name || 'there'}! Here's your receipt for transaction ${sale.transaction_number}. Thank you for your purchase!

${receiptDetails}`;
      
      // Format phone number for WhatsApp (remove any non-digit characters)
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      
      // Create WhatsApp URL with embedded receipt
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      alert('Failed to share receipt via WhatsApp');
    }
  };

  const shareReceiptViaEmail = async (email: string) => {
    if (!sale) return;
    let fileName = '';
    let fileContent = '';
    let fileType = '';
    if (emailAttachmentType === 'txt') {
      fileContent = generateReceiptContent(sale);
      fileType = 'text/plain';
      fileName = `receipt-${sale.transaction_number}.txt`;
    } else {
      fileContent = generateHTMLReceipt(sale);
      fileType = 'text/html';
      fileName = `receipt-${sale.transaction_number}.html`;
    }
    // Prompt download
    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    // Open mailto link
    const subject = encodeURIComponent(`Your Receipt for Transaction ${sale.transaction_number}`);
    const body = encodeURIComponent(
      `Hello ${sale.customer?.first_name || ''},\n\nPlease find attached your receipt for transaction ${sale.transaction_number}.\n\n(If the file is not attached, please attach the downloaded file to this email.)\n\nThank you for your purchase!\n\n--\n${sale.tenant?.name || ''} ${sale.branch?.name || ''}`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  const updateCustomerPhone = async () => {
    if (!sale?.customer?.id || !customerPhone.trim()) return;

    setIsUpdatingCustomer(true);
    try {
      const { supabaseAdmin } = await import("../../../lib/supabase/supabaseClient");
      
      const { error } = await supabaseAdmin
        .from('customers')
        .update({ phone: customerPhone.trim() })
        .eq('id', sale.customer.id);

      if (error) throw error;

      // Share receipt after updating phone
      await shareReceiptViaWhatsApp(customerPhone.trim());
      
      // Close modal
      setShowWhatsAppModal(false);
      setCustomerPhone('');
      
      // Refresh sale data to show updated phone
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating customer phone:', error);
      alert('Failed to update customer phone number');
    } finally {
      setIsUpdatingCustomer(false);
    }
  };

  const updateCustomerEmail = async () => {
    if (!sale?.customer?.id || !customerEmail.trim()) return;
    setIsUpdatingEmail(true);
    try {
      const { supabaseAdmin } = await import("../../../lib/supabase/supabaseClient");
      const { error } = await supabaseAdmin
        .from('customers')
        .update({ email: customerEmail.trim() })
        .eq('id', sale.customer.id);
      if (error) throw error;
      // Share after updating
      await shareReceiptViaEmail(customerEmail.trim());
      setShowEmailModal(false);
      setCustomerEmail('');
      window.location.reload();
    } catch (error) {
      console.error('Error updating customer email:', error);
      alert('Failed to update customer email');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  if (loading) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </BranchDashboardLayout>
    );
  }

  if (error || !sale) {
    return (
      <BranchDashboardLayout>
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {error ? "Error loading sale details" : "Sale not found"}
          </div>
          <button
            onClick={() => navigate("/branch/sales")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Sales
          </button>
        </div>
      </BranchDashboardLayout>
    );
  }

  const customer = sale.customer;
  const saleItems = sale.sale_items || [];

  return (
    <BranchDashboardLayout>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/branch/sales")}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Sales
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              <FiPrinter className="mr-2 h-4 w-4" />
              Print
            </button>
            <button
              onClick={downloadReceipt}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              <FiDownload className="mr-2 h-4 w-4" />
              Download TXT
            </button>
            <button
              onClick={downloadPDFReceipt}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              <FiDownload className="mr-2 h-4 w-4" />
              Download PDF
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700"
            >
              <FiMessageCircle className="mr-2 h-4 w-4" />
              Share WhatsApp
            </button>
            <button
              onClick={handleEmailShare}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
            >
              <FiShare2 className="mr-2 h-4 w-4" />
              Share Email
            </button>
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md shadow-sm hover:bg-emerald-700"
            >
              <FiEdit className="mr-2 h-4 w-4" />
              Edit Sale
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Total Amount"
              value={formatCurrency(sale.total_amount)}
            />
            <DashboardCard
              title="Items Sold"
              value={summary.totalItems.toString()}
            />
            <DashboardCard
              title="Profit"
              value={formatCurrency(summary.totalProfit)}
            />
            <DashboardCard
              title="Profit Margin"
              value={`${summary.profitMargin.toFixed(1)}%`}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Sale Information */}
            <ContentCard title="Sale Information">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Transaction Number
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{sale.transaction_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sale Date
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDateTime(sale.sale_date)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {sale.payment_method?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      sale.payment_status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : sale.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : sale.payment_status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {sale.payment_status?.charAt(0).toUpperCase() + sale.payment_status?.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cashier
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {sale.cashier
                      ? `${sale.cashier.first_name} ${sale.cashier.last_name}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Created At
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDateTime(sale.created_at)}
                  </p>
                </div>
                {sale.notes && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{sale.notes}</p>
                  </div>
                )}
              </div>
            </ContentCard>

            {/* Items Sold */}
            <ContentCard title="Items Sold">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {saleItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.product?.name}
                            </div>
                            {item.product?.barcode && (
                              <div className="text-sm text-gray-500">
                                Barcode: {item.product.barcode}
                              </div>
                            )}
                            {item.product?.manufacturer && (
                              <div className="text-sm text-gray-500">
                                Manufacturer: {item.product.manufacturer}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.discount_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ContentCard>

            {/* Payment Summary */}
            <ContentCard title="Payment Summary">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(sale.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(sale.tax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="text-sm font-medium text-gray-900">
                    -{formatCurrency(sale.discount)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total:</span>
                    <span className="text-base font-bold text-gray-900">
                      {formatCurrency(sale.total_amount)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-medium ${
                    sale.status === 'completed' ? 'text-green-600' : 
                    sale.status === 'pending' ? 'text-yellow-600' : 
                    sale.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {sale.status?.charAt(0).toUpperCase() + sale.status?.slice(1)}
                  </span>
                </div>
              </div>
            </ContentCard>
          </div>

          <div className="space-y-6">
            {/* Customer Information */}
            {customer && (
              <ContentCard title="Customer Information">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {customer.first_name} {customer.last_name}
                    </p>
                  </div>
                  {customer.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
                    </div>
                  )}
                  {customer.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{customer.phone}</p>
                    </div>
                  )}
                  {customer.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="mt-1 text-sm text-gray-900">{customer.address}</p>
                    </div>
                  )}
                  {customer.date_of_birth && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDateTime(customer.date_of_birth)}
                      </p>
                    </div>
                  )}
                </div>
              </ContentCard>
            )}

            {/* Actions */}
            <ContentCard title="Actions">
              <div className="space-y-3">
                <button
                  onClick={handleEdit}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  <FiEdit className="mr-2 h-4 w-4" />
                  Edit Sale
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiPrinter className="mr-2 h-4 w-4" />
                  Print Receipt
                </button>
                <button
                  onClick={downloadReceipt}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiDownload className="mr-2 h-4 w-4" />
                  Download TXT Receipt
                </button>
                <button
                  onClick={downloadPDFReceipt}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiDownload className="mr-2 h-4 w-4" />
                  Download PDF Receipt
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                >
                  <FiMessageCircle className="mr-2 h-4 w-4" />
                  Share via WhatsApp
                </button>
                <button
                  onClick={handleEmailShare}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                >
                  <FiShare2 className="mr-2 h-4 w-4" />
                  Share via Email
                </button>
              </div>
            </ContentCard>
          </div>
        </div>
      </div>

      {/* WhatsApp Share Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                <FiMessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Share Receipt via WhatsApp
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter customer phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    The receipt will be sent as a formatted text message in WhatsApp.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowWhatsAppModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateCustomerPhone}
                    disabled={!customerPhone.trim() || isUpdatingCustomer}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingCustomer ? 'Updating...' : 'Share Receipt'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Share Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
                <FiShare2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Share Receipt via Email
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Email Address
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter customer email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachment Type
                  </label>
                  <select
                    value={emailAttachmentType}
                    onChange={(e) => setEmailAttachmentType(e.target.value as 'txt' | 'pdf')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pdf">PDF Receipt</option>
                    <option value="txt">Text Receipt</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sale?.customer?.email ? () => shareReceiptViaEmail(customerEmail) : updateCustomerEmail}
                    disabled={!customerEmail.trim() || isUpdatingEmail}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingEmail ? 'Updating...' : 'Share Receipt'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </BranchDashboardLayout>
  );
};

export default SaleDetails;