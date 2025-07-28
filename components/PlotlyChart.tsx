'use client'

import { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-dist'

interface PlotlyChartProps {
  data: any[]
  layout: any
  config?: any
  className?: string
  style?: React.CSSProperties
}

export default function PlotlyChart({ 
  data, 
  layout, 
  config = { displayModeBar: false, responsive: true },
  className = '',
  style = {}
}: PlotlyChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      Plotly.newPlot(chartRef.current, data, layout, config)
    }

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current)
      }
    }
  }, [data, layout, config])

  return (
    <div 
      ref={chartRef} 
      className={className}
      style={style}
    />
  )
} 