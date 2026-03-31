export const SOS_CATEGORIES = [
  {
    id: "academic",
    icon: "📚",
    label: "หมวดบริหารงานวิชาการ",
    shortLabel: "วิชาการ",
    description: "ปัญหาที่เกี่ยวข้องกับภาระการสอน หลักสูตร การประเมิน และสื่อการเรียนรู้",
    sensitive: false,
    groups: [
      {
        id: "teaching-load",
        label: "1.1 ภาระงานสอน",
        shortLabel: "ภาระงานสอน",
        tags: [
          { id: "overload", label: "สอนเกินเกณฑ์" },
          { id: "off-major", label: "สอนไม่ตรงเอก" },
          { id: "multi-grade", label: "สอนควบชั้น" },
          { id: "substitute-class", label: "คาบสอนแทน" },
          { id: "dense-schedule", label: "ตารางสอนแน่น" },
        ],
      },
      {
        id: "curriculum-evaluation",
        label: "1.2 หลักสูตรและการประเมิน",
        shortLabel: "หลักสูตร/ประเมิน",
        tags: [
          { id: "pp-workload", label: "ภาระงาน ปพ." },
          { id: "special-needs", label: "เด็กพิเศษ (เรียนร่วม)" },
          { id: "top-down-policy", label: "นโยบายเบื้องบน" },
        ],
      },
      {
        id: "media-it",
        label: "1.3 สื่อและเทคโนโลยี",
        shortLabel: "สื่อ/เทคโนโลยี",
        tags: [
          { id: "it-damaged", label: "อุปกรณ์ IT ชำรุด" },
          { id: "internet-drop", label: "อินเทอร์เน็ตหลุด" },
          { id: "material-shortage", label: "ขาดแคลนวัสดุฝึก" },
        ],
      },
      {
        id: "professional-advancement",
        label: "1.4 วิทยฐานะ/PA",
        shortLabel: "วิทยฐานะ/PA",
        tags: [
          { id: "pa-workload", label: "ภาระงาน PA" },
          { id: "no-mentor", label: "ขาดพี่เลี้ยง (Mentor)" },
        ],
      },
    ],
  },
  {
    id: "hr-personnel",
    icon: "👥",
    label: "หมวดบริหารงานบุคคล",
    shortLabel: "บุคคล",
    description: "ปัญหางานนอกเหนือการสอน สิทธิ สวัสดิการ และวัฒนธรรมองค์กร",
    sensitive: false,
    groups: [
      {
        id: "non-teaching-duties",
        label: "2.1 ภาระงานพิเศษนอกเหนือการสอน",
        shortLabel: "งานพิเศษ",
        tags: [
          { id: "finance-procurement", label: "งานการเงิน/พัสดุ" },
          { id: "admin-paperwork", label: "งานธุรการ" },
          { id: "guard-duty", label: "เข้าเวรยาม" },
          { id: "canteen-health", label: "งานอนามัย/โรงอาหาร" },
        ],
      },
      {
        id: "rights-benefits",
        label: "2.2 สิทธิและสวัสดิการ",
        shortLabel: "สิทธิ/สวัสดิการ",
        tags: [
          { id: "leave-approval", label: "อนุมัติวันลายาก" },
          { id: "teacher-housing", label: "บ้านพักครู" },
          { id: "contract-instability", label: "ความมั่นคง (ครูอัตราจ้าง)" },
        ],
      },
      {
        id: "workplace-culture",
        label: "2.3 สัมพันธภาพและวัฒนธรรมองค์กร",
        shortLabel: "วัฒนธรรมองค์กร",
        tags: [
          { id: "sotus", label: "ระบบอาวุโส (SOTUS)" },
          { id: "factions", label: "แบ่งพรรคแบ่งพวก" },
          { id: "unfair-evaluation", label: "การประเมินไม่เป็นธรรม" },
        ],
      },
    ],
  },
  {
    id: "finance",
    icon: "💰",
    label: "หมวดบริหารงบประมาณ",
    shortLabel: "งบประมาณ",
    description: "ปัญหางบประมาณที่กระทบการทำงานประจำของครู",
    sensitive: false,
    groups: [
      {
        id: "budget-operations",
        label: "3.1 การเงินและงบประมาณ",
        shortLabel: "การเงิน",
        tags: [
          { id: "personal-advance", label: "สำรองจ่ายเงินส่วนตัว" },
          { id: "fussy-reimbursement", label: "ระเบียบเบิกจ่ายจุกจิก" },
          { id: "unfair-budget", label: "งบไม่เป็นธรรม" },
        ],
      },
    ],
  },
  {
    id: "facilities",
    icon: "🏫",
    label: "หมวดอาคารสถานที่และสิ่งแวดล้อม",
    shortLabel: "อาคารสถานที่",
    description: "ปัญหาโครงสร้างพื้นฐาน สิ่งแวดล้อม และความปลอดภัยในโรงเรียน",
    sensitive: false,
    groups: [
      {
        id: "infrastructure",
        label: "4.1 โครงสร้างพื้นฐาน",
        shortLabel: "โครงสร้างพื้นฐาน",
        tags: [
          { id: "toilet", label: "ห้องน้ำ" },
          { id: "classroom-condition", label: "สภาพห้องเรียน" },
          { id: "teacher-room", label: "ห้องพักครู" },
        ],
      },
      {
        id: "safety",
        label: "4.2 ความปลอดภัย",
        shortLabel: "ความปลอดภัย",
        tags: [
          { id: "danger-zone", label: "จุดเสี่ยงอันตราย" },
          { id: "outside-person", label: "บุคคลภายนอก" },
          { id: "animal-risk", label: "สัตว์รบกวน" },
        ],
      },
    ],
  },
  {
    id: "student-affairs",
    icon: "👨‍👩‍👧‍👦",
    label: "หมวดกิจการนักเรียน",
    shortLabel: "กิจการนักเรียน",
    description: "ปัญหาพฤติกรรม ระบบดูแลช่วยเหลือ และความสัมพันธ์กับผู้ปกครอง",
    sensitive: false,
    groups: [
      {
        id: "student-behavior",
        label: "5.1 พฤติกรรมนักเรียน",
        shortLabel: "พฤติกรรมนักเรียน",
        tags: [
          { id: "drugs-vape", label: "สารเสพติด/บุหรี่ไฟฟ้า" },
          { id: "fight-bully", label: "ทะเลาะวิวาท/บูลลี่" },
          { id: "relationship-risk", label: "ปัญหาชู้สาว" },
          { id: "absence-dropout", label: "ขาดเรียน/หนีเรียน" },
        ],
      },
      {
        id: "support-parents",
        label: "5.2 ระบบดูแลช่วยเหลือและผู้ปกครอง",
        shortLabel: "ดูแลช่วยเหลือ/ผู้ปกครอง",
        tags: [
          { id: "home-visit-cct", label: "ภาระเยี่ยมบ้าน/คัดกรอง" },
          { id: "student-mental-health", label: "ปัญหาสุขภาพจิตเด็ก" },
          { id: "parents-uncooperative", label: "ผู้ปกครองไม่ร่วมมือ" },
          { id: "parents-harassment", label: "ผู้ปกครองคุกคาม" },
        ],
      },
    ],
  },
  {
    id: "health",
    icon: "🩺",
    label: "หมวดสุขภาพ",
    shortLabel: "สุขภาพ",
    description: "ปัญหาสุขภาพกายและสุขภาพจิตที่เกิดจากบริบทการทำงานของครู",
    sensitive: false,
    groups: [
      {
        id: "physical-health",
        label: "6.1 สุขภาพกาย",
        shortLabel: "สุขภาพกาย",
        tags: [
          { id: "stomach-urinary", label: "กระเพาะ/ปัสสาวะอักเสบ" },
          { id: "office-syndrome", label: "ออฟฟิศซินโดรม/ปวดหลัง" },
          { id: "respiratory-voice", label: "โรคทางเดินหายใจ/เส้นเสียง" },
          { id: "school-infection", label: "ติดโรคจากโรงเรียน" },
        ],
      },
      {
        id: "mental-health",
        label: "6.2 สุขภาพจิต",
        shortLabel: "สุขภาพจิต",
        tags: [
          { id: "stress-depression", label: "เครียดสะสม/ซึมเศร้า" },
          { id: "burnout", label: "หมดไฟ (Burnout)" },
          { id: "no-disconnect", label: "งานล้ำเส้นเวลาส่วนตัว" },
        ],
      },
    ],
  },
  {
    id: "top-secret",
    icon: "🔒",
    label: "หมวดความลับสุดยอด / การทุจริต",
    shortLabel: "ลับสุดยอด",
    description: "ข้อมูลปิดที่อ่านได้เฉพาะผู้ดูแลหรือผู้ตรวจการเท่านั้น",
    sensitive: true,
    groups: [
      {
        id: "whistleblower",
        label: "7.1 เรื่องลับและการทุจริต",
        shortLabel: "Whistleblower",
        tags: [
          { id: "budget-fraud", label: "ทุจริตงบประมาณ" },
          { id: "abuse-of-power", label: "ใช้อำนาจมิชอบ" },
          { id: "sexual-harassment", label: "ล่วงละเมิดทางเพศ" },
          { id: "workplace-bullying", label: "กลั่นแกล้งในที่ทำงาน" },
          { id: "life-crisis", label: "วิกฤตชีวิตส่วนตัว" },
        ],
      },
    ],
  },
];

function getFallbackCategory() {
  return SOS_CATEGORIES[0];
}

function getFallbackGroup(categoryId) {
  return getSosCategoryMeta(categoryId).groups[0];
}

function findTagAcrossCategory(category, tagId) {
  for (const group of category.groups) {
    const tag = group.tags.find((item) => item.id === tagId);
    if (tag) {
      return { group, tag };
    }
  }

  const fallbackGroup = category.groups[0];
  return {
    group: fallbackGroup,
    tag: fallbackGroup?.tags[0] || { id: "", label: "" },
  };
}

export function getSosCategoryMeta(categoryId) {
  return SOS_CATEGORIES.find((category) => category.id === categoryId) ?? getFallbackCategory();
}

export function getSosGroupOptions(categoryId) {
  return getSosCategoryMeta(categoryId).groups || [];
}

export function getSosGroupMeta(categoryId, groupId) {
  return getSosGroupOptions(categoryId).find((group) => group.id === groupId) ?? getFallbackGroup(categoryId);
}

export function getSosTagOptions(categoryId, groupId) {
  return getSosGroupMeta(categoryId, groupId).tags || [];
}

export function getSosTagMeta(categoryId, groupId, tagId) {
  const category = getSosCategoryMeta(categoryId);

  if (groupId) {
    return getSosTagOptions(categoryId, groupId).find((tag) => tag.id === tagId) ?? getSosTagOptions(categoryId, groupId)[0];
  }

  return findTagAcrossCategory(category, tagId).tag;
}

export function getSosTagContext(categoryId, groupId, tagId) {
  const category = getSosCategoryMeta(categoryId);

  if (groupId) {
    return {
      category,
      group: getSosGroupMeta(categoryId, groupId),
      tag: getSosTagMeta(categoryId, groupId, tagId),
    };
  }

  const result = findTagAcrossCategory(category, tagId);
  return {
    category,
    group: result.group,
    tag: result.tag,
  };
}

export function normalizeSosVisibility(categoryId, anonymous = false) {
  const category = getSosCategoryMeta(categoryId);

  return {
    isSensitive: category.sensitive,
    visibility: category.sensitive ? "private" : "public",
    anonymous: category.sensitive ? true : anonymous,
  };
}

export function isPublicSosTicket(ticket) {
  return (
    ticket?.approvalStatus === "approved" &&
    ticket?.visibility === "public" &&
    ticket?.isSensitive !== true
  );
}

export function buildSosCategorySummary(tickets) {
  return SOS_CATEGORIES.map((category) => {
    const relatedTickets = tickets.filter((ticket) => ticket.categoryId === category.id);

    return {
      ...category,
      count: relatedTickets.length,
      pending: relatedTickets.filter((ticket) => ticket.approvalStatus === "pending").length,
      active: relatedTickets.filter((ticket) => ticket.workflowStatus !== "resolved").length,
    };
  }).filter((category) => category.count > 0);
}

export function buildSosTagSummary(tickets) {
  const counter = new Map();

  tickets.forEach((ticket) => {
    if (!ticket.categoryId || !ticket.tagId) {
      return;
    }

    const { category, group, tag } = getSosTagContext(ticket.categoryId, ticket.groupId, ticket.tagId);
    const key = `${category.id}:${group.id}:${tag.id}`;
    const previous = counter.get(key);

    counter.set(key, {
      key,
      count: (previous?.count || 0) + 1,
      categoryLabel: category.shortLabel,
      groupLabel: group.shortLabel || group.label,
      label: tag.label,
      sensitive: category.sensitive,
    });
  });

  return [...counter.values()].sort((left, right) => right.count - left.count);
}
