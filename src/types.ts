export type ProfileGender = 'Bride' | 'Groom';

export type ProfileStatus = 'pending_whatsapp' | 'approved' | 'archived';

export type MaritalStatus = 'Never Married' | 'Divorced' | 'Widowed' | 'Khula';

export interface MatrimonialProfile {
  id: string;
  refCode: string;
  fullName: string;
  gender: ProfileGender;
  age: number;
  height: string;
  maritalStatus: MaritalStatus;
  city: string;
  country: string;
  education: string;
  profession: string;
  monthlyIncome: string;
  sect: string;
  caste: string;
  familyType: 'Nuclear' | 'Joint';
  fatherProfession: string;
  siblings: string;
  bio: string;
  partnerPreference: string;
  photoUrl: string;
  hidePhoto?: boolean;
  guardianName: string;
  guardianPhone: string;
  status: ProfileStatus;
  paymentConfirmed: boolean;
  feeAmount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ContactRequestStatus = 'direct_sent' | 'reviewed' | 'declined';

export interface ContactRequest {
  id: string;
  requestCode: string;
  profileId: string;
  profileRefCode: string;
  profileName: string;
  requesterName: string;
  requesterCity: string;
  requesterPhone: string;
  relationToCandidate: string;
  message: string;
  feeAmount: number;
  status: ContactRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublicBureauSettings {
  bureauName: string;
  whatsappNumber: string;
  whatsappIntl: string;
  feePerProfile: number;
  currency: string;
  paymentAccountTitle: string;
  paymentChannel: string;
  paymentInstructions: string;
  officeCity: string;
}

export interface BureauSettings extends PublicBureauSettings {
  adminPassword: string;
}

export interface BureauStats {
  totalProfiles: number;
  approvedProfiles: number;
  pendingProfiles: number;
  archivedProfiles: number;
  totalRequests: number;
  reviewedRequests: number;
  newRequests: number;
  confirmedRevenueRs: number;
}

export interface TrackStatusResponse {
  kind: 'profile' | 'request';
  refCode: string;
  title: string;
  subtitle: string;
  status: string;
  paymentConfirmed: boolean;
  feeAmount: number;
  createdAt: string;
  unlockedContact?: {
    guardianName: string;
    guardianPhone: string;
    profileName: string;
    profileRefCode: string;
  };
}
