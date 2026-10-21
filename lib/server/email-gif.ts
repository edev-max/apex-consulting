import fs from "node:fs"
import path from "node:path"
import { HERO_CID, withHeroImage, type HeroSpec } from "@/lib/email-hero"
import { localFontCss, usePage } from "./pdf"
import type { OutgoingMail } from "./mail"

/* GIF animado del bloque del monto (ver lib/email-hero.ts). Se dibuja cuadro por
   cuadro en un canvas dentro del mismo Chrome de los PDF y se codifica ahí mismo
   con gifenc: no viajan imágenes entre Chrome y el servidor. Cada cuadro después
   del primero solo guarda lo que cambió (lo demás va transparente), así el GIF
   pesa decenas de KB. Se reproduce una vez y queda quieto en el último cuadro. */

let gifenc: string | null = null
const gifencSource = () => (gifenc ??= fs.readFileSync(path.join(process.cwd(), "node_modules", "gifenc", "dist", "gifenc.js"), "utf8"))

export interface HeroGif {
  gif: Buffer
  width: number
  height: number
}

export async function heroGif(spec: HeroSpec): Promise<HeroGif> {
  return usePage(async (page) => {
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${localFontCss()}</style></head><body></body></html>`, {
      waitUntil: "load",
    })
    await page.addScriptTag({ content: `(function(){var exports={};${gifencSource()}\nwindow.gifenc=exports})();\n${HERO_SCRIPT}` })
    const r = (await page.evaluate((s) => (window as any).renderHero(s), spec as any)) as { b64: string; w: number; h: number }
    return { gif: Buffer.from(r.b64, "base64"), width: r.w, height: r.h }
  })
}

/** Cambia el bloque del monto por el GIF incrustado; si no se puede generar, el correo sigue con el bloque HTML */
export async function attachHeroGif(html: string, hero: HeroSpec | null | undefined, who: string) {
  const none = { html, attachments: [] as OutgoingMail["attachments"], ms: 0 }
  if (!hero) return none
  const t0 = Date.now()
  try {
    const g = await heroGif(hero)
    return {
      html: withHeroImage(html, `cid:${HERO_CID}`, { width: g.width, height: g.height, alt: hero.alt }),
      attachments: [{ filename: "monto.gif", content: g.gif, contentType: "image/gif", cid: HERO_CID }],
      ms: Date.now() - t0,
    }
  } catch (e) {
    console.error(`[${who}] GIF del monto (sale el bloque en HTML)`, e)
    return none
  }
}

/* Lo que corre dentro de Chrome. JavaScript plano, sin plantillas de texto. */
const HERO_SCRIPT = String.raw`
window.renderHero = async function (spec) {
  var G = window.gifenc
  var S = 2, W = 548, FPS = 25
  var C = { night: '#070B17', ink: '#0E1422', red: '#E8380D', snow: '#F3F5FB', snow2: '#B9C0D4', amber: '#F2B65A',
    late: '#E8A33D', rest: '#5B6585', track: '#1B2240', paper: '#F6F1E8', lineGray: '#CFC6B6' }
  var FAM = '"Mona Sans", "Segoe UI", Arial, sans-serif'
  await Promise.all([document.fonts.load('900 44px "Mona Sans"'), document.fonts.load('600 12px "Mona Sans"'), document.fonts.load('400 13px "Mona Sans"')])
  var cv = document.createElement('canvas')
  var ctx = cv.getContext('2d', { willReadFrequently: true })
  function font(weight, size, stretch) {
    ctx.font = weight + ' ' + (stretch ? stretch + ' ' : '') + size + 'px ' + FAM
    if ('fontStretch' in ctx) ctx.fontStretch = stretch || 'normal'
  }
  function spacing(px) { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px' }
  var clamp = function (x) { return Math.max(0, Math.min(1, x)) }
  var prog = function (t, a, b) { return clamp((t - a) / (b - a)) }
  var eOut = function (x) { return 1 - Math.pow(1 - x, 3) }
  var eIO = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2 }
  var eBack = function (x) { var c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2) }

  // ---- medidas (en px del correo; el lienzo va al doble para que se vea nítido)
  var BT = 2, BR = 6, PL = 22, PT = 20, PB = 22
  var X0 = BT + PL, inner = W - BT - BR - PL * 2
  var DOC_W = 92, DOC_H = 112, hasDoc = !!spec.doc
  var textW = hasDoc ? inner - DOC_W - 34 : inner
  var amtSize = 44
  function amtFont() { font(900, amtSize, 'expanded'); spacing(-0.03 * amtSize) }
  amtFont()
  while (ctx.measureText(spec.amount).width > textW && amtSize > 24) { amtSize -= 2; amtFont() }
  var amtW = ctx.measureText(spec.amount).width
  spacing(0)
  var amtH = Math.round(amtSize * 1.05)

  // líneas: si no caben se achica la letra y, si aún no, se recorta con "…"
  var lines = spec.lines.map(function (runs) {
    var size = 13
    function width() { return runs.reduce(function (s, r) { font(r.hl ? 700 : 400, size); return s + ctx.measureText(r.t).width }, 0) }
    while (width() > textW && size > 11) size -= 0.5
    runs = runs.map(function (r) { return { t: r.t, hl: r.hl } })
    while (width() > textW && runs.length) {
      var last = runs[runs.length - 1]
      if (last.t.length > 2) last.t = last.t.slice(0, -2) + '…'
      else runs.pop()
    }
    return { runs: runs, size: size }
  })

  var y = BT + PT
  var yLabel = y; y += 15 + 8
  var yAmt = y; y += amtH + 13
  var yLines = []
  lines.forEach(function (l, i) { if (i) y += 5; yLines.push(y); y += 19.5 })
  var yBar = 0, yLegend = 0
  if (spec.bar) { y += 20; yBar = y; y += 12 + 8; yLegend = y; y += 16 }
  y += PB
  var H = Math.ceil(Math.max(y, hasDoc ? BT + 22 + DOC_H + 5 + 22 : 0)) + BR
  cv.width = W * S; cv.height = H * S

  var DUR = spec.bar ? 1.8 : hasDoc ? 1.3 : 0.9
  var U0 = hasDoc ? 0.55 : 0.15, U1 = U0 + 0.5

  function text(s, x, yy, color, align) {
    ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = 'top'; ctx.fillText(s, x, yy)
  }

  function draw(t) {
    ctx.setTransform(S, 0, 0, S, 0, 0)
    ctx.globalAlpha = 1
    // bordes como en el correo: tinta arriba e izquierda, sombra roja abajo y a la derecha
    ctx.fillStyle = C.red; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W - BR, H - BR)
    ctx.fillStyle = C.night; ctx.fillRect(BT, BT, W - BR - BT, H - BR - BT)

    font(600, 12); text(spec.label, X0, yLabel, C.snow2)
    amtFont(); text(spec.amount, X0, yAmt, C.snow); spacing(0)

    // subrayado rojo a mano, de izquierda a derecha
    var u = eIO(prog(t, U0, U1))
    if (u > 0) {
      var b = yAmt + amtH, w = amtW + 4
      ctx.save()
      ctx.beginPath(); ctx.rect(X0 - 8, b - 14, (w + 16) * u, 32); ctx.clip()
      var c1x = X0 + w * 0.27, c1y = b - 2, m1x = X0 + w * 0.53, m1y = b + 3
      ctx.beginPath(); ctx.moveTo(X0 - 2, b + 4)
      ctx.quadraticCurveTo(c1x, c1y, m1x, m1y)
      ctx.quadraticCurveTo(2 * m1x - c1x, 2 * m1y - c1y, X0 + w - 3, b + 1)
      ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke()
      ctx.restore()
    }

    lines.forEach(function (l, i) {
      var x = X0
      l.runs.forEach(function (r) {
        font(r.hl ? 700 : 400, l.size)
        text(r.t, x, yLines[i] + 3, r.hl ? C.amber : C.snow2)
        x += ctx.measureText(r.t).width
      })
    })

    if (spec.bar) {
      var p = spec.bar.part
      ctx.fillStyle = C.track; ctx.fillRect(X0, yBar, inner, 12)
      var rest = t > 1.15 ? inner * (p + (1 - p) * eOut(prog(t, 1.15, 1.7))) : 0
      var late = inner * p * eOut(prog(t, 0.55, 1.15))
      if (rest > 0) { ctx.fillStyle = C.rest; ctx.fillRect(X0, yBar, rest, 12) }
      if (late > 0) { ctx.fillStyle = C.late; ctx.fillRect(X0, yBar, late, 12) }
      var aL = eOut(prog(t, 0.8, 1.1)), aR = eOut(prog(t, 1.3, 1.6))
      if (aL > 0) {
        ctx.globalAlpha = aL
        font(400, 12); text(spec.bar.left[0] + ' ', X0, yLegend, C.snow2)
        var lw = ctx.measureText(spec.bar.left[0] + ' ').width
        font(750, 12); text(spec.bar.left[1], X0 + lw, yLegend, C.amber)
        ctx.globalAlpha = 1
      }
      if (aR > 0) {
        ctx.globalAlpha = aR
        font(750, 12); text(spec.bar.right[1], X0 + inner, yLegend, C.snow, 'right')
        var vw = ctx.measureText(spec.bar.right[1]).width
        font(400, 12); text(spec.bar.right[0] + ' ', X0 + inner - vw, yLegend, C.snow2, 'right')
        ctx.globalAlpha = 1
      }
    }

    if (hasDoc) {
      // la hoja del presupuesto cae girando y aparece el "+"
      var d = eOut(prog(t, 0.1, 0.65))
      var dx = W - BR - 26 - DOC_W, dy = BT + 22
      ctx.save()
      ctx.beginPath(); ctx.rect(BT, BT, W - BR - BT, H - BR - BT); ctx.clip()
      ctx.translate(dx + DOC_W / 2, dy + DOC_H / 2 - 150 * (1 - d))
      ctx.rotate((-8 * (1 - d) * Math.PI) / 180)
      ctx.translate(-DOC_W / 2, -DOC_H / 2)
      ctx.fillStyle = C.red; ctx.fillRect(5, 5, DOC_W, DOC_H)
      ctx.fillStyle = C.ink; ctx.fillRect(0, 0, DOC_W, DOC_H)
      ctx.fillStyle = C.paper; ctx.fillRect(2, 2, DOC_W - 4, DOC_H - 4)
      font(800, 11, 'semi-expanded'); text(spec.doc, 13, 14, C.ink)
      ctx.fillStyle = C.lineGray
      ;[1, 1, 0.6, 1, 0.6].forEach(function (k, i) { ctx.fillRect(13, 33 + i * 14, (DOC_W - 26) * k, 5) })
      var pl = prog(t, 0.7, 1.0)
      if (pl > 0) {
        var s = eBack(pl)
        ctx.translate(DOC_W - 2, 2); ctx.scale(s, s)
        ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-6, -1.5, 12, 3); ctx.fillRect(-1.5, -6, 3, 12)
      }
      ctx.restore()
    }
  }

  // paleta: la del último cuadro (tiene todos los colores) + un color para "sin cambio"
  draw(DUR)
  var pal = G.quantize(ctx.getImageData(0, 0, cv.width, cv.height).data, 95)
  var T = pal.length
  pal.push([255, 0, 255])

  var n = Math.round(DUR * FPS), frames = [], prev = null
  for (var f = 0; f <= n; f++) {
    draw(f / FPS)
    var idx = G.applyPalette(ctx.getImageData(0, 0, cv.width, cv.height).data, pal)
    if (!prev) { frames.push({ px: idx, delay: 1000 / FPS, first: true }); prev = idx; continue }
    var out = new Uint8Array(idx.length), changed = false
    for (var i = 0; i < idx.length; i++) {
      if (idx[i] === prev[i]) out[i] = T
      else { out[i] = idx[i]; changed = true }
    }
    if (changed) frames.push({ px: out, delay: 1000 / FPS })
    else frames[frames.length - 1].delay += 1000 / FPS
    prev = idx
  }
  var enc = G.GIFEncoder()
  frames.forEach(function (fr) {
    if (fr.first) enc.writeFrame(fr.px, cv.width, cv.height, { palette: pal, delay: Math.round(fr.delay), repeat: -1, dispose: 1 })
    else enc.writeFrame(fr.px, cv.width, cv.height, { delay: Math.round(fr.delay), transparent: true, transparentIndex: T, dispose: 1 })
  })
  enc.finish()
  var bytes = enc.bytes(), bin = ''
  for (var k = 0; k < bytes.length; k += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(k, k + 0x8000))
  return { b64: btoa(bin), w: cv.width, h: cv.height }
}
`
