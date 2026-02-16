import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import {
  ACCOUNT_MAPPING,
  SAMPLE_ROWS,
  buildExportWorkbook,
  convertRows,
  normalizeRows,
  parseWorkbookBuffer
} from "./conversionEngine.js";
import { listPeriods, loadPeriodData, savePeriodData } from "./db.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "pmex-pgc-converter", at: new Date().toISOString() });
});

app.get("/api/sample", (_req, res) => {
  res.json({ rows: SAMPLE_ROWS });
});

app.get("/api/mapping/meta", (_req, res) => {
  const groups = {};
  for (const value of Object.values(ACCOUNT_MAPPING)) {
    groups[value.grupo] = (groups[value.grupo] || 0) + 1;
  }
  res.json({ totalMappings: Object.keys(ACCOUNT_MAPPING).length, groups });
});

app.get("/api/periods", (_req, res) => {
  const periods = listPeriods();
  res.json({ periods });
});

app.get("/api/periods/:year/:month", (req, res) => {
  const year = Number(req.params.year);
  const month = Number(req.params.month);
  const payload = loadPeriodData({ year, month });
  if (!payload) {
    return res.status(404).json({ error: "No existe informacion para ese periodo." });
  }

  const conversion = convertRows(
    payload.rows,
    payload.period.exchangeRate || 0.046,
    payload.manualMappings,
    { month, year }
  );

  return res.json({
    ...conversion,
    sourceRows: payload.rows,
    manualMappings: payload.manualMappings,
    storage: payload.period
  });
});

app.post("/api/periods/save", (req, res) => {
  try {
    const {
      rows = [],
      exchangeRate = 0.046,
      manualMappings = {},
      period = {}
    } = req.body || {};

    const year = Number(period.year);
    const month = Number(period.month);
    if (!year || !month) {
      return res.status(400).json({ error: "Debes indicar mes y anio del periodo." });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "Debes enviar filas contables en 'rows'." });
    }

    const normalized = normalizeRows(rows);
    savePeriodData({
      year,
      month,
      rows: normalized.rows,
      manualMappings,
      exchangeRate: Number(exchangeRate) || 0.046,
      filename: period.filename || "manual-save"
    });

    const conversion = convertRows(normalized.rows, Number(exchangeRate) || 0.046, manualMappings, { month, year });
    return res.json({
      ...conversion,
      sourceRows: normalized.rows,
      manualMappings,
      storage: { year, month, exchangeRate: Number(exchangeRate) || 0.046 }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "No se pudo guardar el periodo." });
  }
});

app.post("/api/periods/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se encontro ningun archivo. Usa el campo 'file'." });
    }

    const month = Number(req.body.month);
    const year = Number(req.body.year);
    if (!year || !month) {
      return res.status(400).json({ error: "Debes seleccionar mes y anio." });
    }

    const exchangeRate = Number(req.body.exchangeRate) || 0.046;
    const rows = parseWorkbookBuffer(req.file.buffer);

    savePeriodData({
      year,
      month,
      rows,
      manualMappings: {},
      exchangeRate,
      filename: req.file.originalname
    });

    const conversion = convertRows(rows, exchangeRate, {}, { month, year });
    return res.json({
      ...conversion,
      sourceRows: rows,
      manualMappings: {},
      storage: { year, month, exchangeRate, filename: req.file.originalname }
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "No se pudo leer o guardar el archivo." });
  }
});

app.post("/api/convert", (req, res) => {
  try {
    const { rows = [], exchangeRate = 0.046, manualMappings = {}, period = null } = req.body || {};
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "Debes enviar filas contables en 'rows'." });
    }

    const normalized = normalizeRows(rows);
    const conversion = convertRows(normalized.rows, Number(exchangeRate) || 0.046, manualMappings, period);
    return res.json(conversion);
  } catch (error) {
    return res.status(500).json({ error: error.message || "No se pudo convertir la informacion." });
  }
});

app.post("/api/export", (req, res) => {
  try {
    const { rows = [], exchangeRate = 0.046, manualMappings = {}, period = null } = req.body || {};
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "Debes enviar filas contables en 'rows'." });
    }

    const normalized = normalizeRows(rows);
    const conversion = convertRows(normalized.rows, Number(exchangeRate) || 0.046, manualMappings, period);
    const workbook = buildExportWorkbook(conversion);
    const outputBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const periodLabel =
      period?.month && period?.year
        ? `${String(period.year)}-${String(period.month).padStart(2, "0")}`
        : new Date().toISOString().slice(0, 10);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=conversion_pgc_${periodLabel}.xlsx`);
    return res.send(outputBuffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || "No se pudo generar el archivo Excel." });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
