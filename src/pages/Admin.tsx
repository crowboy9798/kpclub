import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Users, Calendar, Settings, Mail, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MemberManagement from '@/components/MemberManagement';
import EventManagement from '@/components/EventManagement';
import NewsletterManagement from '@/components/NewsletterManagement';
import InvitationManagement from '@/components/InvitationManagement';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'events' | 'newsletters' | 'invitations' | 'settings'>('dashboard');
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [availableGroups, setAvailableGroups] = useState<string[]>(['2024', '2025', 'Committee', 'LTL']);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Fetch user role
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setUserRole(data?.role || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

  // Initialize authentication state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Fetch user role when user changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Fetch user role for existing session
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Auth form submitted. IsSignUp:', isSignUp, 'Email:', loginData.email);
      
      console.log('=== SIGNUP PROCESS STARTED ===');
      console.log('isSignUp:', isSignUp);
      console.log('loginData:', loginData);
      
      if (isSignUp) {
        // Invitation validation is now handled by database trigger

        const { error: signUpError } = await supabase.auth.signUp({
          email: loginData.email,
          password: loginData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`
          }
        });

        if (signUpError) {
          toast({
            title: "Sign Up Failed",
            description: signUpError.message,
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/admin`
      });

      if (error) {
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Password Reset Email Sent",
          description: "Check your email for password reset instructions.",
        });
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Password Reset Error",
        description: "An error occurred while sending the reset email.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive"
      });
      return;
    }

    if (changePasswordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: changePasswordData.newPassword
      });

      if (error) {
        toast({
          title: "Password Change Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Password Changed Successfully",
          description: "Your password has been updated.",
        });
        setChangePasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: "Password Change Error",
        description: "An error occurred while changing your password.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is admin or committee
  const isAdmin = user?.email === 'tejifry@gmail.com' || userRole === 'admin';
  const isCommittee = userRole === 'committee';
  const hasAccess = isAdmin || isCommittee;

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
      actions: isAdmin ? ["Add New Event", "Edit Existing Events"] : ["View Events"],
      allowedRoles: ['admin', 'committee']
    },
    {
      icon: Users,
      title: "Member Management", 
      description: "Manage member database and profiles",
      actions: isAdmin ? ["View Member List", "Add New Members", "Update Member Info", "Export Data", "ADD NEW GROUP"] : ["View Member List"],
      allowedRoles: ['admin', 'committee']
    },
    {
      icon: Mail,
      title: "Communications",
      description: "Manage newsletters and email communications",
      actions: ["Manage Newsletters", "Send Filtered Emails"],
      allowedRoles: ['admin', 'committee']
    },
    {
      icon: Settings,
      title: "Site Management",
      description: "Update website content and settings",
      actions: ["Edit Homepage", "Update Club Info"],
      allowedRoles: ['admin']
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
                {isSignUp ? 'Create Admin Account' : 'Administrator Login'}
              </CardTitle>
              <p className="text-muted-foreground">
                {isSignUp ? 'Create your account using your invitation' : 'Access the club administration dashboard'}
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
                
                {!isSignUp && (
                  <div className="mt-2">
                    <Button 
                      type="button"
                      variant="link" 
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-muted-foreground"
                    >
                      Forgot your password?
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Forgot Password Dialog */}
          <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <Label htmlFor="resetEmail">Email Address</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
              variant={activeTab === 'newsletters' ? 'default' : 'outline'}
              onClick={() => setActiveTab('newsletters')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Newsletters
            </Button>
            {isAdmin && (
              <Button 
                variant={activeTab === 'invitations' ? 'default' : 'outline'}
                onClick={() => setActiveTab('invitations')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invitations
              </Button>
            )}
            <Button 
              variant={activeTab === 'settings' ? 'default' : 'outline'}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
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
              {adminFeatures
                .filter(feature => 
                  feature.allowedRoles.includes('admin') && isAdmin || 
                  feature.allowedRoles.includes('committee') && isCommittee
                )
                .map((feature, index) => {
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
                                  if (action === "ADD NEW GROUP" && isAdmin) {
                                    setIsAddGroupDialogOpen(true);
                                  } else {
                                    setActiveTab('members');
                                  }
                                } else if (feature.title === "Event Management") {
                                  setActiveTab('events');
                                } else if (feature.title === "Communications") {
                                  if (action === "Manage Newsletters") {
                                    setActiveTab('newsletters');
                                  } else {
                                    toast({
                                      title: "Feature Coming Soon",
                                      description: `${action} functionality will be available in the next update.`
                                    });
                                  }
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
          <MemberManagement isReadOnly={isCommittee} />
        ) : activeTab === 'events' ? (
          <EventManagement isReadOnly={isCommittee} />
        ) : activeTab === 'invitations' ? (
          <InvitationManagement user={user} isAdmin={isAdmin} />
        ) : activeTab === 'settings' ? (
          <div className="max-w-2xl">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Lock className="w-6 h-6 mr-3" />
                  Change Password
                </CardTitle>
                <p className="text-muted-foreground">Update your account password</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={changePasswordData.newPassword}
                        onChange={(e) => setChangePasswordData({
                          ...changePasswordData,
                          newPassword: e.target.value
                        })}
                        required
                        className="pr-10"
                        placeholder="Enter new password"
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={changePasswordData.confirmPassword}
                      onChange={(e) => setChangePasswordData({
                        ...changePasswordData,
                        confirmPassword: e.target.value
                      })}
                      required
                      className="mt-1"
                      placeholder="Confirm new password"
                      minLength={6}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setChangePasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <NewsletterManagement />
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