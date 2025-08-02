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
import { Member, MemberFormData } from '@/types/member';
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
  const [sortConfig, setSortConfig] = useState<{key: 'first_name' | 'last_name' | 'id' | 'member_no', direction: 'asc' | 'desc'} | null>(null);
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
    phone: '',
    member_no: '',
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
        .order('first_name');

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
        .select('group_ids')
        .not('group_ids', 'is', null);

      if (error) throw error;

      const allGroups = new Set<string>();
      data?.forEach(member => {
        if (member.group_ids && Array.isArray(member.group_ids)) {
          member.group_ids.forEach(group => allGroups.add(group));
        }
      });

      const combinedGroups = Array.from(allGroups).concat(manuallyAddedGroups);
      setAvailableGroups([...new Set(combinedGroups)].sort());
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const addMember = async () => {
    try {
      const { data, error } = await supabase
        .from('KPC2')
        .insert([newMember])
        .select()
        .single();

      if (error) throw error;

      setMembers(prev => [...prev, data]);
      setIsAddDialogOpen(false);
      setNewMember({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        member_no: '',
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
        .eq('id', editingMember.id);

      if (error) throw error;

      setMembers(prev => 
        prev.map(member => 
          member.id === editingMember.id ? editingMember : member
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
        .eq('id', id);

      if (error) throw error;

      setMembers(prev => prev.filter(member => member.id !== id));
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

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/\"/g, ''));

      const newMembers: MemberFormData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/\"/g, ''));
        const memberData: any = {};

        headers.forEach((header, index) => {
          const value = values[index] || '';

          switch(header.toLowerCase()) {
            case 'first_name':
            case 'last_name':
            case 'email':
            case 'phone':
            case 'member_no':
            case 'member_type':
            case 'address_street':
            case 'address_suburb':
            case 'address_postcode':
            case 'address_state':
            case 'date_joined':
            case 'spouse_partner':
            case 'emergency_contact_name':
            case 'emergency_contact_phone':
            case 'birthday':
            case 'dietary_requirements':
            case 'special_interests':
            case 'group_specific_info':
              memberData[header.toLowerCase()] = value;
              break;
            case 'groups':
            case 'group_ids':
              memberData.group_ids = value ? value.split(';').map(g => g.trim()) : [];
              break;
          }
        });

        if (memberData.first_name && memberData.last_name) {
          newMembers.push(memberData);
        }
      }

      if (newMembers.length > 0) {
        try {
          const { data, error } = await supabase
            .from('KPC2')
            .insert(newMembers)
            .select();

          if (error) throw error;

          setMembers(prev => [...prev, ...data]);
          toast({
            title: "Success",
            description: `Imported ${newMembers.length} members successfully`
          });

          await fetchGroups();
        } catch (error) {
          console.error('Error importing members:', error);
          toast({
            title: "Error",
            description: "Failed to import members",
            variant: "destructive"
          });
        }
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExportCSV = () => {
    const headers = [
      'first_name', 'last_name', 'email', 'phone', 'member_no', 'member_type',
      'groups', 'address_street', 'address_suburb', 'address_postcode', 'address_state',
      'date_joined', 'spouse_partner', 'emergency_contact_name', 'emergency_contact_phone',
      'birthday', 'dietary_requirements', 'special_interests', 'group_specific_info'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedMembers.map(member => 
        headers.map(header => {
          if (header === 'groups') {
            return `"${member.group_ids ? member.group_ids.join(';') : ''}"`;
          }
          const value = member[header as keyof Member] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpc-members-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSort = (key: 'first_name' | 'last_name' | 'id' | 'member_no') => {
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
        member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.member_no.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesYear = filterYear === 'all' || 
        (member.date_joined && member.date_joined.includes(filterYear));

      const matchesGroup = filterGroup === 'all' || 
        (member.group_ids && member.group_ids.includes(filterGroup));

      return matchesSearch && matchesYear && matchesGroup;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

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
      setSelectedMembers(new Set(filteredAndSortedMembers.map(m => m.id)));
    } else {
      setSelectedMembers(new Set());
    }
  };

  const addGroup = () => {
    if (newGroupName.trim() && !availableGroups.includes(newGroupName.trim())) {
      const updatedGroups = [...manuallyAddedGroups, newGroupName.trim()];
      setManuallyAddedGroups(updatedGroups);
      localStorage.setItem('kpc-custom-groups', JSON.stringify(updatedGroups));
      setAvailableGroups(prev => [...prev, newGroupName.trim()].sort());
      setNewGroupName('');
      setIsAddGroupDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Group added successfully"
      });
    }
  };

  const handleSendEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMembers.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one member",
        variant: "destructive"
      });
      return;
    }

    setSendingEmails(true);

    try {
      const selectedMembersList = members.filter(m => selectedMembers.has(m.id));
      
      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          recipients: selectedMembersList.map(m => ({
            email: m.email,
            firstName: m.first_name,
            lastName: m.last_name
          })),
          ...emailForm
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Email sent to ${selectedMembers.size} members`
      });

      setIsEmailDialogOpen(false);
      setEmailForm({
        subject: '',
        message: '',
        fromEmail: 'onboarding@resend.dev',
        fromName: 'Kensington Probus Club',
        attachments: []
      });
      setSelectedMembers(new Set());
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: "Error",
        description: "Failed to send emails",
        variant: "destructive"
      });
    } finally {
      setSendingEmails(false);
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
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleImportCSV}
                style={{ display: 'none' }}
              />
              <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
            </>
          )}
          
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

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
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="member_no">Member No.</Label>
                      <Input
                        id="member_no"
                        value={newMember.member_no}
                        onChange={(e) => setNewMember({...newMember, member_no: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="member_type">Member Type</Label>
                      <Select
                        value={newMember.member_type}
                        onValueChange={(value) => setNewMember({...newMember, member_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full">Full</SelectItem>
                          <SelectItem value="Associate">Associate</SelectItem>
                          <SelectItem value="Honorary">Honorary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="date_joined">Date Joined</Label>
                    <Input
                      id="date_joined"
                      type="date"
                      value={newMember.date_joined}
                      onChange={(e) => setNewMember({...newMember, date_joined: e.target.value})}
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
              
              {!isReadOnly && (
                <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
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
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddGroupDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addGroup}>Add Group</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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
                    onClick={() => handleSort('member_no')}
                  >
                    <div className="flex items-center gap-1">
                      Member No.
                      {getSortIcon('member_no')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('first_name')}
                  >
                    <div className="flex items-center gap-1">
                      First Name
                      {getSortIcon('first_name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('last_name')}
                  >
                    <div className="flex items-center gap-1">
                      Last Name
                      {getSortIcon('last_name')}
                    </div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Groups</TableHead>
                  {!isReadOnly && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMembers.has(member.id)}
                        onCheckedChange={(checked) => handleSelectMember(member.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>{member.member_no}</TableCell>
                    <TableCell>{member.first_name}</TableCell>
                    <TableCell>{member.last_name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.member_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.group_ids?.map((group, index) => (
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
                            onClick={() => deleteMember(member.id)}
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
                    value={editingMember.first_name}
                    onChange={(e) => setEditingMember({...editingMember, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_last_name">Last Name</Label>
                  <Input
                    id="edit_last_name"
                    value={editingMember.last_name}
                    onChange={(e) => setEditingMember({...editingMember, last_name: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_phone">Phone</Label>
                  <Input
                    id="edit_phone"
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit_member_no">Member No.</Label>
                  <Input
                    id="edit_member_no"
                    value={editingMember.member_no}
                    onChange={(e) => setEditingMember({...editingMember, member_no: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_member_type">Member Type</Label>
                  <Select
                    value={editingMember.member_type}
                    onValueChange={(value) => setEditingMember({...editingMember, member_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full">Full</SelectItem>
                      <SelectItem value="Associate">Associate</SelectItem>
                      <SelectItem value="Honorary">Honorary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_date_joined">Date Joined</Label>
                  <Input
                    id="edit_date_joined"
                    type="date"
                    value={editingMember.date_joined}
                    onChange={(e) => setEditingMember({...editingMember, date_joined: e.target.value})}
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

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email to Selected Members</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendEmails} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={emailForm.fromName}
                  onChange={(e) => setEmailForm({...emailForm, fromName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={emailForm.fromEmail}
                  onChange={(e) => setEmailForm({...emailForm, fromEmail: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={6}
                value={emailForm.message}
                onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                required
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEmailDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={sendingEmails || selectedMembers.size === 0}>
                {sendingEmails ? 'Sending...' : `Send Email (${selectedMembers.size})`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberManagement;
