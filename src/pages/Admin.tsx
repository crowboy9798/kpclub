import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Lock, Users, Calendar, Settings, Mail, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [memberGroups, setMemberGroups] = useState(['2024Members', '2025Members']);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

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

  const handleAddGroup = () => {
    if (newGroupName.trim() && !memberGroups.includes(newGroupName.trim())) {
      setMemberGroups([...memberGroups, newGroupName.trim()]);
      setNewGroupName('');
      toast({
        title: "Group Added",
        description: `${newGroupName.trim()} has been added to the member groups.`,
      });
    }
  };

  const handleRemoveGroup = (groupToRemove: string) => {
    setMemberGroups(memberGroups.filter(group => group !== groupToRemove));
    if (selectedGroup === groupToRemove) {
      setSelectedGroup('');
    }
    toast({
      title: "Group Removed",
      description: `${groupToRemove} has been removed from the member groups.`,
    });
  };

  const adminFeatures = [
    {
      icon: Calendar,
      title: "Event Management",
      description: "Add, edit, and delete club events",
      actions: ["Add New Event", "Edit Existing Events", "View Event Analytics"]
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

                <div className="bg-accent/30 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Demo credentials:</strong><br />
                    Username: admin<br />
                    Password: password
                  </p>
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
          <Button 
            variant="outline" 
            onClick={() => setIsLoggedIn(false)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-elegant">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">127</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </CardContent>
          </Card>
          
          <Card className="card-elegant">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-secondary-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">6</div>
              <div className="text-sm text-muted-foreground">Upcoming Events</div>
            </CardContent>
          </Card>
          
          <Card className="card-elegant">
            <CardContent className="p-6 text-center">
              <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">New Messages</div>
            </CardContent>
          </Card>
          
          <Card className="card-elegant">
            <CardContent className="p-6 text-center">
              <Settings className="w-8 h-8 text-secondary-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Pending Tasks</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminFeatures.map((feature, index) => {
            const Icon = feature.icon;
            
            // Special handling for Member Management
            if (feature.title === "Member Management") {
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
                    <div className="space-y-4">
                      {/* View Group List */}
                      <div>
                        <Label htmlFor="group-select" className="text-sm font-medium">
                          View Group List
                        </Label>
                        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select a member group" />
                          </SelectTrigger>
                          <SelectContent>
                            {memberGroups.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Add New Group */}
                      <div className="border-t pt-4">
                        <Label htmlFor="new-group" className="text-sm font-medium">
                          Add New Group
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="new-group"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Enter group name"
                            className="flex-1"
                          />
                          <Button onClick={handleAddGroup} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Manage Groups */}
                      <div className="border-t pt-4">
                        <Label className="text-sm font-medium mb-2 block">
                          Manage Groups
                        </Label>
                        <div className="space-y-2">
                          {memberGroups.map((group) => (
                            <div key={group} className="flex items-center justify-between bg-accent/20 p-2 rounded">
                              <span className="text-sm">{group}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveGroup(group)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            
            // Default rendering for other features
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
                        onClick={() => toast({
                          title: "Feature Coming Soon",
                          description: `${action} functionality will be available in the next update.`
                        })}
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

        {/* Recent Activity */}
        <div className="mt-8">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="text-primary">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="font-medium">New member registration</p>
                    <p className="text-sm text-muted-foreground">Sarah Johnson joined the club</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="font-medium">Event updated</p>
                    <p className="text-sm text-muted-foreground">Holiday Celebration details modified</p>
                  </div>
                  <span className="text-sm text-muted-foreground">1 day ago</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="font-medium">Contact form submission</p>
                    <p className="text-sm text-muted-foreground">New inquiry about membership</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2 days ago</span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Newsletter sent</p>
                    <p className="text-sm text-muted-foreground">December newsletter delivered to 127 members</p>
                  </div>
                  <span className="text-sm text-muted-foreground">3 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;