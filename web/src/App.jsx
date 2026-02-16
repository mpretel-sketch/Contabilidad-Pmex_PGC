import { Fragment, useEffect, useMemo, useState } from "react";

const TABS = [
  { key: "partidas", label: "Partidas (detalle)" },
  { key: "mapping", label: "Mapeo" },
  { key: "balance", label: "Balance" },
  { key: "pnl", label: "P&G" },
  { key: "control", label: "Control" }
];

const GROUP_OPTIONS = [
  "Sin clasificar",
  "Activo No Corriente",
  "Activo Corriente",
  "Patrimonio Neto",
  "Pasivo No Corriente",
  "Pasivo Corriente",
  "Ingresos",
  "Ingresos Financieros",
  "Gastos",
  "Gastos Financieros"
];

const SUBGROUP_OPTIONS = [
  "Sin clasificar",
  "Efectivo y equivalentes",
  "Deudores comerciales",
  "Otros deudores",
  "Periodificaciones",
  "Administraciones Publicas",
  "Inmovilizado material",
  "Amortizacion acumulada",
  "Inversiones financieras LP",
  "Acreedores comerciales",
  "Otros acreedores",
  "Deudas empresas grupo CP",
  "Otros pasivos",
  "Deudas a LP",
  "Fondos propios",
  "Importe neto cifra negocios",
  "Otros ingresos de explotacion",
  "Gastos de personal",
  "Servicios exteriores",
  "Tributos",
  "Amortizaciones",
  "Gastos excepcionales",
  "Resultado financiero",
  "Otros resultados"
];

const MONTHS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" }
];

const NUMERIC_FIELDS = ["sid", "sia", "cargos", "abonos", "sfd", "sfa"];

const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const fmtEur = (n) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const toDisplay = (value, showEur) => (showEur ? fmtEur(value) : fmt(value));

const rowFromAny = (row, index = 0) => ({
  _rowId: String(row._rowId || row.rowId || row.id || `row-${index + 1}`),
  _isNew: Boolean(row._isNew),
  _excludeFromAnalysis: Boolean(row._excludeFromAnalysis),
  code: String(row.code || ""),
  name: String(row.name || ""),
  sid: Number(row.sid || 0),
  sia: Number(row.sia || 0),
  cargos: Number(row.cargos || 0),
  abonos: Number(row.abonos || 0),
  sfd: Number(row.sfd || 0),
  sfa: Number(row.sfa || 0)
});

const parseNum = (value) => {
  const n = Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
};

async function api(path, options = {}) {
  const response = await fetch(path, options);
  if (!response.ok) {
    const maybeJson = await response.json().catch(() => ({}));
    throw new Error(maybeJson.error || "Error en la peticion");
  }
  return response;
}

export default function App() {
  const now = new Date();
  const [tab, setTab] = useState("partidas");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exchangeRate, setExchangeRate] = useState(0.046);
  const [showEur, setShowEur] = useState(false);
  const [conversion, setConversion] = useState(null);
  const [sourceRows, setSourceRows] = useState([]);
  const [manualMappings, setManualMappings] = useState({});
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("Todos");
  const [expanded, setExpanded] = useState("");
  const [mappingMeta, setMappingMeta] = useState(null);
  const [detailSearch, setDetailSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [periodMonth, setPeriodMonth] = useState(() => Number(localStorage.getItem("pmex_period_month")) || now.getMonth() + 1);
  const [periodYear, setPeriodYear] = useState(() => Number(localStorage.getItem("pmex_period_year")) || now.getFullYear());
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    localStorage.setItem("pmex_period_month", String(periodMonth));
    localStorage.setItem("pmex_period_year", String(periodYear));
  }, [periodMonth, periodYear]);

  const refreshPeriods = async () => {
    const response = await api("/api/periods");
    const payload = await response.json();
    setPeriods(payload.periods || []);
  };

  const hydrateState = (payload) => {
    const rows = (payload.sourceRows || payload.convertedData || []).map(rowFromAny);
    setSourceRows(rows);
    setManualMappings(payload.manualMappings || {});
    setExchangeRate(Number(payload.metadata?.exchangeRate || payload.storage?.exchangeRate || 0.046));
    setConversion(payload);
    setExpanded("");
    setSearch("");
    setDetailSearch("");
    setGroupFilter("Todos");
  };

  const loadPeriod = async (month = periodMonth, year = periodYear) => {
    setLoading(true);
    setError("");
    try {
      const response = await api(`/api/periods/${year}/${month}`);
      const payload = await response.json();
      hydrateState(payload);
    } catch (e) {
      if (String(e.message || "").includes("No existe informacion")) {
        setConversion(null);
        setSourceRows([]);
        setManualMappings({});
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      setError("");
      try {
        const [metaRes] = await Promise.all([api("/api/mapping/meta").then((r) => r.json())]);
        setMappingMeta(metaRes);
        await refreshPeriods();
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const savePeriod = async () => {
    if (!sourceRows.length) {
      setError("No hay lineas para guardar.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api("/api/periods/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: sourceRows,
          manualMappings,
          exchangeRate,
          period: { month: periodMonth, year: periodYear }
        })
      });
      const payload = await response.json();
      hydrateState(payload);
      await refreshPeriods();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("exchangeRate", String(exchangeRate));
    formData.append("month", String(periodMonth));
    formData.append("year", String(periodYear));

    setLoading(true);
    setError("");
    try {
      const response = await api("/api/periods/upload", { method: "POST", body: formData });
      const payload = await response.json();
      hydrateState(payload);
      await refreshPeriods();
      setTab("partidas");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onExport = async () => {
    if (!sourceRows.length) return;
    setLoading(true);
    setError("");
    try {
      const response = await api("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: sourceRows,
          manualMappings,
          exchangeRate,
          period: { month: periodMonth, year: periodYear }
        })
      });
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `conversion_nif_a_pgc_${periodYear}-${String(periodMonth).padStart(2, "0")}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (rowId, field, value) => {
    setSourceRows((rows) =>
      rows.map((row) => {
        if (row._rowId !== rowId) return row;
        const next = { ...row };
        next[field] = NUMERIC_FIELDS.includes(field) ? parseNum(value) : value;
        return next;
      })
    );
  };

  const removeRow = (rowId) => {
    setSourceRows((rows) => rows.filter((row) => row._rowId !== rowId));
    setManualMappings((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const addRow = () => {
    const rowId = `manual-${Date.now()}`;
    setSourceRows((rows) => [
      {
        _rowId: rowId,
        _isNew: true,
        _excludeFromAnalysis: false,
        code: "",
        name: "",
        sid: 0,
        sia: 0,
        cargos: 0,
        abonos: 0,
        sfd: 0,
        sfa: 0
      },
      ...rows
    ]);
  };

  const updateManualMapping = (rowId, field, value) => {
    setManualMappings((prev) => {
      const base = prev[rowId] || { pgc: "", pgcName: "", grupo: "Sin clasificar", subgrupo: "Sin clasificar" };
      return { ...prev, [rowId]: { ...base, [field]: value } };
    });
  };

  const clearManualMapping = (rowId) => {
    setManualMappings((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const groups = useMemo(() => {
    if (!conversion?.pgcAggregated) return ["Todos"];
    return ["Todos", ...new Set(conversion.pgcAggregated.map((item) => item.grupo))];
  }, [conversion]);

  const filtered = useMemo(() => {
    if (!conversion?.pgcAggregated) return [];
    const query = search.trim().toLowerCase();

    return conversion.pgcAggregated.filter((item) => {
      if (groupFilter !== "Todos" && item.grupo !== groupFilter) return false;
      if (!query) return true;
      const inHeader = item.pgcCode.toLowerCase().includes(query) || item.pgcName.toLowerCase().includes(query);
      const inDetails = item.details.some((d) => d.code.toLowerCase().includes(query) || d.name.toLowerCase().includes(query));
      return inHeader || inDetails;
    });
  }, [conversion, groupFilter, search]);

  const filteredRows = useMemo(() => {
    const q = detailSearch.trim().toLowerCase();
    return sourceRows.filter((row) => row.code.toLowerCase().includes(q) || row.name.toLowerCase().includes(q));
  }, [sourceRows, detailSearch]);

  const convertedByRowId = useMemo(() => {
    const map = new Map();
    (conversion?.convertedData || []).forEach((row) => map.set(row._rowId, row));
    return map;
  }, [conversion]);

  const filteredRowsByStatus = useMemo(() => {
    return filteredRows.filter((row) => {
      const c = convertedByRowId.get(row._rowId);
      const isSummary = Boolean(c?.isSummaryLine);
      const isMapped = Boolean(c && c.pgcCode !== "SIN MAPEO");
      if (statusFilter === "sumatorias") return isSummary;
      if (statusFilter === "mapeadas") return !isSummary && isMapped;
      if (statusFilter === "sin-mapear") return !isSummary && !isMapped;
      return true;
    });
  }, [filteredRows, convertedByRowId, statusFilter]);

  const coverageClass = (coverage = 0) => {
    if (coverage >= 95) return "ok";
    if (coverage >= 80) return "warn";
    return "bad";
  };

  const checks = useMemo(() => {
    const unmapped = conversion?.metadata?.unmappedCount || 0;
    const analyzed = conversion?.metadata?.analyzedRowCount || 0;
    const trialDiff = Math.abs(conversion?.validations?.trialBalanceFinalDifference || 0);
    const canSave = conversion && sourceRows.length > 0 && analyzed > 0 && unmapped === 0 && trialDiff <= 0.01;
    return { unmapped, analyzed, trialDiff, canSave };
  }, [conversion, sourceRows]);

  const balanceRightWithAdjustment = useMemo(() => {
    if (!conversion) return 0;
    return showEur
      ? conversion.balanceSheet.adjustedTotalPasivoPNEUR
      : conversion.balanceSheet.adjustedTotalPasivoPNMXN;
  }, [conversion, showEur]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>NIF Mexico a PGC Espana</h1>
          <p>Carga mensual en BBDD, sobreescritura por periodo y detalle completo</p>
        </div>
        <div className="header-actions">
          <div className="period-control">
            <span>Periodo</span>
            <select value={periodMonth} onChange={(e) => setPeriodMonth(Number(e.target.value))}>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <input type="number" min="2000" max="2100" value={periodYear} onChange={(e) => setPeriodYear(Number(e.target.value) || now.getFullYear())} />
            <button type="button" className="btn subtle" onClick={() => loadPeriod(periodMonth, periodYear)}>Cargar periodo</button>
          </div>
          <label className="file-input">
            Subir y sobrescribir periodo
            <input type="file" accept=".xlsx,.xls,.csv" onChange={onUpload} />
          </label>
          <div className="rate-control">
            <span>TC MXN/EUR</span>
            <input type="number" step="0.001" value={exchangeRate} onChange={(e) => setExchangeRate(Number.parseFloat(e.target.value) || 0.046)} />
          </div>
          <button type="button" className="btn subtle" onClick={() => setShowEur((s) => !s)}>{showEur ? "EUR" : "MXN"}</button>
          <button type="button" className="btn" onClick={savePeriod} disabled={!checks.canSave}>
            Guardar periodo
          </button>
          <button type="button" className="btn" onClick={onExport}>Exportar XLSX</button>
        </div>
      </header>

      {error && <div className="alert bad">{error}</div>}
      {loading && <div className="alert">Procesando...</div>}

      <nav className="tabs">
        {TABS.map((item) => (
          <button type="button" key={item.key} className={tab === item.key ? "tab active" : "tab"} onClick={() => setTab(item.key)}>
            {item.label}
          </button>
        ))}
      </nav>

      <main className="content">
        <section className="cards">
          <article className="card"><span className="label">Lineas archivo</span><strong>{conversion?.metadata?.rowCount || sourceRows.length}</strong></article>
          <article className="card"><span className="label">Lineas analizadas</span><strong>{conversion?.metadata?.analyzedRowCount || 0}</strong></article>
          <article className="card"><span className="label">Sumatorias excluidas</span><strong>{conversion?.metadata?.summaryExcludedCount || 0}</strong></article>
            <article className="card"><span className="label">Cobertura mapeo</span><strong className={coverageClass(conversion?.metadata?.mappedCoveragePct || 0)}>{fmt(conversion?.metadata?.mappedCoveragePct || 0)}%</strong></article>
          </section>
        {conversion && (
          <section className="panel">
            <h3>Estado de validacion para guardar</h3>
            <p>Lineas analizadas: <strong>{checks.analyzed}</strong></p>
            <p>Sin mapear: <strong>{checks.unmapped}</strong></p>
            <p>Dif. balanza final: <strong>{fmt(conversion.validations.trialBalanceFinalDifference)}</strong></p>
            <p>Dif. balance PGC: <strong>{fmt(conversion.balanceSheet.differenceMXN)}</strong></p>
            <p><strong>{checks.canSave ? "Listo para guardar en BBDD" : "No se puede guardar hasta dejar sin mapear=0 y balanza final cuadrada"}</strong></p>
          </section>
        )}

        <section className="panel">
          <h3>Periodos guardados</h3>
          <div className="period-list">
            {periods.length === 0 && <span className="muted-inline">Sin periodos guardados todavia.</span>}
            {periods.map((p) => (
              <button key={p.period_key} type="button" className="mini-btn" onClick={() => { setPeriodMonth(Number(p.month)); setPeriodYear(Number(p.year)); loadPeriod(Number(p.month), Number(p.year)); }}>
                {String(p.month).padStart(2, "0")}/{p.year} · {p.row_count} lineas
              </button>
            ))}
          </div>
        </section>

        {conversion && tab === "partidas" && (
          <section>
            <div className="partidas-toolbar">
              <button type="button" className="btn subtle" onClick={addRow}>Anadir partida</button>
              <button type="button" className="btn" onClick={savePeriod}>Guardar y recalcular</button>
            </div>
            <div className="controls">
              <input type="text" placeholder="Buscar partida por cuenta o descripcion" value={detailSearch} onChange={(e) => setDetailSearch(e.target.value)} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="todos">Todos los estados</option>
                <option value="sin-mapear">Sin mapear</option>
                <option value="mapeadas">Mapeadas</option>
                <option value="sumatorias">Sumatorias excluidas</option>
              </select>
            </div>
            <div className="table-wrap">
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Cuenta MX</th><th>Descripcion</th><th className="right">SID</th><th className="right">SIA</th><th className="right">Cargos</th><th className="right">Abonos</th>
                    <th className="right">Suma Debe</th><th className="right">Suma Haber</th><th className="right">SFD</th><th className="right">SFA</th><th className="right">Saldo Neto</th>
                    <th>Estado</th><th>PGC asignado</th><th>Nombre asignado</th><th>PGC</th><th>Nombre PGC</th><th>Grupo</th><th>Subgrupo</th><th className="right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRowsByStatus.map((row) => {
                    const manual = manualMappings[row._rowId] || { pgc: "", pgcName: "", grupo: "Sin clasificar", subgrupo: "Sin clasificar" };
                    const converted = convertedByRowId.get(row._rowId);
                    const isSummary = Boolean(converted?.isSummaryLine);
                    const isMapped = Boolean(converted && converted.pgcCode !== "SIN MAPEO");
                    const sumaDebe = Number(row.sid || 0) + Number(row.cargos || 0);
                    const sumaHaber = Number(row.sia || 0) + Number(row.abonos || 0);
                    const saldoNeto = Number(row.sfd || 0) - Number(row.sfa || 0);
                    return (
                      <tr key={row._rowId} className={isSummary ? "summary-row" : isMapped ? "mapped-row" : "unmapped-row"}>
                        <td><input value={row.code} onChange={(e) => updateRow(row._rowId, "code", e.target.value)} className="cell-input" /></td>
                        <td><input value={row.name} onChange={(e) => updateRow(row._rowId, "name", e.target.value)} className="cell-input" /></td>
                        <td className="right"><input value={row.sid} onChange={(e) => updateRow(row._rowId, "sid", e.target.value)} className="cell-input num" /></td>
                        <td className="right"><input value={row.sia} onChange={(e) => updateRow(row._rowId, "sia", e.target.value)} className="cell-input num" /></td>
                        <td className="right"><input value={row.cargos} onChange={(e) => updateRow(row._rowId, "cargos", e.target.value)} className="cell-input num" /></td>
                        <td className="right"><input value={row.abonos} onChange={(e) => updateRow(row._rowId, "abonos", e.target.value)} className="cell-input num" /></td>
                        <td className="right">{fmt(sumaDebe)}</td>
                        <td className="right">{fmt(sumaHaber)}</td>
                        <td className="right"><input value={row.sfd} onChange={(e) => updateRow(row._rowId, "sfd", e.target.value)} className="cell-input num" /></td>
                        <td className="right"><input value={row.sfa} onChange={(e) => updateRow(row._rowId, "sfa", e.target.value)} className="cell-input num" /></td>
                        <td className="right">{fmt(saldoNeto)}</td>
                        <td><span className={isSummary ? "badge badge-warn" : isMapped ? "badge badge-ok" : "badge badge-bad"}>{isSummary ? "Sumatoria excluida" : isMapped ? "Mapeada" : "Sin mapear"}</span></td>
                        <td>{converted?.pgcCode || "SIN MAPEO"}</td>
                        <td>{converted?.pgcName || "Sin equivalencia PGC"}</td>
                        <td><input value={manual.pgc} onChange={(e) => updateManualMapping(row._rowId, "pgc", e.target.value)} className="cell-input" /></td>
                        <td><input value={manual.pgcName} onChange={(e) => updateManualMapping(row._rowId, "pgcName", e.target.value)} className="cell-input" /></td>
                        <td><select value={manual.grupo} onChange={(e) => updateManualMapping(row._rowId, "grupo", e.target.value)} className="cell-select">{GROUP_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></td>
                        <td><select value={manual.subgrupo} onChange={(e) => updateManualMapping(row._rowId, "subgrupo", e.target.value)} className="cell-select">{SUBGROUP_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></td>
                        <td className="right nowrap-actions">
                          <button className="mini-btn" type="button" onClick={() => clearManualMapping(row._rowId)}>Reset map</button>
                          <button className="mini-btn danger" type="button" onClick={() => removeRow(row._rowId)}>Eliminar</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {conversion && tab === "mapping" && (
          <section>
            <div className="controls">
              <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>{groups.map((g) => <option key={g} value={g}>{g}</option>)}</select>
              <input type="text" placeholder="Buscar por cuenta o nombre" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>PGC</th><th>Nombre</th><th>Grupo</th><th className="right">Total</th><th className="right">Detalle</th></tr></thead>
                <tbody>
                  {filtered.map((row) => (
                    <Fragment key={row.pgcCode}>
                      <tr onClick={() => setExpanded(expanded === row.pgcCode ? "" : row.pgcCode)}>
                        <td>{row.pgcCode}</td><td>{row.pgcName}</td><td>{row.grupo}</td><td className="right">{toDisplay(showEur ? row.totalEUR : row.totalMXN, showEur)}</td><td className="right">{row.details.length}</td>
                      </tr>
                      {expanded === row.pgcCode && row.details.map((detail) => (
                        <tr className="child" key={`${row.pgcCode}-${detail._rowId}`}>
                          <td>{detail.code}</td><td>{detail.name}</td><td>{detail.subgrupo}</td><td className="right">{toDisplay(showEur ? detail.displayEUR : detail.displayMXN, showEur)}</td>
                          <td className="right">SID {fmt(detail.sid)} | SIA {fmt(detail.sia)} | C {fmt(detail.cargos)} | A {fmt(detail.abonos)} | SFD {fmt(detail.sfd)} | SFA {fmt(detail.sfa)}</td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {conversion && tab === "balance" && (
          <section className="grid-2">
            <article className="panel">
              <h3>Activo</h3>
              {["Activo No Corriente", "Activo Corriente"].map((group) => (
                <div key={group} className="block">
                  <h4>{group}</h4>
                  {conversion.balanceSheet.groups[group].items.map((item) => <p key={`${group}-${item.pgcCode}`}><span>{item.pgcCode} {item.pgcName}</span><span>{toDisplay(showEur ? item.totalEUR : item.totalMXN, showEur)}</span></p>)}
                  <p className="total"><span>Total {group}</span><span>{toDisplay(showEur ? conversion.balanceSheet.groups[group].totalEUR : conversion.balanceSheet.groups[group].totalMXN, showEur)}</span></p>
                </div>
              ))}
              <p className="grand-total"><span>Total Activo</span><span>{toDisplay(showEur ? conversion.balanceSheet.totalActivoEUR : conversion.balanceSheet.totalActivoMXN, showEur)}</span></p>
            </article>
            <article className="panel">
              <h3>Patrimonio neto y pasivo</h3>
              {["Patrimonio Neto", "Pasivo No Corriente", "Pasivo Corriente"].map((group) => (
                <div key={group} className="block">
                  <h4>{group}</h4>
                  {conversion.balanceSheet.groups[group].items.map((item) => <p key={`${group}-${item.pgcCode}`}><span>{item.pgcCode} {item.pgcName}</span><span>{toDisplay(showEur ? item.totalEUR : item.totalMXN, showEur)}</span></p>)}
                  <p className="total"><span>Total {group}</span><span>{toDisplay(showEur ? conversion.balanceSheet.groups[group].totalEUR : conversion.balanceSheet.groups[group].totalMXN, showEur)}</span></p>
                </div>
              ))}
              <p className="grand-total"><span>Total PN + Pasivo</span><span>{toDisplay(showEur ? conversion.balanceSheet.totalPasivoPNEUR : conversion.balanceSheet.totalPasivoPNMXN, showEur)}</span></p>
              {conversion.balanceSheet.autoResultLine && (
                <p className="grand-total">
                  <span>129 Resultado del periodo (ajuste tecnico)</span>
                  <span>{toDisplay(showEur ? conversion.balanceSheet.autoResultLine.totalEUR : conversion.balanceSheet.autoResultLine.totalMXN, showEur)}</span>
                </p>
              )}
              <p className="grand-total"><span>Total PN + Pasivo (ajustado)</span><span>{toDisplay(balanceRightWithAdjustment, showEur)}</span></p>
            </article>
          </section>
        )}

        {conversion && tab === "pnl" && (
          <section className="panel">
            <h3>Cuenta de Perdidas y Ganancias</h3>
            {Object.entries(conversion.pnl.sections).map(([section, content]) => (
              <div className="block" key={section}>
                <h4>{section}</h4>
                {content.items.map((item) => <p key={`${section}-${item.pgcCode}`}><span>{item.pgcCode} {item.pgcName}</span><span>{toDisplay(showEur ? item.totalEUR : item.totalMXN, showEur)}</span></p>)}
                <p className="total"><span>Subtotal</span><span>{toDisplay(showEur ? content.totalEUR : content.totalMXN, showEur)}</span></p>
              </div>
            ))}
          </section>
        )}

        {conversion && tab === "control" && (
          <section className="panel">
            <h3>Controles de calidad</h3>
            <p>Diferencia balanza inicial: <strong>{fmt(conversion.validations.trialBalanceInitialDifference)}</strong></p>
            <p>Diferencia balanza final: <strong>{fmt(conversion.validations.trialBalanceFinalDifference)}</strong></p>
            <p>Diferencia balance PGC: <strong>{fmt(conversion.balanceSheet.differenceMXN)}</strong></p>
            <p>Cuentas sin mapeo (lineas analizadas): <strong>{conversion.metadata.unmappedCount}</strong></p>
          </section>
        )}

        {mappingMeta && conversion && (
          <footer className="footer">
            <span>Mapeos cargados: {mappingMeta.totalMappings}</span>
            <span>Periodo: {String(periodMonth).padStart(2, "0")}/{periodYear}</span>
            <span>Generado: {new Date(conversion.metadata.generatedAt).toLocaleString("es-ES")}</span>
          </footer>
        )}
      </main>
    </div>
  );
}
