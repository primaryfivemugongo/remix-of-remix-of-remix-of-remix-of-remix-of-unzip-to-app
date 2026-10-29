// Edge Function: attendance-save
// Upserts a single attendance record securely using the service role

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), { status: 500, headers: corsHeaders });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const body = await req.json();
    const { student_id, stream_id, date, status, marked_by, marked_at, absent_reason } = body || {};

    if (!student_id || !stream_id || !date || !status) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
    }

    const payload = {
      student_id,
      stream_id,
      date,
      status,
      marked_by: marked_by ?? null,
      marked_at: marked_at ?? new Date().toISOString(),
      absent_reason: absent_reason ?? null
    };

    const { error } = await admin
      .from("attendance_records")
      .upsert(payload, { onConflict: "student_id,date" });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (e) {
    console.error("attendance-save error", e);
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: corsHeaders });
  }
});
