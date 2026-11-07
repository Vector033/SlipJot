# FreeLLMAPI model comparison (slips, holdout set)

Run 2026-11-07T13:53:09.811Z. Synthetic, fictional data only; free tiers, so cost is $0 but limits and latency vary by hour.

| model | slips | failed | key fields | amount | date+time | payee≈ | review | silent errors | avg ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| gemini-3.5-flash-lite | 0 | 20 | – | – | – | – | – | – | 0 | – |
| gemini-3.8-flash | 0 | 20 | – | – | – | – | – | – | 0 | – |
| gemma-4-31b | 0 | 20 | – | – | – | – | – | – | 0 | – |
| gemma-4-26b-it | 16 | 4 | 100% | 100% | 100% | 100% | 0% | 0% | 27222 | gemma-4-26b-a4b-it |
| qwen3.8-27b | 5 | 15 | 80% | 100% | 100% | 80% | 0% | 20% | 17870 | qwen/qwen3.8-27b |
