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
import { useToast } from '@/hooks/use-toast';
import { Member, MemberFormData } from '@/types/member';
import { Users, Plus, Upload, Download, Search, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MemberManagement = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<'all' | '2024' | '2025'>('all');
  const [filterGroup, setFilterGroup] = useState<'all' | '2024' | '2025' | 'Committee' | 'LTL'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{key: 'first_name' | 'last_name' | 'id' | 'member_no', direction: 'asc' | 'desc'} | null>(null);
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
    nok_contact: '',
    member_no: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('KPC2')
        .select('*')
        .order('Last_Name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Map the database columns to our interface
      const mappedData = data?.map((item: any) => ({
        id: item.ID,
        first_name: item.First_Name || '',
        last_name: item.Last_Name || '',
        member_2025: item.Member_2025 || 'NO',
        member_2024: item.Member_2024 || 'NO',
        member_no: item.Member_No || '',
        dob: item.DOB,
        mobile: item.Mobile,
        joined: item.Joined || '',
        email: item.Email,
        address: item.Address,
        suburb: item.Suburb,
        pcode: item.Pcode,
        nok: item.NOK_relationship,
        nok_name: item.NOK_NAME,
        nok_contact: item.NOK_Contact,
        member_groups: item['Member_groups:'] || []
      })) || [];
      
      setMembers(mappedData);
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
        ID: `KPC-${Date.now()}`,
        First_Name: formData.first_name,
        Last_Name: formData.last_name,
        Email: formData.email || null,
        Mobile: formData.mobile || null,
        Address: formData.address || null,
        Suburb: formData.suburb || null,
        Pcode: formData.pcode || null,
        DOB: formData.dob || null,
        NOK_relationship: formData.nok || null,
        NOK_NAME: formData.nok_name || null,
        NOK_Contact: formData.nok_contact || null,
        Member_No: formData.member_no || null
      };

      const { error } = await supabase
        .from('KPC2')
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
        First_Name: formData.first_name,
        Last_Name: formData.last_name,
        Email: formData.email || null,
        Mobile: formData.mobile || null,
        Address: formData.address || null,
        Suburb: formData.suburb || null,
        Pcode: formData.pcode || null,
        DOB: formData.dob || null,
        NOK_relationship: formData.nok || null,
        NOK_NAME: formData.nok_name || null,
        NOK_Contact: formData.nok_contact || null,
        Member_No: formData.member_no || null
      };

      const { error } = await supabase
        .from('KPC2')
        .update(updatedData)
        .eq('ID', editingMember.id);

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
        .from('KPC2')
        .delete()
        .eq('ID', member.id);

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
      nok_contact: '',
      member_no: ''
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
      nok_contact: member.nok_contact || '',
      member_no: member.member_no || ''
    });
  };

  const handleSort = (key: 'first_name' | 'last_name' | 'id' | 'member_no') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: 'first_name' | 'last_name' | 'id' | 'member_no') => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <div className="flex flex-col ml-1">
          <ChevronUp className="w-3 h-3 text-muted-foreground/50" />
          <ChevronDown className="w-3 h-3 text-muted-foreground/50 -mt-1" />
        </div>
      );
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4 ml-1 text-primary" /> : 
      <ChevronDown className="w-4 h-4 ml-1 text-primary" />;
  };

  const filteredAndSortedMembers = useMemo(() => {
    console.log('Search term:', searchTerm);
    console.log('Members count:', members.length);
    
    let filtered = members.filter(member => {
      const matchesSearch = 
        member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.suburb?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.pcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.member_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.member_groups?.some(group => group.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesYear = 
        filterYear === 'all' ||
        (filterYear === '2024' && member.member_groups?.includes('2024')) ||
        (filterYear === '2025' && member.member_groups?.includes('2025'));
      
      const matchesGroup = 
        filterGroup === 'all' ||
        member.member_groups?.includes(filterGroup);
      
      return matchesSearch && matchesYear && matchesGroup;
    });
    
    console.log('Filtered results:', filtered.length);

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue = '';
        let bValue = '';
        
        switch (sortConfig.key) {
          case 'first_name':
            aValue = a.first_name.toLowerCase();
            bValue = b.first_name.toLowerCase();
            break;
          case 'last_name':
            aValue = a.last_name.toLowerCase();
            bValue = b.last_name.toLowerCase();
            break;
          case 'id':
            aValue = a.id.toLowerCase();
            bValue = b.id.toLowerCase();
            break;
          case 'member_no':
            aValue = a.member_no.toLowerCase();
            bValue = b.member_no.toLowerCase();
            break;
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [members, searchTerm, filterYear, filterGroup, sortConfig]);

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have headers and at least one data row');
      }
      
      // Detect separator (comma or tab)
      const firstLine = lines[0] || '';
      const separator = firstLine.includes('\t') ? '\t' : ',';
      
      // Parse headers and create mapping
      const headers = firstLine.split(separator).map(h => h.trim().toLowerCase());
      
      // Column mapping - flexible header names
      const columnMap = {
        first_name: headers.findIndex(h => h.includes('first') || h === 'first name' || h === 'firstname'),
        last_name: headers.findIndex(h => h.includes('last') || h === 'last name' || h === 'lastname'),
        member_2025: headers.findIndex(h => h.includes('2025') || h === 'member 2025' || h === 'member2025'),
        member_2024: headers.findIndex(h => h.includes('2024') || h === 'member 2024' || h === 'member2024'),
        member_no: headers.findIndex(h => (h.includes('member') && h.includes('no')) || h === 'member no.'),
        dob: headers.findIndex(h => h.includes('dob') || h.includes('birth')),
        mobile: headers.findIndex(h => h.includes('mobile') || h.includes('phone')),
        joined: headers.findIndex(h => h.includes('joined') || h.includes('join')),
        email: headers.findIndex(h => h.includes('email')),
        address: headers.findIndex(h => h.includes('address')),
        suburb: headers.findIndex(h => h.includes('suburb') || h.includes('city')),
        pcode: headers.findIndex(h => h.includes('pcode') || h.includes('postal') || h.includes('zip')),
        nok: headers.findIndex(h => h === 'nok' || (h.includes('nok') && !h.includes('name') && !h.includes('contact'))),
        nok_name: headers.findIndex(h => h === 'nok name' || (h.includes('nok') && h.includes('name'))),
        nok_contact: headers.findIndex(h => h === 'nok contact' || (h.includes('nok') && h.includes('contact')))
      };

      // Helper function to convert various date formats to YYYY-MM-DD
      const convertDate = (dateStr: string) => {
        if (!dateStr || dateStr.trim() === '' || dateStr.trim() === ' ') return null;
        
        const cleanDate = dateStr.trim();
        const parts = cleanDate.split('/');
        
        if (parts.length === 3) {
          let day, month, year;
          
          // Check if it's YYYY/MM/DD format (year is 4 digits and first)
          if (parts[0].length === 4) {
            [year, month, day] = parts;
          } else {
            // Assume DD/MM/YYYY or DD/MM/YY format
            [day, month, year] = parts;
          }
          
          const dayNum = parseInt(day, 10);
          const monthNum = parseInt(month, 10);
          let yearNum = parseInt(year, 10);
          
          // Handle 2-digit years (YY format) - assume 20XX for years 00-30, 19XX for 31-99
          if (yearNum >= 0 && yearNum <= 99) {
            if (yearNum <= 30) {
              yearNum += 2000;
            } else {
              yearNum += 1900;
            }
          }
          
          if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
            return `${yearNum}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }
        
        console.log('Invalid date format:', dateStr);
        return null;
      };

      // Helper function to clean values (convert "0" to null)
      const cleanValue = (value: string) => {
        if (!value || value.trim() === '' || value.trim() === '0') return null;
        return value.trim();
      };

      const members = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(separator).map(v => v.trim());
          
          const member = {
            ID: `KPC-IMPORT-${Date.now()}-${index}`,
            First_Name: columnMap.first_name >= 0 ? values[columnMap.first_name] || '' : '',
            Last_Name: columnMap.last_name >= 0 ? values[columnMap.last_name] || '' : '',
            Member_2025: columnMap.member_2025 >= 0 ? values[columnMap.member_2025] || 'NO' : 'NO',
            Member_2024: columnMap.member_2024 >= 0 ? values[columnMap.member_2024] || 'NO' : 'NO',
            Member_No: columnMap.member_no >= 0 ? values[columnMap.member_no] || `AUTO-${Date.now()}-${index}` : `AUTO-${Date.now()}-${index}`,
            DOB: columnMap.dob >= 0 ? convertDate(values[columnMap.dob]) : null,
            Mobile: columnMap.mobile >= 0 ? cleanValue(values[columnMap.mobile]) : null,
            Joined: columnMap.joined >= 0 ? convertDate(values[columnMap.joined]) || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            Email: columnMap.email >= 0 ? cleanValue(values[columnMap.email]) : null,
            Address: columnMap.address >= 0 ? cleanValue(values[columnMap.address]) : null,
            Suburb: columnMap.suburb >= 0 ? cleanValue(values[columnMap.suburb]) : null,
            Pcode: columnMap.pcode >= 0 ? cleanValue(values[columnMap.pcode]) : null,
            NOK: columnMap.nok >= 0 ? cleanValue(values[columnMap.nok]) : null,
            NOK_NAME: columnMap.nok_name >= 0 ? cleanValue(values[columnMap.nok_name]) : null,
            NOK_Contact: columnMap.nok_contact >= 0 ? cleanValue(values[columnMap.nok_contact]) : null
          };

          return member;
        })
        .filter(member => member.First_Name && member.Last_Name);

      console.log('Attempting to import', members.length, 'members');
      console.log('Sample member:', members[0]);

      const { data, error } = await supabase
        .from('KPC2')
        .insert(members);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${members.length} members.`
      });
      
      fetchMembers();
    } catch (error: any) {
      console.error('Error importing CSV:', error);
      
      let errorMessage = "Failed to import members. Please check the file format.";
      if (error?.message?.includes('Failed to fetch')) {
        errorMessage = "Network connection error. Please check your internet connection and try again.";
      } else if (error?.message?.includes('violates')) {
        errorMessage = "Data validation error. Please check your CSV format and try again.";
      }
      
      toast({
        title: "Import Error",
        description: errorMessage,
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

  const handleSelectMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredAndSortedMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredAndSortedMembers.map(m => m.id)));
    }
  };

  const clearSelection = () => {
    setSelectedMembers(new Set());
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
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search all fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={filterGroup} onValueChange={(value: 'all' | '2024' | '2025' | 'Committee' | 'LTL') => setFilterGroup(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="Committee">Committee</SelectItem>
                  <SelectItem value="LTL">LTL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" className="whitespace-nowrap">
              Go
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Database ({filteredAndSortedMembers.length})
            {searchTerm && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                - {filteredAndSortedMembers.length} result{filteredAndSortedMembers.length !== 1 ? 's' : ''} found
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading members...</div>
          ) : (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead className="w-12">
                      <Checkbox
                        checked={selectedMembers.size === filteredAndSortedMembers.length && filteredAndSortedMembers.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all members"
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center">
                        ID
                        {getSortIcon('id')}
                      </div>
                    </TableHead>
                     <TableHead 
                       className="cursor-pointer select-none"
                       onClick={() => handleSort('first_name')}
                     >
                       <div className="flex items-center">
                         First Name
                         {getSortIcon('first_name')}
                       </div>
                     </TableHead>
                     <TableHead 
                       className="cursor-pointer select-none"
                       onClick={() => handleSort('last_name')}
                     >
                       <div className="flex items-center">
                         Surname
                         {getSortIcon('last_name')}
                       </div>
                     </TableHead>
                     <TableHead 
                       className="cursor-pointer select-none"
                       onClick={() => handleSort('member_no')}
                     >
                       <div className="flex items-center">
                         Member No.
                         {getSortIcon('member_no')}
                       </div>
                     </TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>Mobile</TableHead>
                     <TableHead>Groups</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
               <TableBody>
                  {filteredAndSortedMembers.map((member) => {
                   const status = getMembershipStatus(member);
                   return (
                     <TableRow key={member.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedMembers.has(member.id)}
                            onCheckedChange={() => handleSelectMember(member.id)}
                            aria-label={`Select ${member.first_name} ${member.last_name}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {member.id}
                        </TableCell>
                         <TableCell className="font-medium">
                           <button
                             onClick={() => startEdit(member)}
                             className="text-primary hover:underline text-left"
                           >
                             {member.first_name}
                           </button>
                         </TableCell>
                         <TableCell className="font-medium">
                           {member.last_name}
                         </TableCell>
                         <TableCell>{member.member_no}</TableCell>
                        <TableCell>{member.email || '-'}</TableCell>
                        <TableCell>{member.mobile || '-'}</TableCell>
                        <TableCell>{member.member_groups?.join(', ') || '-'}</TableCell>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nok">Relationship</Label>
                <Input
                  id="nok"
                  value={formData.nok}
                  onChange={(e) => setFormData({ ...formData, nok: e.target.value })}
                  placeholder="e.g., Spouse"
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
              <div>
                <Label htmlFor="nok_contact">Phone No.</Label>
                <Input
                  id="nok_contact"
                  value={formData.nok_contact}
                  onChange={(e) => setFormData({ ...formData, nok_contact: e.target.value })}
                  placeholder="Phone"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="member_no">Member Number</Label>
              <Input
                id="member_no"
                value={formData.member_no}
                onChange={(e) => setFormData({ ...formData, member_no: e.target.value })}
                placeholder="Member number"
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