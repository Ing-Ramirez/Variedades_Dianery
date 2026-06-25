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
  const low = stock <= 5;
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

Object.assign(window, { StatusBadge, StockCell, ORDER_STATUSES, useToast, Toast, useData });
