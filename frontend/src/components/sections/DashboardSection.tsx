"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { useRouter } from "next/navigation"
import { jobApi, userApi, utilsApi, type Job, type Application, type User, type Company } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { fadeUp, scaleIn, staggerContainer, cardHover } from "@/hooks/useScrollReveal"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Briefcase,
  Building2,
  FileText,
  Users,
  BarChart3,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  Search,
  User as UserIcon,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Target,
  Award,
  History,
  Mail,
  Download,
  ChevronDown,
  ChevronUp,
  Info,
  Trophy,
  Filter,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  BookmarkCheck,
  Settings,
  Upload,
  Trash2,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

// Premium circular progress gauge component
function CircularProgress({
  percentage,
  color = "stroke-primary",
  size = 80,
  strokeWidth = 8,
  label = ""
}: {
  percentage: number
  color?: string
  size?: number
  strokeWidth?: number
  label?: string
}) {
  const safePercentage = isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (circumference * safePercentage) / 100

  return (
    <div className="flex flex-col items-center justify-center relative select-none" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="stroke-muted/15 dark:stroke-muted/10"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Foreground circle */}
        <motion.circle
          className={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-sm font-extrabold text-foreground tracking-tight">{safePercentage}%</span>
        {label && <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">{label}</span>}
      </div>
    </div>
  )
}

export default function DashboardSection() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<User | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [postedJobs, setPostedJobs] = useState<Job[]>([])
  const [allJobs, setAllJobs] = useState<Job[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [errorLoading, setErrorLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  // Tabs selection state
  const [activeTab, setActiveTab] = useState<"overview" | "companies" | "sandbox">("overview")

  // Job Seeker interactive states
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null)
  const [expandedAppId, setExpandedAppId] = useState<number | null>(null)
  const [expandedMatchJobId, setExpandedMatchJobId] = useState<number | null>(null)
  const [minMatchScore, setMinMatchScore] = useState<number>(0)

  // Recruiter interactive states
  const [jobStatusFilter, setJobStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [selectedJobIdFilter, setSelectedJobIdFilter] = useState<number | "all">("all")
  const [applicantSearch, setApplicantSearch] = useState("")

  // Register Company States
  const [registerCompanyOpen, setRegisterCompanyOpen] = useState(false)
  const [companyForm, setCompanyForm] = useState({
    name: "",
    website: "",
    description: "",
  })
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [registeringCompany, setRegisteringCompany] = useState(false)

  // Post Job States
  const [postJobOpen, setPostJobOpen] = useState(false)
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    companyId: "",
    location: "",
    jobType: "full_time",
    role: "",
    salary: "",
    openings: "1",
    workLocation: "on_site",
  })
  const [postingJob, setPostingJob] = useState(false)

  // Sandbox States
  const [sandboxResult, setSandboxResult] = useState<{
    fileName: string
    url: string
    publicId: string
  } | null>(null)
  const [uploadingSandbox, setUploadingSandbox] = useState(false)

  const myCompanies = companies.filter((c) => c.recruiterId === user?.userId)

  const loadData = () => {
    setPageLoading(true)
    setErrorLoading(false)
    const isRecruiter = user?.role === "recruiter"

    Promise.all([
      userApi.getMe().catch((err) => {
        console.error("userApi.getMe failed:", err)
        throw err
      }),
      jobApi.list().catch((err) => {
        console.error("jobApi.list failed:", err)
        return [] as Job[]
      }),
      jobApi.listCompanies().catch((err) => {
        console.error("jobApi.listCompanies failed:", err)
        return [] as Company[]
      })
    ]).then(([me, jobs, fetchedCompanies]) => {
      setProfile(me)
      const jobsArr = Array.isArray(jobs) ? jobs : []
      setAllJobs(jobsArr)
      setCompanies(Array.isArray(fetchedCompanies) ? fetchedCompanies : [])

      if (isRecruiter) {
        const myJobs = jobsArr.filter((j) => j.postedByRecruiter === user.userId)
        setPostedJobs(myJobs)

        if (myJobs.length > 0) {
          Promise.all(
            myJobs.map((job) =>
              jobApi.getApplicationsByJob(job.jobId)
                .then((apps) => (Array.isArray(apps) ? apps : []).map((app) => ({
                  ...app,
                  job: {
                    jobId: job.jobId,
                    title: job.title,
                    location: job.location,
                    jobType: job.jobType,
                    company: job.company ? { name: job.company.name } : undefined
                  }
                })))
                .catch(() => [])
            )
          ).then((results) => {
            const allApps = results.flat().sort((a, b) => {
              const dateA = new Date(a.createdAt || 0).getTime()
              const dateB = new Date(b.createdAt || 0).getTime()
              return dateB - dateA
            })
            setApplications(allApps)
          }).catch((err) => {
            console.error("Failed to load recruiter applications", err)
          })
        } else {
          setApplications([])
        }
      } else {
        jobApi.listApplications()
          .then((apps) => setApplications(Array.isArray(apps) ? apps : []))
          .catch(() => setApplications([]))
      }
    }).catch((err) => {
      console.error("Failed to load dashboard data", err)
      setErrorLoading(true)
    }).finally(() => setPageLoading(false))
  }

  const refreshCompanies = async () => {
    try {
      const data = await jobApi.listCompanies()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyForm.name) return
    setRegisteringCompany(true)
    try {
      const formData = new FormData()
      formData.append("name", companyForm.name)
      formData.append("website", companyForm.website)
      formData.append("description", companyForm.description)
      if (companyLogo) {
        formData.append("file", companyLogo)
      }
      await jobApi.createCompany(formData)
      setCompanyForm({ name: "", website: "", description: "" })
      setCompanyLogo(null)
      setRegisterCompanyOpen(false)
      await refreshCompanies()
    } catch (err) {
      console.error(err)
    } finally {
      setRegisteringCompany(false)
    }
  }

  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm("Are you sure you want to delete this company?")) return
    try {
      await jobApi.deleteCompany(companyId)
      await refreshCompanies()
    } catch (err) {
      console.error(err)
    }
  }

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobForm.title || !jobForm.companyId) return
    setPostingJob(true)
    try {
      await jobApi.create({
        title: jobForm.title,
        description: jobForm.description,
        companyId: Number(jobForm.companyId),
        location: jobForm.location,
        jobType: jobForm.jobType as "full_time" | "part_time" | "internship" | "contract",
        role: jobForm.role,
        salary: jobForm.salary,
        openings: Number(jobForm.openings),
        workLocation: jobForm.workLocation as "remote" | "on_site" | "hybrid",
      })
      setJobForm({
        title: "",
        description: "",
        companyId: myCompanies[0]?.companyId ? String(myCompanies[0].companyId) : "",
        location: "",
        jobType: "full_time",
        role: "",
        salary: "",
        openings: "1",
        workLocation: "on_site",
      })
      setPostJobOpen(false)
      // refresh posted jobs list
      const jobs = await jobApi.list()
      const jobsArr = Array.isArray(jobs) ? jobs : []
      setAllJobs(jobsArr)
      setPostedJobs(jobsArr.filter((j) => j.postedByRecruiter === user?.userId))
    } catch (err) {
      console.error(err)
    } finally {
      setPostingJob(false)
    }
  }

  const handleSandboxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingSandbox(true)
    setSandboxResult(null)
    try {
      const res = await utilsApi.upload(file)
      setSandboxResult({
        fileName: file.name,
        url: res.url,
        publicId: res.public_id,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingSandbox(false)
    }
  }

  useEffect(() => {
    const recCompanies = companies.filter((c) => c.recruiterId === user?.userId)
    if (recCompanies.length > 0 && !jobForm.companyId) {
      const timer = setTimeout(() => {
        setJobForm((prev) => ({ ...prev, companyId: String(recCompanies[0].companyId) }))
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [companies, user, jobForm.companyId])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/")
      return
    }
    const timer = setTimeout(() => {
      loadData()
    }, 0)
    return () => clearTimeout(timer)
  }, [user, authLoading, router])

  if (authLoading || pageLoading) {
    return (
      <section className="relative overflow-hidden py-20 lg:py-28 min-h-screen bg-background flex flex-col justify-center items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_4%,transparent),transparent_70%)]" />
        <div className="relative flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-muted-foreground animate-pulse font-medium text-sm tracking-wide">Syncing with workspace nodes...</p>
        </div>
      </section>
    )
  }

  if (errorLoading || !user || !profile) {
    return (
      <section className="relative overflow-hidden py-20 lg:py-28 min-h-screen flex items-center justify-center bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mx-auto max-w-md px-6 text-center space-y-6"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Secure Profile Connection Lost</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We encountered a network error retrieving your profile data from the secure gateway. Please refresh the page to try again.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Button onClick={loadData} className="rounded-2xl gap-2 font-medium bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20 transition-all">
              <RefreshCw size={15} />
              Retry Connection
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="rounded-2xl font-medium">
              Return Home
            </Button>
          </div>
        </motion.div>
      </section>
    )
  }

  const isRecruiter = user.role === "recruiter"

  // Helper matching logic for job seekers
  const getSkillsMatch = (job: Job, userSkills: string[]) => {
    const skills = Array.isArray(userSkills) ? userSkills : []
    if (skills.length === 0) {
      return { percentage: 0, matched: [] as string[], missing: [] as string[] }
    }
    const jobTitle = (job.title || "").toLowerCase()
    const jobDesc = (job.description || "").toLowerCase()
    const jobRole = (job.role || "").toLowerCase()

    const matched = skills.filter((skill) => {
      const s = skill.toLowerCase()
      return jobTitle.includes(s) || jobDesc.includes(s) || jobRole.includes(s)
    })

    const missing = skills.filter((skill) => !matched.includes(skill))
    const percentage = Math.round((matched.length / skills.length) * 100)

    return { percentage, matched, missing }
  }

  // Calculate matching jobs
  const jobMatches = allJobs
    .map((job) => {
      const matchInfo = getSkillsMatch(job, profile.skills || [])
      return { ...job, matchInfo }
    })
    .filter((item) => item.isActive)
    .sort((a, b) => b.matchInfo.percentage - a.matchInfo.percentage)

  // Filter matches based on user's threshold
  const filteredMatches = jobMatches.filter((item) => item.matchInfo.percentage >= minMatchScore)

  // Status counters for Job Seeker applications
  const totalApps = applications.length
  const hiredApps = applications.filter((a) => a.status === "hired").length
  const rejectedApps = applications.filter((a) => a.status === "rejected").length
  const pendingApps = applications.filter((a) => a.status === "submitted").length
  const successRate = totalApps > 0 ? Math.round((hiredApps / totalApps) * 100) : 0

  // Status counters for Recruiter analytics
  const recTotalApplicants = applications.length
  const recHiredApplicants = applications.filter((a) => a.status === "hired").length
  const recRejectedApplicants = applications.filter((a) => a.status === "rejected").length
  const recPendingApplicants = applications.filter((a) => a.status === "submitted").length
  const recAverageApplicants = postedJobs.length > 0 ? Number((recTotalApplicants / postedJobs.length).toFixed(1)) : 0
  const recHiringRate = recTotalApplicants > 0 ? Math.round((recHiredApplicants / recTotalApplicants) * 100) : 0

  // Recruiter: Find job with maximum applicants
  const getMostPopularJob = (): { job: Job; count: number } | null => {
    if (postedJobs.length === 0) return null
    let maxAppCount = -1
    let popularJob: Job | null = null
    postedJobs.forEach((job) => {
      const count = applications.filter((app) => app.jobId === job.jobId).length
      if (count > maxAppCount) {
        maxAppCount = count
        popularJob = job
      }
    })
    return popularJob ? { job: popularJob, count: maxAppCount } : null
  }
  const popularJobInfo = getMostPopularJob()

  // Recruiter: Filter posted jobs list
  const filteredPostedJobs = postedJobs.filter((job) => {
    if (jobStatusFilter === "active") return job.isActive
    if (jobStatusFilter === "inactive") return !job.isActive
    return true
  })

  // Recruiter: Filter applicants feed
  const filteredApplicants = applications.filter((app) => {
    // Job ID Filter
    if (selectedJobIdFilter !== "all" && app.jobId !== selectedJobIdFilter) {
      return false
    }
    // Search input query
    if (applicantSearch.trim() !== "") {
      const query = applicantSearch.toLowerCase()
      const emailMatch = (app.applicantEmail || "").toLowerCase().includes(query)
      const nameMatch = app.applicant?.name ? app.applicant.name.toLowerCase().includes(query) : false
      const jobTitleMatch = app.job?.title ? app.job.title.toLowerCase().includes(query) : false
      return emailMatch || nameMatch || jobTitleMatch
    }
    return true
  })

  // General dashboard statistics cards
  const stats = isRecruiter
    ? [
        { icon: Briefcase, label: "Active Postings", value: postedJobs.filter((j) => j.isActive).length, color: "text-blue-500", bg: "bg-blue-500/10" },
        { icon: Building2, label: "Total Posted Jobs", value: postedJobs.length, color: "text-violet-500", bg: "bg-violet-500/10" },
        { icon: Users, label: "Total Candidates", value: recTotalApplicants, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { icon: BarChart3, label: "Hiring Success Rate", value: `${recHiringRate}%`, color: "text-amber-500", bg: "bg-amber-500/10" },
      ]
    : [
        { icon: FileText, label: "Total Applications", value: totalApps, color: "text-blue-500", bg: "bg-blue-500/10" },
        { icon: Clock, label: "Pending Process", value: pendingApps, color: "text-amber-500", bg: "bg-amber-500/10" },
        { icon: CheckCircle, label: "Hired Status", value: hiredApps, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { icon: XCircle, label: "Unsuccessful", value: rejectedApps, color: "text-rose-500", bg: "bg-rose-500/10" },
      ]

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-16 lg:py-24 min-h-screen bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--primary)_8%,transparent),transparent_50%),radial-gradient(ellipse_at_bottom_left,color-mix(in_oklch,var(--accent)_6%,transparent),transparent_60%)] bg-background text-foreground"
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none select-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none select-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Premium Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 p-6 md:p-8 rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-indigo-500 p-0.5 shadow-lg shadow-primary/20">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                {profile.profilePic ? (
                  <img src={profile.profilePic} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                    {profile.name.split(" ")[0].substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{profile.name.split(" ")[0]}</span>
                </h1>
                <Badge variant="accent" className="font-semibold px-2.5 py-0.5 rounded-full select-none capitalize">
                  {profile.role}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                {isRecruiter 
                  ? "Recruiter Operations Center: Manage jobs, verify resumes, and build your high-performance teams." 
                  : "Career Pipeline: Track applications, compare match scores, and find your next breakthrough role."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 sm:self-end md:self-center">
            {isRecruiter ? (
              <>
                <Button
                  onClick={() => setPostJobOpen(true)}
                  className="gap-2 rounded-2xl font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  Post New Job
                </Button>
                <Link href="/profile">
                  <Button variant="outline" className="rounded-2xl gap-2 font-semibold">
                    <Settings size={16} />
                    Configure Board
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/jobs">
                  <Button className="gap-2 rounded-2xl font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] transition-all cursor-pointer">
                    <Search size={16} />
                    Explore Jobs
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="rounded-2xl gap-2 font-semibold">
                    <UserIcon size={16} />
                    Edit Profile
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Overview Stats Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={scaleIn}
              custom={i}
              className="rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.02] dark:bg-black/10 backdrop-blur-xl p-5 lg:p-6 shadow-xl shadow-black/5 hover:-translate-y-1 hover:border-primary/25 hover:shadow-primary/5 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 shadow-md`}>
                <stat.icon size={20} />
              </div>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Selection */}
        <div className="flex gap-3 border-b border-white/[0.08] pb-4 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all select-none ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            }`}
          >
            Overview
          </button>
          {isRecruiter && (
            <button
              onClick={() => setActiveTab("companies")}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all select-none ${
                activeTab === "companies"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
              }`}
            >
              Manage Companies
            </button>
          )}
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all select-none ${
              activeTab === "sandbox"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            }`}
          >
            File Sandbox
          </button>
        </div>

        {activeTab === "overview" && (
          <>
            {/* -------------------- JOB SEEKER VIEW -------------------- */}
            {!isRecruiter && (
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 items-start">
            
            {/* Widget 1: Application Pipeline Progress */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 backdrop-blur-xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" />
                  Application Pipeline
                </h2>
                {selectedStatusFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStatusFilter(null)}
                    className="text-xs h-7 px-2 text-primary hover:text-primary/80 rounded-full"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>

              {totalApps === 0 ? (
                <div className="text-center py-10">
                  <Info className="mx-auto text-muted-foreground/30 mb-3" size={32} />
                  <p className="text-xs text-muted-foreground font-medium">No application metrics compiled yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Radial Success Circle */}
                  <div className="flex justify-center py-4 bg-white/[0.01] dark:bg-black/5 rounded-2xl border border-white/[0.03]">
                    <div className="flex items-center gap-6">
                      <CircularProgress percentage={successRate} color="stroke-emerald-500" size={90} label="Success" />
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Conversion Metric</p>
                        <p className="text-sm font-semibold text-foreground">Hiring Conversion Rate</p>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-[150px]">
                          Percentage of applications resulting in a hired contract.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pipeline Funnel Bars */}
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Interactive Pipeline States</p>
                    {[
                      {
                        label: "Pending / Submitted",
                        status: "submitted",
                        count: pendingApps,
                        pct: Math.round((pendingApps / totalApps) * 100),
                        color: "bg-amber-500",
                        border: "border-amber-500/20",
                        text: "text-amber-500"
                      },
                      {
                        label: "Hired Status",
                        status: "hired",
                        count: hiredApps,
                        pct: Math.round((hiredApps / totalApps) * 100),
                        color: "bg-emerald-500",
                        border: "border-emerald-500/20",
                        text: "text-emerald-500"
                      },
                      {
                        label: "Unsuccessful",
                        status: "rejected",
                        count: rejectedApps,
                        pct: Math.round((rejectedApps / totalApps) * 100),
                        color: "bg-rose-500",
                        border: "border-rose-500/20",
                        text: "text-rose-500"
                      }
                    ].map((row) => {
                      const isActive = selectedStatusFilter === row.status
                      return (
                        <div
                          key={row.status}
                          onClick={() => setSelectedStatusFilter(isActive ? null : row.status)}
                          className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer select-none ${
                            isActive
                              ? "bg-primary/10 border-primary shadow-lg shadow-primary/5 scale-[1.01]"
                              : "bg-white/[0.01] dark:bg-black/5 border-white/[0.05] dark:border-white/[0.02] hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                            <span className="text-foreground">{row.label}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={row.text}>{row.count} apps</span>
                              <span className="text-muted-foreground">({row.pct}%)</span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${row.pct}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full ${row.color} rounded-full`}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    💡 Click any pipeline step above to filter the chronological history timeline.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Widget 2: Smart Matches / Skill Matcher */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 backdrop-blur-xl p-6 shadow-2xl relative lg:col-span-1"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Target size={18} className="text-primary" />
                  Smart Skill Matcher
                </h2>
                <Badge variant="success" className="px-2 py-0.5 rounded-full font-bold select-none text-[10px]">
                  Real-time
                </Badge>
              </div>

              {/* Skills breakdown header */}
              <div className="mb-6 p-4 bg-white/[0.01] dark:bg-black/5 border border-white/[0.05] dark:border-white/[0.02] rounded-2xl">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">My Profile Skills</p>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-[10px] py-0 px-2 rounded-lg bg-secondary/40">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">You haven&apos;t listed any skills in your profile details.</p>
                    <Link href="/profile">
                      <Button size="sm" className="w-full text-xs gap-1.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 font-semibold cursor-pointer">
                        <Sparkles size={13} />
                        Update Profile Skills
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Match filter slider */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <span>Match Threshold Filter</span>
                    <span className="text-primary font-extrabold">{minMatchScore}% or higher</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted/40 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Matches List */}
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Top Job Matches</p>
                {profile.skills && profile.skills.length > 0 ? (
                  filteredMatches.length === 0 ? (
                    <div className="text-center py-8 bg-white/[0.01] dark:bg-black/5 border border-white/[0.03] rounded-2xl p-4">
                      <Info className="mx-auto text-muted-foreground/30 mb-2" size={24} />
                      <p className="text-xs text-muted-foreground">No active jobs found matching {minMatchScore}%+ of your profile skills.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {filteredMatches.slice(0, 5).map((match) => {
                        const isExpanded = expandedMatchJobId === match.jobId
                        return (
                          <div
                            key={match.jobId}
                            className="p-3.5 rounded-2xl border border-white/[0.04] dark:border-white/[0.02] bg-white/[0.01] dark:bg-black/10 hover:border-primary/25 transition-all duration-300 group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                  {match.title}
                                </h3>
                                <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">
                                  {match.company?.name || "Premium Employer"} · {match.location}
                                </p>
                              </div>
                              <CircularProgress
                                percentage={match.matchInfo.percentage}
                                color={
                                  match.matchInfo.percentage >= 70
                                    ? "stroke-emerald-500"
                                    : match.matchInfo.percentage >= 40
                                    ? "stroke-amber-500"
                                    : "stroke-primary"
                                }
                                size={44}
                                strokeWidth={4}
                              />
                            </div>

                            {/* Click to expand match info */}
                            <div className="mt-2.5 flex items-center justify-between">
                              <button
                                onClick={() => setExpandedMatchJobId(isExpanded ? null : match.jobId)}
                                className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer select-none"
                              >
                                {isExpanded ? (
                                  <>
                                    Hide Skill Details <ChevronUp size={12} />
                                  </>
                                ) : (
                                  <>
                                    Show Skill Match <ChevronDown size={12} />
                                  </>
                                )}
                              </button>
                              <Link href={`/jobs/${match.jobId}`}>
                                <Button size="sm" className="h-6 text-[10px] px-2.5 rounded-lg gap-1 font-bold cursor-pointer bg-primary/10 hover:bg-primary/25 text-primary">
                                  Apply Now <ArrowRight size={10} />
                                </Button>
                              </Link>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 pt-3 border-t border-white/[0.04] space-y-2 overflow-hidden text-xs"
                                >
                                  <div>
                                    <p className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wide mb-1">Matched Skills</p>
                                    {match.matchInfo.matched.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {match.matchInfo.matched.map((s) => (
                                          <Badge key={s} variant="success" className="text-[9px] py-0 px-1.5 rounded-md">
                                            {s}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[10px] text-muted-foreground italic">None</p>
                                    )}
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wide mb-1">Missing / Unmatched Skills</p>
                                    {match.matchInfo.missing.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {match.matchInfo.missing.map((s) => (
                                          <Badge key={s} variant="secondary" className="text-[9px] py-0 px-1.5 rounded-md bg-muted/40">
                                            {s}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[10px] text-muted-foreground italic">All matched!</p>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  )
                ) : (
                  // General job postings list when user doesn't have any skills configured
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {allJobs.slice(0, 4).map((job) => (
                      <div
                        key={job.jobId}
                        className="p-3.5 rounded-2xl border border-white/[0.04] dark:border-white/[0.02] bg-white/[0.01] dark:bg-black/10 hover:border-primary/25 transition-all duration-300 group"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">
                              {job.company?.name || "Premium Employer"} · {job.location}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-[9px] py-0 px-1.5 rounded bg-background/50 capitalize">
                                {job.jobType.replace("_", " ")}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-semibold">{job.salary}</span>
                            </div>
                          </div>
                          <Link href={`/jobs/${job.jobId}`}>
                            <Button size="sm" className="h-7 text-[10px] px-2.5 rounded-lg font-bold bg-primary/10 hover:bg-primary/25 text-primary cursor-pointer">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Widget 3: Vertical Application History Timeline */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 backdrop-blur-xl p-6 shadow-2xl relative lg:col-span-1"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <History size={18} className="text-primary" />
                  Chronological Pipeline History
                </h2>
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full select-none font-bold">
                  {applications.length} Records
                </Badge>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-16 bg-white/[0.01] dark:bg-black/5 border border-white/[0.03] rounded-3xl p-6">
                  <FileText className="mx-auto text-muted-foreground/30 mb-3" size={40} />
                  <p className="text-sm font-medium text-foreground">No applications filed yet.</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Search and apply to jobs listed on our board to begin compiling history data.
                  </p>
                  <Link href="/jobs">
                    <Button variant="outline" size="sm" className="mt-4 rounded-xl font-semibold gap-1.5 cursor-pointer">
                      Browse Active Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="relative pl-1 pr-1">
                  {/* Dotted Vertical Timeline Track Line */}
                  <div className="absolute left-[21px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-muted/30 pointer-events-none" />

                  {/* Scrollable list */}
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1.5 custom-scrollbar relative z-10">
                    {(selectedStatusFilter ? applications.filter((a) => a.status === selectedStatusFilter) : applications).map((app) => {
                      const isExpanded = expandedAppId === app.applicationId
                      const dateString = app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Today"

                      return (
                        <div key={app.applicationId} className="flex gap-4 relative group">
                          
                          {/* Left node point indicator */}
                          <div className="flex flex-col items-center select-none pt-1">
                            <div
                              onClick={() => setExpandedAppId(isExpanded ? null : app.applicationId)}
                              className={`w-10 h-10 rounded-full border bg-background flex items-center justify-center cursor-pointer shadow-md transition-all duration-300 hover:scale-110 z-10 ${
                                app.status === "hired"
                                  ? "border-emerald-500 text-emerald-500 shadow-emerald-500/10"
                                  : app.status === "rejected"
                                  ? "border-rose-500 text-rose-500 shadow-rose-500/10"
                                  : "border-amber-500 text-amber-500 shadow-amber-500/10"
                              }`}
                            >
                              {app.status === "hired" ? (
                                <CheckCircle size={16} />
                              ) : app.status === "rejected" ? (
                                <XCircle size={16} />
                              ) : (
                                <Clock size={16} />
                              )}
                            </div>
                          </div>

                          {/* Right interactive card */}
                          <div
                            onClick={() => setExpandedAppId(isExpanded ? null : app.applicationId)}
                            className="flex-1 p-4 rounded-2xl border border-white/[0.04] dark:border-white/[0.02] bg-white/[0.01] dark:bg-black/10 hover:border-primary/25 transition-all duration-300 shadow-sm cursor-pointer"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                  {app.job?.company?.name || "Premium Employer"}
                                </h3>
                                <h4 className="text-sm font-semibold text-foreground mt-0.5">
                                  {app.job?.title || `Job ID: #${app.jobId}`}
                                </h4>
                                <span className="text-[10px] text-muted-foreground font-medium mt-1 block">
                                  Applied on {dateString}
                                </span>
                              </div>
                              <Badge
                                variant={
                                  app.status === "hired"
                                    ? "success"
                                    : app.status === "rejected"
                                    ? "destructive"
                                    : "warning"
                                }
                                className="text-[9px] font-extrabold capitalize px-2 py-0.5 rounded-full"
                              >
                                {app.status === "submitted" ? "Pending" : app.status}
                              </Badge>
                            </div>

                            {/* Stepper Details dropdown */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t border-white/[0.04] space-y-4 overflow-hidden text-xs"
                                >
                                  {/* Milestones Stepper */}
                                  <div className="space-y-3 pl-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Milestone Progression</p>
                                    
                                    {/* Step 1: Submission */}
                                    <div className="flex items-start gap-2.5">
                                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0">
                                        ✓
                                      </div>
                                      <div>
                                        <p className="font-semibold text-foreground">Application Filed</p>
                                        <p className="text-[10px] text-muted-foreground">Receipt of registration verified at backend nodes.</p>
                                      </div>
                                    </div>

                                    {/* Step 2: Review */}
                                    <div className="flex items-start gap-2.5">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                        app.status !== "submitted"
                                          ? "bg-emerald-500/10 text-emerald-500"
                                          : "bg-amber-500/10 text-amber-500 animate-pulse"
                                      }`}>
                                        {app.status !== "submitted" ? "✓" : "2"}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-foreground">Verification Review</p>
                                        <p className="text-[10px] text-muted-foreground">
                                          {app.status !== "submitted"
                                            ? "Review completed by hiring representative."
                                            : "Application details actively queued for recruiter audit."}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Step 3: Verdict */}
                                    <div className="flex items-start gap-2.5">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                        app.status === "hired"
                                          ? "bg-emerald-500/10 text-emerald-500"
                                          : app.status === "rejected"
                                          ? "bg-rose-500/10 text-rose-500"
                                          : "bg-muted/30 text-muted-foreground"
                                      }`}>
                                        {app.status === "hired" ? "✓" : app.status === "rejected" ? "✗" : "3"}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-foreground">Final Decisive Status</p>
                                        <p className="text-[10px] text-muted-foreground">
                                          {app.status === "hired"
                                            ? "Congratulations! Secure recruitment contract awarded."
                                            : app.status === "rejected"
                                            ? "Employer filled the openings count. Profile saved for future cycles."
                                            : "Pending decisive resolution from company board."}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                                    {app.resume && (
                                      <a
                                        href={app.resume}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-1.5 bg-secondary/60 hover:bg-secondary text-secondary-foreground font-semibold py-1.5 px-3 rounded-xl border border-white/[0.04] transition-all text-[10px]"
                                      >
                                        <Download size={11} />
                                        Download Resume
                                      </a>
                                    )}
                                    <Link href={`/jobs/${app.jobId}`} onClick={(e) => e.stopPropagation()}>
                                      <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-xl font-semibold gap-1">
                                        <Eye size={11} /> View Job Post
                                      </Button>
                                    </Link>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>

          </div>
        )}

        {/* -------------------- RECRUITER VIEW -------------------- */}
        {isRecruiter && (
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 items-start">
            
            {/* Widget 1: Recruiter Analytics & Command Dashboard */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 backdrop-blur-xl p-6 shadow-2xl relative"
            >
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                <BarChart3 size={18} className="text-primary" />
                Hiring Center Analytics
              </h2>

              {postedJobs.length === 0 ? (
                <div className="text-center py-10">
                  <Info className="mx-auto text-muted-foreground/30 mb-3" size={32} />
                  <p className="text-xs text-muted-foreground font-medium">No postings active. Analytics offline.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Radial gauges row */}
                  <div className="grid grid-cols-3 gap-2 py-4 bg-white/[0.01] dark:bg-black/5 rounded-2xl border border-white/[0.03] text-center">
                    <div>
                      <div className="flex justify-center mb-1">
                        <CircularProgress percentage={recHiringRate} color="stroke-emerald-500" size={56} strokeWidth={5} />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mt-1">Hired Rate</p>
                    </div>
                    <div>
                      <div className="flex justify-center mb-1">
                        <CircularProgress
                          percentage={recTotalApplicants > 0 ? Math.round((recPendingApplicants / recTotalApplicants) * 100) : 0}
                          color="stroke-amber-500"
                          size={56}
                          strokeWidth={5}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mt-1">Pending Review</p>
                    </div>
                    <div>
                      <div className="flex justify-center mb-1">
                        <CircularProgress
                          percentage={recTotalApplicants > 0 ? Math.round((recRejectedApplicants / recTotalApplicants) * 100) : 0}
                          color="stroke-rose-500"
                          size={56}
                          strokeWidth={5}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mt-1">Rejected</p>
                    </div>
                  </div>

                  {/* Most Popular Job Highlight Widget */}
                  {popularJobInfo && popularJobInfo.count > 0 && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-500/5 border border-primary/20 shadow-md relative overflow-hidden group">
                      <div className="absolute top-2 right-2 text-primary/20 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                        <Trophy size={48} />
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="text-amber-500 animate-bounce" size={16} />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">High-Demand Posting</span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground truncate">{popularJobInfo.job.title}</h3>
                      <div className="flex justify-between items-center mt-3 text-xs">
                        <span className="text-muted-foreground font-medium">Attracted Applicants:</span>
                        <Badge variant="accent" className="font-bold px-2 py-0.5 rounded-md">
                          {popularJobInfo.count} Candidates
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Active Job Distribution Fill Rates */}
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Job applicant fill rates</p>
                    <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                      {postedJobs.slice(0, 4).map((job) => {
                        const count = applications.filter((app) => app.jobId === job.jobId).length
                        const fillPct = Math.min(100, Math.round((count / Math.max(job.openings, 1)) * 100))
                        return (
                          <div key={job.jobId} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-foreground truncate max-w-[170px]">{job.title}</span>
                              <span className="text-muted-foreground text-[10px] font-bold">
                                {count} / {job.openings} openings ({fillPct}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${fillPct}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full bg-gradient-to-r from-primary to-indigo-500`}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Widget 2: Posted Jobs Board */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 backdrop-blur-xl p-6 shadow-2xl relative lg:col-span-1"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Briefcase size={18} className="text-primary" />
                  Your Postings Grid
                </h2>
                
                {/* Active / Inactive Status Filter Toggle */}
                <div className="flex rounded-xl bg-muted/40 p-0.5 text-xs font-semibold select-none shrink-0 self-start sm:self-center">
                  {[
                    { key: "all", label: "All" },
                    { key: "active", label: "Active" },
                    { key: "inactive", label: "Inactive" }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setJobStatusFilter(tab.key as "all" | "active" | "inactive")}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        jobStatusFilter === tab.key
                          ? "bg-background text-foreground shadow-sm font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {postedJobs.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.01] dark:bg-black/5 border border-white/[0.03] rounded-3xl p-6">
                  <Building2 className="mx-auto text-muted-foreground/30 mb-3" size={40} />
                  <p className="text-sm font-medium text-foreground">No jobs posted yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Deploy your first recruitment node to start receiving applications.
                  </p>
                  <Link href="/jobs">
                    <Button size="sm" className="mt-4 rounded-xl font-semibold gap-1.5 cursor-pointer bg-gradient-to-r from-primary to-indigo-600">
                      <Plus size={14} /> Post Your First Job
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {filteredPostedJobs.map((job) => {
                    const count = applications.filter((a) => a.jobId === job.jobId).length
                    const isSelectedFilter = selectedJobIdFilter === job.jobId

                    return (
                      <div
                        key={job.jobId}
                        className={`p-4 rounded-2xl border transition-all duration-300 relative group ${
                          isSelectedFilter
                            ? "bg-primary/10 border-primary shadow-lg shadow-primary/5 scale-[1.01]"
                            : "bg-white/[0.01] dark:bg-black/10 border-white/[0.04] dark:border-white/[0.02] hover:border-primary/25"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <Badge
                                variant={job.isActive ? "success" : "secondary"}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              >
                                {job.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-semibold">{job.location}</span>
                            </div>
                            <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {job.title}
                            </h3>
                            
                            {/* Stats grids */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2.5 text-[11px] text-muted-foreground font-medium">
                              <span className="flex items-center gap-1">
                                <Briefcase size={12} className="text-muted-foreground/60" /> {job.jobType.replace("_", " ")}
                              </span>
                              <span className="flex items-center gap-1 font-semibold text-foreground">
                                <DollarSign size={12} className="text-muted-foreground/60" /> {job.salary}
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end justify-between self-stretch shrink-0">
                            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs font-bold shadow-sm">
                              <Users size={12} />
                              {count}
                            </div>
                            
                            {/* Interactive view applicants trigger */}
                            <button
                              onClick={() => {
                                setSelectedJobIdFilter(isSelectedFilter ? "all" : job.jobId)
                                document.getElementById("applicant-feed-section")?.scrollIntoView({ behavior: "smooth" })
                              }}
                              className="text-[10px] font-extrabold text-primary hover:underline mt-4 flex items-center gap-0.5 select-none cursor-pointer"
                            >
                              {isSelectedFilter ? "Clear Filter" : "Filter Candidates"} →
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {filteredPostedJobs.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-xs text-muted-foreground">No matching postings with selected state.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Widget 3: Recent Applicant Feed */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              id="applicant-feed-section"
              className="rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 backdrop-blur-xl p-6 shadow-2xl relative lg:col-span-1"
            >
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Users size={18} className="text-primary" />
                    Candidate Feed
                  </h2>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full select-none font-bold">
                    {filteredApplicants.length} Enlisted
                  </Badge>
                </div>

                {/* Filters Row */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-muted-foreground/60 pointer-events-none" size={14} />
                    <input
                      type="text"
                      placeholder="Search by candidate name or email..."
                      value={applicantSearch}
                      onChange={(e) => setApplicantSearch(e.target.value)}
                      className="w-full bg-muted/30 border border-white/[0.05] dark:border-white/[0.02] rounded-xl pl-9 pr-4 py-1.5 text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  {/* Dropdown selectors for job ID filter */}
                  {postedJobs.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Filter size={11} className="text-muted-foreground" />
                      <select
                        value={selectedJobIdFilter}
                        onChange={(e) => setSelectedJobIdFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
                        className="bg-muted/40 text-foreground font-semibold px-2 py-1 rounded-lg border border-white/[0.04] outline-none text-[11px] cursor-pointer"
                      >
                        <option value="all" className="bg-background text-foreground font-semibold">All Jobs</option>
                        {postedJobs.map((job) => (
                          <option key={job.jobId} value={job.jobId} className="bg-background text-foreground font-semibold">
                            {job.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {filteredApplicants.length === 0 ? (
                <div className="text-center py-16 bg-white/[0.01] dark:bg-black/5 border border-white/[0.03] rounded-3xl p-6">
                  <Users className="mx-auto text-muted-foreground/30 mb-3" size={40} />
                  <p className="text-sm font-medium text-foreground">No candidates match criteria</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Adjust filters or modify your candidate search queries.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {filteredApplicants.map((app) => {
                    const dateString = app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Today"
                    const initials = app.applicant?.name
                      ? app.applicant.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
                      : app.applicantEmail.substring(0, 2).toUpperCase()

                    return (
                      <div
                        key={app.applicationId}
                        className="p-3.5 rounded-2xl border border-white/[0.04] dark:border-white/[0.02] bg-white/[0.01] dark:bg-black/10 hover:border-primary/25 hover:bg-white/[0.02] transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          
                          {/* Applicant Avatar */}
                          <Avatar className="size-10 shadow-sm shrink-0 border border-white/[0.08]">
                            {app.applicant?.profilePic && <AvatarImage src={app.applicant.profilePic} alt={app.applicant?.name} />}
                            <AvatarFallback className="bg-gradient-to-tr from-primary/10 to-indigo-500/10 text-primary font-bold text-xs select-none">
                              {initials}
                            </AvatarFallback>
                          </Avatar>

                          {/* Candidate specs */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <h4 className="text-sm font-semibold text-foreground truncate">
                                {app.applicant?.name || "Premium Candidate"}
                              </h4>
                              <Badge
                                variant={
                                  app.status === "hired"
                                    ? "success"
                                    : app.status === "rejected"
                                    ? "destructive"
                                    : "warning"
                                }
                                className="text-[8px] font-extrabold capitalize px-1.5 py-0.2 rounded-full"
                              >
                                {app.status === "submitted" ? "Pending" : app.status}
                              </Badge>
                            </div>

                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                              <Mail size={11} className="shrink-0" />
                              {app.applicantEmail}
                            </p>

                            <p className="text-[11px] font-bold text-primary mt-2 truncate">
                              Applied: {app.job?.title || "Premium Role"}
                            </p>

                            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/[0.03] text-[10px] text-muted-foreground">
                              <span>Filed on {dateString}</span>
                              {app.resume && (
                                <a
                                  href={app.resume}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary font-extrabold py-1 px-2.5 rounded-lg border border-primary/10 transition-all cursor-pointer"
                                >
                                  <Download size={10} />
                                  Resume
                                </a>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>

          </div>
        )}
        </>)}

        {activeTab === "companies" && isRecruiter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 backdrop-blur-xl p-6 md:p-8 shadow-2xl relative space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                  <Building2 size={22} className="text-primary" />
                  Manage Companies
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Register and maintain company nodes to associate with job postings.
                </p>
              </div>
              <Button
                onClick={() => setRegisterCompanyOpen(true)}
                className="gap-2 rounded-2xl font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] transition-all cursor-pointer self-start sm:self-center"
              >
                <Plus size={16} />
                Register Company
              </Button>
            </div>

            {myCompanies.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <Building2 className="mx-auto text-muted-foreground/30 mb-3 animate-pulse" size={48} />
                <p className="text-sm font-semibold text-foreground">No companies registered yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Get started by registering a company. You need at least one registered company to post jobs.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myCompanies.map((company) => (
                  <div
                    key={company.companyId}
                    className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.01] dark:bg-black/20 hover:border-primary/30 transition-all duration-300 relative group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden shrink-0 border border-white/[0.05]">
                          {company.logo ? (
                            <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 size={20} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-foreground text-sm truncate">{company.name}</h3>
                          {company.website && (
                            <a
                              href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-primary hover:underline flex items-center gap-0.5 mt-0.5 truncate"
                            >
                              {company.website} <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {company.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/[0.04] flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCompany(company.companyId)}
                        className="text-xs h-8 px-3 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl gap-1.5"
                      >
                        <Trash2 size={13} />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "sandbox" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 backdrop-blur-xl p-6 md:p-8 shadow-2xl relative space-y-6 max-w-2xl mx-auto"
          >
            <div>
              <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                <Upload size={22} className="text-primary" />
                File Upload Sandbox
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Upload any document or media file directly to the Cloudinary utility service.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-8 hover:border-primary/50 cursor-pointer transition-colors relative group bg-white/[0.01]">
                {uploadingSandbox ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="text-sm font-semibold text-muted-foreground">Uploading to Cloudinary...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      Choose File to Upload
                    </span>
                    <span className="text-xs text-muted-foreground">Any format (image, PDF, doc, etc.)</span>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  disabled={uploadingSandbox}
                  onChange={handleSandboxUpload}
                />
              </label>

              {sandboxResult && (
                <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] space-y-3.5">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-bold">Upload Successful!</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">File Name</p>
                      <p className="font-semibold text-foreground mt-0.5">{sandboxResult.fileName}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Cloudinary URL</p>
                      <a
                        href={sandboxResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 mt-0.5 break-all font-semibold"
                      >
                        {sandboxResult.url} <ExternalLink size={12} />
                      </a>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Public ID</p>
                      <code className="px-1.5 py-0.5 rounded bg-muted/40 font-mono text-[11px] text-foreground inline-block mt-0.5">
                        {sandboxResult.publicId}
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div>

      {/* Register Company Dialog */}
      <Dialog open={registerCompanyOpen} onOpenChange={setRegisterCompanyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register Company</DialogTitle>
            <DialogDescription>
              Create a new company node to associate with your job listings.
            </DialogDescription>
            <DialogClose />
          </DialogHeader>
          <form onSubmit={handleRegisterCompany}>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company-website">Website URL</Label>
                <Input
                  id="company-website"
                  placeholder="e.g. https://acme.com"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company-description">Description</Label>
                <Textarea
                  id="company-description"
                  placeholder="Tell us about the company..."
                  rows={3}
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company-logo">Company Logo</Label>
                <Input
                  id="company-logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCompanyLogo(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRegisterCompanyOpen(false)}
                disabled={registeringCompany}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={registeringCompany}>
                {registeringCompany ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Post New Job Dialog */}
      <Dialog open={postJobOpen} onOpenChange={setPostJobOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Post New Job</DialogTitle>
            <DialogDescription>
              Create a new recruitment listing for active candidates.
            </DialogDescription>
            <DialogClose />
          </DialogHeader>
          <form onSubmit={handlePostJob}>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-1.5">
                <Label htmlFor="job-title">Job Title *</Label>
                <Input
                  id="job-title"
                  required
                  placeholder="e.g. Lead Frontend Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="job-company">Company *</Label>
                {myCompanies.length === 0 ? (
                  <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500 text-xs font-semibold">
                    No companies registered. Please register a company first in {"Manage Companies"}.
                  </div>
                ) : (
                  <select
                    id="job-company"
                    required
                    value={jobForm.companyId}
                    onChange={(e) => setJobForm({ ...jobForm, companyId: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {myCompanies.map((c) => (
                      <option key={c.companyId} value={c.companyId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="job-description">Job Description *</Label>
                <Textarea
                  id="job-description"
                  required
                  placeholder="Roles, responsibilities, requirements..."
                  rows={4}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="job-location">Location *</Label>
                  <Input
                    id="job-location"
                    required
                    placeholder="e.g. Bangalore, India"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="job-type">Job Type</Label>
                  <select
                    id="job-type"
                    value={jobForm.jobType}
                    onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="job-role">Role/Category *</Label>
                  <Input
                    id="job-role"
                    required
                    placeholder="e.g. Frontend Developer"
                    value={jobForm.role}
                    onChange={(e) => setJobForm({ ...jobForm, role: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="job-salary">Salary Range *</Label>
                  <Input
                    id="job-salary"
                    required
                    placeholder="e.g. ₹12L - ₹18L"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="job-openings">Openings Count *</Label>
                  <Input
                    id="job-openings"
                    type="number"
                    min="1"
                    required
                    value={jobForm.openings}
                    onChange={(e) => setJobForm({ ...jobForm, openings: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="job-worklocation">Work Location</Label>
                  <select
                    id="job-worklocation"
                    value={jobForm.workLocation}
                    onChange={(e) => setJobForm({ ...jobForm, workLocation: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none"
                  >
                    <option value="on_site">On Site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPostJobOpen(false)}
                disabled={postingJob}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={postingJob || myCompanies.length === 0}>
                {postingJob ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                    Posting...
                  </>
                ) : (
                  "Post Job"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </section>
  )
}
