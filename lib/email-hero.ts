/* El bloque del monto de los correos (estado de cuenta y presupuesto) puede ir
   como GIF animado: el monto se subraya en rojo, la barra muestra cuánto está
   vencido y, en el presupuesto, entra la hoja con su número. Se genera en el
   servidor al enviar (lib/server/email-gif.ts); si algo falla, el correo sale
   con el mismo bloque en HTML, que va siempre entre las marcas de abajo.

   Los montos se ven completos desde el primer cuadro: el Outlook viejo de
   Windows solo muestra ese cuadro. */

/** Un tramo de texto de una línea; hl = resaltado en ámbar */
export interface HeroRun {
  t: string
  hl?: boolean
}

export interface HeroSpec {
  kind: "statement" | "budget" | "support"
  /** "Vencido · a pagar", "Saldo pendiente", "Nuevo cargo a tu cuenta" */
  label: string
  /** "$ 1.000,00" */
  amount: string
  lines: HeroRun[][]
  /** Barra: qué parte (0 a 1) va en ámbar y la leyenda de cada lado [texto, monto] */
  bar?: { part: number; left: [string, string]; right: [string, string] }
  /** Hoja que entra en el presupuesto: "Nº 0104" */
  doc?: string
  /** Texto alternativo de la imagen (lo leen los lectores de pantalla y quien bloquea imágenes) */
  alt: string
}

/** cid de la imagen incrustada en el correo */
export const HERO_CID = "apex-monto"
/** Ancho del bloque dentro del correo (600 de tarjeta menos 26 + 26 de margen) */
export const HERO_WIDTH = 548

const START = "<!--apex-monto-->"
const END = "<!--/apex-monto-->"

/** Envuelve el bloque HTML del monto para poder cambiarlo por el GIF */
export const heroMarked = (html: string) => `${START}${html}${END}`

const attr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** Cambia el bloque HTML del monto por la imagen (cid en el correo, blob en la vista previa) */
export function withHeroImage(html: string, src: string, img: { width: number; height: number; alt: string }) {
  const a = html.indexOf(START)
  const b = html.indexOf(END)
  if (a < 0 || b < a) return html
  const h = Math.round((img.height * HERO_WIDTH) / img.width)
  const tag = `<img src="${attr(src)}" width="${HERO_WIDTH}" height="${h}" alt="${attr(img.alt)}" style="display:block;border:0;width:100%;max-width:${HERO_WIDTH}px;height:auto">`
  return html.slice(0, a) + tag + html.slice(b + END.length)
}

/** Revisa lo que llega del navegador antes de dibujarlo: solo textos cortos y una proporción */
export function cleanHero(x: any): HeroSpec | null {
  const str = (v: unknown, max: number) => (typeof v === "string" && v.length <= max ? v : null)
  if (!x || typeof x !== "object" || !["statement", "budget", "support"].includes(x.kind)) return null
  const label = str(x.label, 80)
  const amount = str(x.amount, 40)
  const alt = str(x.alt, 400)
  if (!label || !amount || alt === null || !Array.isArray(x.lines) || x.lines.length > 3) return null
  const lines: HeroRun[][] = []
  for (const line of x.lines) {
    if (!Array.isArray(line) || line.length > 6) return null
    const runs: HeroRun[] = []
    for (const r of line) {
      const t = str(r?.t, 160)
      if (t === null) return null
      runs.push({ t, hl: r.hl === true })
    }
    lines.push(runs)
  }
  let bar: HeroSpec["bar"]
  if (x.bar) {
    const part = Number(x.bar.part)
    const pair = (p: any): [string, string] | null => (Array.isArray(p) && str(p[0], 60) !== null && str(p[1], 40) !== null ? [p[0], p[1]] : null)
    const left = pair(x.bar.left)
    const right = pair(x.bar.right)
    if (!Number.isFinite(part) || !left || !right) return null
    bar = { part: Math.min(Math.max(part, 0), 1), left, right }
  }
  const doc = x.doc == null ? undefined : str(x.doc, 30)
  if (doc === null) return null
  return { kind: x.kind, label, amount, lines, bar, doc, alt }
}
