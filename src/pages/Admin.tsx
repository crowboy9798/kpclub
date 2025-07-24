import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Users, Calendar, Settings, Mail, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MemberManagement from '@/components/MemberManagement';
import EventManagement from '@/components/EventManagement';
import type { User, Session } from '@supabase/supabase-js';

const Admin = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'events'>('dashboard');
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [availableGroups, setAvailableGroups] = useState<string[]>(['2024', '2025', 'Committee', 'LTL']);

  // Initialize authentication state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Only allow tejifry@gmail.com to sign up
        if (loginData.email !== 'tejifry@gmail.com') {
          toast({
            title: "Access Denied",
            description: "Only the administrator email is allowed to create an account.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: loginData.email,
          password: loginData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`
          }
        });

        if (error) {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account Created",
            description: "Your administrator account has been created successfully!",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: loginData.email,
          password: loginData.password,
        });

        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Login Successful",
            description: "Welcome Administrator!",
          });
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Error",
        description: "An error occurred during authentication.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Logout Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  // Check if user is admin (only tejifry@gmail.com allowed)
  const isAdmin = user?.email === 'tejifry@gmail.com';

  const handleAddGroup = () => {
    if (newGroupName.trim() && !availableGroups.includes(newGroupName.trim())) {
      const updatedGroups = [...availableGroups, newGroupName.trim()];
      setAvailableGroups(updatedGroups);
      setNewGroupName('');
      setIsAddGroupDialogOpen(false);
      toast({
        title: "Group Added",
        description: `Group "${newGroupName.trim()}" has been added successfully.`
      });
    } else if (availableGroups.includes(newGroupName.trim())) {
      toast({
        title: "Group Already Exists",
        description: `Group "${newGroupName.trim()}" already exists.`,
        variant: "destructive"
      });
    }
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
      actions: ["View Member List", "Add New Members", "Update Member Info", "ADD NEW GROUP"]
    },
    {
      icon: Mail,
      title: "Communications",
      description: "Manage newsletters and announcements",
      actions: ["Send Newsletter"]
    },
    {
      icon: Settings,
      title: "Site Management",
      description: "Update website content and settings",
      actions: ["Edit Homepage", "Update Club Info"]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card className="card-elegant">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">
                {isSignUp ? 'Create Admin Account' : 'Admin Login'}
              </CardTitle>
              <p className="text-muted-foreground">
                {isSignUp ? 'Set up your administrator account' : 'Access the club administration dashboard'}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={handleInputChange}
                      required
                      className="pr-10"
                      placeholder="Enter your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>


                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  <Lock className="w-4 h-4 mr-2" />
                  {isLoading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <Button 
                  variant="link" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm"
                >
                  {isSignUp ? 'Already have an account? Sign In' : 'Need to create an admin account? Sign Up'}
                </Button>
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
              Welcome back Administrator! Manage your club's information and activities.
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
              onClick={handleLogout}
            >
              <Lock className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <>

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
                                if (action === "ADD NEW GROUP") {
                                  setIsAddGroupDialogOpen(true);
                                } else {
                                  setActiveTab('members');
                                }
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
          <MemberManagement isReadOnly={false} />
        ) : (
          <EventManagement isReadOnly={false} />
        )}

        {/* Add Group Dialog */}
        <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddGroupDialogOpen(false);
                    setNewGroupName('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddGroup}>
                  Add Group
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default Admin;