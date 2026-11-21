"use client";

import { CategoryIcon } from "@/components/category-icon";
import { formatMoney } from "@/lib/core/format";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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

// Modern, accessible tooltips with subtle border and crisp typography
function CategoryTip({ active, payload, sum }: TipProps & { sum: number }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  const val = Number(payload[0]?.value ?? 0);
  const pct = sum > 0 ? Math.round((val / sum) * 100) : 0;
  return (
    <div className="flex flex-col items-start gap-1 rounded-xl border border-line bg-white/95 px-3.5 py-2 text-ink shadow-lg backdrop-blur-xs">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
        {(item?.icon || item?.slug) && (
          <CategoryIcon icon={item.icon} slug={item.slug} color={item.color} size="sm" />
        )}
        <span>{String(payload[0]?.name ?? "")}</span>
        <span className="font-plate num text-ink-3 font-normal">({pct}%)</span>
      </span>
      <span className="font-plate num text-lg leading-tight font-bold text-ink">{baht(val)}</span>
    </div>
  );
}

function DayTip({ active, payload, label, today }: TipProps & { today: number | null }) {
  if (!active || !payload?.length) return null;
  const isToday = today !== null && Number(label) === today;
  return (
    <div className="flex flex-col items-start gap-0.5 rounded-xl border border-line bg-white/95 px-3 py-2 text-ink shadow-lg backdrop-blur-xs">
      <span className="flex items-center gap-1.5 text-xs font-medium text-ink-3">
        <span>วันที่ {String(label ?? "")}</span>
        {isToday && (
          <span className="rounded-full bg-plate-soft px-1.5 py-0.5 text-xs font-semibold text-ink">
            วันนี้
          </span>
        )}
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

/** Round baht gridlines (0, 500, 1k...) so the scale reads at a glance; at most three steps above zero. */
export function dayTicks(max: number): number[] {
  const step = [50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 25000, 50000].find((s) => s * 3 >= max) ?? Math.ceil(max / 3 / 50000) * 50000;
  return Array.from({ length: Math.max(1, Math.ceil(max / step)) + 1 }, (_, i) => i * step);
}

const bahtTick = (v: number) => (v >= 1000 ? `฿${v % 1000 === 0 ? v / 1000 : (v / 1000).toFixed(1)}k` : `฿${v}`);

export function DailyBars({ data, today }: { data: { day: number; total: number }[]; today: number | null }) {
  const ticks = dayTicks(Math.max(...data.map((d) => d.total), 0));
  return (
    <div className="h-44 w-full pt-1" role="img" aria-label={dailySummary(data)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer={false}
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          {/* Subtle horizontal guidelines for instant visual reading */}
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--color-line)"
            strokeOpacity={0.75}
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={{ stroke: "var(--color-line)", strokeWidth: 1 }}
            interval={4}
            tick={{ fontSize: 12, fill: "var(--color-ink-3)" }}
            dy={4}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            ticks={ticks}
            domain={[0, ticks[ticks.length - 1]]}
            tick={{ fontSize: 12, fill: "var(--color-ink-3)" }}
            tickFormatter={bahtTick}
            width={44}
          />
          <Tooltip content={<DayTip today={today} />} cursor={{ fill: "var(--color-steel)", opacity: 0.6 }} />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={600} animationEasing="ease-out">
            {data.map((d) => (
              <Cell
                key={d.day}
                fill={
                  today !== null && d.day > today
                    ? "var(--color-steel-2)"
                    : d.day === today
                      ? "var(--color-plate)"
                      : "var(--color-red)"
                }
              />
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
