"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const colors = ["#22c55e", "#ef4444"];

export function UptimeChart({ sites }: { sites: { name: string; healthy: boolean }[] }) {
  const healthy = sites.filter((site) => site.healthy).length;
  const unhealthy = Math.max(sites.length - healthy, 0);

  const data = [
    { name: "Healthy", value: healthy },
    { name: "Issue", value: unhealthy }
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
