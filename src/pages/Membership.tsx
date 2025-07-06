import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Users, Calendar, Coffee, Heart, Mail, Phone, FileText, CreditCard } from 'lucide-react';

const Membership = () => {
  const membershipTypes = [
    {
      title: "Individual Membership",
      price: "$45",
      period: "per year",
      description: "Perfect for individuals looking to join our community",
      features: [
        "Access to all regular club meetings",
        "Participate in social activities and events",
        "Monthly newsletter subscription",
        "Access to guest speaker series",
        "Coffee and refreshments at meetings",
        "Member directory access",
        "Voting rights in club decisions"
      ],
      recommended: false
    },
    {
      title: "Family Membership",
      price: "$75",
      period: "per year",
      description: "Great value for couples and families",
      features: [
        "All Individual Membership benefits",
        "Membership for up to 2 adults",
        "Family event invitations",
        "Priority booking for special events",
        "Discounted rates for premium activities",
        "Family newsletter updates",
        "Dual voting rights"
      ],
      recommended: true
    },
    {
      title: "Student Membership",
      price: "$20",
      period: "per year",
      description: "Special rate for students and young professionals",
      features: [
        "Access to all regular meetings",
        "Mentorship opportunities",
        "Career networking events",
        "Educational workshop access",
        "Student newsletter",
        "Study group participation"
      ],
      recommended: false
    }
  ];

  const membershipBenefits = [
    {
      icon: Users,
      title: "Community Connection",
      description: "Join a welcoming community of like-minded individuals who share your interests and values."
    },
    {
      icon: Calendar,
      title: "Regular Activities",
      description: "Enjoy monthly meetings, special events, educational talks, and social gatherings throughout the year."
    },
    {
      icon: Coffee,
      title: "Social Fellowship",
      description: "Build lasting friendships over coffee, conversation, and shared experiences in a relaxed atmosphere."
    },
    {
      icon: Heart,
      title: "Mutual Support",
      description: "Be part of a caring community that supports members through life's ups and downs."
    }
  ];

  const joinSteps = [
    {
      step: 1,
      title: "Complete Application",
      description: "Fill out our membership application form with your personal details and interests.",
      icon: FileText
    },
    {
      step: 2,
      title: "Pay Annual Dues",
      description: "Submit your annual membership fee via check, cash, or online payment.",
      icon: CreditCard
    },
    {
      step: 3,
      title: "Attend Orientation",
      description: "Join us for a welcome orientation to meet members and learn about club activities.",
      icon: Users
    },
    {
      step: 4,
      title: "Start Participating",
      description: "Begin enjoying all the benefits and activities of club membership right away!",
      icon: Heart
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-title">Join Our Club</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Become part of the Kensington Probus Club family and discover the joy of meaningful connections, 
            engaging activities, and lifelong friendships.
          </p>
        </div>

        {/* Membership Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-primary text-center mb-8">Why Join Our Club?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {membershipBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="card-elegant text-center p-6 hover:scale-105 transition-smooth">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>


        {/* How to Join */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-primary text-center mb-8">How to Join</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {joinSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-sm">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Information */}
        <div className="gradient-card rounded-xl p-8 text-center">
          <h2 className="text-2xl font-semibold text-primary mb-4">Ready to Join?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We'd love to welcome you to our club! Contact us to get your membership application 
            or visit us at our next meeting to learn more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <div className="flex items-center text-muted-foreground">
              <Mail className="w-5 h-5 text-primary mr-2" />
              <span>info@kensingtonprobus.com</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Phone className="w-5 h-5 text-primary mr-2" />
              <span>(555) 123-4567</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="default">
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
            <Button size="lg" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Download Application
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;