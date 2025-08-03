import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Member, MemberFormData, MemberInsert } from '@/types/member';
import { Users, Plus, Upload, Download, Search, Edit, Trash2, ChevronUp, ChevronDown, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MemberManagementProps {
  isReadOnly?: boolean;
}

const MemberManagement = ({ isReadOnly = false }: MemberManagementProps) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<'all' | '2024' | '2025'>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [manuallyAddedGroups, setManuallyAddedGroups] = useState<string[]>(() => {
    const saved = localStorage.getItem('kpc-custom-groups');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{key: 'First_Name' | 'Last_Name' | 'ID' | 'Member_No', direction: 'asc' | 'desc'} | null>(null);
  const [editingGroups, setEditingGroups] = useState<{[key: string]: string}>({});
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    fromEmail: 'onboarding@resend.dev',
    fromName: 'Kensington Probus Club',
    attachments: [] as Array<{ filename: string; content: string; contentType: string }>
  });
  const [sendingEmails, setSendingEmails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const groupsInputRef = useRef<HTMLInputElement>(null);

  const [newMember, setNewMember] = useState<MemberFormData>({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    address: '',
    suburb: '',
    pcode: '',
    dob: '',
    nok: '',
    nok_name: '',
    nok_contact: '',
    member_no: '',
    phone: '',
    member_type: '',
    group_ids: [],
    address_street: '',
    address_suburb: '',
    address_postcode: '',
    address_state: 'NSW',
    date_joined: '',
    spouse_partner: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    birthday: '',
    dietary_requirements: '',
    special_interests: '',
    group_specific_info: ''
  });

  useEffect(() => {
    fetchMembers();
    fetchGroups();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('KPC2')
        .select('*')
        .order('First_Name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('KPC2')
        .select('"Member_groups:"')
        .not('"Member_groups:"', 'is', null);

      if (error) throw error;
      
      const allGroups = new Set<string>();
      data?.forEach(member => {
        if (member["Member_groups:"]) {
          member["Member_groups:"].forEach((group: string) => {
            allGroups.add(group);
          });
        }
      });
      
      setAvailableGroups([...allGroups, ...manuallyAddedGroups]);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const addMember = async () => {
    try {
      // Convert form data to database format
      const memberData: MemberInsert = {
        First_Name: newMember.first_name,
        Last_Name: newMember.last_name,
        Email: newMember.email || null,
        Mobile: newMember.mobile || newMember.phone || null,
        Member_No: newMember.member_no || null,
        DOB: newMember.dob || newMember.birthday || null,
        Joined: newMember.date_joined || null,
        Address: newMember.address || newMember.address_street || null,
        Suburb: newMember.suburb || newMember.address_suburb || null,
        Pcode: newMember.pcode || newMember.address_postcode || null,
        NOK_relationship: newMember.nok || null,
        NOK_NAME: newMember.nok_name || newMember.emergency_contact_name || null,
        NOK_Contact: newMember.nok_contact || newMember.emergency_contact_phone || null,
        "Member_groups:": newMember.group_ids || []
      };

      const { data, error } = await supabase
        .from('KPC2')
        .insert(memberData as any)
        .select()
        .single();

      if (error) throw error;

      setMembers(prev => [...prev, data]);
      setIsAddDialogOpen(false);
      setNewMember({
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        address: '',
        suburb: '',
        pcode: '',
        dob: '',
        nok: '',
        nok_name: '',
        nok_contact: '',
        member_no: '',
        phone: '',
        member_type: '',
        group_ids: [],
        address_street: '',
        address_suburb: '',
        address_postcode: '',
        address_state: 'NSW',
        date_joined: '',
        spouse_partner: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        birthday: '',
        dietary_requirements: '',
        special_interests: '',
        group_specific_info: ''
      });

      toast({
        title: "Success",
        description: "Member added successfully"
      });

      await fetchGroups();
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive"
      });
    }
  };

  const editMember = async () => {
    if (!editingMember) return;

    try {
      const { error } = await supabase
        .from('KPC2')
        .update(editingMember)
        .eq('ID', editingMember.ID);

      if (error) throw error;

      setMembers(prev => 
        prev.map(member => 
          member.ID === editingMember.ID ? editingMember : member
        )
      );
      setEditingMember(null);

      toast({
        title: "Success",
        description: "Member updated successfully"
      });

      await fetchGroups();
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Error",
        description: "Failed to update member",
        variant: "destructive"
      });
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      const { error } = await supabase
        .from('KPC2')
        .delete()
        .eq('ID', id);

      if (error) throw error;

      setMembers(prev => prev.filter(member => member.ID !== id));
      toast({
        title: "Success",
        description: "Member deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive"
      });
    }
  };

  const handleSort = (key: 'First_Name' | 'Last_Name' | 'ID' | 'Member_No') => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronUp className="w-4 h-4 opacity-0" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members.filter(member => {
      const matchesSearch = 
        (member.First_Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.Last_Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.Email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.Member_No || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesYear = filterYear === 'all' || 
        (member.Joined && member.Joined.includes(filterYear));

      const matchesGroup = filterGroup === 'all' || 
        (member["Member_groups:"] && member["Member_groups:"].includes(filterGroup));

      return matchesSearch && matchesYear && matchesGroup;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [members, searchTerm, filterYear, filterGroup, sortConfig]);

  const handleSelectMember = (memberId: string, checked: boolean) => {
    const newSelected = new Set(selectedMembers);
    if (checked) {
      newSelected.add(memberId);
    } else {
      newSelected.delete(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(new Set(filteredAndSortedMembers.map(m => m.ID)));
    } else {
      setSelectedMembers(new Set());
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Member Management</h2>
        </div>
        
        <div className="flex gap-2">
          {selectedMembers.size > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setIsEmailDialogOpen(true)}
              disabled={isReadOnly}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Selected ({selectedMembers.size})
            </Button>
          )}
          
          {!isReadOnly && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={newMember.first_name}
                        onChange={(e) => setNewMember({...newMember, first_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={newMember.last_name}
                        onChange={(e) => setNewMember({...newMember, last_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      value={newMember.mobile}
                      onChange={(e) => setNewMember({...newMember, mobile: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={addMember}>Add Member</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-80 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterYear} onValueChange={(value) => setFilterYear(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {availableGroups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Members ({filteredAndSortedMembers.length})
            {selectedMembers.size > 0 && ` - ${selectedMembers.size} selected`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={filteredAndSortedMembers.length > 0 && selectedMembers.size === filteredAndSortedMembers.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('Member_No')}
                  >
                    <div className="flex items-center gap-1">
                      Member No.
                      {getSortIcon('Member_No')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('First_Name')}
                  >
                    <div className="flex items-center gap-1">
                      First Name
                      {getSortIcon('First_Name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('Last_Name')}
                  >
                    <div className="flex items-center gap-1">
                      Last Name
                      {getSortIcon('Last_Name')}
                    </div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Groups</TableHead>
                  {!isReadOnly && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedMembers.map((member) => (
                  <TableRow key={member.ID}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMembers.has(member.ID)}
                        onCheckedChange={(checked) => handleSelectMember(member.ID, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>{member.Member_No}</TableCell>
                    <TableCell>{member.First_Name}</TableCell>
                    <TableCell>{member.Last_Name}</TableCell>
                    <TableCell>{member.Email}</TableCell>
                    <TableCell>{member.Mobile}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member["Member_groups:"]?.map((group, index) => (
                          <Badge key={index} variant="secondary">{group}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMember(member)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMember(member.ID)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_first_name">First Name</Label>
                  <Input
                    id="edit_first_name"
                    value={editingMember.First_Name}
                    onChange={(e) => setEditingMember({...editingMember, First_Name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_last_name">Last Name</Label>
                  <Input
                    id="edit_last_name"
                    value={editingMember.Last_Name}
                    onChange={(e) => setEditingMember({...editingMember, Last_Name: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editingMember.Email || ''}
                    onChange={(e) => setEditingMember({...editingMember, Email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_mobile">Mobile</Label>
                  <Input
                    id="edit_mobile"
                    value={editingMember.Mobile || ''}
                    onChange={(e) => setEditingMember({...editingMember, Mobile: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingMember(null)}>
                  Cancel
                </Button>
                <Button onClick={editMember}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberManagement;