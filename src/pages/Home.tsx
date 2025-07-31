import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar, Users, Coffee, Heart, ArrowRight, Star, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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

const Home = () => {
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
        .order('date_start', { ascending: true })
        .limit(3);

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="hero-text mb-6">
            Welcome to the<br />
            <span className="text-secondary">Kensington Probus Club</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            A vibrant community where friendship flourishes, connections are made, and memories are created through 
            engaging activities and meaningful fellowship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3 shadow-glow">
              <Link to="/membership">
                <Users className="w-5 h-5 mr-2" />
                Join Our Club
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 border-primary-foreground text-primary bg-primary-foreground hover:bg-primary hover:text-primary-foreground">
              <Link to="/events">
                <Calendar className="w-5 h-5 mr-2" />
                View Events
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">What Makes Us Special</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the heart of our community and what brings our members together
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-elegant text-center p-6 group hover:scale-105">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-smooth">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Friendship</h3>
                <p className="text-muted-foreground">Build lasting friendships with like-minded individuals in our welcoming community.</p>
              </CardContent>
            </Card>

            <Card className="card-elegant text-center p-6 group hover:scale-105">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 transition-smooth">
                  <Calendar className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Activities</h3>
                <p className="text-muted-foreground">Enjoy diverse activities from social gatherings to educational talks and outings.</p>
              </CardContent>
            </Card>

            <Card className="card-elegant text-center p-6 group hover:scale-105">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-smooth">
                  <Coffee className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Fellowship</h3>
                <p className="text-muted-foreground">Regular meetings over coffee create the perfect atmosphere for meaningful connections.</p>
              </CardContent>
            </Card>

            <Card className="card-elegant text-center p-6 group hover:scale-105">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 transition-smooth">
                  <Heart className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Community</h3>
                <p className="text-muted-foreground">Be part of a caring community that supports and celebrates each member.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-16 px-4 bg-accent/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Upcoming Events</h2>
            <p className="text-lg text-muted-foreground">Join us for these exciting upcoming activities</p>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading events...</div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No upcoming events scheduled at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="card-elegant overflow-hidden hover:scale-105 transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}>
                        {format(new Date(event.date_start), 'MMM d')}
                      </span>
                      {event.featured && <Star className="w-5 h-5 text-secondary" />}
                    </div>
                    <h3 className="text-xl font-semibold text-primary mb-2">{event.title}</h3>
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {event.time_start && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-primary" />
                          {event.time_start} {event.time_end && `- ${event.time_end}`}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-primary" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/events" onClick={() => window.scrollTo(0, 0)}>
                View All Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 gradient-hero text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Become part of the Kensington Probus Club family and discover the joy of meaningful connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
              <Link to="/membership">
                Learn About Membership
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 border-primary-foreground text-primary bg-primary-foreground">
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;