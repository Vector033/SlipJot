"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const baht = (n: number) => `฿${n.toLocaleString("th-TH", { maximumFractionDigits: 0 })}`;
const tooltipStyle = {
  contentStyle: { borderRadius: 12, border: "2px solid #1b1715", fontFamily: "var(--font-ui)", padding: "6px 10px" },
  labelStyle: { color: "#4a4440" },
};

export function CategoryDonut({ data }: { data: { name: string; total: number; color: string }[] }) {
  const shown = data.filter((d) => d.total > 0);
  if (!shown.length) return null;
  return (
    <div className="h-44 w-44 shrink-0" role="img" aria-label="สัดส่วนรายจ่ายตามหมวด">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={shown}
            dataKey="total"
            nameKey="name"
            innerRadius="60%"
            outerRadius="100%"
            paddingAngle={1.5}
            stroke="#ffffff"
            strokeWidth={2}
            animationDuration={700}
            animationEasing="ease-out"
          >
            {shown.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => baht(Number(v))} {...tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailyBars({ data, today }: { data: { day: number; total: number }[]; today: number | null }) {
  return (
    <div className="h-36 w-full" role="img" aria-label="รายจ่ายรายวัน">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <XAxis dataKey="day" tickLine={false} axisLine={false} interval={4} tick={{ fontSize: 11, fill: "#6e6762" }} />
          <YAxis hide />
          <Tooltip formatter={(v) => baht(Number(v))} labelFormatter={(d) => `วันที่ ${d}`} cursor={{ fill: "#eef0f2" }} {...tooltipStyle} />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} animationDuration={600} animationEasing="ease-out">
            {data.map((d) => (
              <Cell key={d.day} fill={today !== null && d.day > today ? "#dfe3e7" : d.day === today ? "#1b1715" : "#b3121c"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
