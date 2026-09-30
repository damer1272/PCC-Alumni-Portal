export type Alumni = {
  id: number;
  name: string;
  studentId: string;
  email: string;
  course: string;
  year: number;
  status: string;
  company: string;
  position: string;
  location: string;
  avatar: string;
  coverPhoto?: string;
  saying?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
};

export type Announcement = {
  id: number;
  title: string;
  content: string;
  date: string;
  createdBy: string;
  category: string;
};

export type EmploymentRecord = {
  id: number;
  status: string;
  company: string;
  position: string;
  location: string;
  date: string;
  salary: string;
  showSalaryPublicly?: boolean;
};

// Clean default data lists (mock records removed for a fresh start)
export const ALUMNI_LIST: Alumni[] = [];

export const ANNOUNCEMENTS: Announcement[] = [];

export const EMPLOYMENT_HISTORY: EmploymentRecord[] = [];

export const COURSES = [
  "Bachelor of Science in Information Technology (BSIT)",
  "Bachelor of Science in Business Administration (BSBA)",
  "Bachelor of Science in Accountancy (BSA)",
  "Bachelor of Science in Criminology (BSCrim)",
  "Bachelor of Secondary Education (BSEd)",
];

export const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

export const STATUSES = [
  "Employed (Full-Time)",
  "Employed (Part-Time)",
  "Self-Employed / Entrepreneur",
  "Seeking Opportunities",
  "Continuing Studies",
];
