


import json
import logging
import os
import re
from groq import Groq

logger = logging.getLogger(__name__)

api_key = os.getenv("GROQ_API_KEY")s


SYSTEM_PROMPT = """You are an expert contract lawyer and risk analyst.
Respond with ONLY a valid JSON object (no markdown, no extra text):
{
  "parties": [],
  "dates": {"effective": "", "duration": "", "renewal": ""},
  "payment_terms": "",
  "termination": "",
  "renewal": "",
  "confidentiality": "",
  "ip_ownership": "",
  "governing_law": "",
  "risks": [{"clause": "", "category": "", "risk_level": "high|medium|low", "text_excerpt": "", "explanation": ""}],
  "plain_english_summary": ""
}
HIGH risk: one-sided indemnity, unlimited liability, IP assignment, missing termination clause.
MEDIUM risk: auto-renewal short opt-out, non-compete, broad confidentiality.
LOW risk: minor notice requirements."""

MAX_CHARS = 80_000

async def analyze_contract(contract_text: str) -> dict:
    if len(contract_text) > MAX_CHARS:
        contract_text = contract_text[:MAX_CHARS]
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze this contract:\n---\n{contract_text}\n---"}
        ],
        max_tokens=4096,
        temperature=0.1
    )
    
    raw_text = response.choices[0].message.content.strip()
    logger.info(f"Groq responded ({len(raw_text)} chars)")
    return _parse_json(raw_text)

def _parse_json(text: str) -> dict:
    cleaned = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE)
    try:
        return json.loads(cleaned.strip())
    except json.JSONDecodeError:
        return {"error": "Failed to parse response", "parties": [], "dates": {},
                "payment_terms": "N/A", "termination": "N/A", "renewal": None,
                "risks": [], "plain_english_summary": "Analysis failed."}