import ProfileSection from "@/components/sections/ProfileSection"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return {
    title: `User #${id} — RecruiteX`,
    description: "View user profile.",
  }
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProfileSection userId={id} />
}
