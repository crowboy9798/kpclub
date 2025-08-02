import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Mail, Clock, CheckCircle, XCircle, Users } from 'lucide-react';

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'committee' | 'pending';
  invited_by: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'committee' | 'pending';
  invited_by: string | null;
  approved_at: string | null;
  created_at: string;
  email: string;
}

export const UserManagement = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'committee'>('committee');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (invitationsError) throw invitationsError;

      // Fetch user roles with profile data
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          *,
          profiles!user_roles_user_id_fkey (email)
        `)
        .order('created_at', { ascending: false });

      if (userRolesError) throw userRolesError;

      // Map to include email from profiles
      const userRolesWithEmails = (userRolesData || []).map((userRole: any) => ({
        ...userRole,
        email: userRole.profiles?.email || 'Unknown'
      }));

      setInvitations(invitationsData || []);
      setUserRoles(userRolesWithEmails);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('invitations')
        .insert({
          email: inviteEmail,
          role: inviteRole,
          invited_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${inviteEmail}`,
      });

      setInviteEmail('');
      setInviteDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error sending invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation revoked",
        description: "The invitation has been revoked",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error revoking invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'committee') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          role: newRole,
          approved_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "User role updated",
        description: "The user's role has been updated successfully",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'committee':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadge = (invitation: Invitation) => {
    if (invitation.used) {
      return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Used</Badge>;
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Expired</Badge>;
    }
    
    return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage committee member access and invitations</p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Committee Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Committee Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="committee.member@example.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={(value: 'committee') => setInviteRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="committee">Committee Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSendInvitation} className="w-full">
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Users
            </CardTitle>
            <CardDescription>
              Committee members with access to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userRoles.map((userRole) => (
                <div key={userRole.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{userRole.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(userRole.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(userRole.role)}>
                      {userRole.role}
                    </Badge>
                    {userRole.role === 'pending' && (
                      <Select onValueChange={(value: 'admin' | 'committee') => handleUpdateUserRole(userRole.user_id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Approve" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="committee">Committee</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
              {userRoles.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No users found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
            <CardDescription>
              Invitations sent to committee members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Expires {new Date(invitation.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invitation)}
                    {!invitation.used && new Date(invitation.expires_at) > new Date() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeInvitation(invitation.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {invitations.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No pending invitations</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};