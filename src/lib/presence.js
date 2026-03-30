export function getDateFromTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function isUserCurrentlyOnline(user, thresholdMinutes = 3) {
  const lastSeen = getDateFromTimestamp(user?.lastSeen);

  if (!lastSeen) {
    return false;
  }

  const diffMinutes = (Date.now() - lastSeen.getTime()) / 1000 / 60;
  if (user?.isOnline === false) {
    return false;
  }

  return diffMinutes < thresholdMinutes;
}

export function formatLastSeenLabel(value) {
  const lastSeen = getDateFromTimestamp(value);

  if (!lastSeen) {
    return "ยังไม่มีข้อมูลล่าสุด";
  }

  const diffMs = Date.now() - lastSeen.getTime();
  const diffMinutes = Math.floor(diffMs / 1000 / 60);

  if (diffMinutes <= 0) {
    return "เมื่อสักครู่";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} นาทีที่แล้ว`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} ชั่วโมงที่แล้ว`;
  }

  return lastSeen.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
