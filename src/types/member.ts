// Database schema interface matching the actual KPC2 table
export interface Member {
  ID: string;
  First_Name: string;
  Last_Name: string;
  Email: string | null;
  Mobile: string | null;
  Member_No: string | null;
  DOB: string | null;
  Joined: string | null;
  Address: string | null;
  Suburb: string | null;
  Pcode: string | null;
  NOK_relationship: string | null;
  NOK_NAME: string | null;
  NOK_Contact: string | null;
  "Member_groups:": string[];
}

// Interface for inserting new members (ID is auto-generated)
export interface MemberInsert {
  First_Name: string;
  Last_Name: string;
  Email?: string | null;
  Mobile?: string | null;
  Member_No?: string | null;
  DOB?: string | null;
  Joined?: string | null;
  Address?: string | null;
  Suburb?: string | null;
  Pcode?: string | null;
  NOK_relationship?: string | null;
  NOK_NAME?: string | null;
  NOK_Contact?: string | null;
  "Member_groups:"?: string[];
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
  member_no: string;
  phone: string;
  member_type: string;
  group_ids: string[];
  address_street: string;
  address_suburb: string;
  address_postcode: string;
  address_state: string;
  date_joined: string;
  spouse_partner: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  birthday: string;
  dietary_requirements: string;
  special_interests: string;
  group_specific_info: string;
}