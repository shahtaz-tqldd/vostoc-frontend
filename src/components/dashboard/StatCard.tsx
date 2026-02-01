import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

type StatCardProps = {
  label: string
  value: string
  trend: string
  tone?: 'mint' | 'coral' | 'ink'
}

export function StatCard({ label, value, trend, tone = 'ink' }: StatCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4 pt-6">
        <Badge variant={tone}>{label}</Badge>
        <div className="text-3xl font-semibold text-ink-900">{value}</div>
        <div className="text-sm text-ink-500">{trend}</div>
      </CardContent>
    </Card>
  )
}
