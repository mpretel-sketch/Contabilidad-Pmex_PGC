import * as XLSX from "xlsx";

export const ACCOUNT_MAPPING = {
  "101": { pgc: "570", pgcName: "Caja, euros", grupo: "Activo Corriente", subgrupo: "Efectivo y equivalentes" },
  "102-001": { pgc: "572", pgcName: "Bancos e instituciones de credito c/c vista, euros", grupo: "Activo Corriente", subgrupo: "Efectivo y equivalentes" },
  "102-002": { pgc: "573", pgcName: "Bancos e instituciones de credito c/c vista, moneda extranjera", grupo: "Activo Corriente", subgrupo: "Efectivo y equivalentes" },
  "104-001": { pgc: "430", pgcName: "Clientes", grupo: "Activo Corriente", subgrupo: "Deudores comerciales" },
  "104-002": { pgc: "4304", pgcName: "Clientes, moneda extranjera", grupo: "Activo Corriente", subgrupo: "Deudores comerciales" },
  "108-001": { pgc: "460", pgcName: "Anticipos de remuneraciones", grupo: "Activo Corriente", subgrupo: "Otros deudores" },
  "108-004": { pgc: "440", pgcName: "Deudores", grupo: "Activo Corriente", subgrupo: "Otros deudores" },
  "110": { pgc: "480", pgcName: "Gastos anticipados", grupo: "Activo Corriente", subgrupo: "Periodificaciones" },
  "111": { pgc: "4709", pgcName: "H.P. deudora por devolucion de impuestos", grupo: "Activo Corriente", subgrupo: "Administraciones Publicas" },
  "112": { pgc: "473", pgcName: "H.P. retenciones y pagos a cuenta", grupo: "Activo Corriente", subgrupo: "Administraciones Publicas" },
  "115": { pgc: "4720", pgcName: "H.P. IVA soportado", grupo: "Activo Corriente", subgrupo: "Administraciones Publicas" },
  "116": { pgc: "4720", pgcName: "H.P. IVA soportado (pte. de pago)", grupo: "Activo Corriente", subgrupo: "Administraciones Publicas" },
  "117": { pgc: "407", pgcName: "Anticipos a proveedores", grupo: "Activo Corriente", subgrupo: "Deudores comerciales" },
  "122": { pgc: "218", pgcName: "Elementos de transporte", grupo: "Activo No Corriente", subgrupo: "Inmovilizado material" },
  "123": { pgc: "216", pgcName: "Mobiliario", grupo: "Activo No Corriente", subgrupo: "Inmovilizado material" },
  "124": { pgc: "217", pgcName: "Equipos para procesos de informacion", grupo: "Activo No Corriente", subgrupo: "Inmovilizado material" },
  "135-003": { pgc: "2818", pgcName: "Amort. acum. elementos de transporte", grupo: "Activo No Corriente", subgrupo: "Amortizacion acumulada" },
  "135-004": { pgc: "2816", pgcName: "Amort. acum. mobiliario", grupo: "Activo No Corriente", subgrupo: "Amortizacion acumulada" },
  "135-005": { pgc: "2817", pgcName: "Amort. acum. equipos proceso informacion", grupo: "Activo No Corriente", subgrupo: "Amortizacion acumulada" },
  "142": { pgc: "260", pgcName: "Fianzas constituidas a largo plazo", grupo: "Activo No Corriente", subgrupo: "Inversiones financieras LP" },
  "201-001": { pgc: "400", pgcName: "Proveedores", grupo: "Pasivo Corriente", subgrupo: "Acreedores comerciales" },
  "201-002": { pgc: "4004", pgcName: "Proveedores, moneda extranjera", grupo: "Pasivo Corriente", subgrupo: "Acreedores comerciales" },
  "203-003-001": { pgc: "410", pgcName: "Acreedores por prestaciones de servicios", grupo: "Pasivo Corriente", subgrupo: "Otros acreedores" },
  "203-003-002": { pgc: "5530", pgcName: "Socios, c/c (empresas del grupo)", grupo: "Pasivo Corriente", subgrupo: "Deudas empresas grupo CP" },
  "203-003-003": { pgc: "5530", pgcName: "Socios, c/c (empresas del grupo)", grupo: "Pasivo Corriente", subgrupo: "Deudas empresas grupo CP" },
  "204": { pgc: "438", pgcName: "Anticipos de clientes", grupo: "Pasivo Corriente", subgrupo: "Acreedores comerciales" },
  "206": { pgc: "4770", pgcName: "H.P. IVA repercutido", grupo: "Pasivo Corriente", subgrupo: "Administraciones Publicas" },
  "207": { pgc: "4770", pgcName: "H.P. IVA repercutido (pte. cobro)", grupo: "Pasivo Corriente", subgrupo: "Administraciones Publicas" },
  "208-001": { pgc: "4750", pgcName: "H.P. acreedora por IVA", grupo: "Pasivo Corriente", subgrupo: "Administraciones Publicas" },
  "208-003": { pgc: "4752", pgcName: "H.P. acreedora por impuesto sobre sociedades", grupo: "Pasivo Corriente", subgrupo: "Administraciones Publicas" },
  "208-007": { pgc: "476", pgcName: "Organismos de la Seg. Social acreedores", grupo: "Pasivo Corriente", subgrupo: "Administraciones Publicas" },
  "210-001": { pgc: "4751", pgcName: "H.P. acreedora por retenciones practicadas", grupo: "Pasivo Corriente", subgrupo: "Administraciones Publicas" },
  "210-003": { pgc: "4751", pgcName: "H.P. acreedora por retenciones practicadas", grupo: "Pasivo Corriente", subgrupo: "Administraciones Publicas" },
  "210-004": { pgc: "4751", pgcName: "H.P. acreedora por retenciones practicadas", grupo: "Pasivo Corriente", subgrupo: "Administraciones Publicas" },
  "210-008": { pgc: "476", pgcName: "Organismos de la Seg. Social acreedores", grupo: "Pasivo Corriente", subgrupo: "Administraciones Publicas" },
  "210-010": { pgc: "476", pgcName: "Organismos de la Seg. Social acreedores", grupo: "Pasivo Corriente", subgrupo: "Administraciones Publicas" },
  "212": { pgc: "465", pgcName: "Remuneraciones pendientes de pago", grupo: "Pasivo Corriente", subgrupo: "Otros pasivos" },
  "213": { pgc: "171", pgcName: "Deudas a largo plazo", grupo: "Pasivo No Corriente", subgrupo: "Deudas a LP" },
  "301-001": { pgc: "100", pgcName: "Capital social", grupo: "Patrimonio Neto", subgrupo: "Fondos propios" },
  "301-004": { pgc: "1030", pgcName: "Socios por desembolsos no exigidos, capital social", grupo: "Patrimonio Neto", subgrupo: "Fondos propios" },
  "302": { pgc: "112", pgcName: "Reserva legal", grupo: "Patrimonio Neto", subgrupo: "Fondos propios" },
  "303": { pgc: "129", pgcName: "Resultado del ejercicio", grupo: "Patrimonio Neto", subgrupo: "Fondos propios" },
  "304-001": { pgc: "120", pgcName: "Remanente", grupo: "Patrimonio Neto", subgrupo: "Fondos propios" },
  "304-002": { pgc: "121", pgcName: "Resultados negativos de ejercicios anteriores", grupo: "Patrimonio Neto", subgrupo: "Fondos propios" },
  "401": { pgc: "705", pgcName: "Prestaciones de servicios", grupo: "Ingresos", subgrupo: "Importe neto cifra negocios" },
  "402": { pgc: "709", pgcName: "Rappels sobre ventas", grupo: "Ingresos", subgrupo: "Importe neto cifra negocios" },
  "601-000-0001": { pgc: "640", pgcName: "Sueldos y salarios", grupo: "Gastos", subgrupo: "Gastos de personal" },
  "601-000-0002": { pgc: "640", pgcName: "Sueldos y salarios", grupo: "Gastos", subgrupo: "Gastos de personal" },
  "601-000-0003": { pgc: "640", pgcName: "Sueldos y salarios", grupo: "Gastos", subgrupo: "Gastos de personal" },
  "601-000-0004": { pgc: "640", pgcName: "Sueldos y salarios", grupo: "Gastos", subgrupo: "Gastos de personal" },
  "601-000-0005": { pgc: "629", pgcName: "Otros servicios (dietas/viajes)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0006": { pgc: "640", pgcName: "Sueldos y salarios", grupo: "Gastos", subgrupo: "Gastos de personal" },
  "601-000-0007": { pgc: "622", pgcName: "Comunicaciones", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0008": { pgc: "628", pgcName: "Suministros (agua)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0009": { pgc: "628", pgcName: "Suministros (electricidad)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0010": { pgc: "625", pgcName: "Primas de seguros / Vigilancia", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0011": { pgc: "629", pgcName: "Otros servicios (material oficina)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0013": { pgc: "622", pgcName: "Reparaciones y conservacion", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0014": { pgc: "625", pgcName: "Primas de seguros", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0016": { pgc: "631", pgcName: "Otros tributos", grupo: "Gastos", subgrupo: "Tributos" },
  "601-000-0017": { pgc: "669", pgcName: "Otros gastos financieros (recargos)", grupo: "Gastos", subgrupo: "Gastos financieros" },
  "601-000-0018": { pgc: "629", pgcName: "Otros servicios (cuotas)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0019": { pgc: "627", pgcName: "Publicidad, propaganda y relaciones publicas", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0020": { pgc: "621", pgcName: "Arrendamientos y canones", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0031": { pgc: "623", pgcName: "Servicios profesionales independientes", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0033": { pgc: "626", pgcName: "Servicios bancarios y similares", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0034": { pgc: "629", pgcName: "Otros servicios (limpieza)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0035": { pgc: "623", pgcName: "Servicios profesionales independientes", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0036": { pgc: "629", pgcName: "Otros servicios (papeleria)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0038": { pgc: "624", pgcName: "Transportes", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0039": { pgc: "642", pgcName: "Seg. Social a cargo de la empresa (IMSS)", grupo: "Gastos", subgrupo: "Gastos de personal" },
  "601-000-0040": { pgc: "642", pgcName: "Seg. Social a cargo de la empresa (RCV)", grupo: "Gastos", subgrupo: "Gastos de personal" },
  "601-000-0041": { pgc: "642", pgcName: "Seg. Social a cargo de la empresa (Infonavit)", grupo: "Gastos", subgrupo: "Gastos de personal" },
  "601-000-0044": { pgc: "641", pgcName: "Indemnizaciones (antiguedad)", grupo: "Gastos", subgrupo: "Gastos de personal" },
  "601-000-0045": { pgc: "641", pgcName: "Indemnizaciones", grupo: "Gastos", subgrupo: "Gastos de personal" },
  "601-000-0046": { pgc: "640", pgcName: "Sueldos y salarios (festivos)", grupo: "Gastos", subgrupo: "Gastos de personal" },
  "601-000-0048": { pgc: "629", pgcName: "Otros servicios", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0049": { pgc: "623", pgcName: "Servicios prof. indep. (comisiones reservas)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0051": { pgc: "649", pgcName: "Otros gastos sociales (comedor)", grupo: "Gastos", subgrupo: "Gastos de personal" },
  "601-000-0052": { pgc: "628", pgcName: "Suministros (combustible)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0053": { pgc: "623", pgcName: "Servicios prof. independientes (personas morales)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "601-000-0054": { pgc: "640", pgcName: "Sueldos y salarios (horas extras)", grupo: "Gastos", subgrupo: "Gastos de personal" },
  "601-000-0055": { pgc: "631", pgcName: "Otros tributos (imp. nomina)", grupo: "Gastos", subgrupo: "Tributos" },
  "601-001": { pgc: "678", pgcName: "Gastos excepcionales (no deducibles)", grupo: "Gastos", subgrupo: "Gastos excepcionales" },
  "603-000-0001": { pgc: "623", pgcName: "Servicios prof. indep. (admon)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "603-000-0002": { pgc: "623", pgcName: "Servicios prof. indep. (PF)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "603-000-0003": { pgc: "623", pgcName: "Servicios prof. indep. (PM)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "603-000-0004": { pgc: "623", pgcName: "Servicios profesionales (legal)", grupo: "Gastos", subgrupo: "Servicios exteriores" },
  "701": { pgc: "668", pgcName: "Diferencias negativas de cambio", grupo: "Gastos Financieros", subgrupo: "Resultado financiero" },
  "702": { pgc: "768", pgcName: "Diferencias positivas de cambio", grupo: "Ingresos Financieros", subgrupo: "Resultado financiero" },
  "801": { pgc: "678", pgcName: "Gastos excepcionales", grupo: "Gastos", subgrupo: "Otros resultados" },
  "803": { pgc: "678", pgcName: "Gastos excepcionales (no deducibles)", grupo: "Gastos", subgrupo: "Otros resultados" },
  "804-003": { pgc: "6818", pgcName: "Amort. inmovilizado material (transporte)", grupo: "Gastos", subgrupo: "Amortizaciones" },
  "804-004": { pgc: "6816", pgcName: "Amort. inmovilizado material (mobiliario)", grupo: "Gastos", subgrupo: "Amortizaciones" },
  "804-005": { pgc: "6817", pgcName: "Amort. inmovilizado material (eq. informatico)", grupo: "Gastos", subgrupo: "Amortizaciones" },
  "806": { pgc: "759", pgcName: "Ingresos por servicios diversos", grupo: "Ingresos", subgrupo: "Otros ingresos de explotacion" }
};

const REQUIRED_FIELDS = ["code", "name", "sid", "sia", "cargos", "abonos", "sfd", "sfa"];

const BALANCE_GROUPS = {
  "Activo No Corriente": { items: [], totalMXN: 0, totalEUR: 0 },
  "Activo Corriente": { items: [], totalMXN: 0, totalEUR: 0 },
  "Patrimonio Neto": { items: [], totalMXN: 0, totalEUR: 0 },
  "Pasivo No Corriente": { items: [], totalMXN: 0, totalEUR: 0 },
  "Pasivo Corriente": { items: [], totalMXN: 0, totalEUR: 0 }
};

const PNL_SECTIONS = {
  "Importe neto cifra negocios": { items: [], totalMXN: 0, totalEUR: 0 },
  "Otros ingresos de explotacion": { items: [], totalMXN: 0, totalEUR: 0 },
  "Gastos de personal": { items: [], totalMXN: 0, totalEUR: 0 },
  "Servicios exteriores": { items: [], totalMXN: 0, totalEUR: 0 },
  "Tributos": { items: [], totalMXN: 0, totalEUR: 0 },
  "Amortizaciones": { items: [], totalMXN: 0, totalEUR: 0 },
  "Gastos excepcionales": { items: [], totalMXN: 0, totalEUR: 0 },
  "Resultado financiero": { items: [], totalMXN: 0, totalEUR: 0 },
  "Otros resultados": { items: [], totalMXN: 0, totalEUR: 0 }
};

const normalizeHeader = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");

const parseNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const clean = String(value ?? "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(clean);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseString = (value) => String(value ?? "").trim();

const mapField = (rawKey) => {
  const key = normalizeHeader(rawKey);
  if (["codigo", "codigocuenta", "cuenta", "code"].includes(key)) return "code";
  if (["nombre", "descripcion", "name", "concepto"].includes(key)) return "name";
  if (["sid", "saldoinicialdeudor", "saldoinicialdebe"].includes(key)) return "sid";
  if (["sia", "saldoinicialacreedor", "saldoinicialhaber"].includes(key)) return "sia";
  if (["cargos", "debe", "movimientodebe"].includes(key)) return "cargos";
  if (["abonos", "haber", "movimientohaber"].includes(key)) return "abonos";
  if (["sfd", "saldofinaldeudor", "saldofinaldebe"].includes(key)) return "sfd";
  if (["sfa", "saldofinalacreedor", "saldofinalhaber"].includes(key)) return "sfa";
  return null;
};

export function normalizeRows(rawRows) {
  const rows = rawRows
    .map((row, index) => {
      const transformed = {};
      for (const [k, v] of Object.entries(row)) {
        const mapped = mapField(k);
        if (mapped) transformed[mapped] = v;
      }
      if (!transformed.code) return null;
      return {
        _rowId: parseString(row._rowId || row.rowId || row.id) || `row-${index + 1}`,
        code: String(transformed.code).trim(),
        name: String(transformed.name ?? "Sin descripcion").trim(),
        sid: parseNumber(transformed.sid),
        sia: parseNumber(transformed.sia),
        cargos: parseNumber(transformed.cargos),
        abonos: parseNumber(transformed.abonos),
        sfd: parseNumber(transformed.sfd),
        sfa: parseNumber(transformed.sfa)
      };
    })
    .filter(Boolean);

  const missing = REQUIRED_FIELDS.filter((field) => !rows.some((r) => field in r));
  return { rows, missing };
}

export function findMapping(code) {
  const safeCode = String(code ?? "").trim();
  if (!safeCode) return null;
  const parts = safeCode.split("-").filter(Boolean);
  const candidates = [safeCode];

  for (let len = parts.length; len > 0; len -= 1) {
    candidates.push(parts.slice(0, len).join("-"));
  }

  for (const candidate of candidates) {
    if (ACCOUNT_MAPPING[candidate]) return ACCOUNT_MAPPING[candidate];
  }

  return null;
}

const accountDisplayValue = (group, saldo) => {
  if (["Pasivo Corriente", "Pasivo No Corriente", "Patrimonio Neto", "Ingresos", "Ingresos Financieros"].includes(group)) {
    return -saldo;
  }
  return saldo;
};

const normalizeManualMapping = (manual) => {
  if (!manual || typeof manual !== "object") return null;
  const pgc = parseString(manual.pgc || manual.pgcCode);
  const pgcName = parseString(manual.pgcName);
  const grupo = parseString(manual.grupo);
  const subgrupo = parseString(manual.subgrupo);
  if (!pgc && !pgcName && !grupo && !subgrupo) return null;
  return {
    pgc: pgc || "SIN MAPEO",
    pgcName: pgcName || "Sin equivalencia PGC",
    grupo: grupo || "Sin clasificar",
    subgrupo: subgrupo || "Sin clasificar"
  };
};

export function convertRows(rows, exchangeRate = 0.046, manualMappings = {}) {
  const convertedData = rows.map((row) => {
    const manualMapping = normalizeManualMapping(
      manualMappings[row._rowId] || manualMappings[row.code] || row.manualMapping
    );
    const automaticMapping = findMapping(row.code);
    const mapping = manualMapping || automaticMapping;
    const saldo = row.sfd - row.sfa;
    const saldoEur = saldo * exchangeRate;
    const grupo = mapping?.grupo ?? "Sin clasificar";
    const displayMXN = accountDisplayValue(grupo, saldo);

    return {
      ...row,
      mapping,
      pgcCode: mapping?.pgc ?? "SIN MAPEO",
      pgcName: mapping?.pgcName ?? "Sin equivalencia PGC",
      grupo,
      subgrupo: mapping?.subgrupo ?? "Sin clasificar",
      saldo,
      saldoEur,
      displayMXN,
      displayEUR: displayMXN * exchangeRate,
      manualMappingApplied: Boolean(manualMapping)
    };
  });

  const aggregateMap = {};
  for (const row of convertedData) {
    const key = row.pgcCode;
    if (!aggregateMap[key]) {
      aggregateMap[key] = {
        pgcCode: row.pgcCode,
        pgcName: row.pgcName,
        grupo: row.grupo,
        subgrupo: row.subgrupo,
        totalMXN: 0,
        totalEUR: 0,
        details: []
      };
    }
    aggregateMap[key].totalMXN += row.displayMXN;
    aggregateMap[key].totalEUR += row.displayEUR;
    aggregateMap[key].details.push(row);
  }

  const pgcAggregated = Object.values(aggregateMap).sort((a, b) => a.pgcCode.localeCompare(b.pgcCode));

  const balanceGroups = structuredClone(BALANCE_GROUPS);
  for (const row of pgcAggregated) {
    if (!balanceGroups[row.grupo]) continue;
    balanceGroups[row.grupo].items.push(row);
    balanceGroups[row.grupo].totalMXN += row.totalMXN;
    balanceGroups[row.grupo].totalEUR += row.totalEUR;
  }

  const totalActivoMXN = balanceGroups["Activo No Corriente"].totalMXN + balanceGroups["Activo Corriente"].totalMXN;
  const totalPasivoPNMXN =
    balanceGroups["Patrimonio Neto"].totalMXN +
    balanceGroups["Pasivo No Corriente"].totalMXN +
    balanceGroups["Pasivo Corriente"].totalMXN;
  const totalActivoEUR = balanceGroups["Activo No Corriente"].totalEUR + balanceGroups["Activo Corriente"].totalEUR;
  const totalPasivoPNEUR =
    balanceGroups["Patrimonio Neto"].totalEUR +
    balanceGroups["Pasivo No Corriente"].totalEUR +
    balanceGroups["Pasivo Corriente"].totalEUR;

  const pnlSections = structuredClone(PNL_SECTIONS);
  for (const row of pgcAggregated) {
    if (!pnlSections[row.subgrupo]) continue;
    pnlSections[row.subgrupo].items.push(row);
    pnlSections[row.subgrupo].totalMXN += row.totalMXN;
    pnlSections[row.subgrupo].totalEUR += row.totalEUR;
  }

  const ingresosMx = pnlSections["Importe neto cifra negocios"].totalMXN + pnlSections["Otros ingresos de explotacion"].totalMXN;
  const gastosMx =
    pnlSections["Gastos de personal"].totalMXN +
    pnlSections["Servicios exteriores"].totalMXN +
    pnlSections["Tributos"].totalMXN +
    pnlSections["Amortizaciones"].totalMXN +
    pnlSections["Gastos excepcionales"].totalMXN;
  const resultadoFinancieroMx = pnlSections["Resultado financiero"].totalMXN;
  const otrosResultadosMx = pnlSections["Otros resultados"].totalMXN;

  const resultadoExplotacionMx = ingresosMx - gastosMx;
  const resultadoAntesImpuestosMx = resultadoExplotacionMx + resultadoFinancieroMx + otrosResultadosMx;

  const ingresosEur = pnlSections["Importe neto cifra negocios"].totalEUR + pnlSections["Otros ingresos de explotacion"].totalEUR;
  const gastosEur =
    pnlSections["Gastos de personal"].totalEUR +
    pnlSections["Servicios exteriores"].totalEUR +
    pnlSections["Tributos"].totalEUR +
    pnlSections["Amortizaciones"].totalEUR +
    pnlSections["Gastos excepcionales"].totalEUR;
  const resultadoFinancieroEur = pnlSections["Resultado financiero"].totalEUR;
  const otrosResultadosEur = pnlSections["Otros resultados"].totalEUR;
  const resultadoExplotacionEur = ingresosEur - gastosEur;
  const resultadoAntesImpuestosEur = resultadoExplotacionEur + resultadoFinancieroEur + otrosResultadosEur;

  const unmappedRows = convertedData.filter((item) => item.pgcCode === "SIN MAPEO");

  const balances = {
    totalDebeInicial: convertedData.reduce((acc, r) => acc + r.sid, 0),
    totalHaberInicial: convertedData.reduce((acc, r) => acc + r.sia, 0),
    totalDebeFinal: convertedData.reduce((acc, r) => acc + r.sfd, 0),
    totalHaberFinal: convertedData.reduce((acc, r) => acc + r.sfa, 0)
  };

  return {
    metadata: {
      exchangeRate,
      rowCount: convertedData.length,
      unmappedCount: unmappedRows.length,
      manualMappingCount: convertedData.filter((row) => row.manualMappingApplied).length,
      mappedCoveragePct: convertedData.length ? ((convertedData.length - unmappedRows.length) / convertedData.length) * 100 : 0,
      generatedAt: new Date().toISOString()
    },
    convertedData,
    pgcAggregated,
    balanceSheet: {
      groups: balanceGroups,
      totalActivoMXN,
      totalPasivoPNMXN,
      totalActivoEUR,
      totalPasivoPNEUR,
      differenceMXN: totalActivoMXN - totalPasivoPNMXN,
      differenceEUR: totalActivoEUR - totalPasivoPNEUR
    },
    pnl: {
      sections: pnlSections,
      ingresosMx,
      gastosMx,
      resultadoExplotacionMx,
      resultadoFinancieroMx,
      otrosResultadosMx,
      resultadoAntesImpuestosMx,
      ingresosEur,
      gastosEur,
      resultadoExplotacionEur,
      resultadoFinancieroEur,
      otrosResultadosEur,
      resultadoAntesImpuestosEur
    },
    validations: {
      trialBalanceInitialDifference: balances.totalDebeInicial - balances.totalHaberInicial,
      trialBalanceFinalDifference: balances.totalDebeFinal - balances.totalHaberFinal,
      unmappedRows
    }
  };
}

export function parseWorkbookBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("El archivo no contiene hojas de calculo.");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const matrixRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  const headerRowIndex = matrixRows.findIndex((row) => {
    const c0 = normalizeHeader(row?.[0]);
    const c1 = normalizeHeader(row?.[1]);
    return c0 === "cuenta" && c1.includes("nombre");
  });

  if (headerRowIndex >= 0) {
    let start = headerRowIndex + 1;
    while (start < matrixRows.length) {
      const code = String(matrixRows[start]?.[0] ?? "").trim();
      if (code) break;
      start += 1;
    }

    const rows = [];
    for (let i = start; i < matrixRows.length; i += 1) {
      const row = matrixRows[i] || [];
      const code = String(row[0] ?? "").trim();
      if (!code || !code.includes("-")) continue;

      rows.push({
        _rowId: `row-${rows.length + 1}`,
        code,
        name: String(row[1] ?? "").trim() || "Sin descripcion",
        sid: parseNumber(row[2]),
        sia: parseNumber(row[3]),
        cargos: parseNumber(row[4]),
        abonos: parseNumber(row[5]),
        sfd: parseNumber(row[6]),
        sfa: parseNumber(row[7])
      });
    }

    if (rows.length > 0) return rows;
  }

  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
  const { rows } = normalizeRows(rawRows);
  return rows;
}

export function buildExportWorkbook(conversion) {
  const wb = XLSX.utils.book_new();

  const wsMapping = XLSX.utils.json_to_sheet(
    conversion.convertedData.map((r) => ({
      "Cta Mexico": r.code,
      "Nombre Mexico": r.name,
      "Cta PGC": r.pgcCode,
      "Nombre PGC": r.pgcName,
      "Grupo": r.grupo,
      "Subgrupo": r.subgrupo,
      "Saldo MXN": r.displayMXN,
      "Saldo EUR": r.displayEUR
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsMapping, "Mapeo");

  const wsAgg = XLSX.utils.json_to_sheet(
    conversion.pgcAggregated.map((r) => ({
      "Cta PGC": r.pgcCode,
      "Nombre PGC": r.pgcName,
      Grupo: r.grupo,
      Subgrupo: r.subgrupo,
      "Total MXN": r.totalMXN,
      "Total EUR": r.totalEUR
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsAgg, "Balanza_PGC");

  const wsValidation = XLSX.utils.json_to_sheet([
    {
      Control: "Dif. Balanza Inicial (Debe-Haber)",
      Valor: conversion.validations.trialBalanceInitialDifference
    },
    {
      Control: "Dif. Balanza Final (Debe-Haber)",
      Valor: conversion.validations.trialBalanceFinalDifference
    },
    {
      Control: "Dif. Balance PGC (Activo - PN y Pasivo)",
      Valor: conversion.balanceSheet.differenceMXN
    },
    {
      Control: "Cobertura mapeo (%)",
      Valor: conversion.metadata.mappedCoveragePct
    },
    {
      Control: "Sin mapeo",
      Valor: conversion.metadata.unmappedCount
    }
  ]);
  XLSX.utils.book_append_sheet(wb, wsValidation, "Validaciones");

  return wb;
}

export const SAMPLE_ROWS = [
  { code: "101-001-0001", name: "Caja y Efectivo", sid: 82900.95, sia: 0, cargos: 0, abonos: 0, sfd: 82900.95, sfa: 0 },
  { code: "102-001-0001", name: "BBVA Bancomer M.N. 3810", sid: 269952.85, sia: 0, cargos: 1247509.6, abonos: 1405442.13, sfd: 112020.32, sfa: 0 },
  { code: "102-002-0001", name: "BBVA Bancomer USD 6344", sid: 743947.94, sia: 0, cargos: 1228050.96, abonos: 1646992.78, sfd: 325006.12, sfa: 0 },
  { code: "104-001-0001", name: "Duetto Research, Inc.", sid: 21137.07, sia: 0, cargos: 0, abonos: 0, sfd: 21137.07, sfa: 0 },
  { code: "201-001-0000", name: "Proveedores Nacional (varios)", sid: 0, sia: 283254.54, cargos: 259148.68, abonos: 323377.05, sfd: 0, sfa: 347482.91 },
  { code: "203-003-0003", name: "Paraty Hoteles Espana", sid: 0, sia: 4473166.34, cargos: 0, abonos: 88951.14, sfd: 0, sfa: 4562117.48 },
  { code: "208-001-0000", name: "IVA por pagar", sid: 0, sia: 171173.6, cargos: 165656, abonos: 141381.9, sfd: 0, sfa: 146899.5 },
  { code: "301-001-0001", name: "Paraty Hoteles S.L", sid: 0, sia: 49500, cargos: 0, abonos: 0, sfd: 0, sfa: 49500 },
  { code: "401-001-0000", name: "Ventas 16%", sid: 0, sia: 0, cargos: 0, abonos: 1355730.16, sfd: 0, sfa: 1355730.16 },
  { code: "601-000-0001", name: "Sueldos y salarios", sid: 0, sia: 0, cargos: 312154.27, abonos: 0, sfd: 312154.27, sfa: 0 },
  { code: "701-002-0000", name: "Perdida cambiaria", sid: 0, sia: 0, cargos: 120491.28, abonos: 0, sfd: 120491.28, sfa: 0 },
  { code: "702-002-0000", name: "Utilidad cambiaria", sid: 0, sia: 0, cargos: 0, abonos: 7544.04, sfd: 0, sfa: 7544.04 }
];
