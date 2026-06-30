import { Suspense } from "react"
import ResetPasswordSection from "@/components/sections/ResetPasswordSection"

export const metadata = {
  title: "Reset Password — RecruiteX",
  description: "Reset your RecruiteX account password.",
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <ResetPasswordSection />
    </Suspense>
  )
}
