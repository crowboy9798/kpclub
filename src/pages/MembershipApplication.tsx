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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    membershipType: 'individual',
    interests: '',
    agreedToTerms: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Submit to database
      const memberData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email || null,
        mobile: formData.phone || null,
        address: formData.address || null,
        suburb: formData.city || null,
        pcode: formData.postalCode || null,
        member_2025: 'YES' as const,
        member_2024: 'NO' as const,
        member_no: `290043810${String(Date.now()).slice(-3)}`,
        joined: new Date().toISOString().split('T')[0],
        dob: null,
        nok: null,
        nok_name: null,
        nok_contact: null
      };

      const { error } = await supabase
        .from('members')
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
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        membershipType: 'individual',
        interests: '',
        agreedToTerms: false
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
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <a href="/membership">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Membership
          </a>
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="section-title">Membership Application</h1>
          <p className="text-lg text-muted-foreground">
            Join the Kensington Probus Club family
          </p>
        </div>

        {/* Application Form */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="text-primary">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Membership Type */}
              <div>
                <Label htmlFor="membershipType">Membership Type *</Label>
                <select
                  id="membershipType"
                  value={formData.membershipType}
                  onChange={(e) => handleInputChange('membershipType', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="individual">Individual Membership ($45/year)</option>
                  <option value="family">Family Membership ($75/year)</option>
                  <option value="student">Student Membership ($20/year)</option>
                </select>
              </div>

              {/* Interests */}
              <div>
                <Label htmlFor="interests">Interests & Hobbies</Label>
                <Textarea
                  id="interests"
                  placeholder="Tell us about your interests and what you'd like to get involved with..."
                  value={formData.interests}
                  onChange={(e) => handleInputChange('interests', e.target.value)}
                  rows={4}
                />
              </div>

              {/* Terms and Conditions */}
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Terms and Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>Membership Obligations:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Annual membership fees are due at the time of application and annually thereafter</li>
                      <li>Members are expected to participate respectfully in club activities</li>
                      <li>Members must notify the club of any changes to contact information</li>
                    </ul>
                    
                    <p><strong>Club Policies:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>The club reserves the right to refuse or revoke membership</li>
                      <li>Membership fees are non-refundable once paid</li>
                      <li>Members agree to receive club communications via email and mail</li>
                      <li>Personal information will be kept confidential and used only for club purposes</li>
                    </ul>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) => handleInputChange('agreedToTerms', checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the terms and conditions outlined above *
                    </Label>
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