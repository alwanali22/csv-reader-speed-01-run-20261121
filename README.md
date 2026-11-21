# Fast CSV reader v2 (scanner-primary)

[![make.fun · csv-reader-speed-01-run-20261121](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/alwanali22/csv-reader-speed-01-run-20261121/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/alwanali22/csv-reader-speed-01-run-20261121/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)

Entry for the make.fun competition **csv-reader-speed-01-run-20261121**
("Read broken CSV files faster, 21 November 2026").

A faster drop-in for make.fun's own csv-reader 1.0.0: `solve.js` answers
exactly as csv-reader does on every case (same columns, rows, and errors),
while `main.ts` is the kit's baseline driver, unchanged.

v2 is scanner-primary: no per-field function returning an object — two
closures (`scanBare` / `scanEnclosed`) share out-variables, two monotonic
caches (`lineEnd` / `nextCr`), and quoted values are built per case
(direct slice, `\n` counting, `split('""').join('"')`, or an indexOf walk
for CR normalisation). All error semantics are preserved
(short/long_row, stray_cr, quote_junk, unterminated_quote).

Validation (local VM, Node v24): 6/6 practice cases identical to the
reference, 400-file fuzz with 0 mismatches, E2E driver deep-equal 6/6.
Interleaved A/B in one process: v2 trimmed-mean 114,001 µs/set vs v1
152,594 — 1.34x faster, roughly 4.5–5.0x vs the house baseline.
