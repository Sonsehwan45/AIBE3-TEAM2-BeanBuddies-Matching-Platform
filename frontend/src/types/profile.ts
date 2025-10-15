export interface ProfileResponse {
  username: string;
  name: string;
  role: 'CLIENT' | 'FREELANCER';
  createdAt: string;
  ratingAvg: number;
  email?: string;
  companyName?: string;
  companySize?: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE';
  companyDescription?: string;
  representative?: string;
  businessNo?: string;
  companyPhone?: string;
  companyEmail?: string;
  contact?: string;
  experience?: string;
  introduction?: string;
  skills?: string[];
  interests?: string[];
  // Freelancer specific fields
  techStack?: string[];
  career?: string;
  portfolio?: string;
  preferredWorkType?: 'FULL_TIME' | 'PART_TIME' | 'FREELANCE' | 'REMOTE';
  desiredSalary?: string;
}

export interface ProfileUpdateRequest {
  name: string;
  profileScope: 'PUBLIC' | 'PRIVATE';
  email?: string;
  companyName?: string;
  companySize?: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE';
  companyDescription?: string;
  representative?: string;
  businessNo?: string;
  companyPhone?: string;
  companyEmail?: string;
  contact?: string;
  experience?: string;
  introduction?: string;
  skills?: string[];
  interests?: string[];
  // Freelancer specific fields
  techStack?: string[];
  career?: string;
  portfolio?: string;
  preferredWorkType?: 'FULL_TIME' | 'PART_TIME' | 'FREELANCE' | 'REMOTE';
  desiredSalary?: string;
}