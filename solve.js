export function run(input) {
  const src = String(input.text);
  const useHeader = input.header === true;
  const n = src.length;
  const errs = [];
  const outRows = [];
  let head = null;
  let wide = -1;
  let pos = 0;
  let ln = 1;

  if (n > 0 && src.charCodeAt(0) === 0xFEFF) pos = 1;

  let recLine = 1;
  let recRow = null;
  let lineEnd = src.indexOf('\n', pos);
  let nextCr = src.indexOf('\r', pos);

  let fv = '';
  let fe = 0;
  let fa = 0;

  function note(code) {
    errs.push({ code: code, line: recLine, row: recRow });
  }

  function scanBare() {
    if (lineEnd !== -1 && lineEnd < pos) lineEnd = src.indexOf('\n', pos);
    if (nextCr !== -1 && nextCr < pos) nextCr = src.indexOf('\r', pos);
    if (pos >= n) {
      fe = 2;
      return;
    }

    const comma = src.indexOf(',', pos);
    let end;

    if (lineEnd === -1) {
      if (comma === -1) {
        end = n;
        fe = 2;
      } else {
        end = comma;
        fe = 0;
      }
    } else if (comma === -1 || lineEnd < comma) {
      end = lineEnd;
      fe = 1;
    } else {
      end = comma;
      fe = 0;
    }

    if (nextCr !== -1 && nextCr < end) {
      if (fe === 1 && nextCr === end - 1 && src.charCodeAt(nextCr + 1) === 10) {
        if (nextCr > pos) {
          const chunk = src.slice(pos, nextCr);
          fv += chunk;
          fa += chunk.length;
        }
        pos = lineEnd + 1;
        ln += 1;
        fe = 1;
        return;
      }

      while (pos < end) {
        if (lineEnd !== -1 && lineEnd < pos) lineEnd = src.indexOf('\n', pos);
        if (nextCr !== -1 && nextCr < pos) nextCr = src.indexOf('\r', pos);

        if (nextCr === -1 || nextCr >= end) {
          const chunk = src.slice(pos, end);
          fv += chunk;
          fa += chunk.length;
          pos = end;
          break;
        }

        if (nextCr > pos) {
          const chunk = src.slice(pos, nextCr);
          fv += chunk;
          fa += chunk.length;
          pos = nextCr;
        }

        if (src.charCodeAt(pos + 1) === 10) {
          ln += 1;
          pos += 2;
          fe = 1;
          return;
        }

        note('stray_cr');
        pos += 1;
      }

      if (pos === n) {
        fe = 2;
        return;
      }

      const ch = src.charCodeAt(pos);
      if (ch === 44) {
        pos += 1;
        fe = 0;
        return;
      }

      pos += 1;
      ln += 1;
      fe = 1;
      return;
    }

    if (end > pos) {
      const chunk = src.slice(pos, end);
      fv += chunk;
      fa += chunk.length;
    }

    pos = end;

    if (fe === 2) return;
    if (fe === 0) {
      pos += 1;
      return;
    }

    pos += 1;
    ln += 1;
  }

  function scanEnclosed() {
    const open = pos;
    const openLine = ln;
    const start = open + 1;

    let search = start;
    let q = src.indexOf('"', search);
    let paired = false;

    while (q !== -1) {
      if (src.charCodeAt(q + 1) === 34) {
        paired = true;
        search = q + 2;
        q = src.indexOf('"', search);
      } else {
        break;
      }
    }

    if (q === -1) {
      pos = open + 1;
      ln = openLine;
      note('unterminated_quote');
      fv = '"';
      fa = 0;
      scanBare();
      return;
    }

    if (lineEnd !== -1 && lineEnd < start) lineEnd = src.indexOf('\n', start);
    if (nextCr !== -1 && nextCr < start) nextCr = src.indexOf('\r', start);

    const hasLf = lineEnd !== -1 && lineEnd < q;
    const hasCr = nextCr !== -1 && nextCr < q;

    let value;

    if (!paired && !hasLf && !hasCr) {
      value = src.slice(start, q);
    } else if (!paired && hasLf && !hasCr) {
      value = src.slice(start, q);
      let p = src.indexOf('\n', start);
      while (p !== -1 && p < q) {
        ln += 1;
        p = src.indexOf('\n', p + 1);
      }
    } else if (paired && !hasLf && !hasCr) {
      value = src.slice(start, q).split('""').join('"');
    } else {
      let out = '';
      let from = start;
      let crNext = hasCr ? nextCr : -1;
      let lfNext = hasLf ? lineEnd : -1;
      let dqNext = paired ? src.indexOf('"', start) : -1;

      if (dqNext >= q) dqNext = -1;

      while (from < q) {
        let at = q;
        let kind = 0;

        if (crNext !== -1 && crNext < at) {
          at = crNext;
          kind = 1;
        }
        if (lfNext !== -1 && lfNext < at) {
          at = lfNext;
          kind = 2;
        }
        if (dqNext !== -1 && dqNext < at) {
          at = dqNext;
          kind = 3;
        }

        if (kind === 0) {
          out += src.slice(from, q);
          break;
        }

        if (at > from) out += src.slice(from, at);

        if (kind === 1) {
          out += '\n';
          ln += 1;

          if (src.charCodeAt(at + 1) === 10) {
            from = at + 2;
            if (hasLf) {
              lfNext = src.indexOf('\n', from);
              if (lfNext >= q) lfNext = -1;
            }
          } else {
            from = at + 1;
          }

          crNext = src.indexOf('\r', from);
          if (crNext >= q) crNext = -1;
        } else if (kind === 2) {
          out += '\n';
          ln += 1;
          from = at + 1;
          lfNext = src.indexOf('\n', from);
          if (lfNext >= q) lfNext = -1;
        } else {
          out += '"';
          from = at + 2;
          dqNext = src.indexOf('"', from);
          if (dqNext >= q) dqNext = -1;
        }
      }

      value = out;
    }

    fv = value;
    pos = q + 1;

    if (pos >= n) {
      fe = 2;
      return;
    }

    const c = src.charCodeAt(pos);

    if (c === 44) {
      pos += 1;
      fe = 0;
      return;
    }

    if (c === 10) {
      pos += 1;
      ln += 1;
      fe = 1;
      return;
    }

    if (c === 13 && src.charCodeAt(pos + 1) === 10) {
      pos += 2;
      ln += 1;
      fe = 1;
      return;
    }

    fa = 0;
    scanBare();

    if (fa > 0) note('quote_junk');
  }

  function finishRow(fields, lastQuoted) {
    if (fields.length === 1 && fields[0] === '' && !lastQuoted) return;

    if (wide < 0) wide = fields.length;

    if (useHeader && head === null) {
      head = fields;
      return;
    }

    if (fields.length < wide) {
      errs.push({
        code: 'short_row',
        line: recLine,
        row: recRow,
        fields: fields.length
      });

      while (fields.length < wide) fields.push('');
    } else if (fields.length > wide) {
      errs.push({
        code: 'long_row',
        line: recLine,
        row: recRow,
        extra: fields.splice(wide)
      });
    }

    outRows.push(fields);
  }

  while (true) {
    while (pos < n) {
      const c = src.charCodeAt(pos);

      if (c === 10) {
        pos += 1;
        ln += 1;
      } else if (c === 13 && src.charCodeAt(pos + 1) === 10) {
        pos += 2;
        ln += 1;
      } else {
        break;
      }
    }

    if (pos >= n) break;

    recLine = ln;
    recRow = useHeader && head === null ? null : outRows.length;

    const fields = [];
    let lastQuoted = false;

    while (true) {
      lastQuoted = src.charCodeAt(pos) === 34;

      if (lastQuoted) {
        scanEnclosed();
      } else {
        fv = '';
        fa = 0;
        scanBare();
      }

      fields.push(fv);

      if (fe !== 0) break;
    }

    finishRow(fields, lastQuoted);
  }

  return {
    columns: useHeader ? (head ?? []) : null,
    rows: outRows,
    errors: errs
  };
}
