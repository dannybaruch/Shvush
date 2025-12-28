
import { Institution, Candidate, Interaction } from '../types';

// מזהה ברירת מחדל למוסד חדש
const INSTITUTION_ID = 'inst-new-user';

export const MOCK_INSTITUTION: Institution = {
  id: INSTITUTION_ID,
  name: 'המוסד שלי',
  // Fixed: changed admin_email to email to match the Institution interface
  email: '',
  signup_date: new Date().toISOString(),
  trial_expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 ימי ניסיון כברירת מחדל
  is_active: true,
  has_payment_method: false,
  enrollment_goal: 0
};

export const MOCK_INSTITUTIONS_LIST: Institution[] = [MOCK_INSTITUTION];

// רשימת מועמדים ריקה לשימוש אמת
export const MOCK_CANDIDATES: Candidate[] = [];

// רשימת אינטראקציות ריקה לשימוש אמת
export const MOCK_INTERACTIONS: Interaction[] = [];
