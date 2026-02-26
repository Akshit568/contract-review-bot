"""
pdf_parser.py
Extract plain text from a PDF binary using PyMuPDF (fitz).
Falls back to pdfplumber if fitz is unavailable.
"""

import io
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract all text from a PDF given its raw bytes.
    Tries PyMuPDF first, then pdfplumber as fallback.
    """
    text = _extract_with_pymupdf(pdf_bytes)
    if not text.strip():
        logger.warning("PyMuPDF returned empty text, trying pdfplumber…")
        text = _extract_with_pdfplumber(pdf_bytes)

    # Basic cleanup: collapse excessive whitespace
    lines = [line.strip() for line in text.splitlines()]
    cleaned = "\n".join(line for line in lines if line)
    return cleaned


def _extract_with_pymupdf(pdf_bytes: bytes) -> str:
    """Primary extractor: PyMuPDF (fitz)."""
    try:
        import fitz  # PyMuPDF

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages = []
        for page in doc:
            pages.append(page.get_text())
        return "\n".join(pages)
    except ImportError:
        logger.warning("PyMuPDF not installed. Trying pdfplumber…")
        return ""
    except Exception as e:
        logger.error(f"PyMuPDF extraction error: {e}")
        return ""


def _extract_with_pdfplumber(pdf_bytes: bytes) -> str:
    """Fallback extractor: pdfplumber."""
    try:
        import pdfplumber

        pages = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    pages.append(t)
        return "\n".join(pages)
    except ImportError:
        logger.error("Neither PyMuPDF nor pdfplumber is installed.")
        raise RuntimeError("No PDF parser available. Install PyMuPDF: pip install pymupdf")
    except Exception as e:
        logger.error(f"pdfplumber extraction error: {e}")
        raise
