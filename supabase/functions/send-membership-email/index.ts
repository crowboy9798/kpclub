import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MembershipApplicationData {
  title: string;
  surname: string;
  givenNames: string;
  preferredName: string;
  spousePartnerName: string;
  dateOfBirth: string;
  email: string;
  address: string;
  suburb: string;
  postcode: string;
  mobile: string;
  formerVocation: string;
  hobbies: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  digitalSignatureName: string;
  adminEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const applicationData: MembershipApplicationData = await req.json();

    console.log("Processing membership application email for:", applicationData.email);

    // Format the application data for email
    const applicationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a365d; border-bottom: 2px solid #3182ce; padding-bottom: 10px;">
          New Membership Application - Kensington Probus Club
        </h1>
        
        <h2 style="color: #2d3748; margin-top: 30px;">Personal Information</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background-color: #f7fafc;">
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Title:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.title || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Given Names:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.givenNames}</td>
          </tr>
          <tr style="background-color: #f7fafc;">
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Surname:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.surname}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Preferred Name:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.preferredName || 'N/A'}</td>
          </tr>
          <tr style="background-color: #f7fafc;">
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Spouse/Partner:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.spousePartnerName || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Date of Birth:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.dateOfBirth}</td>
          </tr>
        </table>

        <h2 style="color: #2d3748; margin-top: 30px;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background-color: #f7fafc;">
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Email:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Mobile/Phone:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.mobile}</td>
          </tr>
          <tr style="background-color: #f7fafc;">
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Address:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.address}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Suburb:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.suburb || 'N/A'}</td>
          </tr>
          <tr style="background-color: #f7fafc;">
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Postcode:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.postcode}</td>
          </tr>
        </table>

        <h2 style="color: #2d3748; margin-top: 30px;">Additional Information</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background-color: #f7fafc;">
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Former Vocation:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.formerVocation || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Hobbies & Interests:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.hobbies || 'N/A'}</td>
          </tr>
        </table>

        <h2 style="color: #2d3748; margin-top: 30px;">Emergency Contact</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background-color: #f7fafc;">
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Name:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.emergencyContactName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Relationship:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.emergencyContactRelationship}</td>
          </tr>
          <tr style="background-color: #f7fafc;">
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Phone:</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${applicationData.emergencyContactPhone || 'N/A'}</td>
          </tr>
        </table>

        <h2 style="color: #2d3748; margin-top: 30px;">Digital Signature</h2>
        <p style="padding: 10px; background-color: #f7fafc; border-left: 4px solid #3182ce;">
          <strong>Digitally signed by:</strong> ${applicationData.digitalSignatureName}
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 2px solid #e2e8f0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This application was submitted through the Kensington Probus Club website on ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    // Send email to admin
    const emailResponse = await resend.emails.send({
      from: "KPC Applications <admin@kensingtonprobusclub.com.au>",
      to: [applicationData.adminEmail],
      subject: `New Membership Application: ${applicationData.givenNames} ${applicationData.surname}`,
      html: applicationHtml,
    });

    console.log("Membership application email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Application email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-membership-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);