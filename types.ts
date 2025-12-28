
export enum Source {
  Graduate = 'בוגר',
  VisitedMe = 'הגעתם אליי לישיבה',
  Ad = 'מודעה',
  Friend = 'חבר'
}

export enum Stage {
  Initial = 'פנייה ראשונית',
  Scheduled = 'נקבע ביקור',
  Visiting = 'מבקר כעת',
  DidInterview = 'עשה ראיון',
  NoInterview = 'לא עשה ראיון',
  Decision = 'שלב ההחלטה',
  Closed = 'סגור'
}

export enum Status {
  Accepted = 'התקבל',
  Enrolled = 'נרשם בפועל',
  Passed = 'ויתר/הפסד'
}

export enum InteractionType {
  Phone = 'טלפון',
  WhatsApp = 'וואטסאפ',
  Meeting = 'פגישה',
  Email = 'מייל',
  Interview = 'ראיון קבלה',
  Observation = 'תצפית מדריך'
}

export interface Institution {
  id: string;
  name: string;
  email: string;
  password?: string; // במציאות זה יהיה Hash
  signup_date: string;
  trial_expiry_date: string;
  is_active: boolean;
  has_payment_method: boolean;
  enrollment_goal?: number;
  candidate_count?: number; 
}

export interface Candidate {
  id: string;
  institution_id: string; // Foreign Key למוסד
  full_name: string;
  phone: string;
  current_yeshiva: string;
  source: Source;
  stage: Stage;
  status: Status;
  photo?: string;
  created_at?: string;
  
  // Logistics & Hospitality
  visit_start?: string; 
  visit_end?: string;   
  assigned_host?: string; 
  assigned_room?: string; 
  special_requirements?: string;
  
  // Evaluation
  evaluation_score?: number; 
  interviewer_name?: string;
  interview_status?: 'Pending' | 'Done';
}

export interface Interaction {
  id: string;
  candidate_id: string;
  institution_id: string; // Foreign Key למוסד
  type: InteractionType;
  summary: string;
  timestamp: string;
}
