# RecruiteX — Frontend Agent Guide

Monorepo (npm workspaces): `packages/*` (`@app/db`), `services/*` (4 microservices), `frontend` (Next.js 16 + Tailwind v4 + shadcn/ui).

**Stack**: Next.js 16 (App Router) + Tailwind CSS v4 + shadcn/ui (radix-nova) + Framer Motion + TypeScript.

---

## 1. Commands

| What | Command |
|------|---------|
| Run all 4 backend services | `npm run dev` (from root) |
| Run a single backend service | `npm run dev:<name>` (auth/user/job/utils) |
| Run frontend | `cd frontend && npm run dev` |
| Build frontend (must pass TS) | `cd frontend && npm run build` |
| Lint frontend | `cd frontend && npm run lint` |
| DB generate/migrate/push/studio | `npm run db:<cmd>` from root |
| Build a service | `cd services/<name> && npm run build` (runs `npm install && tsc`) |

## 2. Architecture

**4 microservices** (Express 5 + TypeScript, ESM, `NodeNext` module, compiled to `dist/`):

| Service | Mount path | Port | Key extras |
|---------|-----------|------|------------|
| auth | `/api/auth` | 5000 | Upstash Redis, Kafka producer |
| user | `/api/user` | 5002 | — |
| job | `/api/job` | 5003 | **Route mount typo**: `app.use('api/job',...)` — missing leading `/` |
| utils | `/api/utils` | 5001 | Cloudinary, Kafka consumer, 50mb body limit |

**Shared DB**: `@app/db` — Drizzle ORM + Neon PostgreSQL. Schema exports: `skills, users, userSkills, company, jobs, applications`.

**Auth**: JWT (15d expiry). localStorage keys: `rx-token`, `rx-user`. Middleware verifies token, attaches `req.user`.

**File uploads**: All go through `POST /api/utils/upload` (multipart, `file` field). Returns `{ url, public_id }`. Pass old `public_id` to replace.

**Async**: Kafka — auth publishes `send-mail-topic` (forgot-password), utils consumes.

## 3. Building New UI — The Process

**Always follow this order to avoid iterations:**

1. **Check backend first** — Read the relevant service's routes/controllers to know what endpoints, request shapes, and response shapes exist
2. **Add API client methods** — Extend `lib/api-client.ts` with new types + `api.*` object
3. **Create page shell** — `app/feature/page.tsx` (server component, imports sections)
4. **Create section components** — `components/sections/FeatureSection.tsx` (client component with animations)
5. **Wire API calls** — `useEffect` + `useState` for fetching, `useAuth()` for protected endpoints
6. **Apply animations** — `useScrollReveal` variants on every section
7. **Verify** — `npm run build` (must pass TS + compilation)

### Backend-first integration rules:
- When you need a new page, check the corresponding service's routes first. The backend already has endpoints for profile, jobs, companies, skills, applications, etc.
- Use `request<T>()` from `api-client.ts` — it auto-attaches JWT and handles errors
- For file uploads, use `FormData` (not JSON) and the `file` field name
- Auth is already wired — `useAuth()` gives you `{ user, token, login, register, logout }`
- If the backend is missing an endpoint, add it in the relevant `services/<name>/src/routes/` file + controller

## 4. Design System — Anti "AI-Generated" Look

**Every UI must avoid generic patterns (these look AI-made):**
- Symmetric 3-column card grids — use asymmetric bento layouts instead
- Centered everything with no hierarchy — vary sizes and positions
- Flat cards with simple borders — use glassmorphism, layered depth, conic borders
- "Find Your Dream Job" heroes — write specific, punchy copy
- Standard modals with title + form + submit — use slide-over panels or wizard flows
- Same border-radius everywhere — mix: 8px cards, 16px sections, 9999px pills
- All sections same width — alternate full-bleed with contained sections

**Instead, use these patterns:**
- **Asymmetric grids** — different sized cells, intentional whitespace
- **Layered depth** — overlapping elements, shadow layering, z-index play
- **Unexpected shapes** — `clip-path`, varied `border-radius`, diagonal dividers
- **Micro-interactions** — hover transforms (scale, rotate, glow, color shift)
- **Typography as design** — weight contrast (800 headlines + 400 body), varied sizes
- **Color as function** — use accent sparingly, not as decoration
- **Whitespace as luxury** — generous padding, breathing room

## 5. Theme System (4 Themes)

Defined in `globals.css` as CSS custom properties. Switch via `[data-theme]` attr.

| data-theme | Name | Bg | Primary | Accent |
|------------|------|----|---------|--------|
| (default) | Crisp | light warm | Indigo | Coral |
| "dark" | Onyx | dark premium | Bright indigo | Neon coral |
| "midnight" | Nebula | blue navy | Electric blue | Cyan |
| "sunset" | Ember | warm dark | Amber | Rose |

**Rules:**
- Always use semantic tokens: `bg-background text-foreground border-border bg-primary`
- Never use literal colors: `bg-white text-black` — breaks across themes
- Brand scale: `bg-brand-50` through `bg-brand-950`, `text-accent-brand`
- Gradient text: `bg-linear-to-r from-primary to-brand-400 bg-clip-text text-transparent`
- Theme persisted in localStorage as `recruitex-theme`
- `useTheme()` returns `{ theme, setTheme, themes }`

## 6. Animation System

### Framer Motion (entrance + interaction)

**Every section must use scroll-triggered entrance animations.**

```tsx
"use client"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export default function SomeSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  return (
    <section ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >...</motion.div>
    </section>
  )
}
```

Animation variants (from `hooks/useScrollReveal.ts`):
- `fadeUp`, `fadeLeft`, `fadeRight`, `scaleIn`, `staggerContainer`, `cardHover`

Rules:
- `once: true` always (no re-animate)
- Duration: 0.6–0.8s entrances, 0.2–0.4s hovers
- Easing: `[0.25, 0.46, 0.45, 0.94]` — use `as const` for TS
- Use `<AnimatePresence>` for mount/unmount

### CSS Animations (continuous decorative effects)
Classes in `globals.css`: `animate-float`, `animate-float-slow`, `animate-pulse-glow`, `animate-morph-gradient`, `animate-drift`, `animate-shimmer`, `animate-ripple`

### Hydration Safety
**Never use `Math.random()` or `Date.now()` in render.** Use seeded pseudo-random:
```tsx
const seed = (n: number) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x) }
const positions = Array.from({ length: 10 }, (_, i) => seed(i * 7 + 1))
```

## 7. Component Architecture

```
app/feature/page.tsx           ← Server component (page shell, composes sections)
components/sections/FeatureX.tsx ← Client component (scroll animations + logic)
components/ui/Button.tsx       ← shadcn primitives (keep server when possible)
```

### Section component pattern:
```tsx
<section className="relative overflow-hidden py-20 lg:py-28">
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_3%,transparent),transparent_70%)]" />
  <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {children}
  </div>
</section>
```

### Card pattern:
```tsx
className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 lg:p-8"
```

### Glass overlay:
```tsx
className="bg-background/60 backdrop-blur-xl border border-border/50"
```

## 8. Key Files

| File | Purpose |
|------|---------|
| `globals.css` | 4 themes + CSS animations + utilities |
| `useScrollReveal.ts` | Animation variants + scroll hook |
| `api-client.ts` | Centralized fetch with JWT, typed API modules |
| `auth-context.tsx` | `useAuth()` hook |
| `ThemeProvider.tsx` | `useTheme()` hook |
| `utils.ts` | `cn()` className merger (CVA + tailwind-merge) |

## 9. Backend Integration Reference

### API Client (`lib/api-client.ts`)
- `request<T>(endpoint, options)` — base function, prepends `NEXT_PUBLIC_AUTH_API` URL
- Auto-attaches JWT from localStorage `rx-token`
- Sends JSON unless body is `FormData`
- Returns typed response, throws `ApiError` with message + status

### Adding new endpoints:
```tsx
// In lib/api-client.ts:
export interface Job {
  jobId: number; title: string; company: string; salary: string
  location: string; jobType: "full_time" | "part_time" | "internship" | "contract"
}

export const jobApi = {
  list: () => request<Job[]>('/jobs', { method: 'GET' }),
  getById: (id: number) => request<Job>(`/jobs/${id}`, { method: 'GET' }),
  create: (data: FormData) => request<Job>('/jobs/new', { method: 'POST', body: data }),
}
```

### Existing backend endpoints to use:

**Auth** (`/api/auth`): POST `/register` (with file upload for resumes), POST `/login`

**User** (`/api/user`): GET `/me`, GET `/profile/:userId`, PUT `/update/profile`, PUT `/update/pic`, PUT `/update/resume`, POST `/skill/add`, DELETE `/skill/delete`

**Job** (`/api/job`): POST `/company/new`, DELETE `/company/:companyId`, POST `/job/new`

**Utils** (`/api/utils`): POST `/upload`

### Existing database columns (check these when building forms):

Schema (`packages/db/schema/`):
- `users`: `userId, name, email, password, phoneNumber, role (jobseeker|recruiter), bio, resume, resumePublicId, profilePic, profilePicPublicId, subscription`
- `jobs`: `jobId, title, description, salary, location, jobType (full_time|part_time|internship|contract), openings, role, workLocation (remote|on_site|hybrid), companyId, postedByRecruiter, isActive`
- `company`: `companyId, name, description, website, logo, logoPublicId, recruiterId`
- `applications`: `applicationId, jobId, applicantId, applicantEmail, status (submitted|rejected|hired), resume, subscribed`
- `skills`: `skillId, skillName`
- `userSkills`: `userId, skillId`

### Error handling pattern:
```tsx
try {
  await someApi.call(data)
} catch (e) {
  if (e instanceof ApiError) showError(e.message)
}
```
