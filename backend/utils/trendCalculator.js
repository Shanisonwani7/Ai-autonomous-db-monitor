function analyzeSeries(values) {
  const numericValues = values
    .filter((value) => value !== null && value !== undefined)
    .map(Number)
    .filter((value) => Number.isFinite(value));

  if (numericValues.length === 0) {
    return {
      first: null,
      latest: null,
      min: null,
      max: null,
      average: null,
      absoluteChange: null,
      percentChange: null,
      trend: "insufficient_data",
    };
  }

  if (numericValues.length === 1) {
    const value = numericValues[0];

    return {
      first: value,
      latest: value,
      min: value,
      max: value,
      average: value,
      absoluteChange: 0,
      percentChange: 0,
      trend: "stable",
    };
  }

  const first = numericValues[0];
  const latest = numericValues[numericValues.length - 1];

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);

  const average =
    numericValues.reduce((sum, value) => sum + value, 0) /
    numericValues.length;

  const absoluteChange = latest - first;

  // If the series starts at zero:
  // 0 -> 0 is stable, while 0 -> non-zero has
  // undefined percentage change.
  if (first === 0) {
    return {
      first,
      latest,
      min,
      max,
      average: Number(average.toFixed(2)),
      absoluteChange,
      percentChange: null,
      trend: absoluteChange === 0
        ? "stable"
        : "increasing",
    };
  }

  const percentChange =
    (absoluteChange / first) * 100;

  let trend = "stable";

  if (Math.abs(percentChange) >= 5) {
    trend =
      percentChange > 0
        ? "increasing"
        : "decreasing";
  }

  return {
    first,
    latest,
    min,
    max,
    average: Number(average.toFixed(2)),
    absoluteChange,
    percentChange: Number(percentChange.toFixed(2)),
    trend,
  };
}

module.exports = {
  analyzeSeries,
};