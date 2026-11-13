"use client";

import { CategoryIcon } from "@/components/category-icon";
import { formatMoney } from "@/lib/core/format";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const baht = formatMoney;

export interface DonutDatum {
  name: string;
  total: number;
  color: string;
  icon?: string;
  slug?: string | null;
}

type TipPayloadItem = { value?: unknown; name?: unknown; payload?: DonutDatum & { day?: number; total?: number } };
type TipProps = { active?: boolean; payload?: readonly TipPayloadItem[]; label?: unknown };

// Tooltips are styled directly like yellow public-transport licence plates with bold black digits
// and pair category colour with CategoryIcon so colour is never the sole indicator.
function CategoryTip({ active, payload, sum }: TipProps & { sum: number }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  const val = Number(payload[0]?.value ?? 0);
  const pct = sum > 0 ? Math.round((val / sum) * 100) : 0;
  return (
    <div className="flex flex-col items-start gap-1 rounded-[10px] border-2 border-ink bg-plate px-3 py-2 text-ink shadow-[0_6px_14px_-8px_rgb(27_23_21/0.45),inset_0_0_0_2px_var(--color-plate),inset_0_0_0_3.5px_var(--color-ink)]">
      <span className="flex items-center gap-1.5 text-xs leading-normal font-semibold text-ink">
        {(item?.icon || item?.slug) && (
          <CategoryIcon icon={item.icon} slug={item.slug} color={item.color} size="sm" />
        )}
        <span>{String(payload[0]?.name ?? "")}</span>
        <span className="font-plate num text-ink/75">({pct}%)</span>
      </span>
      <span className="font-plate num text-lg leading-tight font-bold text-ink">{baht(val)}</span>
    </div>
  );
}

function DayTip({ active, payload, label, today }: TipProps & { today: number | null }) {
  if (!active || !payload?.length) return null;
  const isToday = today !== null && Number(label) === today;
  return (
    <div className="flex flex-col items-start gap-0.5 rounded-[10px] border-2 border-ink bg-plate px-3 py-1.5 text-ink shadow-[0_6px_14px_-8px_rgb(27_23_21/0.45),inset_0_0_0_2px_var(--color-plate),inset_0_0_0_3.5px_var(--color-ink)]">
      <span className="text-xs leading-normal font-semibold text-ink/85">
        วันที่ {String(label ?? "")}
        {isToday ? " · วันนี้" : ""}
      </span>
      <span className="font-plate num text-lg leading-tight font-bold text-ink">{baht(Number(payload[0].value))}</span>
    </div>
  );
}

export function CategoryDonut({ data }: { data: DonutDatum[] }) {
  const shown = data.filter((d) => d.total > 0);
  if (!shown.length) return null;
  const sum = shown.reduce((a, d) => a + d.total, 0);
  const top = [...shown].sort((a, b) => b.total - a.total)[0];

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div
        className="relative h-44 w-44"
        role="img"
        aria-label={`สัดส่วนรายจ่ายตามหมวด: ${[...shown]
          .sort((a, b) => b.total - a.total)
          .slice(0, 3)
          .map((d) => `${d.name} ${Math.round((d.total / sum) * 100)}%`)
          .join(", ")}`}
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
              stroke="var(--color-panel)"
              strokeWidth={2}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {shown.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<CategoryTip sum={sum} />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center icon + count anchor so donut never relies on colour alone */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
          <CategoryIcon icon={top.icon} slug={top.slug} color={top.color} size="sm" />
          <span className="font-plate num text-xs font-semibold text-ink-2">{shown.length} หมวด</span>
        </div>
      </div>
    </div>
  );
}

export function DailyBars({ data, today }: { data: { day: number; total: number }[]; today: number | null }) {
  return (
    <div className="h-36 w-full" role="img" aria-label={dailySummary(data)}>
      <ResponsiveContainer>
        <BarChart accessibilityLayer={false} data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <XAxis dataKey="day" tickLine={false} axisLine={false} interval={4} tick={{ fontSize: 12, fill: "var(--color-ink-3)" }} />
          <YAxis hide />
          <Tooltip content={<DayTip today={today} />} cursor={{ fill: "var(--color-steel)" }} />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} animationDuration={600} animationEasing="ease-out">
            {data.map((d) => (
              <Cell key={d.day} fill={today !== null && d.day > today ? "var(--color-steel-2)" : d.day === today ? "var(--color-ink)" : "var(--color-red)"} />
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
