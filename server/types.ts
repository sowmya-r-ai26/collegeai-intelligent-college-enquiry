export type CourseLevel = 'UG' | 'PG' | 'Diploma';

export interface CourseRecord {
  id: number;
  code: string;
  course_name: string;
  course_category: string;
  level: CourseLevel;
  description: string;
  duration: string;
  eligibility: string;
  fees: string;
  fee_numeric: number;
  seats: number;
  career_opportunities: string[];
  featured: boolean;
  created_at: string;
}

export interface ApplicationRecord {
  id: number;
  application_number: string;
  full_name: string;
  email: string;
  mobile_number: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  selected_course_id: number;
  course_name?: string;
  course_code?: string;
  academic_qualification: string;
  percentage: number;
  tenth_percentage?: number;
  previous_institution?: string;
  quota: string;
  application_status: string;
  status_note: string;
  is_demo?: boolean;
  created_at: string;
}

export interface KnowledgeChunkRecord {
  id: number;
  title: string;
  content: string;
  category: string;
  source_file: string;
  embedding: number[];
  created_at: string;
}

export interface ChatMessageRecord {
  id: number;
  session_id: string;
  user_message: string;
  assistant_response: string;
  sources: Array<{ id: number; title: string; category: string; score: number }>;
  created_at: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  tag: string;
  description: string;
}

export interface InstitutionalNotice {
  id: string;
  title: string;
  body: string;
  time_label: string;
  category: string;
}

export interface CollegeInfoPayload {
  institution_name: string;
  short_code: string;
  affiliation: string;
  location: string;
  academic_session: string;
  admissions_email: string;
  admissions_phone: string;
  website: string;
  stats: {
    accredited_degrees: number;
    placement_rate: string;
    rag_chunks: number;
    active_recruiters: string;
  };
  events: CampusEvent[];
  notices: InstitutionalNotice[];
  placements: {
    rate: string;
    highest_package: string;
    average_package: string;
    top_recruiters: string[];
    highlights: string[];
  };
  campus_life: {
    hostel_boys: string;
    hostel_girls: string;
    mess_fee: string;
    facilities: Array<{ name: string; detail: string }>;
  };
}
