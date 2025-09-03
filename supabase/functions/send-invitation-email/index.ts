import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailData {
  email: string;
  role: string;
  invitedBy: string;
  expires_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, role, invitedBy, expires_at }: InvitationEmailData = await req.json();
    
    console.log("Sending invitation email to:", email);

    const expiryDate = new Date(expires_at).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const signUpUrl = `${Deno.env.get("SUPABASE_URL")}/auth/v1/signup`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; text-align: center;">
          <h1 style="color: #333; margin-bottom: 10px;">You're Invited!</h1>
          <h2 style="color: #666; font-weight: normal; margin-bottom: 30px;">Kensington Probus Club</h2>
        </div>
        
        <div style="padding: 30px 0;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            You have been invited to join the Kensington Probus Club administration system as a <strong>${role}</strong> member.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">How to get started:</h3>
            <ol style="color: #666; line-height: 1.8;">
              <li>Visit our admin portal: <a href="https://kensingtonprobusclub.netlify.app/admin" style="color: #2563eb;">https://kensingtonprobusclub.netlify.app/admin</a></li>
              <li>Click "Sign Up" and use this exact email address: <strong>${email}</strong></li>
              <li>Create your password and complete the registration</li>
              <li>You'll automatically be granted ${role} access</li>
            </ol>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            <strong>Important:</strong> This invitation expires on ${expiryDate}. Please complete your registration before this date.
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            If you have any questions, please contact us at kensingtonprobusclub@gmail.com
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af;">
            Kensington Probus Club<br>
            This invitation was sent by an administrator.
          </p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "Kensington Probus Club <admin@kensingtonprobusclub.com.au>",
      to: [email],
      subject: `Invitation to Join Kensington Probus Club - ${role} Access`,
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending invitation email:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Invitation email sent successfully:", data);

    return new Response(JSON.stringify({ 
      success: true,
      messageId: data?.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-invitation-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);