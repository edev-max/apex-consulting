import type { DiscountType } from "./budget-math"

export interface BudgetItem {
  id: string
  category: string
  description: string
  quantity: number
  rate: number
  unit: string
  /* Descuento por ítem. Opcionales: los presupuestos anteriores no los traen. */
  discount_type?: DiscountType
  discount_value?: number
}

export type BudgetStatus = "pending" | "paid" | "overdue" | "cancelled"
export type AdvanceType = "percent" | "amount"
export type PaymentStatus = "unpaid" | "partial" | "paid"

export interface Budget {
  id: string
  number: string
  client_name: string
  project_name: string
  project_description: string | null
  total: number
  date: string
  status: BudgetStatus
  items: BudgetItem[]
  paid_amount: number
  payment_status: PaymentStatus
  created_at: string
  updated_at: string
  /** Día en que el cliente lo aprobó; null = por aprobar (no es cuenta por cobrar) */
  approved_on: string | null
  /** Anticipo (prepago): porcentaje del total o monto fijo en USD; null = todo al vencer */
  advance_type: AdvanceType | null
  advance_value: number | null
  /* Presupuesto de proyecto (migración 14): incluye soporte después de la entrega */
  is_project: boolean
  /** Día de la entrega, cuando arranca el soporte; null = todavía no se entrega */
  support_start: string | null
  /** Último día del soporte incluido (por defecto, inicio + SUPPORT_DAYS) */
  support_end: string | null
}

export type Currency = "USD" | "VES"

export interface Payment {
  id: string
  budget_id: string
  /** Lo abonado al presupuesto, en USD */
  amount: number
  payment_date: string
  payment_method: string
  reference_number: string | null
  notes: string | null
  created_at: string
  /* Columnas de la migración 11; pueden no existir todavía */
  currency?: Currency
  amount_ves?: number | null
  exchange_rate?: number | null
}

export interface Settings {
  id?: string
  company_name: string
  payment_phone: string
  payment_bank: string
  /** Número de cuenta bancaria para transferencias (20 dígitos) */
  payment_account: string
  payment_id_number: string
  contact_email: string
  website: string
  due_days: number
  /* Envío automático semanal del estado de cuenta (migración 12) */
  statement_auto: boolean
  /** 0 domingo … 6 sábado */
  statement_weekday: number
  /** Hora de Caracas, 0 a 23 */
  statement_hour: number
  statement_scope: StatementScope
  /** Dirección pública de la app: desde ahí se procesa el envío automático */
  app_url: string
  /** Términos y condiciones del presupuesto (migración 13); vacío = DEFAULT_BUDGET_TERMS */
  budget_terms: string
  /** Términos del soporte de los presupuestos de proyecto (migración 14); vacío = DEFAULT_SUPPORT_TERMS */
  support_terms: string
}

/** A quién le llega el estado de cuenta semanal: solo con vencido o todos con saldo */
export type StatementScope = "late" | "open"

export interface Contact {
  /** Opcional: "Administración", "Jean" */
  name: string
  email: string
}

/** Fila de la tabla clients: sus correos de contacto y si recibe el estado de cuenta semanal */
export interface ClientRecord {
  id: string
  name: string
  email: string
  contacts: Contact[]
  auto_statement: boolean
}

export interface EmailLogEntry {
  id: string
  run_id: string | null
  kind: "statement" | "budget"
  /** manual = desde la app · auto = envío semanal · test = prueba a uno mismo */
  origin: "manual" | "auto" | "test"
  client_name: string
  budget_id: string | null
  recipients: string[]
  subject: string | null
  amount: number | null
  status: "sent" | "error"
  error: string | null
  created_at: string
}

export const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

export interface Profile {
  id?: string
  full_name: string | null
}

export const PAYMENT_METHODS: Record<string, string> = {
  transfer: "Transferencia",
  mobile: "Pago móvil",
  cash: "Efectivo",
  zelle: "Zelle",
  card: "Tarjeta",
  check: "Cheque",
  paypal: "PayPal",
  other: "Otro",
}

export const methodLabel = (m: string) => PAYMENT_METHODS[m] ?? m

/** Valores con los que se imprimían los PDF antes de que fueran editables */
export const DEFAULT_SETTINGS: Settings = {
  company_name: "",
  payment_phone: "04242864675",
  payment_bank: "Banesco",
  payment_account: "01340946350001464332",
  payment_id_number: "V-26682963",
  contact_email: "edwin.dev.21114@gmail.com",
  website: "apexconsulting-it.site",
  due_days: 7,
  statement_auto: false,
  statement_weekday: 1,
  statement_hour: 8,
  statement_scope: "late",
  app_url: "",
  budget_terms: "",
  support_terms: "",
}

/** Términos con los que se imprimía el presupuesto. Una línea en blanco separa
    párrafos; **así** va en negrita; {dias} y {anticipo} se llenan en cada PDF. */
export const DEFAULT_BUDGET_TERMS = `**Modalidad post-pago:** el presupuesto cuenta con {dias} días hábiles para su cancelación a partir de su aprobación. Transcurrido dicho plazo sin recibir el pago, los montos podrán estar sujetos a modificaciones o recargos por retraso.

**Modalidad prepago:** se abona {anticipo} del presupuesto al inicio del trabajo y el resto a su entrega o finalización.`

/** Días de soporte incluidos en un presupuesto de proyecto, desde la entrega */
export const SUPPORT_DAYS = 30
/** Días antes del fin del soporte en que se recomienda la revisión final */
export const SUPPORT_REVIEW_DAYS = 5

/** Términos del soporte de los presupuestos de proyecto: van en su PDF, en el
    aviso de entrega y en la constancia. {soporte} = días de soporte y
    {revision} = días antes del cierre para la revisión. Sin fechas: sirven
    igual antes de la entrega (presupuesto) que después (constancia). */
export const DEFAULT_SUPPORT_TERMS = `A partir de la entrega cuentas con {soporte} días de soporte sin costo adicional, para que el sistema quede funcionando tal como lo acordamos. En ese período atendemos tus dudas de uso, te orientamos en lo que necesites y hacemos los ajustes técnicos sobre lo ya desarrollado, para que funcione según lo convenido.

El soporte incluido cubre el proyecto tal como fue solicitado y entregado. Las **mejoras a un desarrollo ya hecho**, así como cualquier funcionalidad o detalle que **no se haya contemplado al momento de solicitarlo**, constituyen un nuevo requerimiento y **se cobran por separado**, aun dentro del período de soporte.

Te recomendamos que, {revision} días antes de que termine el soporte, revisemos juntos cada parte del proyecto. Así certificamos que todo funciona como debe y, si aparece algún detalle, lo resolvemos todavía dentro del período incluido.

Al concluir los {soporte} días, toda atención relacionada con el proyecto requiere **un plan de horas de soporte o el pago de las horas utilizadas**, sin excepción. Esto aplica a cualquier solicitud, sea cual sea su naturaleza u origen: una consulta o explicación de uso, una revisión técnica o de código, un ajuste, una configuración o una asesoría. Tú eliges la modalidad que mejor te acomode: un paquete de horas o el pago de las horas que uses.

Este esquema nos permite atenderte siempre con la misma dedicación con la que construimos tu proyecto.`
