# """
# claude_client.py
# Handles all communication with the Anthropic Claude API.
# Uses claude-sonnet-4-5 for deep contract analysis.
# """

# import os
# import json
# import logging
# import re
# import anthropic

# logger = logging.getLogger(__name__)

# # ── Client ────────────────────────────────────────────────────────────────────
# # Reads ANTHROPIC_API_KEY from environment automatically
# _client = anthropic.Anthropic(api_key="")
# MODEL = "claude-sonnet-4-5"

# # ── Prompt ────────────────────────────────────────────────────────────────────
# SYSTEM_PROMPT = """You are an expert contract lawyer and risk analyst. 
# Your job is to read legal contracts and produce clear, structured analysis 
# that any business person — not just a lawyer — can understand.

# You MUST respond with ONLY a valid JSON object (no markdown fences, no extra text).
# The JSON must follow this exact schema:

# {
#   "parties": ["list of all parties/entities in the contract"],
#   "dates": {
#     "effective": "YYYY-MM-DD or descriptive string",
#     "duration": "duration or 'ongoing' if indefinite",
#     "renewal": "renewal terms, or null if none"
#   },
#   "payment_terms": "clear description of payment amounts, schedule, and late fees",
#   "termination": "termination conditions and required notice period",
#   "renewal": "auto-renewal terms and opt-out window, or null",
#   "confidentiality": "confidentiality / NDA terms summary, or null",
#   "ip_ownership": "intellectual property / work-for-hire terms, or null",
#   "governing_law": "jurisdiction / governing law, or null",
#   "risks": [
#     {
#       "clause": "short name of the risky clause",
#       "category": "one of: auto-renewal | liability | missing-exit | ip-assignment | indemnity | payment | confidentiality | other",
#       "risk_level": "high | medium | low",
#       "text_excerpt": "brief verbatim or near-verbatim excerpt from the contract",
#       "explanation": "plain-English explanation of why this is risky and what to do about it"
#     }
#   ],
#   "plain_english_summary": "1–2 paragraph summary a non-lawyer can understand, highlighting the most important points and top risks"
# }

# Risk identification rules:
# - HIGH risk: one-sided indemnity, unlimited liability, automatic IP assignment, missing termination-for-convenience, punitive late fees
# - MEDIUM risk: auto-renewal with short opt-out window (<30 days), non-compete clauses, broad confidentiality scope
# - LOW risk: minor notice-period requirements, standard renewal terms with adequate notice

# Identify AT LEAST 3 risks if they exist. If fewer than 3 real risks exist, note that the contract appears low-risk.
# Be accurate — do not hallucinate clauses that are not in the text."""

# USER_TEMPLATE = """Please analyze the following contract and return the structured JSON analysis.

# CONTRACT TEXT:
# ---
# {contract_text}
# ---"""

# # ── Main function ─────────────────────────────────────────────────────────────

# MAX_CHARS = 80_000  # ~20k tokens — well within Claude's context window


# async def analyze_contract(contract_text: str) -> dict:
#     """
#     Send contract text to Claude and return parsed JSON analysis.
#     Truncates very long contracts with a warning in the response.
#     """
#     truncated = False
#     if len(contract_text) > MAX_CHARS:
#         contract_text = contract_text[:MAX_CHARS]
#         truncated = True
#         logger.warning(f"Contract truncated to {MAX_CHARS} chars for analysis.")

#     message = _client.messages.create(
#         model=MODEL,
#         max_tokens=4096,
#         system=SYSTEM_PROMPT,
#         messages=[
#             {"role": "user", "content": USER_TEMPLATE.format(contract_text=contract_text)}
#         ],
#     )

#     raw_text = message.content[0].text.strip()
#     logger.info(f"Claude responded ({len(raw_text)} chars), usage: {message.usage}")

#     analysis = _parse_json(raw_text)

#     if truncated:
#         analysis["_warning"] = (
#             "Contract was very long and was truncated before analysis. "
#             "Some clauses near the end may not be reflected."
#         )

#     return analysis


# # ── Helpers ───────────────────────────────────────────────────────────────────

# def _parse_json(text: str) -> dict:
#     """
#     Robustly parse Claude's JSON response.
#     Strips markdown code fences if present.
#     """
#     # Remove ```json ... ``` or ``` ... ``` wrappers
#     cleaned = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
#     cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE)
#     cleaned = cleaned.strip()

#     try:
#         return json.loads(cleaned)
#     except json.JSONDecodeError as e:
#         logger.error(f"JSON parse error: {e}\nRaw response:\n{cleaned[:500]}")
#         # Return a graceful error object instead of crashing
#         return {
#             "error": "Failed to parse AI response as JSON.",
#             "raw_response": cleaned,
#             "parties": [],
#             "dates": {},
#             "payment_terms": "N/A",
#             "termination": "N/A",
#             "renewal": None,
#             "risks": [],
#             "plain_english_summary": "Analysis could not be structured. Raw response included.",
#         }
 



# import os
# import json
# import logging
# import re
# import google.generativeai as genai

# logger = logging.getLogger(__name__)

# genai.configure(api_key="AIzaSyAvZvCFDr1EA2osnY9A3g0lpn-Gb7h8uX8")
# model = genai.GenerativeModel("gemini-2.0-flash")

# SYSTEM_PROMPT = """You are an expert contract lawyer and risk analyst.
# Respond with ONLY a valid JSON object (no markdown, no extra text):
# {
#   "parties": [],
#   "dates": {"effective": "", "duration": "", "renewal": ""},
#   "payment_terms": "",
#   "termination": "",
#   "renewal": "",
#   "confidentiality": "",
#   "ip_ownership": "",
#   "governing_law": "",
#   "risks": [{"clause": "", "category": "", "risk_level": "high|medium|low", "text_excerpt": "", "explanation": ""}],
#   "plain_english_summary": ""
# }
# HIGH risk: one-sided indemnity, unlimited liability, IP assignment, missing termination clause.
# MEDIUM risk: auto-renewal short opt-out, non-compete, broad confidentiality.
# LOW risk: minor notice requirements."""

# MAX_CHARS = 80_000

# async def analyze_contract(contract_text: str) -> dict:
#     if len(contract_text) > MAX_CHARS:
#         contract_text = contract_text[:MAX_CHARS]
#     prompt = f"{SYSTEM_PROMPT}\n\nCONTRACT:\n---\n{contract_text}\n---"
#     response = model.generate_content(prompt)
#     return _parse_json(response.text.strip())

# def _parse_json(text: str) -> dict:
#     cleaned = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
#     cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE)
#     try:
#         return json.loads(cleaned.strip())
#     except json.JSONDecodeError:
#         return {"error": "Failed to parse response", "parties": [], "dates": {},
#                 "payment_terms": "N/A", "termination": "N/A", "renewal": None,
#                 "risks": [], "plain_english_summary": "Analysis failed."}




import json
import logging
import re
from groq import Groq

logger = logging.getLogger(__name__)

client = Groq(api_key="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")

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