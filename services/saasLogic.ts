
import { Institution } from '../types';

/**
 * SaaS Logic: Checks if access should be restricted based on trial status.
 * Requirement: If current_date > trial_expiry_date AND no payment method, restrict access.
 */
export const checkAccessStatus = (institution: Institution): 'active' | 'expired' => {
  const currentDate = new Date();
  const expiryDate = new Date(institution.trial_expiry_date);

  // If the trial has expired
  if (currentDate > expiryDate) {
    // If no payment method is found, restrict access
    if (!institution.has_payment_method) {
      return 'expired';
    }
  }

  // Otherwise, if the account is active, allow access
  return institution.is_active ? 'active' : 'expired';
};

export const calculateTrialDaysRemaining = (expiryDate: string): number => {
  const diff = new Date(expiryDate).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
