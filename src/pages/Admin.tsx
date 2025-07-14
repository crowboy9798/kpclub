import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Users, Calendar, Settings, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MemberManagement from '@/components/MemberManagement';
import EventManagement from '@/components/EventManagement';

const Admin = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPermissions, setUserPermissions] = useState<'admin' | 'committee' | null>(null);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'events'>('dashboard');
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [availableGroups, setAvailableGroups] = useState<string[]>(['2024', '2025', 'Committee', 'LTL']);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check password
    if (loginData.password !== 'KPC2512#') {
      toast({
        title: "Login Failed",
        description: "Invalid password.",
        variant: "destructive"
      });
      return;
    }

    // Check for admin access
    if (loginData.email === 'kensingtonprobusclub@gmail.com') {
      setIsLoggedIn(true);
      setUserPermissions('admin');
      toast({
        title: "Login Successful",
        description: "Welcome Administrator!",
      });
      return;
    }

    // Check for committee member access
    try {
      const { data: members, error } = await supabase
        .from('KPC2')
        .select('Email, "Member_groups:"')
        .eq('Email', loginData.email);

      if (error) {
        console.error('Error checking member status:', error);
        toast({
          title: "Login Error",
          description: "Unable to verify membership status.",
          variant: "destructive"
        });
        return;
      }

      const member = members?.[0];
      if (member && member["Member_groups:"] && member["Member_groups:"].includes('Committee')) {
        setIsLoggedIn(true);
        setUserPermissions('committee');
        toast({
          title: "Login Successful",
          description: "Welcome Committee Member!",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin area.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login.",
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

  const isAdmin = userPermissions === 'admin';
  const isCommittee = userPermissions === 'committee';

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
              Welcome back{isAdmin ? ' Administrator' : ' Committee Member'}! {isAdmin ? 'Manage' : 'View'} your club's information and activities.
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
              onClick={() => {
                setIsLoggedIn(false);
                setUserPermissions(null);
                setLoginData({ email: '', password: '' });
              }}
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
          <MemberManagement isReadOnly={!isAdmin} />
        ) : (
          <EventManagement isReadOnly={!isAdmin} />
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