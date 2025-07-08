import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Member, MemberFormData } from '@/types/member';
import { Users, Plus, Upload, Download, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MemberManagement = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<'all' | '2024' | '2025'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<MemberFormData>({
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
    nok_contact: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('last_name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load members from database.",
        variant: "destructive"
      });
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMember = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        mobile: formData.mobile || null,
        address: formData.address || null,
        suburb: formData.suburb || null,
        pcode: formData.pcode || null,
        dob: formData.dob || null,
        nok: formData.nok || null,
        nok_name: formData.nok_name || null,
        nok_contact: formData.nok_contact || null,
        member_2025: 'YES' as const,
        member_2024: 'NO' as const,
        member_no: `290043810${String(Date.now()).slice(-3)}`,
        joined: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase
        .from('members')
        .insert([newMember]);

      if (error) {
        throw error;
      }

      toast({
        title: "Member Added",
        description: `${formData.first_name} ${formData.last_name} has been added successfully.`
      });
      setIsAddDialogOpen(false);
      resetForm();
      fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      const updatedData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        mobile: formData.mobile || null,
        address: formData.address || null,
        suburb: formData.suburb || null,
        pcode: formData.pcode || null,
        dob: formData.dob || null,
        nok: formData.nok || null,
        nok_name: formData.nok_name || null,
        nok_contact: formData.nok_contact || null
      };

      const { error } = await supabase
        .from('members')
        .update(updatedData)
        .eq('id', editingMember.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Member Updated",
        description: `${formData.first_name} ${formData.last_name} has been updated successfully.`
      });
      setEditingMember(null);
      resetForm();
      fetchMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Error",
        description: "Failed to update member. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMember = async (member: Member) => {
    if (!confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', member.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Member Deleted",
        description: `${member.first_name} ${member.last_name} has been deleted.`
      });
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
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
      nok_contact: ''
    });
  };

  const startEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email || '',
      mobile: member.mobile || '',
      address: member.address || '',
      suburb: member.suburb || '',
      pcode: member.pcode || '',
      dob: member.dob || '',
      nok: member.nok || '',
      nok_name: member.nok_name || '',
      nok_contact: member.nok_contact || ''
    });
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.member_no.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = 
      filterYear === 'all' ||
      (filterYear === '2024' && member.member_2024 === 'YES') ||
      (filterYear === '2025' && member.member_2025 === 'YES');
    
    return matchesSearch && matchesYear;
  });

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');
      
      // Detect separator (comma or tab)
      const firstLine = lines[0] || '';
      const separator = firstLine.includes('\t') ? '\t' : ',';
      
      const headers = firstLine.split(separator);
      
      const members = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(separator);
          return {
            first_name: values[1]?.trim() || '',
            last_name: values[2]?.trim() || '',
            member_2025: values[3]?.trim() || 'NO',
            member_2024: values[4]?.trim() || 'NO',
            member_no: values[5]?.trim() || '',
            dob: values[6]?.trim() || null,
            mobile: values[7]?.trim() || null,
            joined: values[8]?.trim() || new Date().toISOString().split('T')[0],
            email: values[9]?.trim() || null,
            address: values[10]?.trim() || null,
            suburb: values[11]?.trim() || null,
            pcode: values[12]?.trim() || null,
            nok: values[13]?.trim() || null,
            nok_name: values[14]?.trim() || null,
            nok_contact: values[15]?.trim() || null
          };
        })
        .filter(member => member.first_name && member.last_name);

      const { error } = await supabase
        .from('members')
        .upsert(members, { 
          onConflict: 'member_no',
          ignoreDuplicates: false 
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${members.length} members.`
      });
      
      fetchMembers();
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        title: "Import Error",
        description: "Failed to import members. Please check the file format.",
        variant: "destructive"
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'First Name', 'Last Name', '2025 Member', '2024 Member', 'Member No.', 'DOB', 'Mobile', 'Joined', 'Email', 'Address', 'Suburb', 'Pcode', 'NOK', 'NOK Name', 'NOK Contact'];
    
    const csvContent = [
      headers.join('\t'),
      ...members.map(member => [
        member.id,
        member.first_name,
        member.last_name,
        member.member_2025,
        member.member_2024,
        member.member_no,
        member.dob || '',
        member.mobile || '',
        member.joined,
        member.email || '',
        member.address || '',
        member.suburb || '',
        member.pcode || '',
        member.nok || '',
        member.nok_name || '',
        member.nok_contact || ''
      ].join('\t'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: `Exported ${members.length} members to CSV.`
    });
  };

  const getMembershipStatus = (member: Member) => {
    if (member.member_2025 === 'YES') return { text: '2025 Member', variant: 'default' as const };
    if (member.member_2025 === 'LTL') return { text: '2025 LTL', variant: 'secondary' as const };
    if (member.member_2024 === 'YES') return { text: '2024 Only', variant: 'outline' as const };
    return { text: 'Inactive', variant: 'destructive' as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Member Management
          </h2>
          <p className="text-muted-foreground">Manage club members and their information</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
          </Dialog>
          
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
          
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterYear} onValueChange={(value: 'all' | '2024' | '2025') => setFilterYear(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="2025">2025 Members</SelectItem>
                <SelectItem value="2024">2024 Members</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({filteredMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading members...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Member No.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Suburb</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => {
                  const status = getMembershipStatus(member);
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.first_name} {member.last_name}
                      </TableCell>
                      <TableCell>{member.member_no}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.text}</Badge>
                      </TableCell>
                      <TableCell>{member.email || '-'}</TableCell>
                      <TableCell>{member.mobile || '-'}</TableCell>
                      <TableCell>{member.suburb || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(member)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMember(member)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Member Dialog */}
      <Dialog open={isAddDialogOpen || editingMember !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingMember(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Edit Member' : 'Add New Member'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={editingMember ? handleEditMember : handleAddMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="suburb">Suburb</Label>
                <Input
                  id="suburb"
                  value={formData.suburb}
                  onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pcode">Postal Code</Label>
                <Input
                  id="pcode"
                  value={formData.pcode}
                  onChange={(e) => setFormData({ ...formData, pcode: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nok">Next of Kin Relationship</Label>
                <Input
                  id="nok"
                  value={formData.nok}
                  onChange={(e) => setFormData({ ...formData, nok: e.target.value })}
                  placeholder="e.g., Spouse, Daughter, Son"
                />
              </div>
              <div>
                <Label htmlFor="nok_name">Next of Kin Name</Label>
                <Input
                  id="nok_name"
                  value={formData.nok_name}
                  onChange={(e) => setFormData({ ...formData, nok_name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nok_contact">Next of Kin Contact</Label>
              <Input
                id="nok_contact"
                value={formData.nok_contact}
                onChange={(e) => setFormData({ ...formData, nok_contact: e.target.value })}
                placeholder="Phone number"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingMember(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingMember ? 'Update Member' : 'Add Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberManagement;