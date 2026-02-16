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
  res.json({
    totalMappings: Object.keys(ACCOUNT_MAPPING).length,
    groups
  });
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

app.post("/api/convert/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se encontro ningun archivo. Usa el campo 'file'." });
    }

    const rows = parseWorkbookBuffer(req.file.buffer);
    const exchangeRate = Number(req.body.exchangeRate) || 0.046;
    let period = { month: Number(req.body.month) || null, year: Number(req.body.year) || null };
    if (req.body.period) {
      try {
        period = JSON.parse(req.body.period);
      } catch (_error) {
        period = { month: Number(req.body.month) || null, year: Number(req.body.year) || null };
      }
    }
    const conversion = convertRows(rows, exchangeRate, {}, period);
    return res.json(conversion);
  } catch (error) {
    return res.status(400).json({ error: error.message || "No se pudo leer el archivo." });
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
