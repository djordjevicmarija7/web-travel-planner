import jsPDF from 'jspdf';

// ── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:      [10,  10,  15],
  surface: [15,  15,  26],
  elevat:  [17,  17,  24],
  border:  [30,  30,  46],
  accent:  [74,  158, 255],
  textPri: [232, 232, 240],
  textSec: [192, 192, 208],
  textMut: [136, 136, 153],
  done:    [34,  197, 94],
  warn:    [245, 158, 11],
  danger:  [239, 68,  68],
  planned: [74,  158, 255],
};

const STATUS_COLORS = {
  planned:   C.planned,
  reserved:  C.warn,
  completed: C.done,
  cancelled: C.danger,
};

/**
 * Generates and downloads a PDF from trip data already available on the front-end.
 * No new API calls needed — pass the trip object directly.
 *
 * @param {object} trip  - The trip object (same shape as TripDto / SharedTripDto.trip)
 */
export function generateTripPdf(trip) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W = 210, H = 297;
  const ML = 18, MR = 18, MT = 18;
  const CW = W - ML - MR;   // content width
  let y = MT;

  // ── Helpers ───────────────────────────────────────────────────────────────

  function rgb(col) { return { r: col[0], g: col[1], b: col[2] }; }

  function setFill(col)   { doc.setFillColor(...col); }
  function setDraw(col)   { doc.setDrawColor(...col); }
  function setTxt(col)    { doc.setTextColor(...col); }
  function setFont(style, size) { doc.setFont('helvetica', style); doc.setFontSize(size); }

  function text(str, x, yPos, opts) { doc.text(str ?? '', x, yPos, opts); }

  function checkPage(needed = 10) {
    if (y + needed > H - 14) {
      doc.addPage();
      // repaint background on new page
      setFill(C.bg);
      doc.rect(0, 0, W, H, 'F');
      y = MT;
    }
  }

  function hline(yPos, col = C.border, lw = 0.3) {
    setDraw(col);
    doc.setLineWidth(lw);
    doc.line(ML, yPos, W - MR, yPos);
  }

  function sectionLabel(label) {
    checkPage(10);
    setFont('bold', 7);
    setTxt(C.textMut);
    text(label, ML, y);
    y += 5;
    hline(y - 1, C.border, 0.2);
    y += 2;
  }

  function filledRect(x, yPos, w, h, col) {
    setFill(col);
    doc.rect(x, yPos, w, h, 'F');
  }

  function multilineText(str, x, yPos, maxW, lineH, col, fontStyle = 'normal', size = 9) {
    setFont(fontStyle, size);
    setTxt(col);
    const lines = doc.splitTextToSize(str || '', maxW);
    doc.text(lines, x, yPos);
    return lines.length * lineH;
  }

  // ── Background ────────────────────────────────────────────────────────────
  setFill(C.bg);
  doc.rect(0, 0, W, H, 'F');

  // ── Header ────────────────────────────────────────────────────────────────
  setFont('bold', 24);
  setTxt(C.accent);
  text(trip.name || 'Trip Report', ML, y);
  y += 8;

  const start = trip.startDate?.slice(0, 10) ?? '';
  const end   = trip.endDate?.slice(0, 10) ?? '';
  setFont('normal', 10);
  setTxt(C.textMut);
  text(`${start}  →  ${end}`, ML, y);
  y += 5;

  hline(y, C.accent, 0.8);
  y += 6;

  // ── Stats row ─────────────────────────────────────────────────────────────
  const stats = [];
  if (trip.budget != null)
    stats.push(['BUDGET', `EUR ${Number(trip.budget).toLocaleString()}`]);
  if (trip.destinations?.length)
    stats.push(['DESTINATIONS', String(trip.destinations.length)]);
  if (trip.activities?.length)
    stats.push(['ACTIVITIES', String(trip.activities.length)]);
  if (trip.expenses?.length) {
    const total = trip.expenses.reduce((s, e) => s + (e.amount || 0), 0);
    stats.push(['SPENT', `EUR ${total.toFixed(2)}`]);
    if (trip.budget != null)
      stats.push(['REMAINING', `EUR ${(trip.budget - total).toFixed(2)}`]);
  }

  if (stats.length) {
    const colW = CW / stats.length;
    const boxH = 14;
    stats.forEach(([label, value], i) => {
      const x = ML + i * colW;
      filledRect(x, y, colW - 1, boxH, C.elevat);
      setFont('normal', 6.5);
      setTxt(C.textMut);
      text(label, x + 4, y + 4.5);
      setFont('bold', 11);
      setTxt(C.textPri);
      text(value, x + 4, y + 10.5);
    });
    y += boxH + 5;
  }

  // ── Description ───────────────────────────────────────────────────────────
  if (trip.description) {
    checkPage(20);
    sectionLabel('DESCRIPTION');
    filledRect(ML, y, CW, 2, C.surface);
    const dh = multilineText(trip.description, ML + 3, y + 5, CW - 6, 4.5, C.textSec, 'normal', 9);
    filledRect(ML, y, CW, dh + 8, C.surface);
    multilineText(trip.description, ML + 3, y + 5, CW - 6, 4.5, C.textSec, 'normal', 9);
    y += dh + 11;
  }

  // ── Notes ─────────────────────────────────────────────────────────────────
  if (trip.notes) {
    checkPage(20);
    sectionLabel('NOTES');
    const nh = multilineText(trip.notes, ML + 3, y + 5, CW - 6, 4.5, C.textSec, 'normal', 9);
    filledRect(ML, y, CW, nh + 8, C.surface);
    multilineText(trip.notes, ML + 3, y + 5, CW - 6, 4.5, C.textSec, 'normal', 9);
    y += nh + 11;
  }

  // ── Destinations ──────────────────────────────────────────────────────────
  if (trip.destinations?.length) {
    checkPage(16);
    sectionLabel('DESTINATIONS');
    for (const dest of trip.destinations) {
      checkPage(18);
      const cardH = 16 + (dest.description ? 6 : 0);
      filledRect(ML, y, CW, cardH, C.surface);
      // left accent bar
      setFill(C.accent);
      doc.rect(ML, y, 2, cardH, 'F');
      // name
      setFont('bold', 11);
      setTxt(C.textPri);
      text(dest.name, ML + 5, y + 6);
      // location
      if (dest.location) {
        setFont('normal', 8);
        setTxt(C.textMut);
        text(`  ${dest.location}`, ML + 5, y + 11);
      }
      // dates
      const dateStr = `${dest.arrivalDate?.slice(0,10) ?? ''} → ${dest.departureDate?.slice(0,10) ?? ''}`;
      setFont('normal', 8);
      setTxt(C.accent);
      doc.text(dateStr, W - MR - 2, y + 6, { align: 'right' });
      // nights
      if (dest.arrivalDate && dest.departureDate) {
        const nights = Math.ceil((new Date(dest.departureDate) - new Date(dest.arrivalDate)) / 86400000);
        if (nights > 0) {
          setFont('normal', 7);
          setTxt(C.textMut);
          doc.text(`${nights} night${nights !== 1 ? 's' : ''}`, W - MR - 2, y + 11, { align: 'right' });
        }
      }
      // optional description
      if (dest.description) {
        setFont('normal', 8);
        setTxt(C.textMut);
        const lines = doc.splitTextToSize(dest.description, CW - 8);
        doc.text(lines[0], ML + 5, y + 17);
      }
      y += cardH + 2;
    }
    y += 4;
  }

  // ── Activities ────────────────────────────────────────────────────────────
  if (trip.activities?.length) {
    checkPage(20);
    sectionLabel('ACTIVITIES');

    // Table header
    const cols = [28, 70, 22, 25];  // col widths
    const xs   = [ML, ML+cols[0], ML+cols[0]+cols[1], ML+cols[0]+cols[1]+cols[2]];
    const rowH = 8;
    filledRect(ML, y, CW, rowH, C.elevat);
    ['DATE', 'ACTIVITY', 'STATUS', 'COST'].forEach((h, i) => {
      setFont('bold', 6.5);
      setTxt(C.textMut);
      text(h, xs[i] + 2, y + 5);
    });
    y += rowH;

    const sorted = [...trip.activities].sort((a, b) =>
      (a.date ?? '').localeCompare(b.date ?? ''));

    sorted.forEach((act, idx) => {
      checkPage(rowH + 2);
      const bg = idx % 2 === 0 ? C.surface : C.elevat;
      filledRect(ML, y, CW, rowH, bg);

      setFont('normal', 7.5);
      setTxt(C.textMut);
      text(act.date?.slice(0, 10) ?? '', xs[0] + 2, y + 5.5);

      setFont('normal', 8.5);
      setTxt(C.textPri);
      const nameLines = doc.splitTextToSize(act.name ?? '', cols[1] - 4);
      text(nameLines[0], xs[1] + 2, y + 5.5);

      const sc = STATUS_COLORS[act.status] ?? C.textMut;
      setFont('bold', 6.5);
      setTxt(sc);
      text((act.status ?? 'planned').toUpperCase(), xs[2] + 2, y + 5.5);

      setFont('normal', 7.5);
      setTxt(C.textSec);
      const costStr = act.estimatedCost != null ? `EUR ${Number(act.estimatedCost).toFixed(2)}` : '—';
      doc.text(costStr, xs[3] + cols[3] - 2, y + 5.5, { align: 'right' });

      y += rowH;
    });
    y += 6;
  }

  // ── Expenses ──────────────────────────────────────────────────────────────
  if (trip.expenses?.length) {
    checkPage(20);
    sectionLabel('EXPENSES');

    const cols = [28, 68, 26, 23];
    const xs   = [ML, ML+cols[0], ML+cols[0]+cols[1], ML+cols[0]+cols[1]+cols[2]];
    const rowH = 8;
    filledRect(ML, y, CW, rowH, C.elevat);
    ['DATE', 'NAME', 'CATEGORY', 'AMOUNT'].forEach((h, i) => {
      setFont('bold', 6.5);
      setTxt(C.textMut);
      text(h, xs[i] + 2, y + 5);
    });
    y += rowH;

    const sortedExp = [...trip.expenses].sort((a, b) =>
      (a.date ?? '').localeCompare(b.date ?? ''));

    let total = 0;
    sortedExp.forEach((exp, idx) => {
      checkPage(rowH + 2);
      const bg = idx % 2 === 0 ? C.surface : C.elevat;
      filledRect(ML, y, CW, rowH, bg);
      total += exp.amount || 0;

      setFont('normal', 7.5); setTxt(C.textMut);
      text(exp.date?.slice(0, 10) ?? '', xs[0] + 2, y + 5.5);

      setFont('normal', 8.5); setTxt(C.textPri);
      const nameLines = doc.splitTextToSize(exp.name ?? '', cols[1] - 4);
      text(nameLines[0], xs[1] + 2, y + 5.5);

      setFont('normal', 7.5); setTxt(C.textSec);
      text((exp.category ?? 'other').charAt(0).toUpperCase() + (exp.category ?? '').slice(1), xs[2] + 2, y + 5.5);

      setFont('bold', 8.5); setTxt(C.textPri);
      doc.text(`EUR ${Number(exp.amount ?? 0).toFixed(2)}`, xs[3] + cols[3] - 2, y + 5.5, { align: 'right' });

      y += rowH;
    });

    // Total row
    checkPage(10);
    filledRect(ML, y, CW, 10, C.elevat);
    setDraw(C.accent); doc.setLineWidth(0.6);
    doc.line(ML, y, W - MR, y);
    setFont('bold', 8); setTxt(C.textSec);
    text('TOTAL SPENT', ML + 4, y + 6.5);
    setFont('bold', 11); setTxt(C.accent);
    doc.text(`EUR ${total.toFixed(2)}`, W - MR - 2, y + 6.5, { align: 'right' });
    y += 10;

    if (trip.budget != null) {
      const rem = trip.budget - total;
      filledRect(ML, y, CW, 8, C.surface);
      setFont('normal', 7.5); setTxt(C.textMut);
      text('REMAINING', ML + 4, y + 5.5);
      setFont('bold', 9); setTxt(rem >= 0 ? C.done : C.danger);
      doc.text(`EUR ${rem.toFixed(2)}`, W - MR - 2, y + 5.5, { align: 'right' });
      y += 8;
    }
    y += 6;
  }

  // ── Checklist ─────────────────────────────────────────────────────────────
  if (trip.checklist?.length) {
    checkPage(16);
    sectionLabel('PACKING LIST');
    const ordered = [
      ...trip.checklist.filter(i => !i.isCompleted),
      ...trip.checklist.filter(i =>  i.isCompleted),
    ];
    for (const item of ordered) {
      checkPage(7);
      const mark  = item.isCompleted ? '[x]' : '[ ]';
      const mc    = item.isCompleted ? C.done    : C.accent;
      const tc    = item.isCompleted ? C.textMut : C.textPri;
      setFont('bold', 8); setTxt(mc);
      text(mark, ML + 1, y);
      setFont('normal', 9); setTxt(tc);
      text(item.name ?? '', ML + 10, y);
      y += 5.5;
    }
    y += 4;
  }

  // ── Footer on every page ──────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    hline(H - 10, C.border, 0.3);
    setFont('normal', 6.5); setTxt(C.textMut);
    doc.text('Generated by Wanderlust', ML, H - 6);
    doc.text(`Page ${p} of ${totalPages}`, W - MR, H - 6, { align: 'right' });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = `trip-${(trip.name || 'report').toLowerCase().replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
}