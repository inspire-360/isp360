export const insightDimensions = [
  {
    key: "learners",
    label: "Learners (ผู้เรียน)",
    question: "เรื่องอะไรที่ทำให้เด็ก ๆ ตาเป็นประกายมากที่สุดในห้องเรียนของคุณ?",
    hint: "มองหา passion ของผู้เรียน มากกว่าคะแนนหรือความเก่ง",
  },
  {
    key: "learningStyle",
    label: "Learning Style (สไตล์การเรียนรู้)",
    question: "ช่วงเวลา Magic Moment ของห้องเรียนเกิดขึ้นตอนไหน?",
    hint: "มองหาช่วงที่เด็กมี flow, เงียบกริบ หรือมีส่วนร่วมมากที่สุด",
  },
  {
    key: "community",
    label: "Community (พันธมิตร)",
    question: "ใครคือฮีโร่ลับนอกโรงเรียนที่ช่วยการเรียนรู้ของเด็กได้?",
    hint: "ปราชญ์ชาวบ้าน ร้านค้า องค์กรท้องถิ่น หรือผู้ปกครอง",
  },
  {
    key: "painPoints",
    label: "Pain Points (ความเจ็บปวด)",
    question: "ถ้าเสกเวทมนตร์ให้หายไปได้ 1 อย่าง ปัญหานั้นคืออะไร?",
    hint: "หา villain ตัวจริงของพื้นที่การเรียนรู้",
  },
  {
    key: "opportunities",
    label: "Opportunities (โอกาส)",
    question: "มีของดีอะไรที่ถูกวางทิ้งไว้เฉย ๆ และยังไม่ถูกใช้ให้เต็มศักยภาพ?",
    hint: "มองหา hidden assets ที่พร้อมต่อยอดได้ทันที",
  },
  {
    key: "passion",
    label: "Passion (ไฟในใจครู)",
    question: "ถ้าไม่มีข้อจำกัดและมีงบไม่อั้น คุณอยากทำโครงการอะไรที่สุด?",
    hint: "ฟังเสียงความฝันที่อยากทำจริง",
  },
  {
    key: "threats",
    label: "Threats (อุปสรรค)",
    question: "กำแพงที่สูงที่สุดซึ่งขวางการพัฒนาอยู่ตอนนี้คืออะไร?",
    hint: "เวลา งบ ระบบ ระเบียบ หรือความไม่พร้อมของบริบท",
  },
  {
    key: "vision",
    label: "Vision (ภาพปลายทาง)",
    question: "อีก 6 เดือนข้างหน้า คุณอยากเดินเข้าห้องเรียนแล้วเห็นภาพอะไร?",
    hint: "นิยามภาพความสำเร็จให้ชัดเจน",
  },
  {
    key: "smallWins",
    label: "Small Wins (ความสุขเล็ก ๆ)",
    question: "เรื่องเล็ก ๆ อะไรที่ทำให้คุณยิ้มมุมปากและอยากพัฒนาเรื่องนี้ต่อ?",
    hint: "สิ่งเล็ก ๆ ที่เป็นเชื้อไฟให้ครูไม่หมดแรง",
  },
];

export const swotBuckets = [
  { key: "strengths", label: "Strengths", thaiLabel: "จุดแข็ง" },
  { key: "weaknesses", label: "Weaknesses", thaiLabel: "จุดอ่อน" },
  { key: "opportunities", label: "Opportunities", thaiLabel: "โอกาส" },
  { key: "threats", label: "Threats", thaiLabel: "อุปสรรค" },
];

const resourceTypes = ["Text", "Image", "VDO", "Presentation", "Blog"];

const makeArticleLesson = (id, title, summary, outcomes, deliverables, mentorTip) => ({
  id,
  title,
  type: "article",
  iconName: "BookOpen",
  content: {
    summary,
    outcomes,
    deliverables,
    mentorTip,
    resourceTypes,
  },
});

const makeQuizLesson = (id, title, quizId, passScore, extra = {}) => ({
  id,
  title,
  type: "quiz",
  iconName: "ClipboardCheck",
  content: {
    quizId,
    passScore,
    mentorTip: extra.mentorTip,
    mode: extra.mode || "quiz",
    maxAttempts: extra.maxAttempts,
    cooldownHours: extra.cooldownHours,
    description: extra.description,
  },
});

const makeReportLesson = (id, title, moduleKey, badgeName, uniquePrefix, unlockLabel) => ({
  id,
  title,
  type: "certificate",
  iconName: "Award",
  content: {
    certificateType: "module-report",
    moduleKey,
    badgeName,
    uniquePrefix,
    unlockLabel,
  },
});

export const teacherQuizBank = {
  pretest: [
    { id: "pre-1", question: "การวิเคราะห์ความต้องการเชิงพื้นที่ช่วยครูอย่างไร?", options: ["ทำให้ทำเอกสารเร็วขึ้น", "ช่วยมองเห็นปัญหาและโอกาสจริงของพื้นที่", "ใช้แทนผลสอบปลายภาค", "ใช้แทนการประชุม PLC"], correctAnswer: 1 },
    { id: "pre-2", question: "SWOT ใช้เพื่ออะไรเป็นหลัก?", options: ["จัดทำงบประมาณ", "วิเคราะห์ปัจจัยภายในและภายนอกเพื่อกำหนดกลยุทธ์", "ประเมินคะแนนครู", "ทดสอบผู้เรียน"], correctAnswer: 1 },
    { id: "pre-3", question: "Student Agency หมายถึงอะไร?", options: ["การให้เด็กเป็นผู้ลงมือกำหนดเป้าหมายและขับเคลื่อนการเรียนรู้", "การให้เด็กเลือกที่นั่ง", "การให้เด็กทำแบบทดสอบเอง", "การให้เด็กใช้สื่อดิจิทัลตลอดเวลา"], correctAnswer: 0 },
    { id: "pre-4", question: "PLC ที่มีคุณภาพควรเน้นสิ่งใด?", options: ["จำนวนครั้งประชุม", "รูปแบบเอกสาร", "ผลลัพธ์ต่อการเรียนรู้ของผู้เรียน", "จำนวนผู้เข้าร่วม"], correctAnswer: 2 },
    { id: "pre-5", question: "PDCA เป็นเครื่องมือสำคัญเพราะอะไร?", options: ["ใช้เฉพาะงานวิจัย", "ช่วยวางแผน ลงมือ ตรวจสอบ และพัฒนาต่อ", "ใช้แทน SWOT", "ใช้เฉพาะงานบริหาร"], correctAnswer: 1 },
  ],
  module1Posttest: [
    { id: "m1-1", question: "ภารกิจ The 9 Dimensions มีเป้าหมายหลักข้อใด?", options: ["ทำรายงานสั้น ๆ", "เก็บข้อมูลดิบให้ครอบคลุม ลด blind spots", "เลือกนวัตกรรมทันที", "หาคะแนนประเมินตนเอง"], correctAnswer: 1 },
    { id: "m1-2", question: "TOWS Matrix ใช้เพื่ออะไร?", options: ["จับคู่ปัจจัยเพื่อสร้างกลยุทธ์ที่ลงมือทำได้", "แทนการทำ SWOT", "จัดอันดับครู", "สรุปผลสอบ"], correctAnswer: 0 },
    { id: "m1-3", question: "Needs Detective ต้องทำอะไรต่อจากการสร้างกลยุทธ์?", options: ["เลือกกลยุทธ์ 1 แนวทางและให้คะแนน", "เริ่มทำ Module 2", "ทำแบบสอบถามใหม่", "ส่งเกียรติบัตร"], correctAnswer: 0 },
    { id: "m1-4", question: "Action Plan ของ Module 1 ใช้กรอบใด?", options: ["5W1H", "OECD Compass", "PDCA", "SEZ"], correctAnswer: 2 },
    { id: "m1-5", question: "Module 1 จะปลดล็อก Module 2 เมื่อใด?", options: ["เมื่อทำ Mission 1 เสร็จ", "เมื่อผ่าน Post-test และสร้าง Report Card", "เมื่อเข้าสู่ Dashboard", "เมื่อทำ SWOT อย่างเดียว"], correctAnswer: 1 },
  ],
  module2Posttest: [
    { id: "m2-1", question: "Dream Lab ช่วยเรื่องใดมากที่สุด?", options: ["เปิดกรอบคิดและฝันให้ไกลกว่าข้อจำกัดเดิม", "คำนวณงบประมาณ", "ตรวจการบ้าน", "ทำรายงาน PLC"], correctAnswer: 0 },
    { id: "m2-2", question: "Mapping the Journey ต้องเชื่อมกับสิ่งใดจาก Module 1?", options: ["คะแนน Post-test", "Pain Point หรือปัญหาหลักที่เลือก", "Badge ที่ได้รับ", "รายชื่อเพื่อน"], correctAnswer: 1 },
    { id: "m2-3", question: "SMART Objective ต้องมีองค์ประกอบใด?", options: ["Specific Measurable Achievable Relevant Time-bound", "Simple Modern Accurate Repeatable Timely", "Survey Mapping Analysis Reflection Time", "Strategy Mission Active Roadmap Tool"], correctAnswer: 0 },
    { id: "m2-4", question: "Quality Check ของ Module 2 ต้องเชื่อมกับกรอบใดบ้าง?", options: ["แค่ OECD", "OECD, พระบรมราโชบาย ร.10 และ SEZ", "แค่หลักสูตรสถานศึกษา", "แค่ Dashboard"], correctAnswer: 1 },
    { id: "m2-5", question: "ผลลัพธ์หลักของ Module 2 คืออะไร?", options: ["Roadmap ที่เชื่อมเป้าหมายการศึกษาและบริบทพื้นที่", "กราฟ SWOT", "ตาราง PLC", "เกียรติบัตรสุดท้าย"], correctAnswer: 0 },
  ],
  module3Reflection: [
    { id: "m3-1", question: "หลังทำ PLC แล้ว แนวคิดที่ได้จากเพื่อนครูช่วยให้คุณเห็นทางออกใหม่หรือไม่?", options: ["เห็นชัดเจนมาก", "เห็นบางส่วน", "ยังไม่ชัด", "ยังไม่ได้ลองแลกเปลี่ยนจริง"], correctAnswer: 0 },
  ],
  module4Posttest: [
    { id: "m4-1", question: "Innovation Lab ต้องจับคู่สิ่งใดเข้าด้วยกัน?", options: ["ฮาร์ดแวร์/ซอฟต์แวร์ กับรูปแบบ Active Learning", "PLC กับแบบประเมิน", "Badge กับ Survey", "Roadmap กับเกียรติบัตร"], correctAnswer: 0 },
    { id: "m4-2", question: "Lesson Plan ของ Module 4 ควรเชื่อมกับอะไร?", options: ["แนวคิดนวัตกรรมที่ออกแบบไว้", "แค่คะแนนสอบ", "แค่รายชื่อผู้เรียน", "แค่เวลาสอน"], correctAnswer: 0 },
    { id: "m4-3", question: "Crafting Session มีเป้าหมายหลักข้อใด?", options: ["สร้างหรือเตรียมสื่อ/หลักฐานสำหรับใช้จริง", "ทำแบบสอบถามใหม่", "เปิดห้อง Meet", "ปลดล็อกทันทีโดยไม่ส่งงาน"], correctAnswer: 0 },
    { id: "m4-4", question: "นวัตกรรมการสอนที่ดีควรมีลักษณะอย่างไร?", options: ["สวยแต่ใช้จริงไม่ได้", "เชื่อมปัญหา เป้าหมาย และวิธีจัดการเรียนรู้ได้จริง", "ใช้เทคโนโลยีเยอะที่สุด", "แพงที่สุด"], correctAnswer: 1 },
    { id: "m4-5", question: "Module 4 ผ่านเมื่อใด?", options: ["ทำ Innovation Lab อย่างเดียว", "ส่ง Lesson Plan และ Crafting Session พร้อมผ่าน Post-test", "ตอบคำถามใน Dashboard", "ล็อกอินสำเร็จ"], correctAnswer: 1 },
  ],
  module5Posttest: [
    { id: "m5-1", question: "Mission 1 ของ Module 5 ต้องส่งอะไร?", options: ["คลิปการสอนจริง 10 นาที", "ลิงก์ Dashboard", "ผลสอบปลายภาค", "กราฟ SWOT"], correctAnswer: 0 },
    { id: "m5-2", question: "Reflection หลังสอนควรโฟกัสเรื่องใด?", options: ["สิ่งที่เกิดขึ้นจริงกับผู้เรียนและสิ่งที่ควรปรับ", "จำนวนหน้าเอกสาร", "ชื่อไฟล์ภาพ", "สีของสไลด์"], correctAnswer: 0 },
    { id: "m5-3", question: "แนวทางต่อยอดใน Module 5 ควรเชื่อมกับอะไร?", options: ["การพัฒนาแผน/นวัตกรรมรอบถัดไป", "การเปลี่ยนรหัสผ่าน", "การสุ่มเพื่อนครูใหม่", "การสร้าง Badge ใหม่"], correctAnswer: 0 },
    { id: "m5-4", question: "RE-Reflection ช่วยเรื่องใดมากที่สุด?", options: ["ทำให้การสอนรอบต่อไปดีขึ้นอย่างมีหลักฐาน", "ย่นเวลาอบรม", "แทนการทำ Lesson Plan", "ใช้แทน Survey"], correctAnswer: 0 },
    { id: "m5-5", question: "หลังผ่าน Module 5 จะปลดล็อกอะไร?", options: ["Module 2", "Module 4", "Post-test ใหญ่ของหลักสูตร", "Pre-test"], correctAnswer: 2 },
  ],
  finalPosttest: [
    { id: "f-1", question: "The 9 Dimensions ช่วยลดสิ่งใด?", options: ["Blind Spots", "ใบงาน", "การบ้าน", "จำนวนผู้เรียน"], correctAnswer: 0 },
    { id: "f-2", question: "SWOT และ TOWS ต่างกันอย่างไร?", options: ["SWOT ใช้วิเคราะห์ ส่วน TOWS ใช้สร้างกลยุทธ์", "เหมือนกันทุกอย่าง", "TOWS ใช้สอบเท่านั้น", "SWOT ใช้ตอนจบหลักสูตรเท่านั้น"], correctAnswer: 0 },
    { id: "f-3", question: "Roadmap 30 วันของ Module 2 ควรเริ่มจากอะไร?", options: ["Pain Point หรือ Solution ที่เลือกจาก Module 1", "รายชื่อผู้ปกครอง", "เกียรติบัตร", "สีประจำโรงเรียน"], correctAnswer: 0 },
    { id: "f-4", question: "PLC ที่ดีต้องมีองค์ประกอบใด?", options: ["การแลกเปลี่ยนเพื่อยกระดับผู้เรียนและการทำงานร่วมกัน", "ประชุมยาวที่สุด", "ทำเอกสารมากที่สุด", "มีคนเข้าร่วมมากที่สุด"], correctAnswer: 0 },
    { id: "f-5", question: "Innovation Lab ช่วยครูเรื่องใด?", options: ["ออกแบบนวัตกรรมที่เชื่อมเครื่องมือกับวิธีสอน", "ทำคะแนนสอบแทนผู้เรียน", "แทน PLC", "ปิดคอร์ส"], correctAnswer: 0 },
    { id: "f-6", question: "Reflection หลังสอนสำคัญเพราะอะไร?", options: ["ใช้พัฒนารอบถัดไปจากหลักฐานจริง", "ใช้แทนการสอน", "ใช้แทนแผน", "ใช้แทนเป้าหมาย"], correctAnswer: 0 },
    { id: "f-7", question: "SMART Objective ต้องมีข้อใด?", options: ["Specific และ Time-bound", "Simple และ Tiny", "Soft และ Trendy", "Silent และ Timely"], correctAnswer: 0 },
    { id: "f-8", question: "AI Mentor ในแพลตฟอร์มนี้ควรทำหน้าที่ใด?", options: ["ชวนคิดและให้กำลังใจ", "ตัดสินคำตอบแทนครู", "ล็อกบทเรียน", "แทนผู้บริหาร"], correctAnswer: 0 },
    { id: "f-9", question: "หาก Final Post-test ไม่ผ่านครบ 3 ครั้ง ระบบควรทำอย่างไร?", options: ["ล็อกถาวร", "รอ 12 ชั่วโมงก่อนทำใหม่", "ย้อนกลับไป Pre-test ทันที", "ออกจากระบบ"], correctAnswer: 1 },
    { id: "f-10", question: "ก่อนรับ Certificate ต้องทำอะไรให้ครบ?", options: ["ผ่าน Final Post-test และทำแบบประเมินความพึงพอใจ", "ทำ Dashboard ให้ครบ", "อัปโหลดรูปโปรไฟล์", "สมัครใหม่"], correctAnswer: 0 },
  ],
};

export const teacherCourseData = {
  id: "course-teacher",
  title: "InSPIRE 360° for Teacher",
  description: "หลักสูตร PWA สำหรับครูที่ผสาน UX/UI สมัยใหม่, interactive learning, gamification และ AI mentor เพื่อขับเคลื่อนการพัฒนาเชิงพื้นที่",
  modules: [
    {
      id: "module-pretest",
      navigationLabel: "Pre-test",
      title: "Pre-test (ไม่กำหนดเกณฑ์ผ่าน)",
      description: "ประเมินความพร้อมก่อนเข้าสู่เส้นทาง InSPIRE 360°",
      lessons: [
        makeArticleLesson("pretest-intro", "ก่อนเริ่มคอร์สครู", "สำรวจความพร้อมของตนเองก่อนเข้าสู่กระบวนการคิดเชิงระบบและการออกแบบพัฒนาเชิงพื้นที่", ["มองเห็นภาพรวมของเส้นทางการเรียน", "เข้าใจการปลดล็อกโมดูลและระบบ badge"], ["ทำแบบทดสอบก่อนเรียนให้ครบ"], "เริ่มจากความจริงของตัวเองก่อน แล้วค่อยค่อยออกแบบการเปลี่ยนแปลงครับ"),
        makeQuizLesson("pretest-exam", "แบบทดสอบก่อนเรียน", "pretest", 0, { description: "แบบทดสอบนี้ไม่มีเกณฑ์ผ่าน เพื่อสำรวจจุดตั้งต้นของผู้เรียน" }),
      ],
    },
    {
      id: "module-1",
      navigationLabel: "Module 1",
      title: "Module 1 - In-Sight [เปิดตา เปิดใจ ค้นหาความต้องการ]",
      description: "ครูสามารถวิเคราะห์ปัญหาและความต้องการเชิงพื้นที่ของตนเองและโรงเรียนได้อย่างเป็นระบบ",
      lessons: [
        makeArticleLesson("m1-intro", "ภาพรวม Module 1 : In-Sight", "สำรวจบริบทด้วยข้อมูลดิบ 9 มิติ ก่อนเปลี่ยนข้อมูลให้เป็น SWOT, TOWS, แนวทางแก้ และ Action Plan", ["วิเคราะห์ปัญหาอย่างเป็นระบบ", "คัดแยกข้อมูลให้เกิดกลยุทธ์ที่ลงมือทำได้"], ["ทำ Mission 1-5", "ผ่าน Post-test 3/5", "ดาวน์โหลด In-Sight Card และรับ badge"], "ลองมองพื้นที่ของคุณให้ลึกกว่าปัญหาที่เห็นบนผิวหน้า แล้วคำตอบใหม่ ๆ จะค่อย ๆ โผล่ขึ้นมาครับ"),
        { id: "m1-mission-1", title: "Mission 1 : The 9 Dimensions", type: "activity", iconName: "Sparkles", activityType: "insight_dimensions", content: { mentorTip: "เขียนตามความจริงของพื้นที่ก่อน ไม่ต้องรีบหาคำตอบที่สวยที่สุด", objective: "รวบรวมข้อมูลดิบ 9 มิติ และให้ระดับ pain point / problem" } },
        { id: "m1-mission-2", title: "Mission 2 : SWOT Analysis", type: "activity", iconName: "Layout", activityType: "swot_visualizer", content: { mentorTip: "หยิบคำจาก 9 มิติไปจัดกลุ่มใน SWOT และพิมพ์เพิ่มได้ตลอดเวลา", objective: "เปลี่ยนข้อมูลดิบให้เป็นข้อมูลเชิงกลยุทธ์ พร้อมดู SWOT balance" } },
        { id: "m1-mission-3", title: "Mission 3 : Strategy Fusion (TOWS Matrix)", type: "activity", iconName: "PenTool", activityType: "tows_matrix", content: { mentorTip: "จับคู่ปัจจัยภายในและภายนอกทีละคู่ แล้วสร้างกลยุทธ์อย่างน้อย 3 แนวทาง", objective: "สร้างกลยุทธ์เชิงรุก/แก้ไข/ป้องกัน/รับมือ" } },
        { id: "m1-mission-4", title: "Mission 4 : Needs Detective", type: "activity", iconName: "CheckSquare", activityType: "needs_detective", content: { mentorTip: "ให้คะแนนแต่ละกลยุทธ์ แล้วสกัด Core Problem, Real Need และ Solution ที่แท้จริง", objective: "คัดเลือกแนวทางที่ดีที่สุดและตกผลึกความต้องการจริง" } },
        { id: "m1-mission-5", title: "Mission 5 : Action Plan (PDCA)", type: "activity", iconName: "ArrowRight", activityType: "pdca_action_plan", content: { mentorTip: "แปลงกลยุทธ์ที่เลือกให้เป็นแผนปฏิบัติการที่เริ่มได้จริงในพื้นที่", objective: "ออกแบบ Action Plan ด้วยกรอบ PDCA" } },
        makeQuizLesson("m1-posttest", "Post-test [Module 1]", "module1Posttest", 3, { description: "แบบทดสอบ 5 ข้อ ผ่านเมื่อได้อย่างน้อย 3 คะแนน" }),
        makeReportLesson("m1-report-card", "The In-Sight Card / Report Card Module 1", "module1", "In-Sight Badge", "INS", "ปลดล็อก Module 2 - S-Design"),
      ],
    },
    {
      id: "module-2",
      navigationLabel: "Module 2",
      title: "Module 2 - S-Design [ออกแบบฝัน ปั้นแผนสู่การพัฒนา]",
      description: "ครูเขียน Roadmap พัฒนาตนเองและผู้เรียน พร้อมเชื่อมเป้าหมายกับ OECD, พระบรมราโชบาย ร.10 และ SEZ",
      lessons: [
        makeArticleLesson("m2-intro", "ภาพรวม Module 2 : S-Design", "เปลี่ยน pain point จาก Module 1 ให้เป็น roadmap 30 วัน พร้อม SMART objective และคุณภาพเชิงนโยบาย", ["ออกแบบภาพฝันและบรรยากาศที่อยากเห็น", "สร้าง roadmap และ SMART objective ที่ตรวจสอบได้"], ["ทำ Mission 1-6", "ผ่าน Post-test 3/5", "รับ S-Design Badge"], "อย่าเริ่มจากข้อจำกัดก่อน เริ่มจากภาพฝันที่อยากเห็นจริง แล้วค่อยทำให้มันเป็นแผนครับ"),
        { id: "m2-mission-1", title: "Mission 1 : Dream Lab", type: "activity", iconName: "Sparkles", activityType: "dream_lab", content: { mentorTip: "ถ้าไม่มีข้อจำกัดใดเลย คุณอยากเห็นอะไรเกิดขึ้นกับผู้เรียนและห้องเรียนของคุณ?" } },
        { id: "m2-mission-2", title: "Mission 2 : Vibe Check", type: "activity", iconName: "Layout", activityType: "vibe_check", content: { mentorTip: "บรรยากาศที่ดีต้องมองเห็นได้ทั้งจากมุมเด็ก มุมครู และมุมการจัดการเรียนรู้" } },
        { id: "m2-mission-3", title: "Mission 3 : Mapping the Journey", type: "activity", iconName: "PenTool", activityType: "roadmap_builder", content: { mentorTip: "ออกแบบ 30 วันหรือ 4 สัปดาห์ โดยผูกกับ pain point/solution จาก Module 1" } },
        { id: "m2-mission-4", title: "Mission 4 : Define 5W1H", type: "activity", iconName: "FileText", activityType: "fivewoneh", content: { mentorTip: "ตอบให้ชัด ใคร ทำอะไร ที่ไหน เมื่อไร ทำไม และอย่างไร" } },
        { id: "m2-mission-5", title: "Mission 5 : SMART Objective", type: "activity", iconName: "CheckSquare", activityType: "smart_goal", content: { mentorTip: "เป้าหมายที่ดีต้องวัดได้ ลงมือได้ และมีกรอบเวลาชัดเจน" } },
        { id: "m2-mission-6", title: "Mission 6 : SMART Quality Check", type: "activity", iconName: "Award", activityType: "quality_check", content: { mentorTip: "เชื่อมเป้าหมายให้สอดคล้องกับ OECD, พระบรมราโชบาย ร.10 และ SEZ แบบเจาะจง" } },
        makeQuizLesson("m2-posttest", "Post-test [Module 2]", "module2Posttest", 3, { description: "แบบทดสอบ 5 ข้อ ผ่านเมื่อได้อย่างน้อย 3 คะแนน" }),
        makeReportLesson("m2-report-card", "Report Card Module 2 : Roadmap", "module2", "S-Design Badge", "SDN", "ปลดล็อก Module 3 - P-PLC"),
      ],
    },
    {
      id: "module-3",
      navigationLabel: "Module 3",
      title: "Module 3 - P-PLC [รวมพลัง สร้างเครือข่ายแห่งการเรียนรู้]",
      description: "ครูรู้จักการสร้าง PLC และทำงานร่วมกันออนไลน์ พร้อมมีเครือข่ายเพื่อแลกเปลี่ยนเรียนรู้",
      lessons: [
        makeArticleLesson("m3-intro", "ภาพรวม Module 3 : P-PLC", "ใช้ pain point จาก Module 1 เป็นหัวข้อกลาง สร้างวง PLC ออนไลน์ และฝึก pitch อย่างกระชับ", ["จับคู่เพื่อนครูและนัดหมาย PLC", "สรุปบทเรียนจากการประชุมและฝึก pitch 1 นาที"], ["ทำ Mission 1-3", "ทำแบบสะท้อนความคิด 1 ข้อ", "รับ P-PLC Badge"], "พลังของ PLC ไม่ได้อยู่ที่จำนวนคน แต่อยู่ที่การแลกเปลี่ยนที่ทำให้เห็นทางออกใหม่ครับ"),
        { id: "m3-mission-1", title: "Mission 1 : PLC Matchmaking", type: "activity", iconName: "Users", activityType: "plc_matchmaking", content: { mentorTip: "สุ่มเพื่อนครู จองเวลา และเตรียมห้อง Google Meet สำหรับการแลกเปลี่ยนเรียนรู้" } },
        { id: "m3-mission-2", title: "Mission 2 : PLC Report", type: "activity", iconName: "FileText", activityType: "plc_report", content: { mentorTip: "บันทึกสิ่งที่ได้เรียนรู้จากการประชุม พร้อมแนบลิงก์หลักฐานหรือภาพหน้าจอ" } },
        { id: "m3-mission-3", title: "Mission 3 : Pitching 1 Minute", type: "activity", iconName: "PlayCircle", activityType: "pitching_session", content: { mentorTip: "เขียนสคริปต์สั้น ๆ ให้ชัด คม และเล่าให้เห็นปัญหา-ทางออกภายใน 1 นาที" } },
        makeQuizLesson("m3-posttest", "Post-test [Module 3] : Reflection Survey", "module3Reflection", 0, { mode: "survey", description: "สะท้อนสิ่งที่ได้จากการทำ PLC จำนวน 1 ข้อ" }),
        makeReportLesson("m3-report-card", "Report Card Module 3 : PLC", "module3", "P-PLC Badge", "PLC", "ปลดล็อก Module 4 - I-Innovation"),
      ],
    },
    {
      id: "module-4",
      navigationLabel: "Module 4",
      title: "Module 4 - I-Innovation [ก้าวสู่ความพร้อม จุดประกายนวัตกรรม]",
      description: "ครูมีทักษะและเครื่องมือใหม่ในการออกแบบนวัตกรรมการสอนที่นำไปใช้ได้จริง",
      lessons: [
        makeArticleLesson("m4-intro", "ภาพรวม Module 4 : I-Innovation", "จับคู่เครื่องมือและรูปแบบ Active Learning เพื่อออกแบบนวัตกรรมและแผนการสอนจริง", ["ออกแบบชื่อนวัตกรรมจากการจับคู่เครื่องมือ", "สร้างแผนการสอนและหลักฐานสื่อสำหรับใช้งานจริง"], ["ทำ Mission 1-3", "ผ่าน Post-test 3/5", "รับ In-Innovation Badge"], "นวัตกรรมที่ดีไม่จำเป็นต้องใหญ่เสมอไป แต่ต้องตอบโจทย์จริงและใช้ได้จริงครับ"),
        { id: "m4-mission-1", title: "Mission 1 : Innovation Lab", type: "activity", iconName: "Zap", activityType: "innovation_lab", content: { mentorTip: "จับคู่ hardware / software กับรูปแบบ Active Learning และตั้งชื่อนวัตกรรมให้ชัด" } },
        { id: "m4-mission-2", title: "Mission 2 : Lesson Plan", type: "activity", iconName: "FileText", activityType: "lesson_plan", content: { mentorTip: "เขียนแผนการจัดการเรียนรู้ที่เชื่อมกับนวัตกรรมที่ออกแบบไว้" } },
        { id: "m4-mission-3", title: "Mission 3 : Crafting Session", type: "activity", iconName: "PenTool", activityType: "crafting_session", content: { mentorTip: "ออกแบบ/สร้างสื่อจริง แล้วแนบลิงก์หลักฐานหรือคำอธิบายการใช้งาน" } },
        makeQuizLesson("m4-posttest", "Post-test [Module 4]", "module4Posttest", 3, { description: "แบบทดสอบ 5 ข้อ ผ่านเมื่อได้อย่างน้อย 3 คะแนน" }),
        makeReportLesson("m4-report-card", "Report Card Module 4 : Innovation", "module4", "In-Innovation Badge", "INV", "ปลดล็อก Module 5 - RE-Reflection"),
      ],
    },
    {
      id: "module-5",
      navigationLabel: "Module 5",
      title: "Module 5 - RE-Reflection [สะท้อนผล ต่อยอดการพัฒนา]",
      description: "ครูนำแผนไปใช้จริง บันทึกผล และออกแบบแนวทางพัฒนาต่อยอดจากหลักฐานการสอน",
      lessons: [
        makeArticleLesson("m5-intro", "ภาพรวม Module 5 : RE-Reflection", "นำแผนหรือนวัตกรรมไปใช้จริงในชั้นเรียน แล้วสะท้อนผลเพื่อต่อยอดรอบถัดไป", ["เชื่อมการลงมือสอนจริงกับการสะท้อนผล", "เห็นแนวทางพัฒนาแผน/นวัตกรรมรอบใหม่"], ["ทำ Mission 1-3", "ผ่าน Post-test 3/5", "รับ RE-Reflection Badge"], "การสะท้อนผลไม่ใช่การตัดสินตัวเอง แต่คือการมองเห็นรอบพัฒนาถัดไปอย่างแม่นยำครับ"),
        { id: "m5-mission-1", title: "Mission 1 : Teaching in Action", type: "activity", iconName: "PlayCircle", activityType: "classroom_trial", content: { mentorTip: "นำแผนไปใช้จริง แล้วแนบลิงก์คลิปการสอน 10 นาทีพร้อมบริบทของคาบเรียน" } },
        { id: "m5-mission-2", title: "Mission 2 : Reflection Log", type: "activity", iconName: "FileText", activityType: "reflection_log", content: { mentorTip: "บันทึกสิ่งที่เกิดขึ้นจริงกับผู้เรียน สิ่งที่เวิร์ก และสิ่งที่ควรปรับ" } },
        { id: "m5-mission-3", title: "Mission 3 : Next Growth Plan", type: "activity", iconName: "ArrowRight", activityType: "growth_plan", content: { mentorTip: "ออกแบบแนวทางต่อยอดแผน/นวัตกรรมรอบถัดไปจากสิ่งที่ได้เรียนรู้" } },
        makeQuizLesson("m5-posttest", "Post-test [Module 5]", "module5Posttest", 3, { description: "แบบทดสอบ 5 ข้อ ผ่านเมื่อได้อย่างน้อย 3 คะแนน" }),
        makeReportLesson("m5-report-card", "Report Card Module 5 : RE-Reflection", "module5", "RE-Reflection Badge", "REF", "ปลดล็อก Final Post-test"),
      ],
    },
    {
      id: "module-final-posttest",
      navigationLabel: "Final Test",
      title: "Post-test ใหญ่ของหลักสูตร",
      description: "ผ่าน 80% และหากไม่ผ่านครบ 3 ครั้ง ต้องรออีก 12 ชั่วโมงก่อนเริ่มใหม่",
      lessons: [
        makeQuizLesson("final-posttest", "Final Post-test", "finalPosttest", 8, { maxAttempts: 3, cooldownHours: 12, description: "แบบทดสอบ 10 ข้อ ผ่านเมื่อได้อย่างน้อย 8 คะแนน" }),
      ],
    },
    {
      id: "module-survey",
      navigationLabel: "Survey",
      title: "แบบประเมินความพึงพอใจการใช้ Platform",
      description: "สะท้อนประสบการณ์การใช้งานแพลตฟอร์มเพื่อพัฒนารอบถัดไป",
      lessons: [
        { id: "platform-survey", title: "แบบประเมินความพึงพอใจ", type: "activity", iconName: "FileText", activityType: "platform_survey", content: { mentorTip: "ความคิดเห็นของคุณจะช่วยให้แพลตฟอร์มนี้ตอบโจทย์ครูและผู้เรียนได้ดีขึ้นครับ" } },
      ],
    },
    {
      id: "module-certificate",
      navigationLabel: "Certificate",
      title: "Certificate of In-Sight / InSPIRE 360°",
      description: "รับใบรับรองหลังผ่านทุกขั้นตอนของหลักสูตร",
      lessons: [
        { id: "final-certificate", title: "รับ Certificate", type: "certificate", iconName: "Award", content: { certificateType: "final-certificate", badgeName: "InSPIRE 360° Teacher Certificate", uniquePrefix: "CRT" } },
      ],
    },
  ],
};
