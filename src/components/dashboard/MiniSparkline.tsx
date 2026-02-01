type MiniSparklineProps = {
  points: number[]
}

export function MiniSparkline({ points }: MiniSparklineProps) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100
      const y = 100 - ((point - min) / range) * 100
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 100 100" className="h-16 w-full">
      <path
        d={path}
        fill="none"
        stroke="#2DD4BF"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}
