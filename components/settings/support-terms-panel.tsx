"use client"

import { useEffect, useState } from "react"
import { useData } from "@/hooks/data"
import { Panel, useToast } from "@/components/ui/kit"
import { supportTermsHTML } from "@/lib/reports"
import { DEFAULT_SUPPORT_TERMS, SUPPORT_DAYS, SUPPORT_REVIEW_DAYS } from "@/lib/types"

/** Condiciones del soporte: salen en los presupuestos de proyecto, en el aviso de entrega y en la constancia para firmar */
export function SupportTermsPanel({ className }: { className?: string }) {
  const { settings, saveSettings, supportReady } = useData()
  const toast = useToast()

  const saved = settings.support_terms.trim() || DEFAULT_SUPPORT_TERMS
  const [text, setText] = useState(saved)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => setText(saved), [saved])

  const dirty = text.trim() !== saved.trim()
  const isDefault = text.trim() === DEFAULT_SUPPORT_TERMS

  const save = async () => {
    setError(null)
    setSaving(true)
    const { error } = await saveSettings({ ...settings, support_terms: text })
    setSaving(false)
    if (error) return setError(error)
    toast("Condiciones del soporte guardadas.")
  }

  return (
    <Panel className={className} title="Condiciones del soporte" aside={<span>Presupuestos de proyecto</span>}>
      {!supportReady && (
        <p className="mb-4 border-2 border-amber bg-amber-bg px-3 py-2.5 text-[13.5px] text-ink-2">
          <b className="text-amber">Solo lectura por ahora.</b> Para editarlas hay que aplicar la migración{" "}
          <code className="font-mono text-[12.5px]">scripts/14-presupuestos-de-proyecto-y-soporte.sql</code>.
        </p>
      )}
      <div className="grid gap-4">
        <fieldset disabled={!supportReady} className="disabled:opacity-60">
          <label htmlFor="s-support-terms" className="field-label">
            Texto
          </label>
          <textarea
            id="s-support-terms"
            className="input font-mono text-[13px] leading-relaxed"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="mt-1.5 text-[12.5px] text-ink-2">
            Una línea en blanco separa párrafos · <code className="font-mono">**así**</code> va en negrita ·{" "}
            <code className="font-mono">{"{soporte}"}</code> = días de soporte ({SUPPORT_DAYS}) · <code className="font-mono">{"{revision}"}</code> = días antes
            del cierre para la revisión ({SUPPORT_REVIEW_DAYS}). Sale en el PDF del presupuesto de proyecto, en el correo de entrega y en la constancia
            que firma el cliente.
          </p>
        </fieldset>

        <div>
          <span className="field-label">Así se lee</span>
          <div
            className="border-2 border-ink bg-paper px-4 py-3 text-[13px] leading-relaxed [&_b]:font-bold [&_p+p]:mt-2"
            dangerouslySetInnerHTML={{ __html: supportTermsHTML(text) }}
          />
        </div>

        {error && <p className="border-2 border-amber bg-amber-bg px-3 py-2 text-[13.5px] font-semibold text-amber">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-red" onClick={save} disabled={!supportReady || saving || !dirty}>
            {saving ? "Guardando…" : "Guardar condiciones"}
          </button>
          <button type="button" className="btn-paper" onClick={() => setText(DEFAULT_SUPPORT_TERMS)} disabled={!supportReady || isDefault}>
            Volver al texto original
          </button>
        </div>
      </div>
    </Panel>
  )
}
