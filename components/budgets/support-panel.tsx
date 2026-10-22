"use client"

import { useState } from "react"
import { Mail, Printer, RotateCcw } from "lucide-react"
import { useData } from "@/hooks/data"
import { Panel, useToast } from "@/components/ui/kit"
import { SendDialog } from "@/components/email/send-dialog"
import { supportReport } from "@/lib/reports"
import { defaultSupportMessage, pdfName, supportEmail } from "@/lib/emails"
import { printHTML } from "@/lib/print"
import { defaultSupportEnd, supportState, supportWindow } from "@/lib/support"
import { dateFmt, plural, today } from "@/lib/format"
import { SUPPORT_DAYS, type Budget } from "@/lib/types"

/* Soporte de un presupuesto de proyecto: al entregar se registra la fecha (arranca
   el soporte de SUPPORT_DAYS días), se puede ajustar el fin y se envía al cliente
   la constancia de entrega y soporte para que la firme. */
export function SupportPanel({ budget: b }: { budget: Budget }) {
  const { settings, setBudgetSupport, supportReady } = useData()
  const toast = useToast()
  const t = today()
  const w = supportWindow(b)
  const [start, setStart] = useState(b.support_start ?? t)
  const [end, setEnd] = useState(w?.end ?? defaultSupportEnd(b.support_start ?? t))
  const [saving, setSaving] = useState(false)
  const [mailOpen, setMailOpen] = useState(false)

  const filename = pdfName(`Entrega y soporte ${b.number}`, b.project_name)
  const changed = !!w && (start !== w.start || end !== w.end)

  const save = async (next: { start: string | null; end: string | null }, done: string) => {
    setSaving(true)
    const { error } = await setBudgetSupport(b, next)
    setSaving(false)
    if (error) return toast(error, "warn")
    toast(done)
  }

  if (!supportReady) {
    return (
      <Panel title="Soporte del proyecto">
        <p className="text-[13.5px] text-ink-2">Para registrar la entrega y el soporte falta aplicar la migración 14 en la base de datos.</p>
      </Panel>
    )
  }

  const st = w ? supportState(w, t) : null
  const chip =
    !st
      ? { text: "Sin entregar", cls: "tag-ink" }
      : st.state === "vencido"
        ? { text: "Soporte vencido", cls: "tag-warn" }
        : st.state === "revision"
          ? { text: "Toca la revisión", cls: "tag-warn" }
          : st.state === "por-iniciar"
            ? { text: "Por iniciar", cls: "tag-ink" }
            : { text: "Soporte activo", cls: "tag-ok" }

  return (
    <Panel title="Soporte del proyecto" aside={<span className={chip.cls}>{chip.text}</span>}>
      {!w ? (
        <div className="grid gap-3 text-[13.5px]">
          <p className="text-ink-2">
            Incluye <b className="text-ink">{SUPPORT_DAYS} días de soporte</b> desde la entrega. Cuando entregues, registra la fecha: ahí arranca el soporte y puedes
            enviarle al cliente la constancia para firmar.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="field-label">Fecha de entrega</span>
              <input type="date" className="input" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <button
              className="btn-red"
              disabled={saving || !start}
              onClick={() => save({ start, end: defaultSupportEnd(start) }, `Entrega registrada: soporte hasta el ${dateFmt(defaultSupportEnd(start))}.`)}
            >
              Registrar entrega
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 text-[13.5px]">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="field-label">Inicio (entrega)</span>
              <input
                type="date"
                className="input"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value)
                  // el fin acompaña al inicio mientras no se haya cambiado a mano
                  if (end === defaultSupportEnd(start)) setEnd(defaultSupportEnd(e.target.value))
                }}
              />
            </label>
            <label className="block">
              <span className="field-label">Fin del soporte</span>
              <input type="date" className="input" value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </div>
          <p className="text-ink-2">
            {st!.state === "vencido"
              ? `Venció el ${dateFmt(w.end)}: desde entonces la atención va por horas de soporte.`
              : st!.state === "por-iniciar"
                ? `Arranca el ${dateFmt(w.start)}.`
                : `${plural(st!.left, "día", "días")} de soporte · revisión recomendada desde el ${dateFmt(w.review)}.`}
          </p>
          <div className="flex flex-wrap gap-2">
            {changed && (
              <button className="btn-ink btn-sm" disabled={saving || !start || !end} onClick={() => save({ start, end }, "Fechas del soporte guardadas.")}>
                Guardar fechas
              </button>
            )}
            <button className="btn-red btn-sm" disabled={changed} onClick={() => setMailOpen(true)} title={changed ? "Guarda las fechas primero" : undefined}>
              <Mail className="h-4 w-4" />
              Enviar constancia
            </button>
            <button
              className="btn-paper btn-sm"
              disabled={changed}
              onClick={() => printHTML(supportReport(b, settings), filename)}
              title="Para imprimir y firmar en papel"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button
              className="btn-ghost btn-sm"
              disabled={saving}
              onClick={() => save({ start: null, end: null }, "Se quitó la entrega: el proyecto vuelve a estar sin entregar.")}
              title="Si la registraste por error"
            >
              <RotateCcw className="h-4 w-4" />
              Quitar entrega
            </button>
          </div>
        </div>
      )}

      {mailOpen && w && (
        <SendDialog
          open
          onClose={() => setMailOpen(false)}
          title={`Enviar la constancia de entrega y soporte (${b.number})`}
          clientName={b.client_name}
          defaultMessage={defaultSupportMessage(b)}
          payload={{
            build: (message, assets) => supportEmail({ doc: b, settings, message, pdfName: filename, assets }),
            pdfHtml: supportReport(b, settings),
            filename,
            log: { kind: "budget", budgetId: b.id, amount: null },
          }}
        />
      )}
    </Panel>
  )
}
