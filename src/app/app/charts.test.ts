import { describe, expect, it } from "vitest";
import { dayTicks } from "./charts";

describe("dayTicks", () => {
  it("uses round baht steps that cover the tallest day", () => {
    expect(dayTicks(0)).toEqual([0, 50]);
    expect(dayTicks(1300)).toEqual([0, 500, 1000, 1500]);
    expect(dayTicks(3800)).toEqual([0, 2000, 4000]);
    expect(dayTicks(250_000)).toEqual([0, 100000, 200000, 300000]);
  });
});
