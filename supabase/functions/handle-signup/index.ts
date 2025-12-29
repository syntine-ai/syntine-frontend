import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    email: string;
    raw_user_meta_data: {
      first_name?: string;
      last_name?: string;
      organization_name?: string;
    };
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const payload: WebhookPayload = await req.json();
    console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

    // Only handle INSERT events on auth.users
    if (payload.type !== "INSERT" || payload.table !== "users") {
      console.log("Ignoring non-INSERT event or non-users table");
      return new Response(JSON.stringify({ message: "Ignored" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const user = payload.record;
    const metadata = user.raw_user_meta_data || {};
    const firstName = metadata.first_name || "";
    const lastName = metadata.last_name || "";
    const organizationName = metadata.organization_name || `${firstName}'s Organization`;

    console.log(`Creating organization and profile for user ${user.id}`);

    // Step 1: Create organization
    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: organizationName,
        email: user.email,
        plan: "starter",
        status: "trial",
      })
      .select()
      .single();

    if (orgError) {
      console.error("Error creating organization:", orgError);
      throw orgError;
    }

    console.log(`Created organization: ${org.id}`);

    // Step 2: Create profile linked to organization
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: user.id,
        organization_id: org.id,
        first_name: firstName,
        last_name: lastName,
        email: user.email,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Rollback: delete the organization
      await supabaseAdmin.from("organizations").delete().eq("id", org.id);
      throw profileError;
    }

    console.log(`Created profile for user: ${user.id}`);

    // Step 3: Assign org_owner role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: user.id,
        role: "org_owner",
      });

    if (roleError) {
      console.error("Error assigning role:", roleError);
      // Continue anyway - role can be assigned manually
    }

    console.log(`Assigned org_owner role to user: ${user.id}`);

    // Step 4: Log activity
    await supabaseAdmin.from("activity_logs").insert({
      organization_id: org.id,
      user_id: user.id,
      level: "info",
      service: "auth",
      action: "user_signup",
      message: `New user signed up: ${user.email}`,
      details: { organization_name: organizationName },
    });

    // Step 5: Create welcome notification
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      organization_id: org.id,
      type: "success",
      title: "Welcome to Syntine!",
      message: "Your account has been created. Start by creating your first AI agent.",
      action_url: "/app/agents",
    });

    console.log("Signup flow completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        organization_id: org.id,
        message: "User setup completed" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in handle-signup:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});