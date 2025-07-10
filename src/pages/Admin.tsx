import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Users, Calendar, Settings, Mail } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import MemberManagement from '@/components/MemberManagement';
import EventManagement from '@/components/EventManagement';

const Admin = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'events'>('dashboard');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple demo authentication - in a real app, this would be handled by a proper auth system
    if (loginData.username === 'admin' && loginData.password === 'password') {
      setIsLoggedIn(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard!",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Try admin/password for demo.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };


  const adminFeatures = [
    {
      icon: Calendar,
      title: "Event Management",
      description: "Add, edit, and delete club events",
      actions: ["Add New Event", "Edit Existing Events"]
    },
    {
      icon: Users,
      title: "Member Management",
      description: "Manage member database and profiles",
      actions: ["View Member List", "Add New Members", "Update Member Info", "Manage Renewals"]
    },
    {
      icon: Mail,
      title: "Communications",
      description: "Manage newsletters and announcements",
      actions: ["Send Newsletter", "View Contact Submissions", "Manage Email Lists"]
    },
    {
      icon: Settings,
      title: "Site Management",
      description: "Update website content and settings",
      actions: ["Edit Homepage", "Update Club Info", "Manage Media Files"]
    }
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card className="card-elegant">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">Admin Login</CardTitle>
              <p className="text-muted-foreground">
                Access the club administration dashboard
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={loginData.username}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Enter your username"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Enter your password"
                  />
                </div>


                <Button type="submit" className="w-full" size="lg">
                  <Lock className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Forgot your password? Contact the club president for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="section-title mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Manage your club's information and activities.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'dashboard' ? 'default' : 'outline'}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              variant={activeTab === 'members' ? 'default' : 'outline'}
              onClick={() => setActiveTab('members')}
            >
              <Users className="w-4 h-4 mr-2" />
              Members
            </Button>
            <Button 
              variant={activeTab === 'events' ? 'default' : 'outline'}
              onClick={() => setActiveTab('events')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsLoggedIn(false)}
            >
              <Lock className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="card-elegant">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">89</div>
                  <div className="text-sm text-muted-foreground">Database</div>
                </CardContent>
              </Card>
              
              <Card className="card-elegant">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-secondary-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">53</div>
                  <div className="text-sm text-muted-foreground">Active Members</div>
                </CardContent>
              </Card>
              
              <Card className="card-elegant">
                <CardContent className="p-6 text-center">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">36</div>
                  <div className="text-sm text-muted-foreground">Inactive Members</div>
                </CardContent>
              </Card>
              
              <Card className="card-elegant">
                <CardContent className="p-6 text-center">
                  <Settings className="w-8 h-8 text-secondary-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">6</div>
                  <div className="text-sm text-muted-foreground">Events</div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminFeatures.map((feature, index) => {
                const Icon = feature.icon;
                
                return (
                  <Card key={index} className="card-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center text-primary">
                        <Icon className="w-6 h-6 mr-3" />
                        {feature.title}
                      </CardTitle>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {feature.actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => {
                              if (feature.title === "Member Management") {
                                setActiveTab('members');
                              } else if (feature.title === "Event Management") {
                                setActiveTab('events');
                              } else {
                                toast({
                                  title: "Feature Coming Soon",
                                  description: `${action} functionality will be available in the next update.`
                                });
                              }
                            }}
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : activeTab === 'members' ? (
          <MemberManagement />
        ) : (
          <EventManagement />
        )}

      </div>
    </div>
  );
};

export default Admin;