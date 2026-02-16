from __future__ import annotations

import datetime as dt
import uuid
from typing import Any

import pandas as pd
import streamlit as st

from conversion_engine import convert_rows, export_conversion_xlsx, parse_workbook
from db import init_db, list_periods, load_period_data, save_period_data

st.set_page_config(page_title="NIF Mexico a PGC Espana", layout="wide")
init_db()

MONTHS = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
}

GROUP_OPTIONS = [
    "Sin clasificar",
    "Activo No Corriente",
    "Activo Corriente",
    "Patrimonio Neto",
    "Pasivo No Corriente",
    "Pasivo Corriente",
    "Ingresos",
    "Ingresos Financieros",
    "Gastos",
    "Gastos Financieros",
]

SUBGROUP_OPTIONS = [
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
    "Otros resultados",
]


def fmt(n: float) -> str:
    return f"{n:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def ensure_state() -> None:
    now = dt.date.today()
    st.session_state.setdefault("period_month", now.month)
    st.session_state.setdefault("period_year", now.year)
    st.session_state.setdefault("exchange_rate", 0.046)
    st.session_state.setdefault("source_rows", [])
    st.session_state.setdefault("manual_mappings", {})
    st.session_state.setdefault("conversion", None)


def analyze_current() -> None:
    rows = st.session_state["source_rows"]
    mappings = st.session_state["manual_mappings"]
    period = {"month": st.session_state["period_month"], "year": st.session_state["period_year"]}
    st.session_state["conversion"] = convert_rows(rows, st.session_state["exchange_rate"], mappings, period)


def can_save(conversion: dict[str, Any] | None) -> tuple[bool, str]:
    if not conversion:
        return False, "Sin analisis"
    analyzed = conversion["metadata"]["analyzedRowCount"]
    unmapped = conversion["metadata"]["unmappedCount"]
    trial = abs(conversion["validations"]["trialBalanceFinalDifference"])
    if analyzed <= 0:
        return False, "No hay lineas analizadas"
    if unmapped > 0:
        return False, "Hay lineas sin mapear"
    if trial > 0.01:
        return False, "La balanza final no cuadra"
    return True, "Listo para guardar"


def load_period_action(year: int, month: int) -> None:
    payload = load_period_data(year, month)
    if not payload:
        st.warning("No existe informacion guardada para ese periodo")
        return
    st.session_state["source_rows"] = payload["rows"]
    st.session_state["manual_mappings"] = payload["manualMappings"]
    st.session_state["exchange_rate"] = float(payload["period"]["exchange_rate"] or 0.046)
    analyze_current()


ensure_state()

st.title("NIF Mexico a PGC Espana (Python)")
st.caption("Carga mensual en SQLite. Flujo: subir -> mapear/cuadrar -> guardar")

col1, col2, col3, col4, col5, col6 = st.columns([1.2, 1, 1.2, 1.6, 1.1, 1.2])
with col1:
    st.session_state["period_month"] = st.selectbox("Mes", options=list(MONTHS.keys()), format_func=lambda x: MONTHS[x], index=list(MONTHS.keys()).index(st.session_state["period_month"]))
with col2:
    st.session_state["period_year"] = st.number_input("Año", min_value=2000, max_value=2100, value=int(st.session_state["period_year"]))
with col3:
    if st.button("Cargar periodo"):
        load_period_action(int(st.session_state["period_year"]), int(st.session_state["period_month"]))
with col4:
    upload = st.file_uploader("Subir y analizar archivo", type=["xlsx", "xls", "csv"], label_visibility="collapsed")
with col5:
    st.session_state["exchange_rate"] = st.number_input("TC MXN/EUR", min_value=0.0001, value=float(st.session_state["exchange_rate"]), format="%.4f")
with col6:
    if st.button("Recalcular"):
        analyze_current()

if upload is not None:
    rows = parse_workbook(upload.read())
    st.session_state["source_rows"] = rows
    st.session_state["manual_mappings"] = {}
    analyze_current()
    st.success(f"Archivo analizado: {len(rows)} lineas")

periods = list_periods()
if periods:
    period_options = [f"{p['month']:02d}/{p['year']} · {p['row_count']} lineas" for p in periods]
    idx = st.selectbox("Periodos guardados", options=range(len(period_options)), format_func=lambda i: period_options[i])
    if st.button("Cargar seleccionado"):
        p = periods[idx]
        st.session_state["period_month"] = int(p["month"])
        st.session_state["period_year"] = int(p["year"])
        load_period_action(int(p["year"]), int(p["month"]))

conversion = st.session_state["conversion"]
if conversion:
    ok_save, save_msg = can_save(conversion)
    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("Lineas archivo", conversion["metadata"]["rowCount"])
    c2.metric("Lineas analizadas", conversion["metadata"]["analyzedRowCount"])
    c3.metric("Sumatorias excluidas", conversion["metadata"]["summaryExcludedCount"])
    c4.metric("Sin mapear", conversion["metadata"]["unmappedCount"])
    c5.metric("Cobertura mapeo %", f"{conversion['metadata']['mappedCoveragePct']:.2f}")

    st.info(
        f"Estado guardado: {save_msg} · Dif. balanza final: {fmt(conversion['validations']['trialBalanceFinalDifference'])}"
    )

    btn_col1, btn_col2, btn_col3 = st.columns([1.2, 1.2, 2])
    with btn_col1:
        if st.button("Guardar periodo", disabled=not ok_save):
            save_period_data(
                year=int(st.session_state["period_year"]),
                month=int(st.session_state["period_month"]),
                filename="manual-save",
                exchange_rate=float(st.session_state["exchange_rate"]),
                rows=st.session_state["source_rows"],
                manual_mappings=st.session_state["manual_mappings"],
                uploaded_at=dt.datetime.now().isoformat(),
            )
            st.success("Periodo guardado en BBDD")
    with btn_col2:
        xbytes = export_conversion_xlsx(conversion)
        st.download_button(
            "Exportar XLSX",
            data=xbytes,
            file_name=f"conversion_pgc_{st.session_state['period_year']}-{str(st.session_state['period_month']).zfill(2)}.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )

    tabs = st.tabs(["Partidas", "Mapeo", "Balance", "P&G", "Control"])

    with tabs[0]:
        status_filter = st.selectbox("Filtro estado", ["todos", "sin-mapear", "mapeadas", "sumatorias"])
        detail_search = st.text_input("Buscar partida")

        converted_by_id = {r["_rowId"]: r for r in conversion["convertedData"]}
        display_rows: list[dict[str, Any]] = []
        for r in st.session_state["source_rows"]:
            c = converted_by_id.get(r["_rowId"], {})
            is_summary = bool(c.get("isSummaryLine"))
            is_mapped = c.get("pgcCode") not in (None, "SIN MAPEO")
            status = "sumatoria" if is_summary else ("mapeada" if is_mapped else "sin-mapear")
            if status_filter == "sin-mapear" and status != "sin-mapear":
                continue
            if status_filter == "mapeadas" and status != "mapeada":
                continue
            if status_filter == "sumatorias" and status != "sumatoria":
                continue
            if detail_search:
                q = detail_search.lower()
                if q not in r["code"].lower() and q not in r["name"].lower():
                    continue

            manual = st.session_state["manual_mappings"].get(r["_rowId"], {})
            display_rows.append(
                {
                    "_rowId": r["_rowId"],
                    "code": r["code"],
                    "name": r["name"],
                    "sid": r["sid"],
                    "sia": r["sia"],
                    "cargos": r["cargos"],
                    "abonos": r["abonos"],
                    "sfd": r["sfd"],
                    "sfa": r["sfa"],
                    "suma_debe": r["sid"] + r["cargos"],
                    "suma_haber": r["sia"] + r["abonos"],
                    "saldo_neto": r["sfd"] - r["sfa"],
                    "estado": status,
                    "pgc_asignado": c.get("pgcCode", "SIN MAPEO"),
                    "nombre_asignado": c.get("pgcName", "Sin equivalencia PGC"),
                    "manual_pgc": manual.get("pgc", ""),
                    "manual_pgcName": manual.get("pgcName", ""),
                    "manual_grupo": manual.get("grupo", "Sin clasificar"),
                    "manual_subgrupo": manual.get("subgrupo", "Sin clasificar"),
                }
            )

        df = pd.DataFrame(display_rows)
        if df.empty:
            st.warning("Sin lineas para mostrar con ese filtro")
        else:
            edited = st.data_editor(
                df,
                num_rows="dynamic",
                use_container_width=True,
                hide_index=True,
                column_config={
                    "_rowId": st.column_config.TextColumn("rowId", disabled=True),
                    "suma_debe": st.column_config.NumberColumn("Suma Debe", disabled=True),
                    "suma_haber": st.column_config.NumberColumn("Suma Haber", disabled=True),
                    "saldo_neto": st.column_config.NumberColumn("Saldo Neto", disabled=True),
                    "estado": st.column_config.TextColumn("Estado", disabled=True),
                    "pgc_asignado": st.column_config.TextColumn("PGC asignado", disabled=True),
                    "nombre_asignado": st.column_config.TextColumn("Nombre asignado", disabled=True),
                    "manual_grupo": st.column_config.SelectboxColumn("Manual Grupo", options=GROUP_OPTIONS),
                    "manual_subgrupo": st.column_config.SelectboxColumn("Manual Subgrupo", options=SUBGROUP_OPTIONS),
                },
            )

            if st.button("Aplicar cambios de Partidas"):
                new_rows = []
                new_maps: dict[str, dict[str, str]] = {}
                for _, row in edited.iterrows():
                    row_id = str(row.get("_rowId") or f"row-{uuid.uuid4().hex[:8]}")
                    new_rows.append(
                        {
                            "_rowId": row_id,
                            "_isNew": True,
                            "_excludeFromAnalysis": False,
                            "code": str(row.get("code", "")).strip(),
                            "name": str(row.get("name", "")).strip(),
                            "sid": float(row.get("sid", 0) or 0),
                            "sia": float(row.get("sia", 0) or 0),
                            "cargos": float(row.get("cargos", 0) or 0),
                            "abonos": float(row.get("abonos", 0) or 0),
                            "sfd": float(row.get("sfd", 0) or 0),
                            "sfa": float(row.get("sfa", 0) or 0),
                        }
                    )

                    pgc = str(row.get("manual_pgc", "")).strip()
                    pgc_name = str(row.get("manual_pgcName", "")).strip()
                    grupo = str(row.get("manual_grupo", "Sin clasificar"))
                    subgrupo = str(row.get("manual_subgrupo", "Sin clasificar"))
                    if pgc or pgc_name or grupo != "Sin clasificar" or subgrupo != "Sin clasificar":
                        new_maps[row_id] = {
                            "pgc": pgc,
                            "pgcName": pgc_name,
                            "grupo": grupo,
                            "subgrupo": subgrupo,
                        }

                st.session_state["source_rows"] = [r for r in new_rows if r["code"]]
                st.session_state["manual_mappings"] = new_maps
                analyze_current()
                st.success("Cambios aplicados")

    with tabs[1]:
        st.dataframe(pd.DataFrame(conversion["pgcAggregated"]), use_container_width=True)

    with tabs[2]:
        b = conversion["balanceSheet"]
        left, right = st.columns(2)
        with left:
            st.subheader("Activo")
            st.write(f"Total Activo: {fmt(b['totalActivoMXN'])}")
        with right:
            st.subheader("Patrimonio Neto y Pasivo")
            st.write(f"Total PN + Pasivo: {fmt(b['totalPasivoPNMXN'])}")
            if b.get("autoResultLine"):
                st.warning(f"129 Resultado periodo (ajuste tecnico): {fmt(b['autoResultLine']['totalMXN'])}")
                st.write(f"Total PN + Pasivo (ajustado): {fmt(b['adjustedTotalPasivoPNMXN'])}")

    with tabs[3]:
        st.subheader("Cuenta de Perdidas y Ganancias")
        st.success(f"Total del periodo: {fmt(conversion['pnl']['resultadoAntesImpuestosMx'])}")
        collapse_all = st.toggle("Colapsar todas las secciones", value=False)
        for section, content in conversion["pnl"]["sections"].items():
            with st.expander(f"{section} · Subtotal {fmt(content['totalMXN'])}", expanded=not collapse_all):
                for item in content["items"]:
                    st.write(f"{item['pgcCode']} - {item['pgcName']}: {fmt(item['totalMXN'])}")
        st.info(f"Total del periodo (Resultado PyG): {fmt(conversion['pnl']['resultadoAntesImpuestosMx'])}")

    with tabs[4]:
        st.write(f"Dif. balanza final: {fmt(conversion['validations']['trialBalanceFinalDifference'])}")
        st.write(f"Sin mapear: {conversion['metadata']['unmappedCount']}")
        if conversion["validations"]["unmappedRows"]:
            st.dataframe(pd.DataFrame(conversion["validations"]["unmappedRows"]), use_container_width=True)
else:
    st.info("Sube un archivo mensual o carga un periodo guardado para empezar")
