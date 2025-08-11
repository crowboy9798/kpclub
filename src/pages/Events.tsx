import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Star, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date_start: string;
  date_end: string | null;
  time_start: string | null;
  time_end: string | null;
  location: string | null;
  category: string;
  featured: boolean;
  max_attendees: number | null;
}

const Events = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date_start', new Date().toISOString().split('T')[0])
        .order('date_start', { ascending: true });

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

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

        {/* All Upcoming Events */}
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-6">Upcoming Events</h2>
          {loading ? (
            <div className="text-center py-8">Loading events...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="card-elegant overflow-hidden hover:scale-105 transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-primary mb-2">{event.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{event.description}</p>
                    
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-2 text-primary" />
                        {format(new Date(event.date_start), 'PPP')}
                      </div>
                      {event.time_start && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-2 text-primary" />
                          {event.time_start} {event.time_end && `- ${event.time_end}`}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-2 text-primary" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
              <Link to="/membership">
                <Users className="w-4 h-4 mr-2" />
                Become a Member
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">
                <ArrowRight className="w-4 h-4 mr-2" />
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;