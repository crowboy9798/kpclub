import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Star, ArrowRight } from 'lucide-react';

const Events = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: "Monthly Social Gathering",
      date: "December 15, 2024",
      time: "2:00 PM - 4:00 PM",
      location: "Kensington Community Center - Main Hall",
      description: "Join us for our monthly social meeting with coffee, light refreshments, and community updates. A perfect opportunity to catch up with fellow members and welcome newcomers.",
      category: "Social",
      featured: true
    },
    {
      id: 2,
      title: "Holiday Celebration",
      date: "December 20, 2024",
      time: "6:00 PM - 9:00 PM",
      location: "Kensington Community Center - Main Hall",
      description: "Celebrate the holiday season with festive activities, seasonal refreshments, live music, and good cheer. Bring your family and friends for an evening of joy and community spirit.",
      category: "Special Event",
      featured: true
    },
    {
      id: 3,
      title: "Guest Speaker Series: Local History",
      date: "January 8, 2025",
      time: "7:00 PM - 8:30 PM",
      location: "Community Center - Conference Room",
      description: "Join renowned historian Dr. Sarah Williams for a fascinating presentation on the rich heritage and history of our local area. Light refreshments will be served.",
      category: "Educational",
      featured: false
    },
    {
      id: 4,
      title: "Coffee Morning & Book Club",
      date: "January 15, 2025",
      time: "10:00 AM - 12:00 PM",
      location: "Local Café - Main Street",
      description: "Informal gathering for book lovers and coffee enthusiasts. This month we'll be discussing 'The Seven Husbands of Evelyn Hugo' by Taylor Jenkins Reid.",
      category: "Social",
      featured: false
    },
    {
      id: 5,
      title: "Community Service Day",
      date: "January 22, 2025",
      time: "9:00 AM - 1:00 PM",
      location: "Kensington Park",
      description: "Give back to our community by participating in park cleanup and beautification activities. Tools and refreshments provided. Suitable for all fitness levels.",
      category: "Community Service",
      featured: false
    },
    {
      id: 6,
      title: "Wine Tasting Evening",
      date: "February 5, 2025",
      time: "7:00 PM - 9:30 PM",
      location: "The Vineyard Restaurant",
      description: "Enjoy an elegant evening of wine tasting featuring local vineyards. Professional sommelier will guide us through wine selections paired with artisanal cheeses.",
      category: "Social",
      featured: false
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Social':
        return 'bg-secondary/20 text-secondary-foreground';
      case 'Educational':
        return 'bg-primary/20 text-primary';
      case 'Special Event':
        return 'bg-red-100 text-red-800';
      case 'Community Service':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-title">Club Events</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover upcoming activities, social gatherings, and special events. Join us for friendship, 
            learning, and community engagement throughout the year.
          </p>
        </div>

        {/* Featured Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center">
            <Star className="w-6 h-6 text-secondary mr-2" />
            Featured Events
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingEvents.filter(event => event.featured).map((event) => (
              <Card key={event.id} className="card-elegant overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                    <Star className="w-5 h-5 text-secondary" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-primary mb-3">{event.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2 text-primary" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      {event.location}
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Register Interest
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Upcoming Events */}
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-6">All Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="card-elegant overflow-hidden hover:scale-105 transition-smooth">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                    {event.featured && <Star className="w-4 h-4 text-secondary" />}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-primary mb-2">{event.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-2 text-primary" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-2 text-primary" />
                      {event.time}
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="w-full text-primary hover:bg-primary/10">
                    Learn More
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center gradient-card rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Want to Attend Our Events?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join our club to participate in all upcoming events and activities. Members receive priority 
            registration and special member pricing for premium events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="default">
              <a href="/membership">
                <Users className="w-4 h-4 mr-2" />
                Become a Member
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/contact">
                <ArrowRight className="w-4 h-4 mr-2" />
                Contact Us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;