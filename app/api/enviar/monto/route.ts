import { NextResponse } from "next/server"
import { sessionClient } from "@/lib/server/supabase"
import { heroGif } from "@/lib/server/email-gif"
import { cleanHero } from "@/lib/email-hero"

/* El GIF del bloque del monto para la vista previa del diálogo de envío
   ("Así lo recibe el cliente"): el mismo que sale en el correo. */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(request: Request) {
  const {
    data: { user },
  } = await sessionClient().auth.getUser()
  if (!user) return NextResponse.json({ error: "La sesión venció." }, { status: 401 })

  const hero = cleanHero(await request.json().then((b) => b?.hero, () => null))
  if (!hero) return NextResponse.json({ error: "Datos del monto inválidos." }, { status: 400 })
  try {
    const g = await heroGif(hero)
    return new NextResponse(new Uint8Array(g.gif), {
      headers: { "content-type": "image/gif", "cache-control": "no-store", "x-width": String(g.width), "x-height": String(g.height) },
    })
  } catch (e) {
    console.error("[enviar/monto]", e)
    return NextResponse.json({ error: "No se pudo generar el GIF." }, { status: 500 })
  }
}
