function formatDuration(interval) {
  if (!interval) return "0 Seconds";

  const parts = [];

  if (interval.years) parts.push(`${interval.years} Years`);
  if (interval.months) parts.push(`${interval.months} Months`);
  if (interval.days) parts.push(`${interval.days} Days`);
  if (interval.hours) parts.push(`${interval.hours} Hours`);
  if (interval.minutes) parts.push(`${interval.minutes} Minutes`);
  if (interval.seconds) parts.push(`${Math.floor(interval.seconds)} Seconds`);
  if (interval.milliseconds)
    parts.push(`${Math.floor(interval.milliseconds)} Milliseconds`);

  return parts.length ? parts.join(" ") : "0 Seconds";
}

module.exports = {
  formatDuration,
};