"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Rectangle,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type MouseHandlerDataParam,
  type PieSectorShapeProps,
} from "recharts";
import { CategoryIcon } from "@/components/category-icon";
import type { BudgetStatus } from "@/lib/core/budget";
import { formatMoney } from "@/lib/core/format";
import type { MonthKey } from "@/lib/core/month";

const baht = formatMoney;

const SHORT_TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function formatTooltipDate(day: number, month?: MonthKey) {
  if (!month) return `วันที่ ${day}`;
  const [y, m] = month.split("-").map(Number);
  return `วันที่ ${day} ${SHORT_TH_MONTHS[m - 1] ?? ""} ${y + 543}`;
}

export interface DonutDatum {
  name: string;
  total: number;
  color: string;
  icon?: string;
  slug?: string | null;
}

export interface CategoryBreakdownItem extends DonutDatum {
  categoryId: string | null;
  count: number;
  budget: BudgetStatus | null;
}

export interface DailyBarDatum {
  day: number;
  total: number;
  count?: number;
}

type TipPayloadItem = {
  value?: unknown;
  name?: unknown;
  payload?: DonutDatum & { day?: number; total?: number; count?: number };
};
type TipProps = { active?: boolean; payload?: readonly TipPayloadItem[]; label?: unknown };

const TOOLTIP_CARD_CLASS =
  "flex flex-col items-start gap-0.5 rounded-xl border border-line bg-panel px-3 py-2 text-ink shadow-[0_1px_0_#dde1e6,0_8px_24px_-16px_rgb(27_23_21/0.25)]";

function CategoryTipCard({
  name,
  amount,
  pct,
  color,
  icon,
  slug,
}: {
  name: string;
  amount: number;
  pct: number;
  color?: string;
  icon?: string;
  slug?: string | null;
}) {
  return (
    <div className={TOOLTIP_CARD_CLASS}>
      <span className="flex items-center gap-1.5 text-xs font-medium text-ink-3">
        {(icon || slug) && <CategoryIcon icon={icon} slug={slug} color={color} size="sm" />}
        {!icon && !slug && color && <span aria-hidden className="size-2.5 rounded-full" style={{ background: color }} />}
        <span>{name}</span>
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="font-plate num text-lg leading-tight font-semibold text-ink">{baht(amount)}</span>
        <span className="font-plate num text-xs font-semibold text-ink-3">{pct}%</span>
      </span>
    </div>
  );
}

function CategoryTip({ active, payload, sum }: TipProps & { sum: number }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  const val = Number(payload[0]?.value ?? 0);
  const pct = sum > 0 ? Math.round((val / sum) * 100) : 0;
  return (
    <CategoryTipCard
      name={String(payload[0]?.name ?? "")}
      amount={val}
      pct={pct}
      color={item?.color}
      icon={item?.icon}
      slug={item?.slug}
    />
  );
}

function DayTipCard({
  day,
  total,
  count,
  isToday,
  month,
}: {
  day: number;
  total: number;
  count?: number;
  isToday: boolean;
  month?: MonthKey;
}) {
  return (
    <div className={TOOLTIP_CARD_CLASS}>
      <span className="flex items-center gap-1.5 text-xs font-medium text-ink-3">
        <span>{formatTooltipDate(day, month)}</span>
        {isToday && <span className="rounded-full bg-plate-soft px-1.5 py-0.5 text-xs font-semibold text-ink">วันนี้</span>}
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="font-plate num text-lg leading-tight font-semibold text-ink">{baht(total)}</span>
        {typeof count === "number" && <span className="num text-xs text-ink-3">{count} รายการ</span>}
      </span>
    </div>
  );
}

function DayTip({ active, payload, label, today, month }: TipProps & { today: number | null; month?: MonthKey }) {
  if (!active || !payload?.length) return null;
  const day = Number(label ?? payload[0]?.payload?.day ?? 0);
  const isToday = today !== null && day === today;
  const count = payload[0]?.payload?.count;
  return <DayTipCard day={day} total={Number(payload[0].value ?? 0)} count={count} isToday={isToday} month={month} />;
}

export function CategoryDonut({
  data,
  activeCategory = null,
  onActiveCategoryChange,
}: {
  data: DonutDatum[];
  activeCategory?: string | null;
  onActiveCategoryChange?: (name: string | null) => void;
}) {
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [focusedItem, setFocusedItem] = useState<DonutDatum | null>(null);

  const shown = data.filter((d) => d.total > 0);
  if (!shown.length) return null;
  const sum = shown.reduce((a, d) => a + d.total, 0);
  const top = [...shown].sort((a, b) => b.total - a.total)[0];
  const effectiveActive = hoveredName ?? focusedItem?.name ?? activeCategory;
  const activeSlice = effectiveActive ? (shown.find((d) => d.name === effectiveActive) ?? null) : null;
  const centerItem = activeSlice ?? top;
  const centerPct = sum > 0 && activeSlice ? Math.round((activeSlice.total / sum) * 100) : null;

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
        <div className="relative z-10 h-full w-full">
          <ResponsiveContainer>
            <PieChart accessibilityLayer={false}>
            <Pie
              data={shown}
              dataKey="total"
              nameKey="name"
              innerRadius="60%"
              outerRadius="92%"
              paddingAngle={1.5}
              stroke="var(--color-panel)"
              strokeWidth={2}
              animationDuration={700}
              animationEasing="ease-out"
              onMouseEnter={(entry) => {
                const name = entry?.name ? String(entry.name) : null;
                setHoveredName(name);
                onActiveCategoryChange?.(name);
              }}
              onMouseLeave={() => {
                setHoveredName(null);
                onActiveCategoryChange?.(null);
              }}
              shape={(props: PieSectorShapeProps) => {
                const datum = props.payload as DonutDatum | undefined;
                const name = String(props.name ?? datum?.name ?? "");
                const val = Number(props.value ?? datum?.total ?? 0);
                const pct = sum > 0 ? Math.round((val / sum) * 100) : 0;
                const isLit = effectiveActive !== null && effectiveActive === name;
                const dimmed = effectiveActive !== null && !isLit;
                return (
                  <Sector
                    cx={props.cx}
                    cy={props.cy}
                    innerRadius={props.innerRadius}
                    outerRadius={isLit ? (props.outerRadius ?? 0) + 5 : props.outerRadius}
                    startAngle={props.startAngle}
                    endAngle={props.endAngle}
                    cornerRadius={props.cornerRadius}
                    fill={props.fill}
                    fillOpacity={dimmed ? 0.35 : 1}
                    stroke={isLit && focusedItem?.name === name ? "var(--color-ink)" : "var(--color-panel)"}
                    strokeWidth={2}
                    tabIndex={0}
                    role="button"
                    aria-label={`${name} ${baht(val)} (${pct}%)`}
                    className="cursor-pointer transition-[fill-opacity] duration-150 focus:outline-none"
                    onFocus={() => {
                      if (datum) setFocusedItem(datum);
                      onActiveCategoryChange?.(name);
                    }}
                    onBlur={() => {
                      setFocusedItem(null);
                      onActiveCategoryChange?.(null);
                    }}
                  />
                );
              }}
            >
              {shown.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
              <Tooltip wrapperStyle={{ zIndex: 30 }} content={<CategoryTip sum={sum} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {focusedItem && !hoveredName && (
          <div className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap">
            <CategoryTipCard
              name={focusedItem.name}
              amount={focusedItem.total}
              pct={sum > 0 ? Math.round((focusedItem.total / sum) * 100) : 0}
              color={focusedItem.color}
              icon={focusedItem.icon}
              slug={focusedItem.slug}
            />
          </div>
        )}

        {/* Center icon + count/share anchor so donut never relies on colour alone */}
        <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center gap-1">
          <CategoryIcon icon={centerItem.icon} slug={centerItem.slug} color={centerItem.color} size="sm" />
          <span className="font-plate num text-xs font-semibold text-ink-2">
            {centerPct !== null ? `${centerPct}%` : `${shown.length} หมวด`}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CategoryBreakdown({
  categories,
  total,
  month,
}: {
  categories: CategoryBreakdownItem[];
  total: number;
  month: MonthKey;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const visible = categories.filter((c) => c.total > 0 || c.budget);

  return (
    <div className="flex flex-col items-center gap-6 p-4 sm:flex-row sm:items-start sm:p-5">
      <CategoryDonut data={categories} activeCategory={activeCategory} onActiveCategoryChange={setActiveCategory} />
      <ul className="rows w-full min-w-0 sm:flex-1">
        {visible.map((c) => {
          const isHighlighted = activeCategory === c.name;
          return (
            <li key={c.name}>
              <Link
                href={`/app/expenses?${new URLSearchParams({ month, cat: c.categoryId ?? "none" })}`}
                onMouseEnter={() => setActiveCategory(c.name)}
                onMouseLeave={() => setActiveCategory((cur) => (cur === c.name ? null : cur))}
                onFocus={() => setActiveCategory(c.name)}
                onBlur={() => setActiveCategory((cur) => (cur === c.name ? null : cur))}
                className={`-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors ${
                  isHighlighted ? "bg-steel ring-1 ring-ink/15" : "hover:bg-steel"
                }`}
              >
                <CategoryIcon icon={c.icon} slug={c.slug} color={c.color} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="font-plate num shrink-0 text-[1.05rem] font-semibold">{formatMoney(c.total)}</span>
                    <span className="num w-10 text-right text-sm text-ink-3">
                      {total ? Math.round((c.total / total) * 100) : 0}%
                    </span>
                  </span>
                  {c.budget && (
                    <BudgetBar
                      spent={c.total}
                      ratio={c.budget.ratio}
                      level={c.budget.level}
                      budget={c.budget.budget}
                    />
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BudgetBar({
  spent,
  ratio,
  level,
  budget,
}: {
  spent: number;
  ratio: number;
  level: "ok" | "near" | "over";
  budget: number;
}) {
  const color = level === "over" ? "thermal-budget-over" : level === "near" ? "thermal-budget-near" : "bg-ok";
  const remaining = budget - spent;
  return (
    <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span
        className="h-2 min-w-16 flex-1 overflow-hidden rounded-full bg-steel-2"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(Math.min(ratio, 1) * 100)}
        aria-label="ใช้ไปเทียบกับงบ"
      >
        <span className={`block h-full rounded-full ${color}`} style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
      </span>
      <span className="text-xs whitespace-nowrap text-ink-2">
        {remaining >= 0 ? (
          <>
            เหลือใช้ได้อีก <span className="font-plate num font-semibold text-ink">{formatMoney(remaining)}</span>
          </>
        ) : (
          <span className="font-semibold text-red-deep">
            เกินงบ <span className="font-plate num">{formatMoney(Math.abs(remaining))}</span>
          </span>
        )}
      </span>
    </span>
  );
}

/** Round baht gridlines (0, 500, 1k...) so the scale reads at a glance; at most three steps above zero. */
export function dayTicks(max: number): number[] {
  const step = [50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 25000, 50000].find((s) => s * 3 >= max) ?? Math.ceil(max / 3 / 50000) * 50000;
  return Array.from({ length: Math.max(1, Math.ceil(max / step)) + 1 }, (_, i) => i * step);
}

const bahtTick = (v: number) => (v >= 1000 ? `฿${v % 1000 === 0 ? v / 1000 : (v / 1000).toFixed(1)}k` : `฿${v}`);

function dayBarFill(day: number, today: number | null, active: boolean) {
  if (today !== null && day > today) return active ? "var(--color-chrome-dark)" : "var(--color-steel-2)";
  if (day === today) return active ? "var(--color-plate-deep)" : "var(--color-plate)";
  return active ? "var(--color-red-deep)" : "var(--color-red)";
}

export function DailyBars({ data, today, month }: { data: DailyBarDatum[]; today: number | null; month?: MonthKey }) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [focusedBar, setFocusedBar] = useState<{ day: number; total: number; count?: number; index: number } | null>(null);

  const ticks = dayTicks(Math.max(...data.map((d) => d.total), 0));
  const activeDay = hoveredDay ?? focusedBar?.day ?? null;

  const handleChartMouseMove = (state: MouseHandlerDataParam) => {
    const idx = typeof state.activeTooltipIndex === "number" ? state.activeTooltipIndex : Number(state.activeTooltipIndex);
    if (Number.isInteger(idx) && data[idx]) {
      setHoveredDay(data[idx].day);
    } else if (state.activeLabel != null) {
      const day = Number(state.activeLabel);
      if (Number.isFinite(day)) setHoveredDay(day);
    }
  };

  return (
    <div className="relative h-44 w-full pt-1" role="img" aria-label={dailySummary(data)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer={false}
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          onMouseMove={handleChartMouseMove}
          onMouseLeave={() => setHoveredDay(null)}
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
          <Tooltip content={<DayTip today={today} month={month} />} cursor={{ fill: "var(--color-steel)", opacity: 0.7 }} />
          <Bar
            dataKey="total"
            maxBarSize={24}
            animationDuration={600}
            animationEasing="ease-out"
            background={{ fill: "transparent" }}
            shape={(props: BarShapeProps) => {
              const d = props.payload as DailyBarDatum | undefined;
              const day = d?.day ?? 0;
              const total = d?.total ?? 0;
              const count = d?.count;
              const isHighlighted = activeDay !== null && activeDay === day;
              const dimmed = activeDay !== null && !isHighlighted;
              const fill = dayBarFill(day, today, isHighlighted);
              const bg = props.background as { y?: number; height?: number } | undefined;
              const hitY = bg?.y ?? 0;
              const hitHeight = bg?.height ?? Math.max(props.height ?? 0, 120);
              const barX = Number(props.x ?? 0);
              const barW = Math.max(Number(props.width ?? 0), 4);
              const barY = Number(props.y ?? 0);
              const barH = Number(props.height ?? 0);
              const label = `${formatTooltipDate(day, month)}: ${baht(total)}${typeof count === "number" ? ` (${count} รายการ)` : ""}`;

              return (
                <g
                  tabIndex={0}
                  role="button"
                  aria-label={label}
                  className="cursor-pointer focus:outline-none"
                  onFocus={() => setFocusedBar({ day, total, count, index: props.index })}
                  onBlur={() => setFocusedBar((cur) => (cur?.day === day ? null : cur))}
                >
                  <rect x={barX} y={hitY} width={barW} height={hitHeight} fill="transparent" />
                  {barH > 0 && (
                    <Rectangle
                      x={props.x}
                      y={barY}
                      width={props.width}
                      height={barH}
                      radius={[4, 4, 0, 0]}
                      fill={fill}
                      fillOpacity={dimmed ? 0.45 : 1}
                      stroke={focusedBar?.day === day ? "var(--color-ink)" : "none"}
                      strokeWidth={focusedBar?.day === day ? 1.5 : 0}
                    />
                  )}
                </g>
              );
            }}
          >
            {data.map((d) => (
              <Cell key={d.day} fill={dayBarFill(d.day, today, activeDay === d.day)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {focusedBar && hoveredDay === null && (
        <div
          className="pointer-events-none absolute top-0 z-20 -translate-x-1/2 -translate-y-2 whitespace-nowrap"
          style={{
            left: `${Math.min(Math.max(((focusedBar.index + 0.5) / Math.max(data.length, 1)) * 100, 16), 84)}%`,
          }}
        >
          <DayTipCard
            day={focusedBar.day}
            total={focusedBar.total}
            count={focusedBar.count}
            isToday={today !== null && focusedBar.day === today}
            month={month}
          />
        </div>
      )}
    </div>
  );
}

function dailySummary(data: { day: number; total: number }[]) {
  const spent = data.filter((d) => d.total > 0);
  if (!spent.length) return "รายจ่ายรายวัน: ยังไม่มี";
  const max = spent.reduce((a, d) => (d.total > a.total ? d : a));
  return `รายจ่ายรายวัน: มีรายจ่าย ${spent.length} วัน มากสุดวันที่ ${max.day} ${baht(max.total)}`;
}
