import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function SwotBalanceChart({ values }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const total = values.reduce((sum, item) => sum + item.value, 0);

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    if (total === 0) {
      return undefined;
    }

    chartRef.current = new Chart(canvas, {
      type: "polarArea",
      data: {
        labels: values.map((item) => item.label),
        datasets: [
          {
            data: values.map((item) => item.value),
            backgroundColor: values.map((item) => item.color),
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#475569",
              font: {
                family: "Sarabun",
              },
            },
          },
        },
        scales: {
          r: {
            ticks: {
              color: "#64748b",
              backdropColor: "transparent",
              stepSize: 1,
            },
            grid: {
              color: "rgba(148, 163, 184, 0.25)",
            },
            angleLines: {
              color: "rgba(148, 163, 184, 0.2)",
            },
            pointLabels: {
              color: "#334155",
              font: {
                family: "Sarabun",
                size: 12,
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [values]);

  const total = values.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500">
        เพิ่มประเด็นลงใน SWOT ก่อน แล้วกราฟสมดุลมุมมองจะปรากฏที่นี่
      </div>
    );
  }

  return (
    <div className="h-72 rounded-[24px] border border-slate-200 bg-white p-4">
      <canvas ref={canvasRef} />
    </div>
  );
}
