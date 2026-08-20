from typing import Any


def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def average(values: list[float]) -> float:
    if not values:
        return 0.0

    return sum(values) / len(values)


def detect_anomalies(history: list[dict]) -> dict:
    """
    Detect unusual database behaviour by comparing
    the latest monitoring record with recent historical
    averages.

    This is the first rule-based anomaly detector.
    It is intentionally kept separate from prediction.py
    so the project can later replace it with an ML model.
    """

    if not history:
        return {
            "status": "insufficient_data",
            "anomalyScore": 0,
            "riskLevel": "Unknown",
            "anomalies": [],
        }

    # History is expected newest -> oldest.
    latest = history[0]

    recent_history = history[1:20]

    anomalies: list[dict] = []
    anomaly_score = 0

    # --------------------------------------------------
    # Active Connections
    # --------------------------------------------------

    connection_values = [
        safe_float(item.get("activeConnections"))
        for item in recent_history
    ]

    avg_connections = average(connection_values)

    latest_connections = safe_float(
        latest.get("activeConnections")
    )

    if (
        avg_connections > 0
        and latest_connections > avg_connections * 1.5
    ):
        anomaly_score += 20

        anomalies.append({
            "metric": "activeConnections",
            "severity": "medium",
            "message": (
                "Active connections are significantly "
                "above the recent historical average."
            ),
            "current": latest_connections,
            "average": round(avg_connections, 2),
        })

    # --------------------------------------------------
    # Running Queries
    # --------------------------------------------------

    query_values = [
        safe_float(item.get("runningQueries"))
        for item in recent_history
    ]

    avg_running_queries = average(query_values)

    latest_running_queries = safe_float(
        latest.get("runningQueries")
    )

    if (
        avg_running_queries > 0
        and latest_running_queries
        > avg_running_queries * 2
    ):
        anomaly_score += 15

        anomalies.append({
            "metric": "runningQueries",
            "severity": "medium",
            "message": (
                "Running query activity is significantly "
                "above the recent historical average."
            ),
            "current": latest_running_queries,
            "average": round(avg_running_queries, 2),
        })

    # --------------------------------------------------
    # Slow Queries
    # --------------------------------------------------

    slow_values = [
        safe_float(item.get("slowQueries"))
        for item in recent_history
    ]

    avg_slow_queries = average(slow_values)

    latest_slow_queries = safe_float(
        latest.get("slowQueries")
    )

    if (
        latest_slow_queries > 0
        and avg_slow_queries == 0
    ):
        anomaly_score += 20

        anomalies.append({
            "metric": "slowQueries",
            "severity": "high",
            "message": (
                "Slow queries have appeared even though "
                "the recent baseline had none."
            ),
            "current": latest_slow_queries,
            "average": round(avg_slow_queries, 2),
        })

    elif (
        avg_slow_queries > 0
        and latest_slow_queries
        > avg_slow_queries * 2
    ):
        anomaly_score += 15

        anomalies.append({
            "metric": "slowQueries",
            "severity": "medium",
            "message": (
                "Slow query activity is significantly "
                "above the recent baseline."
            ),
            "current": latest_slow_queries,
            "average": round(avg_slow_queries, 2),
        })

    # --------------------------------------------------
    # Locks
    # --------------------------------------------------

    lock_values = [
        safe_float(item.get("locks"))
        for item in recent_history
    ]

    avg_locks = average(lock_values)

    latest_locks = safe_float(
        latest.get("locks")
    )

    if (
        avg_locks > 0
        and latest_locks > avg_locks * 1.5
    ):
        anomaly_score += 15

        anomalies.append({
            "metric": "locks",
            "severity": "medium",
            "message": (
                "Lock activity is significantly above "
                "the recent historical average."
            ),
            "current": latest_locks,
            "average": round(avg_locks, 2),
        })

    # --------------------------------------------------
    # Long Transactions
    # --------------------------------------------------

    long_tx_values = [
        safe_float(item.get("longTransactions"))
        for item in recent_history
    ]

    avg_long_tx = average(long_tx_values)

    latest_long_tx = safe_float(
        latest.get("longTransactions")
    )

    if (
        latest_long_tx > 0
        and avg_long_tx == 0
    ):
        anomaly_score += 20

        anomalies.append({
            "metric": "longTransactions",
            "severity": "high",
            "message": (
                "Long-running transactions have appeared "
                "above a previously normal baseline."
            ),
            "current": latest_long_tx,
            "average": round(avg_long_tx, 2),
        })

    # --------------------------------------------------
    # Deadlocks
    # --------------------------------------------------

    latest_deadlocks = safe_float(
        latest.get("deadlocks")
    )

    recent_deadlocks = [
        safe_float(item.get("deadlocks"))
        for item in recent_history
    ]

    if (
        latest_deadlocks > 0
        and all(value == 0 for value in recent_deadlocks[:-1])
    ):
        anomaly_score += 25

        anomalies.append({
            "metric": "deadlocks",
            "severity": "critical",
            "message": (
                "A new deadlock event has appeared "
                "against a previously zero baseline."
            ),
            "current": latest_deadlocks,
            "average": 0,
        })

    # --------------------------------------------------
    # Health Score
    # --------------------------------------------------

    health_values = [
        safe_float(item.get("healthScore"))
        for item in recent_history
        if item.get("healthScore") is not None
    ]

    latest_health = latest.get("healthScore")

    if latest_health is not None and health_values:
        avg_health = average(health_values)

        latest_health_value = safe_float(
            latest_health
        )

        if latest_health_value < avg_health - 10:
            anomaly_score += 20

            anomalies.append({
                "metric": "healthScore",
                "severity": "high",
                "message": (
                    "Database health score has dropped "
                    "significantly compared with the recent baseline."
                ),
                "current": latest_health_value,
                "average": round(avg_health, 2),
            })

    # --------------------------------------------------
    # Final risk classification
    # --------------------------------------------------

    anomaly_score = min(
        round(anomaly_score),
        100,
    )

    if anomaly_score >= 70:
        risk_level = "Critical"
        status = "anomalous"
    elif anomaly_score >= 40:
        risk_level = "High"
        status = "anomalous"
    elif anomaly_score >= 20:
        risk_level = "Medium"
        status = "warning"
    else:
        risk_level = "Low"
        status = "normal"

    return {
        "status": status,
        "anomalyScore": anomaly_score,
        "riskLevel": risk_level,
        "anomalies": anomalies,
        "baseline": {
            "averageConnections": round(
                avg_connections,
                2,
            ),
            "averageRunningQueries": round(
                avg_running_queries,
                2,
            ),
            "averageSlowQueries": round(
                avg_slow_queries,
                2,
            ),
            "averageLocks": round(
                avg_locks,
                2,
            ),
            "averageLongTransactions": round(
                avg_long_tx,
                2,
            ),
        },
    }