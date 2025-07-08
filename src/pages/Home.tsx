import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar, Users, Coffee, Heart, ArrowRight, Star } from 'lucide-react';

const Home = () => {
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="card-elegant overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Dec 15
                  </span>
                  <Star className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Monthly Social Gathering</h3>
                <p className="text-muted-foreground mb-4">Join us for coffee, conversation, and community updates in our monthly social meeting.</p>
                <div className="text-sm text-muted-foreground">
                  <p>📍 Community Center • 2:00 PM</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elegant overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Dec 20
                  </span>
                  <Star className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Holiday Celebration</h3>
                <p className="text-muted-foreground mb-4">Celebrate the holiday season with festive activities, refreshments, and good cheer.</p>
                <div className="text-sm text-muted-foreground">
                  <p>📍 Main Hall • 6:00 PM</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elegant overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Jan 8
                  </span>
                  <Star className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Guest Speaker Series</h3>
                <p className="text-muted-foreground mb-4">Fascinating talk on local history and heritage by renowned historian Dr. Sarah Williams.</p>
                <div className="text-sm text-muted-foreground">
                  <p>📍 Conference Room • 7:00 PM</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/events">
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
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
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