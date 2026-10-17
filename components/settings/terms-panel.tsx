"use client"

import { useEffect, useState } from "react"
import { useData } from "@/hooks/data"
import { Panel, useToast } from "@/components/ui/kit"
import { termsHTML } from "@/lib/reports"
import { DEFAULT_BUDGET_TERMS } from "@/lib/types"

/** Términos y condiciones que salen en cada presupuesto */
export function TermsPanel({ className }: { className?: string }) {
  const { settings, saveSettings, termsReady } = useData()
  const toast = useToast()

  const saved = settings.budget_terms.trim() || DEFAULT_BUDGET_TERMS
  const [text, setText] = useState(saved)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => setText(saved), [saved])

  const dirty = text.trim() !== saved.trim()
  const isDefault = text.trim() === DEFAULT_BUDGET_TERMS

  const save = async () => {
    setError(null)
    setSaving(true)
    const { error } = await saveSettings({ ...settings, budget_terms: text })
    setSaving(false)
    if (error) return setError(error)
    toast("Términos y condiciones guardados.")
  }

  return (
    <Panel className={className} title="Términos y condiciones" aside={<span>Salen en cada presupuesto</span>}>
      {!termsReady && (
        <p className="mb-4 border-2 border-amber bg-amber-bg px-3 py-2.5 text-[13.5px] text-ink-2">
          <b className="text-amber">Solo lectura por ahora.</b> Para editarlos hay que aplicar la migración{" "}
          <code className="font-mono text-[12.5px]">scripts/13-terminos-del-presupuesto.sql</code>. Los presupuestos usan el texto original.
        </p>
      )}
      <div className="grid gap-4">
        <fieldset disabled={!termsReady} className="disabled:opacity-60">
          <label htmlFor="s-terms" className="field-label">
            Texto
          </label>
          <textarea id="s-terms" className="input font-mono text-[13px] leading-relaxed" rows={8} value={text} onChange={(e) => setText(e.target.value)} />
          <p className="mt-1.5 text-[12.5px] text-ink-2">
            Una línea en blanco separa párrafos · <code className="font-mono">**así**</code> va en negrita ·{" "}
            <code className="font-mono">{"{dias}"}</code> = días para pagar ({settings.due_days}) · <code className="font-mono">{"{anticipo}"}</code> = el
            anticipo de cada presupuesto («el 50 %» o «un anticipo de $ 300,00»)
          </p>
        </fieldset>

        <div>
          <span className="field-label">Así se imprime</span>
          <div
            className="border-2 border-ink bg-paper px-4 py-3 text-[13px] leading-relaxed [&_b]:font-bold [&_p+p]:mt-2"
            dangerouslySetInnerHTML={{ __html: termsHTML(text, { dias: settings.due_days, anticipo: "el 50 %" }) }}
          />
        </div>

        {error && <p className="border-2 border-amber bg-amber-bg px-3 py-2 text-[13.5px] font-semibold text-amber">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-red" onClick={save} disabled={!termsReady || saving || !dirty}>
            {saving ? "Guardando…" : "Guardar términos"}
          </button>
          <button type="button" className="btn-paper" onClick={() => setText(DEFAULT_BUDGET_TERMS)} disabled={!termsReady || isDefault}>
            Volver al texto original
          </button>
        </div>
      </div>
    </Panel>
  )
}
