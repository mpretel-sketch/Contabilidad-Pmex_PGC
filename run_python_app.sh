#!/usr/bin/env bash
set -euo pipefail

PYTHON_BIN="/Library/Frameworks/Python.framework/Versions/3.12/bin/python3"
APP_DIR="/Users/miguelpretelpozo/Conta_Pmex_PGC/python_app"

cd "$APP_DIR"

"$PYTHON_BIN" -m pip install -r requirements.txt
"$PYTHON_BIN" -m streamlit run app.py
