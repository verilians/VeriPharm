import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import SupplierForm from "./SupplierForm";

// Types - Match the SupplierForm interface
interface SupplierFormData {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  tax_id?: string;
  license_number?: string;
  supplier_type?: 'wholesale' | 'manufacturer' | 'distributor' | 'retail';
  payment_terms?: string;
  credit_limit?: number;
  current_balance?: number;
  status?: 'active' | 'inactive' | 'suspended';
  rating?: number;
  notes?: string;
}

const AddSupplier: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (formData: SupplierFormData) => {
    console.log("🔄 [AddSupplier] Starting supplier creation...");
    console.log("📝 [AddSupplier] Form data:", formData);
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate user authentication
      if (!user?.tenant_id || !user?.branch_id) {
        throw new Error("User not authenticated or missing tenant/branch information");
      }

      // Prepare data for database insertion
      const supplierData = {
        tenant_id: user.tenant_id,
        branch_id: user.branch_id,
        name: formData.name,
        contact_person: formData.contact_person || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || 'Uganda',
        tax_id: formData.tax_id || null,
        license_number: formData.license_number || null,
        supplier_type: formData.supplier_type || 'wholesale',
        payment_terms: formData.payment_terms || 'Net 30 (Pay within 30 days)',
        credit_limit: formData.credit_limit || 0,
        current_balance: formData.current_balance || 0,
        status: formData.status || 'active',
        rating: formData.rating || null,
        notes: formData.notes || null,
        created_by: user.id,
      };

      console.log("💾 [AddSupplier] Inserting supplier data:", supplierData);

      // Insert supplier into database
      const { data: newSupplier, error } = await supabaseAdmin
        .from('suppliers')
        .insert(supplierData)
        .select()
        .single();

      if (error) {
        console.error("❌ [AddSupplier] Database error:", error);
        throw error;
      }

      console.log("✅ [AddSupplier] Supplier created successfully:", newSupplier);

      // Navigate to suppliers list with success message
      navigate("/branch/suppliers", { 
        state: { 
          message: `Supplier "${formData.name}" created successfully!` 
        } 
      });

    } catch (error) {
      console.error("❌ [AddSupplier] Error creating supplier:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to create supplier. Please try again.";
      
      setSubmitError(errorMessage);
      throw error; // Re-throw to let SupplierForm handle the error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log("🚫 [AddSupplier] Cancelling supplier creation");
    navigate("/branch/suppliers");
  };

  return (
    <SupplierForm
      isEditing={false}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={isSubmitting}
    />
  );
};

export default AddSupplier; 