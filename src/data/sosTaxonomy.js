export const SOS_CATEGORIES = [
  {
    id: "academic-affairs",
    icon: "📚",
    label: "หมวดหมู่การบริหารงานวิชาการ",
    shortLabel: "งานวิชาการ",
    description: "ปัญหาที่เกี่ยวข้องกับการจัดการเรียนการสอนโดยตรง",
    sensitive: false,
    tags: [
      {
        id: "teaching-load",
        label: "ภาระงานสอน",
        examples: ["จำนวนคาบสอนมากเกินไป", "สอนไม่ตรงเอก", "คาบสอนแทน"],
      },
      {
        id: "curriculum-assessment",
        label: "หลักสูตรและการประเมิน",
        examples: [
          "ความซับซ้อนของหลักสูตร",
          "ปัญหาการทำ ปพ.",
          "ระบบตัดเกรด",
          "การประเมินผลตัวชี้วัด",
        ],
      },
      {
        id: "teaching-media",
        label: "สื่อและเทคโนโลยีการสอน",
        examples: [
          "อุปกรณ์ในห้องเรียนเสีย",
          "อินเทอร์เน็ตไม่เสถียร",
          "ขาดแคลนสื่อ",
        ],
      },
      {
        id: "professional-growth",
        label: "การพัฒนาตนเอง/วิทยฐานะ",
        examples: [
          "ขาดงบประมาณอบรม",
          "เกณฑ์ประเมิน PA ยุ่งยาก",
          "ภาระงานวิจัยในชั้นเรียน",
        ],
      },
    ],
  },
  {
    id: "personnel-hr",
    icon: "👥",
    label: "หมวดหมู่การบริหารงานบุคคล",
    shortLabel: "งานบุคคล",
    description: "สิทธิ สวัสดิการ และภาระงานอื่น ๆ ของครู",
    sensitive: false,
    tags: [
      {
        id: "special-duty",
        label: "ภาระงานพิเศษ",
        examples: [
          "งานเอกสารนอกเหนือการสอน",
          "งานพัสดุ/การเงินสำหรับครูผู้สอน",
          "งานเข้าเวรยาม",
        ],
      },
      {
        id: "rules-benefits",
        label: "กฎระเบียบและสวัสดิการ",
        examples: [
          "การลางานยุ่งยาก",
          "สวัสดิการบ้านพักครู",
          "การเบิกจ่ายสวัสดิการล่าช้า",
        ],
      },
      {
        id: "performance-review",
        label: "การประเมินผลการปฏิบัติงาน",
        examples: [
          "ไม่เป็นธรรมในการเลื่อนขั้นเงินเดือน",
          "เกณฑ์การประเมินไม่ชัดเจน",
        ],
      },
      {
        id: "work-relationship",
        label: "สัมพันธภาพในองค์กร",
        examples: [
          "การสื่อสารระหว่างผู้บริหารกับครู",
          "การประสานงานระหว่างหมวดวิชา/สายชั้น",
        ],
      },
    ],
  },
  {
    id: "budget-finance",
    icon: "💰",
    label: "หมวดหมู่การบริหารงบประมาณ",
    shortLabel: "งบประมาณ",
    description: "ปัญหาเรื่องงบประมาณที่กระทบต่อการทำงาน",
    sensitive: false,
    tags: [
      {
        id: "delay",
        label: "ความล่าช้า",
        examples: [
          "การอนุมัติโครงการช้า",
          "การเบิกจ่ายเงินสดล่วงหน้า",
          "การคืนเงินสำรองจ่าย",
        ],
      },
      {
        id: "budget-capacity",
        label: "ความเพียงพอ",
        examples: [
          "งบประมาณแต่ละหมวดวิชาไม่พอ",
          "ข้อจำกัดในการจัดซื้อวัสดุอุปกรณ์",
        ],
      },
      {
        id: "finance-paperwork",
        label: "กระบวนการเอกสาร",
        examples: ["เอกสารการเงิน/พัสดุซับซ้อน", "ภาระ e-GP"],
      },
    ],
  },
  {
    id: "general-admin-facilities",
    icon: "🏫",
    label: "หมวดหมู่การบริหารทั่วไปและอาคารสถานที่",
    shortLabel: "อาคารสถานที่",
    description: "สภาพแวดล้อมและโครงสร้างพื้นฐานของโรงเรียน",
    sensitive: false,
    tags: [
      {
        id: "environment-building",
        label: "สภาพแวดล้อม/อาคาร",
        examples: [
          "ห้องเรียนทรุดโทรม",
          "แสงสว่าง/พัดลม/แอร์ไม่เพียงพอ",
          "ห้องน้ำไม่สะอาด",
        ],
      },
      {
        id: "safety",
        label: "ความปลอดภัย",
        examples: ["จุดเสี่ยงในโรงเรียน", "คนแปลกหน้าเข้าออก", "ระบบป้องกันอัคคีภัย"],
      },
      {
        id: "utilities",
        label: "สาธารณูปโภค",
        examples: ["น้ำประปาไม่ไหล", "ไฟตก/ไฟดับบ่อย", "พื้นที่ทำงานไม่เพียงพอ"],
      },
    ],
  },
  {
    id: "student-affairs",
    icon: "👨‍👩‍👧‍👦",
    label: "หมวดหมู่กิจการนักเรียนและผู้ปกครอง",
    shortLabel: "กิจการนักเรียน",
    description: "ปัญหาที่เกิดจากการดูแลนักเรียนและการมีส่วนร่วมของผู้ปกครอง",
    sensitive: false,
    tags: [
      {
        id: "student-behavior",
        label: "พฤติกรรมนักเรียน",
        examples: ["นักเรียนหนีเรียน", "ทะเลาะวิวาท", "สารเสพติด", "Bullying"],
      },
      {
        id: "advisor-duty",
        label: "งานครูที่ปรึกษา",
        examples: ["ระบบดูแลช่วยเหลือนักเรียน", "การเยี่ยมบ้าน", "ภาระงานโฮมรูม"],
      },
      {
        id: "parents",
        label: "ผู้ปกครอง",
        examples: [
          "ขาดความร่วมมือจากผู้ปกครอง",
          "ความขัดแย้งกับผู้ปกครอง",
          "การร้องเรียนจากผู้ปกครอง",
        ],
      },
    ],
  },
  {
    id: "health-wellbeing",
    icon: "🩺",
    label: "หมวดหมู่สุขภาพและสุขภาวะ",
    shortLabel: "สุขภาวะ",
    description: "คุณภาพชีวิต สุขภาพกาย และสุขภาพจิตของครู",
    sensitive: false,
    tags: [
      {
        id: "physical-health",
        label: "สุขภาพกาย",
        examples: [
          "ออฟฟิศซินโดรม",
          "ปัญหาเส้นเสียง/ลำคอ",
          "ปวดหลัง/ข้อจากการยืนนาน",
          "ฝุ่น PM 2.5",
          "อุบัติเหตุระหว่างปฏิบัติงาน",
        ],
      },
      {
        id: "mental-health",
        label: "สุขภาพจิต",
        examples: [
          "ภาวะหมดไฟ",
          "ความเครียดจากการประเมิน",
          "Work-Life Balance",
          "ความวิตกกังวล/ซึมเศร้า",
        ],
      },
    ],
  },
  {
    id: "confidential-sensitive",
    icon: "🔒",
    label: "หมวดหมู่ความลับและเรื่องละเอียดอ่อน",
    shortLabel: "เรื่องลับ",
    description: "ไม่แสดงคำตอบสาธารณะและเหมาะกับการปิดบังตัวตน",
    sensitive: true,
    tags: [
      {
        id: "misconduct",
        label: "การทุจริต/ประพฤติมิชอบ",
        examples: ["การเรียกรับผลประโยชน์", "การใช้งบประมาณผิดวัตถุประสงค์"],
      },
      {
        id: "harassment",
        label: "การคุกคาม/ล่วงละเมิด",
        examples: [
          "Sexual Harassment",
          "Abuse of Power",
          "Workplace Bullying",
        ],
      },
      {
        id: "serious-conflict",
        label: "ความขัดแย้งรุนแรง",
        examples: [
          "ความขัดแย้งกับเพื่อนร่วมงาน",
          "ความขัดแย้งกับผู้บังคับบัญชา",
        ],
      },
      {
        id: "personal-impact",
        label: "ปัญหาส่วนตัวที่กระทบงาน",
        examples: ["ปัญหาหนี้สินครู", "ปัญหาครอบครัว"],
      },
    ],
  },
];

export function getSosCategoryMeta(categoryId) {
  return SOS_CATEGORIES.find((category) => category.id === categoryId) ?? SOS_CATEGORIES[0];
}

export function getSosTagOptions(categoryId) {
  return getSosCategoryMeta(categoryId).tags;
}

export function getSosTagMeta(categoryId, tagId) {
  return getSosTagOptions(categoryId).find((tag) => tag.id === tagId) ?? getSosTagOptions(categoryId)[0];
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
  const tagCounter = new Map();

  tickets.forEach((ticket) => {
    if (!ticket.categoryId || !ticket.tagId) {
      return;
    }

    const category = getSosCategoryMeta(ticket.categoryId);
    const tag = getSosTagMeta(ticket.categoryId, ticket.tagId);
    const key = `${ticket.categoryId}:${ticket.tagId}`;
    const previous = tagCounter.get(key);

    tagCounter.set(key, {
      key,
      count: (previous?.count || 0) + 1,
      categoryLabel: category.shortLabel,
      label: tag.label,
      sensitive: category.sensitive,
    });
  });

  return [...tagCounter.values()].sort((left, right) => right.count - left.count);
}
