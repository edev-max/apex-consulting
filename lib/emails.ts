/* Correos a clientes. El cuerpo es un aviso corto con la marca (el documento
   completo va en el PDF adjunto):
   - Presupuesto: "Cargamos el presupuesto Nº X a tu estado de cuenta".
   - Estado de cuenta semanal: recordatorio de lo vencido.

   Gmail y Outlook no entienden flex, grid, sombras ni SVG: todo va en tablas
   con estilos en línea; las sombras duras se hacen con bordes más gruesos abajo
   y a la derecha, y el logo es un PNG incrustado (cid). */

import { BRAND } from "./brand"
import { addDays, dateFmt, dateLong, esc, num, plain, usd } from "./format"
import { budgetTotal } from "./budget-math"
import type { Settings } from "./types"
import { advanceNote, statementTable, type BudgetDoc, type StatementBudgetRow, type StatementRow } from "./reports"

const C = BRAND
const SNOW = "#F3F5FB"
const SNOW2 = "#B9C0D4"
const ROW = "#E4DED2"
const FONT = `'Mona Sans','Segoe UI',Helvetica,Arial,sans-serif`
const WIDE = `'Mona Sans','Arial Black','Helvetica Neue',Arial,sans-serif`

export interface EmailContent {
  subject: string
  html: string
  text: string
}

/** Dónde están las imágenes del logo: rutas de la app (vista previa) o cid (correo enviado) */
export interface EmailAssets {
  logo: string
  logoWhite: string
}

export const PREVIEW_ASSETS: EmailAssets = { logo: "/email/apex-logo.png", logoWhite: "/email/apex-logo-blanco.png" }
export const CID_ASSETS: EmailAssets = { logo: "cid:apex-logo", logoWhite: "cid:apex-logo-blanco" }

/* ---------- Piezas ---------- */

const table = (inner: string, style = "", attrs = "") =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ${attrs} style="border-collapse:collapse;${style}">${inner}</table>`

const tri = `<span style="color:${C.red};font-size:12px">&#9650;</span>`
const spacer = (h: number) => `<div style="height:${h}px;line-height:${h}px;font-size:0">&nbsp;</div>`

const paragraphs = (text: string) =>
  text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px;font:15px/1.6 ${FONT};color:${C.ink2}">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("")

/** Bloque noche con sombra roja: el dato que importa */
function bigBlock(lbl: string, amount: string, lines: string[]) {
  return table(
    `<tr><td style="padding:20px 22px;background:${C.night}">
  <div style="font:600 12px ${FONT};color:${SNOW2}">${lbl}</div>
  <div style="font:900 44px/1.05 ${WIDE};color:${SNOW};letter-spacing:-.02em;margin-top:8px;white-space:nowrap">${amount}</div>
  ${lines.map((l) => `<div style="font:13px/1.5 ${FONT};color:${SNOW2};margin-top:5px">${l}</div>`).join("")}
</td></tr>`,
    `border-top:2px solid ${C.ink};border-left:2px solid ${C.ink};border-right:6px solid ${C.red};border-bottom:6px solid ${C.red}`,
  )
}

/** Tabla de datos clave/valor con borde duro */
function facts(rows: [string, string][]) {
  return table(
    rows
      .map(
        ([k, v], i) => `<tr>
  <td style="padding:9px 12px;${i ? `border-top:1.5px solid ${ROW};` : ""}font:600 12px ${FONT};color:${C.ink2};width:42%">${k}</td>
  <td style="padding:9px 12px;${i ? `border-top:1.5px solid ${ROW};` : ""}font:750 14px ${FONT};color:${C.ink};text-align:right">${v}</td>
</tr>`,
      )
      .join(""),
    `background:#ffffff;border:2px solid ${C.ink};border-right:5px solid ${C.ink};border-bottom:5px solid ${C.ink}`,
  )
}

function payBox(s: Settings) {
  const row = (k: string, v: string) =>
    v
      ? `<tr><td style="padding:3px 0;font:12px ${FONT};color:${C.ink2};width:150px">${k}</td><td style="padding:3px 0;font:750 14px ${FONT};color:${C.ink}">${esc(v)}</td></tr>`
      : ""
  return table(
    `<tr><td style="padding:9px 14px;background:${C.paper};border-bottom:2px solid ${C.ink};font:800 13px ${FONT};color:${C.ink}">Datos de pago</td></tr>
<tr><td style="padding:10px 14px">${table(`${row("Teléfono (pago móvil)", s.payment_phone)}${row("Banco", s.payment_bank)}${row("Número de cuenta", s.payment_account)}${row("Cédula / RIF", s.payment_id_number)}`)}</td></tr>`,
    `background:#ffffff;border:2px solid ${C.ink};border-right:5px solid ${C.ink};border-bottom:5px solid ${C.ink}`,
  )
}

function attachmentNote(file: string) {
  return table(
    `<tr><td style="padding:10px 14px;background:${C.paper};border:2px dashed ${C.ink2};font:13px/1.4 ${FONT};color:${C.ink}">
  <b>Adjunto:</b> ${esc(file)}<br><span style="color:${C.ink2};font-size:12px">El PDF tiene el detalle completo.</span>
</td></tr>`,
  )
}

/** Correo completo: tarjeta blanca de borde grueso sobre papel */
function frame(o: { title: string; kicker: string; hello: string; body: string; a: EmailAssets; s: Settings }) {
  const { a, s } = o
  return `<!doctype html><html lang="es-VE"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><title>${esc(o.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wdth,wght@75..125,300..900&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:${C.paper}">
${table(
  `<tr><td align="center" style="padding:26px 12px">
${table(
  `<tr><td style="padding:20px 26px;border-bottom:4px solid ${C.ink};background:#ffffff">
  ${table(`<tr>
    <td style="vertical-align:middle"><img src="${a.logo}" width="170" height="35" alt="Apex Consulting" style="display:block;border:0;width:170px;height:auto"></td>
    <td style="vertical-align:middle;text-align:right"><span style="display:inline-block;background:${C.ink};color:${C.paper};font:700 12px ${FONT};padding:6px 10px;border-right:4px solid ${C.red};border-bottom:4px solid ${C.red};white-space:nowrap">${tri}&nbsp; ${esc(o.kicker)}</span></td>
  </tr>`)}
</td></tr>
<tr><td style="padding:26px 26px 8px;background:#ffffff">
  <div style="font:900 26px/1.1 ${WIDE};color:${C.ink};letter-spacing:-.025em;margin:0 0 14px">${o.hello}</div>
  ${o.body}
</td></tr>
<tr><td style="padding:18px 26px;background:${C.night};border-top:3px solid ${C.ink}">
  ${table(`<tr>
    <td style="vertical-align:middle"><img src="${a.logoWhite}" width="130" height="27" alt="Apex Consulting" style="display:block;border:0;width:130px;height:auto"></td>
    <td style="vertical-align:middle;text-align:right;font:12px/1.5 ${FONT};color:${SNOW2}">${[s.contact_email, s.payment_phone].filter(Boolean).map(esc).join(" · ")}${s.website ? `<br><b style="color:${SNOW}">${esc(s.website)}</b>` : ""}</td>
  </tr>`)}
</td></tr>`,
  `max-width:600px;background:#ffffff;border:3px solid ${C.ink}`,
  'align="center"',
)}
<div style="max-width:600px;margin:12px auto 0;font:11px/1.5 ${FONT};color:${C.mute};text-align:center">Recibes este correo porque tienes una cuenta con ${esc(s.company_name || "Apex Consulting")}. Para cualquier duda, responde a este mensaje.</div>
</td></tr>`,
  `background:${C.paper}`,
)}
</body></html>`
}

/** Despedida fija al final del correo */
const signOff = `<p style="margin:4px 0 0;font:15px/1.6 ${FONT};color:${C.ink2}">Gracias por tu confianza,<br><b style="color:${C.ink}">Apex Consulting</b></p>`

/* ---------- Presupuesto: aviso de cargo ---------- */

export interface BudgetEmailInput {
  doc: BudgetDoc
  settings: Settings
  message: string
  /** Saldo de la cuenta del cliente contando este cargo */
  accountBalance?: number | null
  /** Nombre del PDF adjunto (para el aviso) */
  pdfName?: string
  assets?: EmailAssets
}

const advanceOfDoc = (doc: BudgetDoc, total: number) => {
  const v = num(doc.advance_value)
  if (!doc.advance_type || v <= 0) return 0
  return doc.advance_type === "percent" ? (total * Math.min(v, 100)) / 100 : Math.min(v, total)
}

export function defaultBudgetMessage(doc: BudgetDoc) {
  const total = budgetTotal(doc.items)
  const adv = advanceOfDoc(doc, total)
  return `Cargamos a tu estado de cuenta el presupuesto Nº ${doc.number} por ${doc.project_name}, por un total de ${usd(total)}.${
    adv > 0 ? ` Para comenzar el trabajo se abona un anticipo de ${usd(adv)} y el resto a la entrega.` : ""
  }

En el PDF adjunto tienes el detalle de lo presupuestado, los términos y los datos de pago.`
}

export function budgetEmail(i: BudgetEmailInput): EmailContent {
  const { doc, settings: s } = i
  const a = i.assets ?? PREVIEW_ASSETS
  const total = budgetTotal(doc.items)
  const adv = advanceOfDoc(doc, total)
  const start = doc.approved_on && doc.approved_on > doc.date ? doc.approved_on : doc.date
  const due = addDays(start, s.due_days)

  const lines = [esc(doc.project_name)]

  const rows: [string, string][] = [
    ["Presupuesto", `Nº ${esc(doc.number)}`],
    ["Proyecto", esc(doc.project_name)],
    ["Fecha", dateFmt(doc.date)],
    adv > 0
      ? [`Anticipo ${doc.advance_type === "percent" ? `${plain(num(doc.advance_value))} %` : ""}`, `<span style="color:${C.amber}">${usd(adv)}</span>`]
      : ["Vence", dateFmt(due)],
  ]
  if (adv > 0) rows.push(["Contra entrega", usd(total - adv)])
  if (i.accountBalance != null && i.accountBalance > total + 0.005) rows.push(["Saldo de tu cuenta con este cargo", `<b>${usd(i.accountBalance)}</b>`])

  const body = `${paragraphs(i.message)}
${spacer(6)}
${bigBlock("Nuevo cargo a tu cuenta", usd(total), lines)}
${spacer(18)}
${facts(rows)}
${spacer(18)}
${payBox(s)}
${spacer(16)}
${i.pdfName ? attachmentNote(i.pdfName) : ""}
${spacer(18)}
${signOff}
${spacer(18)}`

  const subject = `Cargamos el presupuesto Nº ${doc.number} a tu estado de cuenta`
  const text = `Saludos, ${doc.client_name}

${i.message.trim()}

Nuevo cargo: ${usd(total)} · Presupuesto Nº ${doc.number} · ${doc.project_name}${adv > 0 ? `\nAnticipo: ${usd(adv)} · contra entrega: ${usd(total - adv)}` : `\nVence: ${dateFmt(due)}`}

Datos de pago: ${[s.payment_phone, s.payment_bank, s.payment_account, s.payment_id_number].filter(Boolean).join(" · ")}

Gracias por tu confianza,
Apex Consulting`
  return {
    subject,
    html: frame({ title: subject, kicker: `Presupuesto Nº ${doc.number}`, hello: `Saludos, ${esc(doc.client_name)}`, body, a, s }),
    text,
  }
}

/* ---------- Estado de cuenta semanal ---------- */

export interface StatementEmailInput {
  clientName: string
  rows: StatementRow[]
  settings: Settings
  today: string
  message: string
  pdfName?: string
  assets?: EmailAssets
}

export function statementTotals(rows: StatementRow[]) {
  const due = rows.reduce((t, r) => t + r.due, 0)
  const late = rows.reduce((t, r) => t + (r.late ? r.due : 0), 0)
  return { due, late, notLate: due - late }
}

export function defaultStatementMessage(i: { clientName: string; rows: StatementRow[]; today: string }) {
  const { late } = statementTotals(i.rows)
  return `Te enviamos tu estado de cuenta semanal${
    late > 0.005 ? " para recordarte el pago de tus presupuestos vencidos" : ""
  }. Abajo tienes el monto a pagar y en el PDF adjunto el detalle completo al ${dateLong(i.today)}.

Si ya hiciste el pago, responde este correo con la referencia y lo registramos.`
}

/** Línea de detalle de un presupuesto: total, abonado, pendiente y el anticipo si tiene */
const budgetDetail = (x: StatementBudgetRow) => {
  const note = advanceNote(x.standing)
  return [`Total ${usd(x.standing.total)}`, `abonado ${usd(x.standing.paid)}`, `pendiente ${usd(x.standing.pending)}`, note?.text ?? ""]
    .filter(Boolean)
    .join(" · ")
}

/** Una fila por presupuesto: a la derecha lo vencido (o "—") */
function budgetsTable(list: StatementBudgetRow[], late: number, pending: number) {
  const cell = (n: number) => `padding:9px 12px;${n ? `border-top:1.5px solid ${ROW};` : ""}`
  return table(
    `<tr><td colspan="2" style="padding:9px 12px;background:${C.paper};border-bottom:2px solid ${C.ink};font:800 13px ${FONT};color:${C.ink}">Tus presupuestos</td>
<td style="padding:9px 12px;background:${C.paper};border-bottom:2px solid ${C.ink};font:800 12px ${FONT};color:${C.ink2};text-align:right">Vencido</td></tr>
${list
  .map(
    (x, n) => `<tr>
  <td style="${cell(n)}font:800 13px ${FONT};color:${C.ink};white-space:nowrap;width:46px;vertical-align:top">${esc(x.budget.number)}</td>
  <td style="${cell(n)}padding-left:4px;font:13px/1.35 ${FONT};color:${C.ink}">${esc(x.budget.project_name)}<div style="font:11px/1.45 ${FONT};color:${C.ink2};margin-top:2px">${esc(budgetDetail(x))}</div></td>
  <td style="${cell(n)}font:800 14px ${FONT};color:${x.late > 0.005 ? C.amber : C.mute};text-align:right;white-space:nowrap;vertical-align:top">${
    x.late > 0.005
      ? `${usd(x.late)}<div style="font:600 11px ${FONT};color:${C.amber};margin-top:2px">${esc(x.lateConcept ?? "")}${x.lateDays > 0 ? ` · ${x.lateDays} d` : ""}</div>`
      : "—"
  }</td>
</tr>`,
  )
  .join("")}
<tr><td colspan="2" style="padding:10px 12px;border-top:2px solid ${C.ink};background:${C.amberBg};font:800 13px ${FONT};color:${C.ink}">Total vencido</td>
<td style="padding:10px 12px;border-top:2px solid ${C.ink};background:${C.amberBg};font:900 15px ${FONT};color:${C.amber};text-align:right;white-space:nowrap">${usd(late)}</td></tr>
<tr><td colspan="2" style="padding:10px 12px;border-top:1.5px solid ${C.ink};background:${C.paper};font:800 13px ${FONT};color:${C.ink}">Saldo total pendiente</td>
<td style="padding:10px 12px;border-top:1.5px solid ${C.ink};background:${C.paper};font:900 15px ${FONT};color:${C.ink};text-align:right;white-space:nowrap">${usd(pending)}</td></tr>`,
    `background:#ffffff;border:2px solid ${C.ink};border-right:5px solid ${C.ink};border-bottom:5px solid ${C.ink}`,
  )
}

export function statementEmail(i: StatementEmailInput): EmailContent {
  const { settings: s } = i
  const a = i.assets ?? PREVIEW_ASSETS
  const tb = statementTable(i.rows, s.due_days)
  const isLate = tb.late > 0.005
  const amount = isLate ? tb.late : tb.pending
  const lateCount = tb.list.filter((x) => x.late > 0.005).length

  const lines = isLate
    ? [`${lateCount} presupuesto${lateCount === 1 ? "" : "s"} con monto vencido`, `Saldo total pendiente: ${usd(tb.pending)}`]
    : ["Nada vencido"]

  const body = `${paragraphs(i.message)}
${spacer(6)}
${bigBlock(isLate ? "Vencido · a pagar" : "Saldo pendiente", usd(amount), lines)}
${spacer(18)}
${budgetsTable(tb.list, tb.late, tb.pending)}
${spacer(18)}
${payBox(s)}
${spacer(16)}
${i.pdfName ? attachmentNote(i.pdfName) : ""}
${spacer(18)}
${signOff}
${spacer(18)}`

  const subject = isLate
    ? `Tu estado de cuenta semanal · ${usd(amount)} vencido · ${i.clientName}`
    : `Tu estado de cuenta semanal · ${i.clientName}`
  const text = `Saludos, ${i.clientName}

${i.message.trim()}

${tb.list
  .map(
    (x) => `- ${x.budget.number} ${x.budget.project_name}: ${budgetDetail(x)}${x.late > 0.005 ? ` · VENCIDO ${usd(x.late)} (${x.lateConcept ?? ""})` : ""}`,
  )
  .join("\n")}

Total vencido: ${usd(tb.late)}
Saldo total pendiente: ${usd(tb.pending)}

Datos de pago: ${[s.payment_phone, s.payment_bank, s.payment_account, s.payment_id_number].filter(Boolean).join(" · ")}

Gracias por tu confianza,
Apex Consulting`
  return {
    subject,
    html: frame({ title: subject, kicker: "Estado de cuenta semanal", hello: `Saludos, ${esc(i.clientName)}`, body, a, s }),
    text,
  }
}

/** Nombre del PDF adjunto, sin caracteres que rompan el archivo */
export const pdfName = (...parts: string[]) =>
  parts
    .filter(Boolean)
    .join(" - ")
    .replace(/[\\/:*?"<>|\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() + ".pdf"
