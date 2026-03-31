export const SOS_LEVELS = [
  {
    value: "red",
    priority: 1,
    colorName: "สีแดง",
    label: "ฉุกเฉินวิกฤติ",
    englishLabel: "Emergency",
    cardClass: "border-red-200 bg-red-50 text-red-700",
    badgeClass: "border-red-200 bg-red-100 text-red-700",
  },
  {
    value: "yellow",
    priority: 2,
    colorName: "สีเหลือง",
    label: "ฉุกเฉินเร่งด่วน",
    englishLabel: "Urgency",
    cardClass: "border-amber-200 bg-amber-50 text-amber-700",
    badgeClass: "border-amber-200 bg-amber-100 text-amber-700",
  },
  {
    value: "green",
    priority: 3,
    colorName: "สีเขียว",
    label: "ฉุกเฉินไม่เร่งด่วน",
    englishLabel: "Semi urgency",
    cardClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    badgeClass: "border-emerald-200 bg-emerald-100 text-emerald-700",
  },
  {
    value: "white",
    priority: 4,
    colorName: "สีขาว",
    label: "ไม่ฉุกเฉิน",
    englishLabel: "Non urgency",
    cardClass: "border-slate-200 bg-white text-slate-700",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
  },
  {
    value: "black",
    priority: 5,
    colorName: "สีดำ",
    label: "ทั่วไป",
    englishLabel: "General",
    cardClass: "border-slate-950 bg-slate-950 text-white",
    badgeClass: "border-slate-700 bg-slate-900 text-white",
  },
];

export const SOS_APPROVAL_OPTIONS = [
  {
    value: "pending",
    label: "รออนุมัติ",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    value: "approved",
    label: "อนุมัติแล้ว",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    value: "rejected",
    label: "ต้องทบทวน/ไม่อนุมัติ",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
  },
];

export const SOS_WORKFLOW_STATUS_OPTIONS = [
  {
    value: "submitted",
    label: "ส่งเรื่องแล้ว",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
  },
  {
    value: "in_review",
    label: "กำลังตรวจสอบ",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    value: "in_progress",
    label: "กำลังดำเนินการ",
    badgeClass: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  {
    value: "resolved",
    label: "ปิดเรื่องแล้ว",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
];

export const SOS_STATUS_OPTIONS = SOS_WORKFLOW_STATUS_OPTIONS;

export function getSosLevelMeta(levelValue) {
  return SOS_LEVELS.find((level) => level.value === levelValue) ?? SOS_LEVELS[4];
}

export function getSosApprovalMeta(statusValue) {
  return (
    SOS_APPROVAL_OPTIONS.find((status) => status.value === statusValue) ??
    SOS_APPROVAL_OPTIONS[0]
  );
}

export function getSosWorkflowStatusMeta(statusValue) {
  return (
    SOS_WORKFLOW_STATUS_OPTIONS.find((status) => status.value === statusValue) ??
    SOS_WORKFLOW_STATUS_OPTIONS[0]
  );
}

export function getSosStatusMeta(statusValue) {
  return getSosWorkflowStatusMeta(statusValue);
}
