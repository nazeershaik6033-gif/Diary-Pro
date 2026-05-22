'use client'
import { PageHeader } from '@/components/layout/PageHeader'
import { WeeklyReviewWizard } from '@/components/gtd/WeeklyReviewWizard'

export default function WeeklyReviewPage() {
  return (
    <div>
      <PageHeader title="Weekly Review" />
      <WeeklyReviewWizard />
    </div>
  )
}
