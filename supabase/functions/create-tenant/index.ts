import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { tenantName, email, password } = await req.json();

    // Input validation
    if (!tenantName || !email || !password) {
      throw new Error("Tenant name, email, and password are required.");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Create the tenant
    const { data: tenantData, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .insert({ name: tenantName })
      .select()
      .single();

    if (tenantError) throw tenantError;
    if (!tenantData) throw new Error("Failed to create tenant.");

    const tenant_id = tenantData.id;

    // 2. Create the user (admin for the new tenant)
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Or send a confirmation email
      });

    if (authError) {
      // If user creation fails, we should roll back the tenant creation
      await supabaseAdmin.from("tenants").delete().eq("id", tenant_id);
      throw authError;
    }
    if (!authData.user) throw new Error("Failed to create user.");

    const user_id = authData.user.id;

    // 3. Link the user to the tenant in user_profiles
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        user_id: user_id,
        tenant_id: tenant_id,
        role: "manager", // Assign the 'manager' or 'admin' role
        name: "Admin User", // A default name
      });

    if (profileError) {
      // If profile creation fails, roll back user and tenant
      await supabaseAdmin.auth.admin.deleteUser(user_id);
      await supabaseAdmin.from("tenants").delete().eq("id", tenant_id);
      throw profileError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
