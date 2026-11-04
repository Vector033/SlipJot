export type BudgetLevel = "ok" | "near" | "over";

export interface BudgetStatus {
  spent: number;
  budget: number;
  ratio: number;
  level: BudgetLevel;
  /** Spending pace projected to the end of the month (linear). */
  projected: number;
}

/** "near" from 80% of the budget, or when the current pace will cross it by month end. */
export function budgetStatus(spent: number, budget: number, dayOfMonth: number, daysInMonth: number): BudgetStatus {
  const ratio = budget > 0 ? spent / budget : 0;
  const projected = dayOfMonth > 0 ? (spent / dayOfMonth) * daysInMonth : spent;
  const level: BudgetLevel = ratio >= 1 ? "over" : ratio >= 0.8 || (dayOfMonth >= 7 && projected > budget * 1.02) ? "near" : "ok";
  return { spent, budget, ratio, level, projected };
}
