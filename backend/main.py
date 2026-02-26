"""
Contract Review Bot — FastAPI Backend
Handles PDF parsing and Claude API analysis.
"""

import os
import json
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional

from pdf_parser import extract_text_from_pdf
from claude_client import analyze_contract

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Contract Review Bot API",
    description="AI-powered contract analysis using Claude",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    """Simple health-check endpoint."""
    return {"status": "ok", "service": "contract-review-bot"}


@app.post("/analyze")
async def analyze(
    file: Optional[UploadFile] = File(default=None),
    text: Optional[str] = Form(default=None),
):
    """
    Main analysis endpoint.
    Accepts either:
      - A PDF/TXT file upload  (multipart/form-data, field: file)
      - Raw contract text      (multipart/form-data, field: text)
    Returns structured JSON analysis from Claude.
    """

    contract_text: str = ""

    # ── 1. Get text from file or raw input ────────────────────────────────────
    if file and file.filename:
        content = await file.read()
        filename = file.filename.lower()

        if filename.endswith(".pdf"):
            try:
                contract_text = extract_text_from_pdf(content)
            except Exception as e:
                logger.error(f"PDF parsing failed: {e}")
                raise HTTPException(status_code=422, detail=f"Could not parse PDF: {str(e)}")

        elif filename.endswith(".txt"):
            try:
                contract_text = content.decode("utf-8")
            except UnicodeDecodeError:
                contract_text = content.decode("latin-1")

        else:
            raise HTTPException(status_code=415, detail="Only .pdf and .txt files are supported.")

    elif text and text.strip():
        contract_text = text.strip()

    else:
        raise HTTPException(status_code=400, detail="Provide either a file upload or contract text.")

    # ── 2. Guard: minimum meaningful length ───────────────────────────────────
    if len(contract_text) < 50:
        raise HTTPException(status_code=422, detail="Contract text is too short to analyze.")

    # ── 3. Send to Claude ─────────────────────────────────────────────────────
    logger.info(f"Analyzing contract ({len(contract_text)} chars)…")
    try:
        result = await analyze_contract(contract_text)
    except Exception as e:
        logger.error(f"Claude analysis failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    return JSONResponse(content=result)
