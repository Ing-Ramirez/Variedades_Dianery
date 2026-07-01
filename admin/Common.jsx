/* Admin — helpers compartidos: badges de estado, stock, toast global */
const { AdminIcons: AI } = window;
const D = window.DianeryData;

const STATUS_STYLE = {
  "Nuevo":      "blue",
  "Preparando": "amber",
  "Enviado":    "blue",
  "Entregado":  "green",
  "Cancelado":  "red"
};
const ORDER_STATUSES = ["Nuevo", "Preparando", "Enviado", "Entregado", "Cancelado"];

function StatusBadge({ status }) {
  return <span className={"badge " + (STATUS_STYLE[status] || "gray")}><span className="dot" />{status}</span>;
}

function StockCell({ stock }) {
  const t = (D.getConfig() || {}).lowStockThreshold;
  const low = stock <= (t != null ? t : 5);
  return <span className={low ? "stock-low" : "stock-ok"}>{stock} {low && stock > 0 ? "· bajo" : stock === 0 ? "· agotado" : "uds"}</span>;
}

/* Toast global muy simple */
function useToast() {
  const [msg, setMsg] = React.useState(null);
  React.useEffect(() => {
    window.adminToast = (m) => {
      setMsg(m);
      clearTimeout(window.__toastT);
      window.__toastT = setTimeout(() => setMsg(null), 2200);
    };
  }, []);
  return msg;
}

function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast"><AI.check />{msg}</div>;
}

/* Hook: re-render cuando cambian los datos */
function useData() {
  const [, setRev] = React.useState(0);
  React.useEffect(() => {
    const h = () => setRev(r => r + 1);
    window.addEventListener("dianery:change", h);
    return () => window.removeEventListener("dianery:change", h);
  }, []);
  return D;
}

/* Botón "Guardar cambios" (modo explícito). Resaltado cuando hay cambios sin
   enviar al servidor; neutro y deshabilitado cuando todo está guardado. */
function SaveBar() {
  useData(); // re-render cuando cambian datos / estado "sin guardar"
  const pending = D.hasPendingChanges();
  const [saving, setSaving] = React.useState(false);
  const onSave = () => {
    setSaving(true);
    Promise.resolve(D.commit()).then(() => setSaving(false));
  };
  return (
    <button
      className={"btn " + (pending ? "btn-primary" : "btn-ghost")}
      disabled={!pending || saving}
      onClick={onSave}
      title={pending ? "Enviar los cambios al servidor" : "No hay cambios pendientes"}
    >
      <AI.check />{saving ? "Guardando…" : pending ? "Guardar cambios" : "Todo guardado"}
    </button>
  );
}

Object.assign(window, { StatusBadge, StockCell, ORDER_STATUSES, useToast, Toast, useData, SaveBar });
