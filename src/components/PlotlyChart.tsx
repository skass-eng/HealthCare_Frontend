import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';

interface PlotlyChartProps {
  data: any[];
  layout: any;
  config?: any;
  className?: string;
  style?: React.CSSProperties;
}

const PlotlyChart: React.FC<PlotlyChartProps> = ({ 
  data, 
  layout, 
  config = { displayModeBar: false, responsive: true },
  className = '',
  style = {}
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      Plotly.newPlot(chartRef.current, data, layout, config);
    }

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [data, layout, config]);

  return (
    <div 
      ref={chartRef} 
      className={className}
      style={style}
    />
  );
};

export default PlotlyChart; 