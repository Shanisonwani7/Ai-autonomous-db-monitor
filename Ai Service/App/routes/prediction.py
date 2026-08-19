from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"],
)


class MonitoringRecord(BaseModel):
    activeConnections: float = 0
    runningQueries: float = 0
    slowQueries: float = 0
    deadlocks: float = 0
    locks: float = 0
    longTransactions: float = 0
    healthScore: float | None = None
    databaseSize: str | None = None


class PredictionRequest(BaseModel):
    database: str
    history: list[MonitoringRecord] = Field(default_factory=list)


def average(records, field):
    if not records:
        return 0.0

    return sum(getattr(r, field) or 0 for r in records) / len(records)


def maximum(records, field):
    if not records:
        return 0.0

    return max(getattr(r, field) or 0 for r in records)


def parse_database_size(size):
    if not size:
        return 0.0

    text = str(size).lower()

    try:
        value = float(
            "".join(
                ch for ch in text
                if ch.isdigit() or ch == "."
            )
        )
    except ValueError:
        return 0.0

    if "gb" in text:
        return value * 1024

    if "mb" in text:
        return value

    if "kb" in text:
        return value / 1024

    return value


@router.post("/analyze")
def predict_database_failure(request: PredictionRequest):
    history = request.history

    if not history:
        return {
            "success": True,
            "database": request.database,
            "prediction": {
                "riskLevel": "Unknown",
                "probability": "N/A",
                "status": "Insufficient Data",
                "message": (
                    "Not enough historical monitoring data "
                    "is available to predict database failure."
                ),
                "recommendations": [
                    "Continue monitoring the database.",
                    "Collect more historical monitoring data.",
                ],
            },
        }

    latest = history[0]

    avg_connections = average(
        history, "activeConnections"
    )
    avg_running_queries = average(
        history, "runningQueries"
    )
    avg_slow_queries = average(
        history, "slowQueries"
    )
    avg_locks = average(
        history, "locks"
    )

    max_slow_queries = maximum(
        history, "slowQueries"
    )

    risk_score = 0
    recommendations = []

    # Health score
    if latest.healthScore is not None:
        if latest.healthScore < 40:
            risk_score += 35
            recommendations.append(
                "Database health is critically low. "
                "Immediate maintenance is recommended."
            )
        elif latest.healthScore < 60:
            risk_score += 25
            recommendations.append(
                "Database health is below the safe range. "
                "Investigate performance issues."
            )
        elif latest.healthScore < 80:
            risk_score += 10
            recommendations.append(
                "Database health is below optimal. "
                "Continue monitoring."
            )

    # Active connections
    if (
        avg_connections > 0
        and latest.activeConnections > avg_connections * 2
    ):
        risk_score += 15
        recommendations.append(
            "Active connections are significantly "
            "above the historical average."
        )
    elif (
        avg_connections > 0
        and latest.activeConnections > avg_connections * 1.5
    ):
        risk_score += 8
        recommendations.append(
            "Active connections are trending above "
            "normal levels."
        )

    # Running queries
    if (
        avg_running_queries > 0
        and latest.runningQueries > avg_running_queries * 2
    ):
        risk_score += 10
        recommendations.append(
            "Running queries are significantly above "
            "the historical average."
        )

    # Slow queries
    if latest.slowQueries > 0:
        risk_score += 10
        recommendations.append(
            "Slow queries detected. Query optimization "
            "should be investigated."
        )

    if (
        max_slow_queries > 0
        and latest.slowQueries >= max_slow_queries
    ):
        risk_score += 5

    # Deadlocks
    if latest.deadlocks > 0:
        risk_score += 15
        recommendations.append(
            "Deadlocks detected. Investigate transaction "
            "and locking conflicts."
        )

    # Locks
    if (
        avg_locks > 0
        and latest.locks > avg_locks * 2
    ):
        risk_score += 8
        recommendations.append(
            "Lock activity is significantly above "
            "the historical average."
        )

    # Long transactions
    if latest.longTransactions > 0:
        risk_score += 8
        recommendations.append(
            "Long-running transactions detected."
        )

    # Database size
    database_size_mb = parse_database_size(
        latest.databaseSize
    )

    if database_size_mb > 10240:
        risk_score += 8
        recommendations.append(
            "Database size exceeds 10 GB. Review "
            "storage growth and archive unused data."
        )

    # Trend analysis
    recent = history[:10]
    older = history[10:20]

    if len(recent) >= 3 and len(older) >= 3:
        recent_connections = average(
            recent, "activeConnections"
        )
        older_connections = average(
            older, "activeConnections"
        )

        if (
            older_connections > 0
            and recent_connections > older_connections * 1.5
        ):
            risk_score += 10
            recommendations.append(
                "Active connection usage is increasing "
                "compared with earlier monitoring periods."
            )

        recent_slow = average(
            recent, "slowQueries"
        )
        older_slow = average(
            older, "slowQueries"
        )

        if older_slow == 0 and recent_slow > 0:
            risk_score += 8
            recommendations.append(
                "Slow query activity has recently appeared "
                "in monitoring data."
            )

    risk_score = max(
        0,
        min(round(risk_score), 100)
    )

    if risk_score >= 70:
        risk_level = "High"
        status = "Critical"
        message = (
            "Recent monitoring data indicates a high "
            "risk of future database issues."
        )
    elif risk_score >= 40:
        risk_level = "Medium"
        status = "Warning"
        message = (
            "Some monitoring indicators require attention. "
            "Continue monitoring the database closely."
        )
    else:
        risk_level = "Low"
        status = "Healthy"
        message = (
            "Database is currently healthy based on "
            "recent monitoring data."
        )

    if not recommendations:
        recommendations = [
            "Database is operating within the normal range.",
            "Continue monitoring historical performance trends.",
        ]

    return {
        "success": True,
        "database": request.database,
        "prediction": {
            "riskLevel": risk_level,
            "probability": f"{risk_score}%",
            "status": status,
            "message": message,
            "recommendations": recommendations,
        },
        "analysis": {
            "recordsAnalyzed": len(history),
            "averageConnections": round(
                avg_connections, 2
            ),
            "maximumConnections": maximum(
                history, "activeConnections"
            ),
            "averageRunningQueries": round(
                avg_running_queries, 2
            ),
            "maximumRunningQueries": maximum(
                history, "runningQueries"
            ),
            "averageSlowQueries": round(
                avg_slow_queries, 2
            ),
            "maximumSlowQueries": max_slow_queries,
            "averageLocks": round(
                avg_locks, 2
            ),
            "maximumLocks": maximum(
                history, "locks"
            ),
        },
    }