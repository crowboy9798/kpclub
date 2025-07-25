import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Captcha state
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
  const [captchaInput, setCaptchaInput] = useState('');

  // Generate new captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1, num2, answer: '' });
    setCaptchaInput('');
  };

  // Initialize captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate captcha
    const correctAnswer = captcha.num1 + captcha.num2;
    if (parseInt(captchaInput) !== correctAnswer) {
      toast({
        title: "Captcha Failed",
        description: "Please solve the math problem correctly.",
        variant: "destructive"
      });
      generateCaptcha(); // Generate new captcha
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "Thank you for your message. We'll get back to you soon.",
      });
      
      // Reset form and generate new captcha
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      generateCaptcha();
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const contactInfo = [
    {
      icon: Mail,
      title: "Email Address",
      primary: "kensingtonprobusclub@gmail.com",
      secondary: "membership@kensingtonprobus.com",
      description: "Send us an email anytime"
    },
    {
      icon: Phone,
      title: "Phone Number",
      primary: "0417803220",
      secondary: "Available Mon-Fri, 9AM-5PM",
      description: "Call us during business hours"
    },
    {
      icon: MapPin,
      title: "Meeting Location",
      primary: "St Matthews church",
      secondary: "146 Kensington Road Marryatville SA 5069",
      description: "Where we gather monthly"
    },
    {
      icon: Clock,
      title: "Meeting Times",
      primary: "2nd Monday of each month",
      secondary: "except when public holiday, then 3rd Monday (10am to 12)",
      description: "Regular meeting schedule"
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-title">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We'd love to hear from you! Whether you're interested in joining our club, have questions 
            about our activities, or just want to say hello, don't hesitate to reach out.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-6">Contact Information</h2>
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <Card key={index} className="card-elegant">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-primary mb-1">{info.title}</h3>
                          <p className="text-foreground font-medium">{info.primary}</p>
                          <p className="text-muted-foreground text-sm">{info.secondary}</p>
                          <p className="text-muted-foreground text-xs mt-1">{info.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Additional Information */}
            <Card className="card-elegant mt-6">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Office Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday:</span>
                    <span className="font-medium">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday:</span>
                    <span className="font-medium">10:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday:</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> During monthly meetings, response times may be longer. 
                    We appreciate your patience!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-6">Send Us a Message</h2>
            <Card className="card-elegant">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="What's this about?"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="mt-1"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  {/* Captcha */}
                  <div className="border border-muted rounded-lg p-4 bg-accent/20">
                    <Label htmlFor="captcha" className="text-sm font-medium">
                      Security Check: What is {captcha.num1} + {captcha.num2}? *
                    </Label>
                    <Input
                      id="captcha"
                      type="number"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      required
                      className="mt-2 w-32"
                      placeholder="Answer"
                    />
                  </div>

                  <div className="bg-accent/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Privacy Note:</strong> Your personal information will only be used to respond 
                      to your inquiry and will never be shared with third parties.
                    </p>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Meeting Times Section */}
        <div className="mt-16 gradient-card rounded-xl p-8 text-center">
          <h2 className="text-2xl font-semibold text-primary mb-4">Meeting Times</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            2nd Monday of each month St Matthews Church, 146 Kensington Rd, Marryatville SA (10am to 12) except when public holiday, then 3rd Monday (10am to 12)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;