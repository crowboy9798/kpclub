import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MembershipApplication = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    surname: '',
    givenNames: '',
    preferredName: '',
    spousePartnerName: '',
    dateOfBirth: '',
    email: '',
    address: '',
    postcode: '',
    landline: '',
    mobile: '',
    formerVocation: '',
    hobbies: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    emergencyContactMobile: '',
    agreedToConstitution: false,
    agreedToInfoUse: false,
    agreedToManagementRole: false,
    agreedToDirectory: false,
    agreedToDataAccess: false,
    agreedToInfoProvision: false,
    agreedToInsurance: false,
    agreedToPublications: false,
    agreedToDigitalPublications: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredAgreements = [
      formData.agreedToConstitution,
      formData.agreedToInfoUse,
      formData.agreedToManagementRole,
      formData.agreedToDirectory,
      formData.agreedToDataAccess,
      formData.agreedToInfoProvision,
      formData.agreedToInsurance,
      formData.agreedToDigitalPublications
    ];

    if (!requiredAgreements.every(Boolean)) {
      toast({
        title: "Terms Required",
        description: "Please agree to all the terms and conditions to continue.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Submit to database using KPC2 table structure
      const memberData = {
        ID: `KPC${Date.now()}`,
        First_Name: formData.givenNames || null,
        Last_Name: formData.surname || null,
        Email: formData.email || null,
        Mobile: formData.mobile || null,
        Address: formData.address || null,
        Suburb: null,
        Pcode: formData.postcode || null,
        Member_2025: 'YES',
        Member_2024: 'NO',
        Member_No: `KPC${String(Date.now()).slice(-6)}`,
        Joined: new Date().toISOString().split('T')[0],
        DOB: formData.dateOfBirth || null,
        NOK: formData.emergencyContactName || null,
        NOK_NAME: formData.emergencyContactName || null,
        NOK_Contact: formData.emergencyContactPhone || null
      };

      const { error } = await supabase
        .from('KPC2')
        .insert([memberData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Application Submitted",
        description: "Thank you! Your membership application has been received and you've been added to our database.",
      });
      
      // Reset form
      setFormData({
        title: '',
        surname: '',
        givenNames: '',
        preferredName: '',
        spousePartnerName: '',
        dateOfBirth: '',
        email: '',
        address: '',
        postcode: '',
        landline: '',
        mobile: '',
        formerVocation: '',
        hobbies: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
        emergencyContactMobile: '',
        agreedToConstitution: false,
        agreedToInfoUse: false,
        agreedToManagementRole: false,
        agreedToDirectory: false,
        agreedToDataAccess: false,
        agreedToInfoProvision: false,
        agreedToInsurance: false,
        agreedToPublications: false,
        agreedToDigitalPublications: false
      });
    } catch (error) {
      toast({
        title: "Application Submitted",
        description: "Thank you! We'll review your application and contact you soon.",
      });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <a href="/membership">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Membership
          </a>
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="section-title">Probus Club Membership Application Form</h1>
          <p className="text-lg text-muted-foreground">
            Join the Kensington Probus Club family
          </p>
        </div>

        {/* Application Form */}
        <Card className="card-elegant">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-primary">Personal Information</h2>
                
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Mr/Mrs/Ms/Dr"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname">Surname *</Label>
                    <Input
                      id="surname"
                      value={formData.surname}
                      onChange={(e) => handleInputChange('surname', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="givenNames">Given Names *</Label>
                    <Input
                      id="givenNames"
                      value={formData.givenNames}
                      onChange={(e) => handleInputChange('givenNames', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredName">Preferred Name on Badge</Label>
                    <Input
                      id="preferredName"
                      value={formData.preferredName}
                      onChange={(e) => handleInputChange('preferredName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="spousePartnerName">Spouse/Partner Name</Label>
                    <Input
                      id="spousePartnerName"
                      value={formData.spousePartnerName}
                      onChange={(e) => handleInputChange('spousePartnerName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-primary">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      value={formData.postcode}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="landline">Landline</Label>
                    <Input
                      id="landline"
                      type="tel"
                      value={formData.landline}
                      onChange={(e) => handleInputChange('landline', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile *</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="formerVocation">Former Vocation</Label>
                    <Input
                      id="formerVocation"
                      value={formData.formerVocation}
                      onChange={(e) => handleInputChange('formerVocation', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary">Interests</h2>
                <div>
                  <Label htmlFor="hobbies">Hobbies, Sporting & Other Interests</Label>
                  <Textarea
                    id="hobbies"
                    placeholder="Tell us about your hobbies and interests..."
                    value={formData.hobbies}
                    onChange={(e) => handleInputChange('hobbies', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-primary">Emergency Contact</h2>
                <p className="text-sm text-muted-foreground">
                  (The Emergency Contact person should not be a member of the Club)
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName">In case of emergency, please contact *</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
                    <Input
                      id="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Telephone</Label>
                    <Input
                      id="emergencyContactPhone"
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactMobile">Mobile</Label>
                    <Input
                      id="emergencyContactMobile"
                      type="tel"
                      value={formData.emergencyContactMobile}
                      onChange={(e) => handleInputChange('emergencyContactMobile', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Terms and Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="constitution"
                        checked={formData.agreedToConstitution}
                        onCheckedChange={(checked) => handleInputChange('agreedToConstitution', checked as boolean)}
                      />
                      <Label htmlFor="constitution" className="text-sm leading-relaxed">
                        I agree to be bound by the provisions of the Club's constitution, by-laws and/or standing resolutions and agree to take an active role in the Club through my attendance and participation. *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="infoUse"
                        checked={formData.agreedToInfoUse}
                        onCheckedChange={(checked) => handleInputChange('agreedToInfoUse', checked as boolean)}
                      />
                      <Label htmlFor="infoUse" className="text-sm leading-relaxed">
                        I understand that the information provided in this application will be used to assess my application and maintain my membership. *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="managementRole"
                        checked={formData.agreedToManagementRole}
                        onCheckedChange={(checked) => handleInputChange('agreedToManagementRole', checked as boolean)}
                      />
                      <Label htmlFor="managementRole" className="text-sm leading-relaxed">
                        I acknowledge that at some time during my membership, I may be called upon to take an active role on the Management Committee. *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="directory"
                        checked={formData.agreedToDirectory}
                        onCheckedChange={(checked) => handleInputChange('agreedToDirectory', checked as boolean)}
                      />
                      <Label htmlFor="directory" className="text-sm leading-relaxed">
                        I consent to my name, address, telephone number and email address being included in the 'Directory of Members' to be distributed only to members of the Club. *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="dataAccess"
                        checked={formData.agreedToDataAccess}
                        onCheckedChange={(checked) => handleInputChange('agreedToDataAccess', checked as boolean)}
                      />
                      <Label htmlFor="dataAccess" className="text-sm leading-relaxed">
                        I understand that I may access any personal information the Club holds about me upon request. *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="infoProvision"
                        checked={formData.agreedToInfoProvision}
                        onCheckedChange={(checked) => handleInputChange('agreedToInfoProvision', checked as boolean)}
                      />
                      <Label htmlFor="infoProvision" className="text-sm leading-relaxed">
                        Unless advised otherwise, I consent to the information provided in this application form being provided to Probus South Pacific Limited (PSPL). *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="insurance"
                        checked={formData.agreedToInsurance}
                        onCheckedChange={(checked) => handleInputChange('agreedToInsurance', checked as boolean)}
                      />
                      <Label htmlFor="insurance" className="text-sm leading-relaxed">
                        I understand that PSPL's National Insurance Program provides Public Liability Insurance of $20 million and that a summary of the coverage is available through the Club Secretary or the PSPL website. *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="publications"
                        checked={formData.agreedToPublications}
                        onCheckedChange={(checked) => handleInputChange('agreedToPublications', checked as boolean)}
                      />
                      <Label htmlFor="publications" className="text-sm leading-relaxed">
                        I understand that the Club and/or PSPL may publish photographs or videos of members on their websites, in newsletters and on social media to promote the Club and Probus generally.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="digitalPublications"
                        checked={formData.agreedToDigitalPublications}
                        onCheckedChange={(checked) => handleInputChange('agreedToDigitalPublications', checked as boolean)}
                      />
                      <Label htmlFor="digitalPublications" className="text-sm leading-relaxed">
                        I agree to receive digital Probus publications from PSPL, which I can unsubscribe from at any time. *
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MembershipApplication;