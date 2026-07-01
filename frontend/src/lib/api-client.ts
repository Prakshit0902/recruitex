const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API || "http://localhost:5000/api/auth"
const USER_API = process.env.NEXT_PUBLIC_USER_API || "http://localhost:5002/api/user"
const JOB_API = process.env.NEXT_PUBLIC_JOB_API || "http://localhost:5003/api/job"
const UTILS_API = process.env.NEXT_PUBLIC_UTILS_API || "http://localhost:5001/api/utils"
const AI_API = process.env.NEXT_PUBLIC_AI_API || "http://localhost:5004/api/ai"

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${baseUrl}${endpoint}`

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("rx-token") : null
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(url, { ...options, headers })
  const json = await res.json()

  if (!res.ok) {
    throw new ApiError(json.message || "Something went wrong", res.status)
  }

  return json as T
}

// ---------- Shared types ----------

export interface User {
  userId: number
  name: string
  email: string
  phoneNumber: string
  role: "jobseeker" | "recruiter"
  bio: string
  resume: string | null
  profilePic: string | null
  subscription: string | null
  skills: string[]
}

export interface Company {
  companyId: number
  name: string
  description: string
  website: string
  logo: string | null
  logoPublicId: string | null
  recruiterId: number
  createdAt?: string
}

export interface Job {
  jobId: number
  title: string
  description: string
  salary: string
  location: string
  jobType: "full_time" | "part_time" | "internship" | "contract"
  openings: number
  role: string
  workLocation: "remote" | "on_site" | "hybrid"
  companyId: number
  postedByRecruiter: number
  isActive: boolean
  company?: { companyId: number; name: string; logo?: string | null; description?: string; website?: string } | null
  createdAt?: string
}

export interface Application {
  applicationId: number
  jobId: number
  applicantId: number
  applicantEmail: string
  status: "submitted" | "rejected" | "hired"
  resume: string | null
  subscribed: boolean
  createdAt?: string
  job?: { jobId: number; title: string; location?: string; jobType?: string; company?: { name: string } } | null
  applicant?: { name: string; bio?: string; profilePic?: string } | null
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  phoneNumber: string
  role: "jobseeker" | "recruiter"
  bio: string
  resume?: File | null
}

interface AuthResponse {
  message: string
  user: User
  token: string
}

// ---------- Auth API ----------

export const authApi = {
  login: (input: LoginInput) =>
    request<AuthResponse>(AUTH_API, "/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  register: (input: RegisterInput) => {
    const formData = new FormData()
    formData.append("name", input.name)
    formData.append("email", input.email)
    formData.append("password", input.password)
    formData.append("phoneNumber", input.phoneNumber)
    formData.append("role", input.role)
    formData.append("bio", input.bio)
    if (input.resume) formData.append("file", input.resume)
    return request<AuthResponse>(AUTH_API, "/register", {
      method: "POST",
      body: formData,
    })
  },

  forgotPassword: (email: string) =>
    request<{ message: string }>(AUTH_API, "/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<{ message: string }>(AUTH_API, `/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
}

// ---------- User API ----------

interface UserResponse {
  message: string
  user: User
}

export const userApi = {
  getMe: () =>
    request<UserResponse>(USER_API, "/me", { method: "GET" }).then((r) => r.user),

  getProfile: (userId: number) =>
    request<UserResponse>(USER_API, `/profile/${userId}`, { method: "GET" }).then((r) => r.user),

  updateProfile: (data: Partial<Pick<User, "name" | "email" | "phoneNumber" | "bio">>) =>
    request<UserResponse>(USER_API, "/update/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }).then((r) => r.user),

  updateProfilePic: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return request<UserResponse>(USER_API, "/update/pic", {
      method: "PUT",
      body: formData,
    }).then((r) => r.user)
  },

  updateResume: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return request<UserResponse>(USER_API, "/update/resume", {
      method: "PUT",
      body: formData,
    }).then((r) => r.user)
  },

  addSkill: (skillName: string) =>
    request<{ message: string }>(USER_API, "/skill/add", {
      method: "POST",
      body: JSON.stringify({ skillName }),
    }),

  deleteSkill: (skillName: string) =>
    request<{ message: string }>(USER_API, "/skill/delete", {
      method: "DELETE",
      body: JSON.stringify({ skillName }),
    }),
}

// ---------- Job API ----------

interface JobListResponse {
  message: string
  jobs: Job[]
}

interface JobResponse {
  message: string
  job: Job
}

interface CompanyListResponse {
  message: string
  companies: Company[]
}

interface CompanyResponse {
  message: string
  company: Company
}

interface ApplicationResponse {
  message: string
  application: Application
}

interface ApplicationListResponse {
  message: string
  applications: Application[]
}

export const jobApi = {
  list: () =>
    request<JobListResponse>(JOB_API, "/jobs", { method: "GET" }).then((r) => r.jobs),

  getById: (id: number) =>
    request<JobResponse>(JOB_API, `/jobs/${id}`, { method: "GET" }).then((r) => r.job),

  create: (data: {
    title: string
    description: string
    companyId: number
    location: string
    jobType: "full_time" | "part_time" | "internship" | "contract"
    role: string
    salary: string
    openings: number
    workLocation: "remote" | "on_site" | "hybrid"
  }) =>
    request<JobResponse>(JOB_API, "/job/new", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.job),

  listCompanies: () =>
    request<CompanyListResponse>(JOB_API, "/companies", { method: "GET" }).then((r) => r.companies),

  getCompany: (id: number) =>
    request<CompanyResponse>(JOB_API, `/company/${id}`, { method: "GET" }).then((r) => r.company),

  createCompany: (data: FormData) =>
    request<CompanyResponse>(JOB_API, "/company/new", {
      method: "POST",
      body: data,
    }).then((r) => r.company),

  deleteCompany: (companyId: number) =>
    request<{ message: string }>(JOB_API, `/company/${companyId}`, {
      method: "DELETE",
    }),

  apply: (data: FormData) =>
    request<ApplicationResponse>(JOB_API, "/apply", {
      method: "POST",
      body: data,
    }).then((r) => r.application),

  listApplications: () =>
    request<ApplicationListResponse>(JOB_API, "/applications", { method: "GET" }).then((r) => r.applications),

  getApplicationsByJob: (jobId: number) =>
    request<ApplicationListResponse>(JOB_API, `/applications/${jobId}`, { method: "GET" }).then((r) => r.applications),
}

// ---------- Utils API ----------

export const utilsApi = {
  upload: (file: File, oldPublicId?: string) => {
    const formData = new FormData()
    formData.append("file", file)
    if (oldPublicId) formData.append("public_id", oldPublicId)
    return request<{ url: string; public_id: string }>(UTILS_API, "/upload", {
      method: "POST",
      body: formData,
    })
  },
}

// ---------- AI API ----------

export interface MatchResponse {
  matchScore: number
  coverLetter: string
  explanation: string
}

export const aiApi = {
  matchJob: (jobId: number) =>
    request<MatchResponse>(AI_API, "/match", {
      method: "POST",
      body: JSON.stringify({ jobId }),
    }),
}
