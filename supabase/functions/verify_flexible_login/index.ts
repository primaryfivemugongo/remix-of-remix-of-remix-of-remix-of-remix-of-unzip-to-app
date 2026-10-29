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

    const { p_identifier, p_password } = await req.json();

    if (!p_identifier || !p_password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Try to find user in students table
    const { data: student, error: studentError } = await supabaseClient
      .from('students')
      .select('*')
      .eq('email', p_identifier)
      .maybeSingle();

    if (student && !studentError) {
      // Use password_hash if it exists, otherwise use default_password
      const correctPassword = student.password_hash || (student.default_password ? student.default_password.toString().padStart(4, '0') : student.default_password);
      // Pad password to 4 digits for comparison with default_password
      const paddedPassword = p_password.padStart(4, '0');
      
      if (correctPassword === p_password || correctPassword === paddedPassword) {
        return new Response(
          JSON.stringify({
            success: true,
            role: 'student',
            token: `student_${student.id}`,
            name: student.name,
            student_id: student.id,
            email: student.email,
            is_verified: student.is_verified || false,
            personal_email: student.personal_email,
            photo_url: student.photo_url
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // User exists but password is wrong
        return new Response(
          JSON.stringify({ success: false, message: 'Your password is incorrect' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }

    // Try to find user in teachers table
    const { data: teacher, error: teacherError } = await supabaseClient
      .from('teachers')
      .select('*')
      .eq('email', p_identifier)
      .maybeSingle();

    if (teacher && !teacherError) {
      // Use password_hash if it exists, otherwise use default_password
      const correctPassword = teacher.password_hash || (teacher.default_password ? teacher.default_password.toString().padStart(4, '0') : null);
      // Pad password to 4 digits for comparison with default_password
      const paddedPassword = p_password.padStart(4, '0');
      
      if (correctPassword === p_password || correctPassword === paddedPassword) {
        return new Response(
          JSON.stringify({
            success: true,
            role: 'teacher',
            token: `teacher_${teacher.id}`,
            name: teacher.name,
            teacher_id: teacher.id,
            email: teacher.email,
            is_verified: teacher.is_verified || false,
            personal_email: teacher.personal_email
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // User exists but password is wrong
        return new Response(
          JSON.stringify({ success: false, message: 'Your password is incorrect' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }

    // Try to find user in admins table
    const { data: admin, error: adminError } = await supabaseClient
      .from('admins')
      .select('*')
      .eq('email', p_identifier)
      .maybeSingle();

    if (admin && !adminError) {
      if (admin.password_hash === p_password) {
        return new Response(
          JSON.stringify({
            success: true,
            role: 'admin',
            token: `admin_${admin.id}`,
            name: admin.name,
            email: admin.email,
            is_verified: admin.is_verified || false,
            personal_email: admin.personal_email
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // User exists but password is wrong
        return new Response(
          JSON.stringify({ success: false, message: 'Your password is incorrect' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }

    // If no user found with that email in any table
    return new Response(
      JSON.stringify({ success: false, message: 'Your email is incorrect' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in verify_flexible_login:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});