"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useRouter } from "next/navigation"
import { userApi, type User } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { fadeUp, scaleIn } from "@/hooks/useScrollReveal"
import { User as UserIcon, Mail, Phone, Briefcase, FileText, Camera, X, Plus, Save, Loader2, Sparkles, Upload } from "lucide-react"

export default function ProfileSection({ userId: paramUserId }: { userId?: string }) {
  const { user: authUser } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const isOwnProfile = !paramUserId || String(authUser?.userId) === paramUserId
  const [uploadingResume, setUploadingResume] = useState(false)

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingResume(true)
    try {
      await userApi.updateResume(file)
      const updated = await userApi.getMe()
      setProfile(updated)
    } catch {
      // silent
    } finally {
      setUploadingResume(false)
    }
  }

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    bio: "",
  })

  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  useEffect(() => {
    let active = true
    if (!isOwnProfile && paramUserId) {
      userApi.getProfile(parseInt(paramUserId))
        .then((res) => { if (active) setProfile(res) })
        .catch(() => { if (active) router.push("/") })
        .finally(() => {
          if (active) {
            setTimeout(() => { if (active) setLoading(false) }, 0)
          }
        })
    } else if (authUser) {
      userApi.getMe()
        .then((res) => { if (active) setProfile(res) })
        .catch(() => { if (active) setProfile(authUser) })
        .finally(() => {
          if (active) {
            setTimeout(() => { if (active) setLoading(false) }, 0)
          }
        })
    } else {
      setTimeout(() => { if (active) setLoading(false) }, 0)
    }
    return () => { active = false }
  }, [authUser, paramUserId, isOwnProfile, router])

  useEffect(() => {
    if (profile) {
      const timer = setTimeout(() => {
        setForm({
          name: profile.name || "",
          email: profile.email || "",
          phoneNumber: profile.phoneNumber || "",
          bio: profile.bio || "",
        })
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [profile])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await userApi.updateProfile(form)
      setProfile(updated)
      setEditing(false)
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  const refreshProfile = () => {
    if (isOwnProfile) {
      userApi.getMe().then(setProfile).catch(() => {})
    } else if (paramUserId) {
      userApi.getProfile(parseInt(paramUserId)).then(setProfile).catch(() => {})
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return
    try {
      await userApi.addSkill(newSkill.trim())
      setNewSkill("")
      refreshProfile()
    } catch {
      // silent
    }
  }

  const handleRemoveSkill = async (skill: string) => {
    try {
      await userApi.deleteSkill(skill)
      refreshProfile()
    } catch {
      // silent
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await userApi.updateProfilePic(file)
      const updated = await userApi.getMe()
      setProfile(updated)
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <section className="relative overflow-hidden py-20 lg:py-28 min-h-screen bg-background flex flex-col justify-center items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_4%,transparent),transparent_70%)]" />
        <div className="relative flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-muted-foreground animate-pulse font-medium text-sm tracking-wide">Connecting to profile...</p>
        </div>
      </section>
    )
  }

  if (!profile) return null

  return (
    <section className="relative overflow-hidden py-16 lg:py-24 min-h-screen bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--primary)_8%,transparent),transparent_50%),radial-gradient(ellipse_at_bottom_left,color-mix(in_oklch,var(--accent)_6%,transparent),transparent_60%)] bg-background text-foreground">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none select-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none select-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 p-6 md:p-8 rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 w-full">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-indigo-500 p-0.5 shadow-lg shadow-primary/20">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden text-3xl font-extrabold text-primary">
                  {profile.profilePic ? (
                    <img src={profile.profilePic} alt={profile.name} className="size-full object-cover" />
                  ) : (
                    <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              {isOwnProfile && (
                <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-20 m-0.5">
                  <Camera size={20} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              )}
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{profile.name}</span>
                  </h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Mail size={14} />{profile.email}</span>
                    {profile.phoneNumber && <span className="flex items-center gap-1.5"><Phone size={14} />{profile.phoneNumber}</span>}
                    <Badge variant="accent" className="font-semibold px-2.5 py-0.5 rounded-full select-none capitalize ml-2">
                      {profile.role === "recruiter" ? "Recruiter" : "Job Seeker"}
                    </Badge>
                  </div>
                </div>
                {isOwnProfile && (
                  <Button 
                    variant="outline" 
                    className="rounded-2xl gap-2 font-semibold shrink-0 border-white/[0.1] bg-white/[0.01] hover:bg-white/[0.05]" 
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? <X size={16} /> : <UserIcon size={16} />}
                    {editing ? "Cancel" : "Edit Profile"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="lg:col-span-2 space-y-8"
          >
            <div className="rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 backdrop-blur-xl p-6 md:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <UserIcon size={18} className="text-primary" />
                  About
                </h2>
              </div>
              
              {editing ? (
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="rounded-2xl bg-white/[0.01] dark:bg-black/20 border-white/[0.1] focus-visible:ring-primary/50"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {profile.bio || "This user hasn't added a bio yet."}
                </p>
              )}
            </div>

            {editing && (
              <div className="rounded-3xl border border-primary/20 bg-primary/[0.02] backdrop-blur-xl p-6 md:p-8 shadow-2xl relative space-y-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  Edit Details
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</label>
                    <Input 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="rounded-xl bg-white/[0.01] dark:bg-black/20 border-white/[0.1] focus-visible:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                    <Input 
                      value={form.email} 
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="rounded-xl bg-white/[0.01] dark:bg-black/20 border-white/[0.1] focus-visible:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</label>
                    <Input 
                      value={form.phoneNumber} 
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      className="rounded-xl bg-white/[0.01] dark:bg-black/20 border-white/[0.1] focus-visible:ring-primary/50"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="gap-2 rounded-2xl font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] transition-all"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="space-y-8"
          >
            <div className="rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 backdrop-blur-xl p-6 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  Skills
                </h2>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.skills?.length > 0 ? profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1.5 py-1 px-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors border border-white/[0.05]">
                    {skill}
                    {isOwnProfile && editing && (
                      <button onClick={() => handleRemoveSkill(skill)} className="hover:text-destructive transition-colors ml-1">
                        <X size={12} />
                      </button>
                    )}
                  </Badge>
                )) : (
                  <p className="text-sm text-muted-foreground">No skills added yet</p>
                )}
              </div>
              
              {isOwnProfile && editing && (
                <div className="flex gap-2 mt-6">
                  <Input
                    placeholder="Add skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                    className="h-10 text-sm rounded-xl bg-white/[0.01] dark:bg-black/20 border-white/[0.1] focus-visible:ring-primary/50"
                  />
                  <Button className="shrink-0 rounded-xl bg-primary hover:bg-primary/90" onClick={handleAddSkill}>
                    <Plus size={16} />
                  </Button>
                </div>
              )}
            </div>

            {profile.role === "jobseeker" && (
              <div className="rounded-3xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 backdrop-blur-xl p-6 shadow-2xl relative space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  Resume
                </h2>
                {profile.resume ? (
                  <a
                    href={profile.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-white/[0.08] dark:border-white/[0.04] bg-white/[0.03] dark:bg-black/15 p-4 relative hover:scale-[1.02] hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">View Resume</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Open in new tab</p>
                      </div>
                    </div>
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
                )}
                {isOwnProfile && (
                  <div className="pt-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-4 hover:border-primary/50 cursor-pointer transition-colors relative group">
                      {uploadingResume ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="animate-spin text-primary" size={24} />
                          <span className="text-xs text-muted-foreground">Uploading resume...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <Upload size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            {profile.resume ? "Update Resume (PDF)" : "Upload Resume (PDF)"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">PDF format only</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        className="hidden" 
                        disabled={uploadingResume} 
                        onChange={handleResumeChange} 
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
