"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const baht = (n: number) => `฿${n.toLocaleString("th-TH", { maximumFractionDigits: 0 })}`;

export function CategoryDonut({ data }: { data: { name: string; total: number; color: string; icon: string }[] }) {
  const shown = data.filter((d) => d.total > 0);
  if (!shown.length) return null;
  return (
    <div className="h-48 w-48 shrink-0" role="img" aria-label="สัดส่วนรายจ่ายตามหมวด">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={shown} dataKey="total" nameKey="name" innerRadius="62%" outerRadius="100%" paddingAngle={1.5} stroke="none" isAnimationActive={false}>
            {shown.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => baht(Number(v))} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailyBars({ data, today }: { data: { day: number; total: number }[]; today: number | null }) {
  return (
    <div className="h-40 w-full" role="img" aria-label="รายจ่ายรายวัน">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <XAxis dataKey="day" tickLine={false} axisLine={false} interval={4} tick={{ fontSize: 11, fill: "#7a8091" }} />
          <YAxis hide />
          <Tooltip formatter={(v) => baht(Number(v))} labelFormatter={(d) => `วันที่ ${d}`} cursor={{ fill: "#e6f3f1" }} />
          <Bar dataKey="total" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.day} fill={today !== null && d.day > today ? "#e3e0d6" : "#0f766e"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
