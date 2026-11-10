"use client";

import { formatMoney } from "@/lib/core/format";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const baht = formatMoney;

// Tooltips are styled directly like yellow public-transport licence plates with bold black digits.
type TipProps = { active?: boolean; payload?: readonly { value?: unknown; name?: unknown }[]; label?: unknown };
function plateTip(labelOf: (p: TipProps) => string) {
  function PlateTooltip(p: TipProps) {
    if (!p.active || !p.payload?.length) return null;
    return (
      <div className="flex flex-col items-start gap-0.5 rounded-[10px] border-2 border-ink bg-plate px-3 py-1.5 text-ink shadow-[0_6px_14px_-8px_rgb(27_23_21/0.45),inset_0_0_0_2px_var(--color-plate),inset_0_0_0_3.5px_var(--color-ink)]">
        <span className="text-[0.72rem] leading-snug font-semibold text-ink/85">{labelOf(p)}</span>
        <span className="font-plate num text-lg leading-tight font-bold text-ink">{baht(Number(p.payload[0].value))}</span>
      </div>
    );
  }
  return PlateTooltip;
}
const CategoryTip = plateTip((p) => String(p.payload?.[0]?.name ?? ""));
const DayTip = plateTip((p) => `วันที่ ${p.label}`);

export function CategoryDonut({ data }: { data: { name: string; total: number; color: string }[] }) {
  const shown = data.filter((d) => d.total > 0);
  if (!shown.length) return null;
  return (
    <div
      className="h-44 w-44 shrink-0"
      role="img"
      aria-label={`สัดส่วนรายจ่ายตามหมวด: ${(() => {
        const sum = shown.reduce((a, d) => a + d.total, 0);
        return [...shown]
          .sort((a, b) => b.total - a.total)
          .slice(0, 3)
          .map((d) => `${d.name} ${Math.round((d.total / sum) * 100)}%`)
          .join(", ");
      })()}`}
    >
      <ResponsiveContainer>
        <PieChart accessibilityLayer={false}>
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
          <Tooltip content={<CategoryTip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailyBars({ data, today }: { data: { day: number; total: number }[]; today: number | null }) {
  return (
    <div className="h-36 w-full" role="img" aria-label={dailySummary(data)}>
      <ResponsiveContainer>
        <BarChart accessibilityLayer={false} data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <XAxis dataKey="day" tickLine={false} axisLine={false} interval={4} tick={{ fontSize: 11, fill: "#6e6762" }} />
          <YAxis hide />
          <Tooltip content={<DayTip />} cursor={{ fill: "#eef0f2" }} />
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

function dailySummary(data: { day: number; total: number }[]) {
  const spent = data.filter((d) => d.total > 0);
  if (!spent.length) return "รายจ่ายรายวัน: ยังไม่มี";
  const max = spent.reduce((a, d) => (d.total > a.total ? d : a));
  return `รายจ่ายรายวัน: มีรายจ่าย ${spent.length} วัน มากสุดวันที่ ${max.day} ${baht(max.total)}`;
}
