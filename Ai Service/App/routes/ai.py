import json
import os

import httpx
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)

AI_SERVICE_SECRET = os.getenv("AI_SERVICE_SECRET")

if not AI_SERVICE_SECRET:
    raise RuntimeError("AI_SERVICE_SECRET is not configured")


class ChatRequest(BaseModel):
    question: str
    monitoring_data: dict


def verify_ai_service_secret(
    provided_secret: str | None,
):
    if not provided_secret:
        raise HTTPException(
            status_code=401,
            detail="AI service authentication required",
        )

    if provided_secret != AI_SERVICE_SECRET:
        raise HTTPException(
            status_code=403,
            detail="Invalid AI service authentication",
        )


def get_openrouter_key() -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY is not configured",
        )

    return api_key


async def call_openrouter(
    system_prompt: str,
    user_prompt: str,
):
    api_key = get_openrouter_key()

    payload = {
        "model": "openai/gpt-4.1-mini",
        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        "temperature": 0.2,
        "max_tokens": 500,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "AI Autonomous Database Monitoring",
    }

    try:
        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json=payload,
                headers=headers,
            )

        response.raise_for_status()

        result = response.json()

        content = (
            result.get("choices", [{}])[0]
            .get("message", {})
            .get("content")
        )

        if not content:
            raise HTTPException(
                status_code=502,
                detail="AI provider returned an empty response",
            )

        return content

    except httpx.HTTPStatusError as exc:
        try:
            provider_error = exc.response.json()
        except Exception:
            provider_error = exc.response.text

        print("OpenRouter error:", provider_error)

        raise HTTPException(
            status_code=502,
            detail="AI provider request failed",
        )

    except httpx.RequestError as exc:
        print(
            "OpenRouter connection error:",
            str(exc),
        )

        raise HTTPException(
            status_code=502,
            detail="Unable to connect to AI provider",
        )


@router.get("/health")
def ai_health():
    return {
        "success": True,
        "service": "AI Assistant",
        "status": "healthy",
    }


@router.post("/chat")
async def chat(
    request: ChatRequest,
    x_ai_service_secret: str | None = Header(
        default=None,
        alias="X-AI-Service-Secret",
    ),
):
    verify_ai_service_secret(x_ai_service_secret)

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question is required",
        )

    system_prompt = """
You are an expert PostgreSQL Database Administrator.

Answer the user's question using ONLY the monitoring data provided.

Rules:
- Do not invent database metrics.
- Do not invent tables, columns, queries, or indexes.
- Be concise and practical.
- Explain the answer using actual monitoring values.
"""

    user_prompt = f"""
Current Database Monitoring Data:

{json.dumps(request.monitoring_data, indent=2)}

User Question:

{question}
"""

    content = await call_openrouter(
        system_prompt,
        user_prompt,
    )

    return {
        "success": True,
        "answer": content,
    }


@router.post("/recommendation")
async def recommendation(
    request: ChatRequest,
    x_ai_service_secret: str | None = Header(
        default=None,
        alias="X-AI-Service-Secret",
    ),
):
    verify_ai_service_secret(x_ai_service_secret)

    system_prompt = """
You are a PostgreSQL Database Performance Engineer.

Analyze ONLY the supplied real monitoring data.

Return ONLY valid JSON.
Do not return markdown.
Do not return code fences.

Return EXACTLY:

{
  "confidence": 0,
  "suggestion": "",
  "estimatedGain": "0%",
  "recommendations": []
}

Rules:
- confidence must be an integer from 0 to 100.
- suggestion must be short and actionable.
- estimatedGain must be a percentage string such as "5%" or "N/A".
- recommendations must be an array of strings.
- Never invent metrics.
- Never invent indexes, tables, columns, or SQL.
- Do not recommend a change unless the monitoring data supports it.
- If the database is healthy and no clear improvement is indicated, use:
  "Database is running efficiently. Continue monitoring."
  and estimatedGain "N/A".
"""

    user_prompt = f"""
Real Database Monitoring Data:

{json.dumps(request.monitoring_data, indent=2)}
"""

    content = await call_openrouter(
        system_prompt,
        user_prompt,
    )

    try:
        parsed = json.loads(content)

        confidence = int(parsed.get("confidence", 0))
        confidence = max(0, min(100, confidence))

        suggestion = str(
            parsed.get(
                "suggestion",
                "Continue monitoring the database.",
            )
        )

        estimated_gain = str(
            parsed.get(
                "estimatedGain",
                "N/A",
            )
        )

        recommendations = parsed.get(
            "recommendations",
            [],
        )

        if not isinstance(recommendations, list):
            recommendations = []

        recommendations = [
            str(item)
            for item in recommendations
        ]

        return {
            "success": True,
            "confidence": confidence,
            "suggestion": suggestion,
            "estimatedGain": estimated_gain,
            "recommendations": recommendations,
        }

    except (json.JSONDecodeError, ValueError, TypeError):
        return {
            "success": True,
            "confidence": 0,
            "suggestion": "AI recommendation could not be structured.",
            "estimatedGain": "N/A",
            "recommendations": [],
        }