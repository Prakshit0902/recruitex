import CompanyDetailSection from "@/components/sections/CompanyDetailSection"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return {
    title: `Company #${id} — RecruiteX`,
    description: "View company profile and open positions.",
  }
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CompanyDetailSection companyId={id} />
}
