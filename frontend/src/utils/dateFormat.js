export function daysLabel(days) {
  if (days === null || days === undefined) return "?";
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 14) return "1 week";
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks} weeks`;
  }
  if (days < 60) return "1 month";
  const months = Math.round(days / 30);
  return `${months} months`;
}

export function daysClass(days) {
  if (days === null || days === undefined) return "soon";
  if (days <= 0) return "expired";
  if (days <= 3) return "urgent";
  if (days <= 7) return "soon";
  return "fresh";
}
