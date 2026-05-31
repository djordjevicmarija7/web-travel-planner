import jsPDF from 'jspdf';

// ── Palette — clean light professional theme ───────────────────────────────
const C = {
  white:    [255, 255, 255],
  bg:       [247, 249, 252],
  surface:  [255, 255, 255],
  border:   [218, 224, 235],
  borderLt: [232, 237, 246],
  navy:     [17,  32,  68],
  navyMid:  [28,  52,  108],
  navyLt:   [42,  74,  145],
  accent:   [56,  125, 243],
  accentDk: [34,  98,  217],
  accentLt: [219, 234, 254],
  textPri:  [14,  22,  40],
  textSec:  [65,  80,  100],
  textMut:  [140, 155, 175],
  done:     [22,  163, 74],
  doneBg:   [220, 252, 231],
  warn:     [202, 138, 4],
  warnBg:   [254, 243, 199],
  danger:   [220, 38,  38],
  dangerBg: [254, 226, 226],
  gold:     [201, 155, 50],
};

const STATUS_COLOR = {
  planned:   C.accent,
  reserved:  C.warn,
  completed: C.done,
  cancelled: C.danger,
};
const STATUS_BG = {
  planned:   C.accentLt,
  reserved:  C.warnBg,
  completed: C.doneBg,
  cancelled: C.dangerBg,
};

const ARROW = ' > ';

export function generateTripPdf(trip) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PW = 210, PH = 297;
  const ML = 18, MR = 18;
  const CW = PW - ML - MR;
  let y = 0;

  const fill = (col) => doc.setFillColor(...col);
  const draw = (col) => doc.setDrawColor(...col);
  const tc   = (col) => doc.setTextColor(...col);
  const lw   = (w)   => doc.setLineWidth(w);
  const fnt  = (style, size) => { doc.setFont('helvetica', style); doc.setFontSize(size); };
  const put  = (str, x, yy, opts) => doc.text(String(str ?? ''), x, yy, opts || {});

  function newPage() {
    doc.addPage();
    fill(C.white); doc.rect(0, 0, PW, PH, 'F');
    y = 18;
  }

  function check(need = 10) {
    if (y + need > PH - 20) newPage();
  }

  function hline(yy, col = C.border, weight = 0.3) {
    draw(col); lw(weight);
    doc.line(ML, yy, PW - MR, yy);
  }

  function roundRect(x, yy, w, h, r, col) {
    fill(col); doc.roundedRect(x, yy, w, h, r, r, 'F');
  }

  function badge(label, x, yy, textCol, bgCol, width = 22) {
    roundRect(x, yy - 3.5, width, 5, 1.5, bgCol);
    fnt('bold', 5.5); tc(textCol);
    put(label, x + width / 2, yy, { align: 'center' });
  }

  function sectionHead(label) {
    check(18);
    y += 10;
    fill(C.accent); doc.rect(ML, y - 5, 3, 7, 'F');
    fnt('bold', 7); tc(C.textMut);
    doc.text(label.toUpperCase(), ML + 6, y);
    y += 2;
    hline(y, C.border, 0.25);
    y += 6;
  }

  // ── Page 1 background ────────────────────────────────────────────────────
  fill(C.white); doc.rect(0, 0, PW, PH, 'F');

  // ── Cover header band ────────────────────────────────────────────────────
  const BAND = 58;
  fill(C.navy);    doc.rect(0, 0, PW, BAND, 'F');
  fill(C.navyMid); doc.rect(0, 0, PW, BAND * 0.55, 'F');
  fill(C.navyLt);  doc.rect(PW - 40, 0, 40, BAND, 'F');
  fill(C.accent);  doc.rect(PW - 42, 0, 2.5, BAND, 'F');

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      fill([255, 255, 255]);
      doc.circle(PW - 35 + i * 6, 8 + j * 12, 0.6, 'F');
    }
  }

  fill(C.accent); doc.roundedRect(ML, 10, 13, 13, 2, 2, 'F');
  fnt('bold', 11); tc(C.navy);
  put('W', ML + 3.2, 19.5);

  fnt('bold', 7); tc([210, 222, 245]);
  put('WANDERLUST', ML + 18, 19.5);

  fill([255, 255, 255]); doc.rect(ML, 27, CW - 42, 0.4, 'F');

  const tripName = String(trip.name || 'Trip Report');
  const nameSize = tripName.length > 36 ? 15 : tripName.length > 22 ? 18 : 22;
  fnt('bold', nameSize); tc(C.white);
  doc.text(doc.splitTextToSize(tripName, CW - 50), ML, 38);

  const start = String(trip.startDate || '').slice(0, 10);
  const end   = String(trip.endDate   || '').slice(0, 10);
  fnt('normal', 8); tc([160, 185, 230]);
  put(`${start}  ${ARROW}  ${end}`, ML, 50);

  fill(C.accent);   doc.rect(0, BAND, PW, 1.8, 'F');
  fill(C.accentDk); doc.rect(0, BAND + 1.8, PW, 0.6, 'F');

  y = BAND + 10;

  // ── Stats strip ───────────────────────────────────────────────────────────
  const checklistData = trip.checklist || trip.checklistItems || [];
  const totalSpent = (trip.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);

  const stats = [];
  if (trip.budget != null)
    stats.push(['BUDGET', `EUR ${Number(trip.budget).toLocaleString()}`, C.accent]);
  if ((trip.destinations || []).length)
    stats.push(['DESTINATIONS', String(trip.destinations.length), C.textSec]);
  if ((trip.activities || []).length)
    stats.push(['ACTIVITIES', String(trip.activities.length), C.textSec]);
  if ((trip.expenses || []).length) {
    stats.push(['SPENT', `EUR ${totalSpent.toFixed(2)}`, C.textSec]);
    if (trip.budget != null) {
      const rem = trip.budget - totalSpent;
      stats.push(['REMAINING', `EUR ${rem.toFixed(2)}`, rem >= 0 ? C.done : C.danger]);
    }
  }
  if (checklistData.length) {
    const done = checklistData.filter(i => i.isCompleted).length;
    stats.push(['PACKED', `${done}/${checklistData.length}`, C.textSec]);
  }

  if (stats.length) {
    const BOX_H = 18;
    const colW  = CW / stats.length;
    stats.forEach(([label, val, valCol], i) => {
      const x = ML + i * colW;
      fill(C.surface); doc.rect(x + 0.8, y, colW - 1.6, BOX_H, 'F');
      draw(C.border); lw(0.25); doc.rect(x + 0.8, y, colW - 1.6, BOX_H, 'S');
      if (i === 0) { fill(C.accent); doc.rect(x + 0.8, y, colW - 1.6, 1.2, 'F'); }
      fnt('normal', 5); tc(C.textMut);
      put(label, x + 4.5, y + 7);
      fnt('bold', 11); tc(valCol);
      put(val, x + 4.5, y + 15);
    });
    y += BOX_H + 10;
  }

  // ── Description ───────────────────────────────────────────────────────────
  if (trip.description) {
    sectionHead('Description');
    check(20);
    const lines = doc.splitTextToSize(String(trip.description), CW - 14);
    const cardH = lines.length * 4.8 + 12;
    fill(C.bg); doc.rect(ML, y, CW, cardH, 'F');
    draw(C.borderLt); lw(0.25); doc.rect(ML, y, CW, cardH, 'S');
    fill(C.accent); doc.rect(ML, y, 2.5, cardH, 'F');
    fnt('normal', 8.5); tc(C.textSec);
    doc.text(lines, ML + 8, y + 7);
    y += cardH + 6;
  }

  // ── Notes ────────────────────────────────────────────────────────────────
  if (trip.notes) {
    sectionHead('Notes');
    check(20);
    const lines = doc.splitTextToSize(String(trip.notes), CW - 14);
    const cardH = lines.length * 4.8 + 12;
    fill(C.bg); doc.rect(ML, y, CW, cardH, 'F');
    draw(C.borderLt); lw(0.25); doc.rect(ML, y, CW, cardH, 'S');
    fill(C.gold); doc.rect(ML, y, 2.5, cardH, 'F');
    fnt('normal', 8.5); tc(C.textSec);
    doc.text(lines, ML + 8, y + 7);
    y += cardH + 6;
  }

  // ── Destinations ─────────────────────────────────────────────────────────
  if ((trip.destinations || []).length) {
    sectionHead('Destinations');
    [...trip.destinations]
      .sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate))
      .forEach((dest, idx) => {
        const descLines = dest.description
          ? doc.splitTextToSize(String(dest.description), CW - 18)
          : [];
        const cardH = 20 + (descLines.length > 0 ? descLines.length * 4.5 + 5 : 0);
        check(cardH + 4);

        fill(C.surface); doc.rect(ML, y, CW, cardH, 'F');
        draw(C.border); lw(0.25); doc.rect(ML, y, CW, cardH, 'S');
        fill(C.accent); doc.rect(ML, y, 3, cardH, 'F');

        fill(C.accentLt); doc.circle(ML + 11, y + 9, 4, 'F');
        fnt('bold', 7); tc(C.accentDk);
        put(String(idx + 1), ML + 11, y + 11.2, { align: 'center' });

        fnt('bold', 11); tc(C.textPri);
        put(dest.name, ML + 19, y + 9);

        if (dest.location) {
          fnt('normal', 7.5); tc(C.textMut);
          put(`  ${dest.location}`, ML + 19, y + 15);
        }

        if (dest.arrivalDate && dest.departureDate) {
          const nights = Math.ceil(
            (new Date(dest.departureDate) - new Date(dest.arrivalDate)) / 86400000
          );
          if (nights > 0) {
            badge(`${nights} night${nights !== 1 ? 's' : ''}`, PW - MR - 26, y + 9, C.accentDk, C.accentLt, 26);
          }
        }

        fnt('normal', 7); tc(C.textMut);
        doc.text(
          `${String(dest.arrivalDate || '').slice(0,10)}  ${ARROW}  ${String(dest.departureDate || '').slice(0,10)}`,
          PW - MR - 3, y + 15.5, { align: 'right' }
        );

        if (descLines.length > 0) {
          fnt('normal', 7.5); tc(C.textMut);
          doc.text(descLines, ML + 19, y + 21);
        }

        y += cardH + 4;
      });
    y += 4;
  }

  // ── Activities ────────────────────────────────────────────────────────────
  if ((trip.activities || []).length) {
    sectionHead('Activities');

    const grouped = {};
    [...trip.activities]
      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
      .forEach((act) => {
        const d = String(act.date || '').slice(0, 10);
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(act);
      });

    Object.keys(grouped).sort().forEach((date) => {
      check(14);
      fill(C.bg); doc.rect(ML, y, CW, 9, 'F');
      fill(C.accent); doc.rect(ML, y, 3, 9, 'F');
      fnt('bold', 7.5); tc(C.textSec);
      put(date, ML + 8, y + 6);
      y += 9;

      grouped[date].forEach((act, rowIdx) => {
        const ROW_H = 10;
        check(ROW_H + 2);
        fill(rowIdx % 2 === 0 ? C.surface : C.bg); doc.rect(ML, y, CW, ROW_H, 'F');
        draw(C.borderLt); lw(0.2); doc.rect(ML, y, CW, ROW_H, 'S');

        fnt('normal', 7); tc(C.textMut);
        put(String(act.time || '').slice(0, 5), ML + 5, y + 6.8);

        fnt('bold', 8.5); tc(C.textPri);
        put(doc.splitTextToSize(String(act.name || ''), CW - 70)[0], ML + 22, y + 6.8);

        badge(
          String(act.status || 'planned').toUpperCase(),
          PW - MR - 47, y + 3.5,
          STATUS_COLOR[act.status] ?? C.textMut,
          STATUS_BG[act.status]    ?? C.bg,
          24
        );

        if (act.estimatedCost != null) {
          fnt('bold', 7.5); tc(C.textSec);
          doc.text(`EUR ${Number(act.estimatedCost).toFixed(2)}`, PW - MR - 2, y + 6.8, { align: 'right' });
        } else {
          fnt('normal', 7); tc(C.textMut);
          doc.text('-', PW - MR - 2, y + 6.8, { align: 'right' });
        }

        y += ROW_H;
      });
      y += 4;
    });
    y += 4;
  }

  // ── Expenses ──────────────────────────────────────────────────────────────
  if ((trip.expenses || []).length) {
    sectionHead('Expenses');

    const cw = [26, CW - 26 - 34 - 35, 34, 35];
    const xs = cw.reduce((acc, w, i) => {
      acc.push(i === 0 ? ML : acc[i - 1] + cw[i - 1]);
      return acc;
    }, []);

    fill(C.navy); doc.rect(ML, y, CW, 8, 'F');
    ['DATE', 'EXPENSE', 'CATEGORY', 'AMOUNT'].forEach((h, i) => {
      fnt('bold', 6); tc([200, 215, 240]);
      const isRight = i === 3;
      put(h, isRight ? xs[i] + cw[i] - 3 : xs[i] + 3, y + 5.5, { align: isRight ? 'right' : 'left' });
    });
    y += 8;

    let total = 0;
    [...trip.expenses]
      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
      .forEach((exp, idx) => {
        const ROW_H = 9;
        check(ROW_H + 2);
        fill(idx % 2 === 0 ? C.surface : C.bg); doc.rect(ML, y, CW, ROW_H, 'F');
        draw(C.borderLt); lw(0.2); doc.rect(ML, y, CW, ROW_H, 'S');
        total += exp.amount || 0;

        fnt('normal', 7); tc(C.textMut);
        put(String(exp.date || '').slice(0, 10), xs[0] + 3, y + 6);

        fnt('normal', 8.5); tc(C.textPri);
        put(doc.splitTextToSize(String(exp.name || ''), cw[1] - 6)[0], xs[1] + 3, y + 6);

        fnt('normal', 7); tc(C.textSec);
        const cat = String(exp.category || 'other');
        put(cat.charAt(0).toUpperCase() + cat.slice(1), xs[2] + 3, y + 6);

        fnt('bold', 8.5); tc(C.textPri);
        doc.text(`EUR ${Number(exp.amount || 0).toFixed(2)}`, xs[3] + cw[3] - 3, y + 6, { align: 'right' });

        y += ROW_H;
      });

    check(16);
    fill(C.navy); doc.rect(ML, y, CW, 12, 'F');
    fnt('normal', 6.5); tc([180, 195, 225]);
    put('TOTAL SPENT', ML + 5, y + 8);
    fnt('bold', 12); tc(C.white);
    doc.text(`EUR ${total.toFixed(2)}`, PW - MR - 4, y + 8.5, { align: 'right' });
    y += 12;

    if (trip.budget != null) {
      const rem = trip.budget - total;
      check(10);
      fill(rem >= 0 ? C.doneBg : C.dangerBg); doc.rect(ML, y, CW, 9, 'F');
      draw(rem >= 0 ? C.done : C.danger); lw(0.3); doc.rect(ML, y, CW, 9, 'S');
      fnt('normal', 6.5); tc(C.textMut);
      put(rem >= 0 ? 'REMAINING BUDGET' : 'OVER BUDGET', ML + 5, y + 6);
      fnt('bold', 9); tc(rem >= 0 ? C.done : C.danger);
      doc.text(`EUR ${Math.abs(rem).toFixed(2)}`, PW - MR - 4, y + 6, { align: 'right' });
      y += 9;

      if (trip.budget > 0) {
        check(10);
        y += 4;
        const pct = Math.min(total / trip.budget, 1);
        fill(C.borderLt); doc.rect(ML, y, CW, 4, 'F');
        fill(rem >= 0 ? C.done : C.danger); doc.rect(ML, y, CW * pct, 4, 'F');
        fnt('normal', 5.5); tc(C.textMut);
        put(`${(pct * 100).toFixed(1)}% of budget used`, ML, y + 9);
        y += 12;
      }
    }
    y += 6;
  }

  // ── Packing list ──────────────────────────────────────────────────────────
  if (checklistData.length) {
    sectionHead('Packing List');

    const done = checklistData.filter(i => i.isCompleted).length;
    const pct  = checklistData.length > 0 ? done / checklistData.length : 0;

    check(18);
    fnt('bold', 8); tc(pct >= 1 ? C.done : C.textSec);
    put(
      done === checklistData.length
        ? `All ${checklistData.length} items packed!`
        : `${done} of ${checklistData.length} items packed`,
      ML, y + 4
    );
    y += 7;

    fill(C.borderLt); doc.rect(ML, y, CW, 3.5, 'F');
    if (pct > 0) {
      fill(pct >= 1 ? C.done : C.accent);
      doc.rect(ML, y, CW * pct, 3.5, 'F');
    }
    y += 9;

    const COLS = 3;
    const colW2 = (CW - (COLS - 1) * 5) / COLS;
    const ordered = [
      ...checklistData.filter(i => !i.isCompleted),
      ...checklistData.filter(i =>  i.isCompleted),
    ];
    let col = 0;
    let rowStartY = y;

    ordered.forEach((item) => {
      if (col === 0) { check(8); rowStartY = y; }
      const x = ML + col * (colW2 + 5);
      const isChecked = !!item.isCompleted;

      if (isChecked) {
        fill(C.done); doc.roundedRect(x, rowStartY - 3.5, 4.5, 4.5, 0.8, 0.8, 'F');
        draw(C.done); lw(0.9);
        doc.line(x + 0.8, rowStartY - 1.3, x + 2, rowStartY - 0.2);
        doc.line(x + 2, rowStartY - 0.2, x + 4.1, rowStartY - 3.2);
      } else {
        draw(C.border); lw(0.5);
        doc.roundedRect(x, rowStartY - 3.5, 4.5, 4.5, 0.8, 0.8, 'S');
      }

      fnt('normal', 7.5);
      tc(isChecked ? C.textMut : C.textPri);
      put(doc.splitTextToSize(String(item.title ?? item.name ?? ''), colW2 - 8)[0], x + 7, rowStartY);

      col++;
      if (col >= COLS) { col = 0; y = rowStartY + 7.5; }
    });
    if (col !== 0) y = rowStartY + 7.5;
    y += 6;
  }

  // ── Footer on every page ──────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    fill(C.navy); doc.rect(0, PH - 12, PW, 12, 'F');
    fill(C.accent); doc.rect(0, PH - 12, PW, 1, 'F');
    fnt('normal', 5.5); tc([170, 190, 230]);
    doc.text('Wanderlust Travel Planner', ML, PH - 4.5);
    doc.text(String(trip.name ?? ''), PW / 2, PH - 4.5, { align: 'center' });
    doc.text(`${p} / ${totalPages}`, PW - MR, PH - 4.5, { align: 'right' });
  }

  const filename = `${String(trip.name || 'trip').toLowerCase().replace(/\s+/g, '-')}-report.pdf`;
  doc.save(filename);
}