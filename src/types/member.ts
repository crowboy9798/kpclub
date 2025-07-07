export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  member_2025: 'YES' | 'NO' | 'LTL';
  member_2024: 'YES' | 'NO' | 'LTL';
  member_no: string;
  dob: string | null;
  mobile: string | null;
  joined: string;
  email: string | null;
  address: string | null;
  suburb: string | null;
  pcode: string | null;
  nok: string | null;
  nok_name: string | null;
  nok_contact: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MemberFormData {
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  address: string;
  suburb: string;
  pcode: string;
  dob: string;
  nok: string;
  nok_name: string;
  nok_contact: string;
}