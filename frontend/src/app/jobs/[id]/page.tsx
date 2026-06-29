import JobDetailSection from "@/components/sections/JobDetailSection"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return {
    title: `Job #${id} — RecruiteX`,
    description: "View job details and apply.",
  }
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <JobDetailSection jobId={id} />
}
