import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { p_user_type, p_user_id, p_personal_email } = await req.json();

    if (!p_user_type || !p_user_id || !p_personal_email) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let updateResult;

    // Update the appropriate table based on user type
    if (p_user_type === 'student') {
      updateResult = await supabaseClient
        .from('students')
        .update({ 
          is_verified: true, 
          personal_email: p_personal_email 
        })
        .eq('id', p_user_id);
    } else if (p_user_type === 'teacher') {
      updateResult = await supabaseClient
        .from('teachers')
        .update({ 
          is_verified: true, 
          personal_email: p_personal_email 
        })
        .eq('id', p_user_id);
    } else if (p_user_type === 'admin') {
      updateResult = await supabaseClient
        .from('admins')
        .update({ 
          is_verified: true, 
          personal_email: p_personal_email 
        })
        .eq('id', p_user_id);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid user type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (updateResult.error) {
      console.error('Database update error:', updateResult.error);
      return new Response(
        JSON.stringify({ error: updateResult.error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify_user_account:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});