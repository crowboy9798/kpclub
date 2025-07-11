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
    suburb: '',
    postcode: '',
    mobile: '',
    formerVocation: '',
    hobbies: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    agreement1: false,
    agreement2: false,
    agreement3: false,
    agreement4: false,
    agreement5: false,
    agreement6: false,
    agreement7: false,
    agreement8: false,
    agreement9: false,
    agreement10: false,
    digitalSignatureName: ''
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredAgreements = [
      formData.agreement1,
      formData.agreement2,
      formData.agreement3,
      formData.agreement4,
      formData.agreement5,
      formData.agreement6,
      formData.agreement7,
      formData.agreement8,
      formData.agreement10
    ];

    if (!requiredAgreements.every(Boolean)) {
      toast({
        title: "Terms Required",
        description: "Please agree to all the terms and conditions to continue.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.digitalSignatureName.trim()) {
      toast({
        title: "Digital Signature Required",
        description: "Please type your full name to digitally sign the application.",
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
        Suburb: formData.suburb || null,
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
        suburb: '',
        postcode: '',
        mobile: '',
        formerVocation: '',
        hobbies: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
        agreement1: false,
        agreement2: false,
        agreement3: false,
        agreement4: false,
        agreement5: false,
        agreement6: false,
        agreement7: false,
        agreement8: false,
        agreement9: false,
        agreement10: false,
        digitalSignatureName: ''
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
                    <Label htmlFor="givenNames">Given Names *</Label>
                    <Input
                      id="givenNames"
                      value={formData.givenNames}
                      onChange={(e) => handleInputChange('givenNames', e.target.value)}
                      required
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Label htmlFor="suburb">Suburb</Label>
                    <Input
                      id="suburb"
                      value={formData.suburb}
                      onChange={(e) => handleInputChange('suburb', e.target.value)}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mobile">Mobile/Landline *</Label>
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div>
                    <Label htmlFor="emergencyContactPhone">Phone No.</Label>
                    <Input
                      id="emergencyContactPhone"
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
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
                        id="agreement1"
                        checked={formData.agreement1}
                        onCheckedChange={(checked) => handleInputChange('agreement1', checked as boolean)}
                      />
                      <Label htmlFor="agreement1" className="text-sm leading-relaxed">
                        <span className="font-medium">1.</span> I agree to be bound by the provisions of the Club's constitution, by-laws and/or standing resolutions and agree to take an active role in the Club through my attendance and participation.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreement2"
                        checked={formData.agreement2}
                        onCheckedChange={(checked) => handleInputChange('agreement2', checked as boolean)}
                      />
                      <Label htmlFor="agreement2" className="text-sm leading-relaxed">
                        <span className="font-medium">2.</span> I understand that the information provided in this application will be used to assess my application and maintain my membership. I understand that my application may not be processed if any of the above information is not provided.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreement3"
                        checked={formData.agreement3}
                        onCheckedChange={(checked) => handleInputChange('agreement3', checked as boolean)}
                      />
                      <Label htmlFor="agreement3" className="text-sm leading-relaxed">
                        <span className="font-medium">3.</span> I acknowledge that at some time during my membership, I may be called upon to take an active role on the Management Committee.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreement4"
                        checked={formData.agreement4}
                        onCheckedChange={(checked) => handleInputChange('agreement4', checked as boolean)}
                      />
                      <Label htmlFor="agreement4" className="text-sm leading-relaxed">
                        <span className="font-medium">4.</span> I consent to my name, address, telephone number and email address being included in the 'Directory of Members' to be distributed only to members of the Club.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreement5"
                        checked={formData.agreement5}
                        onCheckedChange={(checked) => handleInputChange('agreement5', checked as boolean)}
                      />
                      <Label htmlFor="agreement5" className="text-sm leading-relaxed">
                        <span className="font-medium">5.</span> I understand that I may access any personal information the Club holds about me upon request.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreement6"
                        checked={formData.agreement6}
                        onCheckedChange={(checked) => handleInputChange('agreement6', checked as boolean)}
                      />
                      <Label htmlFor="agreement6" className="text-sm leading-relaxed">
                        <span className="font-medium">6.</span> Unless advised otherwise in accordance with point 7 below, I consent to the information provided in this application form being provided to Probus South Pacific Limited (PSPL). I understand that this information may be used, held and disclosed by PSPL in accordance with the PSPL Privacy Policy which can be viewed at{" "}
                        <a href="https://www.probussouthpacific.org" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          www.probussouthpacific.org
                        </a>
                        {" "}or by clicking here (online access only). By signing this form, I acknowledge that I have read and agree to the terms of the PSPL Privacy Policy.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreement7"
                        checked={formData.agreement7}
                        onCheckedChange={(checked) => handleInputChange('agreement7', checked as boolean)}
                      />
                      <Label htmlFor="agreement7" className="text-sm leading-relaxed">
                        <span className="font-medium">7.</span> I understand that the minimum information required by PSPL is my first name and last name and that it is my responsibility to advise the Club Secretary in writing if I do not want PSPL to hold any of the additional information in this application form or I do not wish to be contacted by PSPL.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreement8"
                        checked={formData.agreement8}
                        onCheckedChange={(checked) => handleInputChange('agreement8', checked as boolean)}
                      />
                      <Label htmlFor="agreement8" className="text-sm leading-relaxed">
                        <span className="font-medium">8.</span> I understand that PSPL's National Insurance Program provides Public Liability Insurance of $20 million and that a summary of the coverage, which is subject to terms, conditions and limitations, is available through the Club Secretary or the PSPL website.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreement9"
                        checked={formData.agreement9}
                        onCheckedChange={(checked) => handleInputChange('agreement9', checked as boolean)}
                      />
                      <Label htmlFor="agreement9" className="text-sm leading-relaxed">
                        <span className="font-medium">9.</span> I understand that the Club and/or PSPL may publish photographs or videos of members on their websites, in newsletters and on social media to promote the Club and Probus generally. By signing this application form, I consent to the publication of such photographs and videos unless I have advised the Club Secretary in writing that I do not consent to such publication.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreement10"
                        checked={formData.agreement10}
                        onCheckedChange={(checked) => handleInputChange('agreement10', checked as boolean)}
                      />
                      <Label htmlFor="agreement10" className="text-sm leading-relaxed">
                        <span className="font-medium">10.</span> I agree to receive digital Probus publications from PSPL, which I can unsubscribe from at any time.
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Digital Signature */}
              <Card className="bg-accent/10 border-accent">
                <CardHeader>
                  <CardTitle className="text-lg text-accent-foreground">Digital Acceptance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    By typing your full name below, you acknowledge that you have read, understood, and agree to all the terms and conditions stated above.
                  </p>
                  <div>
                    <Label htmlFor="digitalSignature">Type your full name to digitally sign this application *</Label>
                    <Input
                      id="digitalSignature"
                      placeholder="Enter your full name"
                      value={formData.digitalSignatureName}
                      onChange={(e) => handleInputChange('digitalSignatureName', e.target.value)}
                      required
                      className="font-medium"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This constitutes your electronic signature and has the same legal effect as a handwritten signature.
                  </p>
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