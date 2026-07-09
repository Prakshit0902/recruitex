import React, { ReactNode } from "react";

export interface JobOptions {
  title: string;
  responsibilities: string;
  why: string;
}

export interface SkillsToLearn {
  title: string;
  why: string;
  how: string;
}

export interface SkillCategory {
  category: string;
  skills: SkillsToLearn[];
}

export interface LearningApproach {
  title: string;
  points: string[];
}

export interface CareerGuideResponse {
  summary: string;
  jobOptions: JobOptions[];
  skillsToLearn: SkillCategory[];
  learningApproach: LearningApproach;
}

export interface ScoreBreakdown {
  formatting: { score: number; feedback: string };
  keywords: { score: number; feedback: string };
  structure: { score: number; feedback: string };
  readability: { score: number; feedback: string };
}

export interface Suggestion {
  category: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}

export interface ResumeAnalysisResponse {
  atsScore: number;
  scoreBreakdown: ScoreBreakdown;
  suggestions: Suggestion[];
  strengths: string[];
  summary: string;
}

// ── User (matches backend camelCase) ─────────────────────────────────────────
export interface User {
  userId: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: "jobseeker" | "recruiter";
  bio: string | null;
  resume: string | null;
  resumePublicId: string | null;
  profilePic: string | null;
  profilePicPublicId: string | null;
  skills: string[];
  subscription: string | null;
}

export interface AppContextType {
  user: User | null;
  loading: boolean;
  btnLoading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser: () => Promise<void>;
  updateProfilePic: (formData: any) => Promise<void>;
  updateResume: (formData: any) => Promise<void>;
  updateUser: (name: string, phoneNumber: string, bio: string) => Promise<void>;
  addSkill: (
    skill: string,
    setSkill: React.Dispatch<React.SetStateAction<string>>
  ) => Promise<void>;
  removeSkill: (skill: string) => Promise<void>;
  applyJob: (jobId: number) => Promise<void>;
  applications: Application[];
  fetchApplications: () => Promise<void>;
}

export interface AppProviderProps {
  children: ReactNode;
}

export interface AccontProps {
  user: User;
  isYourAccount: boolean;
}

// ── Job (matches backend camelCase) ──────────────────────────────────────────
export interface Job {
  jobId: number;
  title: string;
  description: string;
  salary: number | null;
  location: string | null;
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship";
  openings: number;
  role: string;
  workLocation: "On-site" | "Remote" | "Hybrid";
  companyId: number;
  companyName: string;
  companyLogo: string;
  postedByRecruiterId: number;
  createdAt: string;
  isActive: boolean;
}

// ── Company (matches backend camelCase) ───────────────────────────────────────
export interface Company {
  companyId: string;
  name: string;
  description: string;
  website: string;
  logo: string;
  logoPublicId: string;
  recruiterId: number;
  createdAt: string;
  jobs?: Job[];
}

type ApplicationStatus =
  | "Submitted"
  | "Screening"
  | "Interview"
  | "Assignment"
  | "Final Review"
  | "Offer"
  | "Hired"
  | "Rejected";

// ── Application (matches backend camelCase) ───────────────────────────────────
export interface Application {
  applicationId: number;
  jobId: number;
  applicantId: number;
  applicantEmail: string;
  status: ApplicationStatus;
  resume: string;
  appliedAt: string;
  subscribed: boolean;
  jobTitle: string;
  jobSalary: number;
  jobLocation: string;
  overallScore?: number;
  skillMatchScore?: number;
  assignmentScore?: number;
  interviewScore?: number;
  meetLink?: string;
  scheduledAt?: string;
}

// ── Chat Types ──────────────────────────────────────────────────────────────

export interface Conversation {
  conversationId: number;
  applicationId: number;
  jobId: number;
  applicantId: number;
  recruiterId: number;
  lastMessageAt: string;
  createdAt: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  applicantName: string;
  applicantPic: string | null;
  recruiterName: string;
  recruiterPic: string | null;
  unreadCount: number;
  lastMessage: string | null;
}

export interface Message {
  messageId: number;
  conversationId: number;
  senderId: number;
  content: string;
  messageType: "text" | "file" | "image";
  isRead: boolean;
  createdAt: string;
  senderName: string;
  senderPic: string | null;
  _isOptimistic?: boolean;
}

// ── Resume Intelligence (RAG) Types ──────────────────────────────────────────

export interface ResumeQueryResponse {
  answer: string;
  sources: ResumeSourceChunk[];
  confidence: number;
}

export interface ResumeSourceChunk {
  chunkText: string;
  sectionType: string;
  relevanceScore: number;
}

export interface ResumeStructured {
  skills: string[];
  experienceSummary: string;
  projects: string[];
  education: string;
}

export interface ResumeIndexStatus {
  indexed: boolean;
  chunksCount: number;
  processedAt: string | null;
  structured: ResumeStructured | null;
}
