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
    raise RuntimeError(
        "AI_SERVICE_SECRET is not configured"
    )


class ChatRequest(BaseModel):
    question: str
    monitoring_data: dict


def get_openrouter_key() -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY is not configured",
        )

    return api_key


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
    # Verify that the request came from our backend.
    verify_ai_service_secret(
        x_ai_service_secret
    )

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question is required",
        )

    api_key = get_openrouter_key()

    system_prompt = """
You are an expert PostgreSQL Database Administrator.

Answer the user's question using ONLY the monitoring data provided.

Rules:
- Do not invent database metrics.
- Do not invent tables, columns, queries, or indexes.
- Be concise and practical.
- Explain the reason using the actual monitoring values.
"""

    user_prompt = f"""
Current Database Monitoring Data:

{request.monitoring_data}

User Question:

{question}
"""

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
        "temperature": 0.3,
        "max_tokens": 400,
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

        return {
            "success": True,
            "answer": content,
        }

    except httpx.HTTPStatusError as exc:
        try:
            provider_error = exc.response.json()
        except Exception:
            provider_error = exc.response.text

        print(
            "OpenRouter error:",
            provider_error,
        )

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

    except HTTPException:
        raise

    except Exception as exc:
        print(
            "AI service error:",
            str(exc),
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to generate AI response",
        )