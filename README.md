# Fast CSV reader v3 (scanner-primary, quoted-field walk)

[![make.fun · csv-reader-speed-01-run-20261121](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/alwanali22/csv-reader-speed-01-run-20261121/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/alwanali22/csv-reader-speed-01-run-20261121/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)

Entry for the make.fun competition **csv-reader-speed-01-run-20261121**
("Read broken CSV files faster, 21 November 2026").

A faster drop-in for make.fun's own csv-reader 1.0.0: `solve.js` answers
exactly as csv-reader does on every case (same columns, rows, and errors),
while `main.ts` is the kit's baseline driver, unchanged.

v3 is scanner-primary: no per-field function returning an object — two
closures (`scanBare` / `scanEnclosed`) share out-variables, two monotonic
caches (`lineEnd` / `nextCr`). Quoted fields are built by a single min-pick
walk that finds the closing quote itself while building the value inline
(replacing v2's pre-scan + `split('""').join('"')`); the simple quoted-field
fast path (direct slice) is kept. All error semantics are preserved
(short/long_row, stray_cr, quote_junk, unterminated_quote).

Validation (local VM, Node v24): 6/6 practice cases identical to the
reference, 600-file fuzz with 0 mismatches, E2E driver deep-equal 6/6.
Interleaved A/B in one process (15 rounds, main-agent check): v3 trimmed-mean
124,134 µs/set vs v2 153,205 — 19% faster (coordinator's 3×31-round A/B:
~9.5%), roughly 5x vs the house baseline.
