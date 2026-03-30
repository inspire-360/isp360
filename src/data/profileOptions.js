export const prefixOptions = [
  "นาย",
  "นางสาว",
  "นาง",
  "ดร.",
  "ผอ.",
  "ว่าที่ร้อยตรี",
  "อื่นๆ",
];

export const positionOptions = [
  "ครู",
  "บุคลากรทางการศึกษา",
  "ผู้อำนวยการสถานศึกษา",
  "รองผู้อำนวยการสถานศึกษา",
  "ศึกษานิเทศก์",
  "นักเรียน/นักศึกษา",
  "อื่นๆ",
];

const roleLabels = {
  learner: "ผู้เรียน",
  teacher: "ครู",
  admin: "ผู้ดูแลระบบ",
};

export function getRoleLabel(role) {
  return roleLabels[role] || "ผู้เรียน";
}
