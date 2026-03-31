export const insightDimensions = [
  { key: "teachingStrategies", label: "1. วิธีการสอนและกลยุทธ์", englishLabel: "Teaching Strategies", focus: "เทคนิคการสอน การจัดการเรียนรู้", strengthPrompt: "เทคนิคหรือกิจกรรมแบบไหนที่คุณครูจัดแล้วเด็ก ๆ ตาวาวและมีส่วนร่วมมากที่สุด?", weaknessPrompt: "มีแผนการสอนหรือสถานการณ์ไหนที่ยังไม่เป็นไปตามคาด หรือยังเป็น pain point อยู่บ้าง?" },
  { key: "classroomEnvironment", label: "2. การจัดการชั้นเรียนและสภาพแวดล้อม", englishLabel: "Classroom Environment", focus: "โครงสร้างห้อง กติกา พื้นที่กายภาพ", strengthPrompt: "การจัดห้องหรือกติกาแบบไหนที่ช่วยให้ห้องเรียนสงบและพร้อมเรียนได้ดีขึ้น?", weaknessPrompt: "สภาพห้องเรียน อากาศ หรือจำนวนนักเรียนส่วนไหนที่ยังเป็นอุปสรรคต่อการสอน?" },
  { key: "systemsAndAssessment", label: "3. ระบบการทำงานและการประเมินผล", englishLabel: "Systems & Assessment", focus: "การให้คะแนน การตรวจงาน รูทีนประจำวัน", strengthPrompt: "มีวิธีตรวจงานหรือประเมินผลแบบไหนที่ทั้งประหยัดเวลาและทำให้นักเรียนเข้าใจชัดเจน?", weaknessPrompt: "งานหลังบ้านส่วนไหนที่ดูดพลังมากจนกระทบการเตรียมสอนของคุณครู?" },
  { key: "relationshipsAndValues", label: "4. บรรยากาศและความสัมพันธ์", englishLabel: "Relationships & Shared Values", focus: "วัฒนธรรมห้องเรียน ความเชื่อมโยงทางใจ", strengthPrompt: "มีโมเมนต์แบบไหนในห้องเรียนที่ทำให้คุณครูใจฟูและเห็นพลังของความสัมพันธ์ในห้อง?", weaknessPrompt: "มีกำแพงทางใจหรือพฤติกรรมแบบไหนของนักเรียนที่คุณครูยังรู้สึกรับมือได้ยาก?" },
  { key: "teacherLeadership", label: "5. สไตล์และความเป็นผู้นำของครู", englishLabel: "Teacher's Style & Leadership", focus: "บุคลิกภาพ ท่าที การคุมชั้นเรียน", strengthPrompt: "มุมไหนของตัวเองที่ทำให้นักเรียนกล้าเข้าหาและเชื่อใจคุณครูมากที่สุด?", weaknessPrompt: "มีสถานการณ์แบบไหนที่สไตล์การสอนของเรายังเอาไม่อยู่หรือยังไม่ตอบโจทย์?" },
  { key: "skillsAndMastery", label: "6. ทักษะและอาวุธคู่กาย", englishLabel: "Skills & Mastery", focus: "ความเชี่ยวชาญในวิชา เทคนิคเฉพาะตัว", strengthPrompt: "สกิลไหนคือทีเด็ดของคุณครูที่ทำให้เรื่องยากกลายเป็นเรื่องเข้าใจง่าย?", weaknessPrompt: "มีทักษะใหม่ด้านไหนที่คุณครูอยากอัปเวลเพิ่มด่วนเพราะยังรู้สึกไม่ถนัดพอ?" },
  { key: "techAndTools", label: "7. สื่อ เทคโนโลยี และนวัตกรรม", englishLabel: "Tech & Tools", focus: "เครื่องมือทุ่นแรง แอปพลิเคชัน สื่อการสอน", strengthPrompt: "สื่อหรือเครื่องมือไหนคือของคู่ใจที่ช่วยให้การสอนลื่นไหลและเด็กชอบจริง?", weaknessPrompt: "ปัญหาไอที อินเทอร์เน็ต หรืออุปกรณ์ส่วนไหนที่ยังทำให้การสอนสะดุดบ่อย?" },
  { key: "wellBeingAndWorkload", label: "8. สุขภาวะและพลังงานของครู", englishLabel: "Teacher Well-being & Workload", focus: "ความเครียด การจัดสมดุลชีวิต ภาระงานรวม", strengthPrompt: "คุณครูมีวิธีชาร์จแบตหรือดูแลใจตัวเองอย่างไรให้ยังมีพลังและแพสชันอยู่เสมอ?", weaknessPrompt: "งานหรือความเครียดส่วนไหนที่กำลังดึงสมาธิและความสุขในการสอนของคุณครูไปมากที่สุด?" },
  { key: "networkAndPartnership", label: "9. เครือข่ายและแนวร่วม", englishLabel: "Network & Partnership", focus: "การซัพพอร์ตจากเพื่อนครู ผู้บริหาร ผู้ปกครอง", strengthPrompt: "เคยมีกรณีไหนที่การร่วมมือกับผู้ปกครองหรือเพื่อนครูช่วยพลิกสถานการณ์ได้สำเร็จบ้าง?", weaknessPrompt: "การขอความร่วมมือหรือการซัพพอร์ตจากฝ่ายต่าง ๆ ยังติดขัดตรงไหนที่อยากให้ดีขึ้น?" },
];

export const externalScanFactors = [
  { key: "political", label: "P - Political", thaiLabel: "นโยบายและทิศทาง", focus: "นโยบายกระทรวงฯ นโยบายผู้บริหาร ทิศทางเขตพื้นที่", opportunityPrompt: "นโยบายหรือทิศทางไหนที่ช่วยสนับสนุนให้คุณครูสอนง่ายขึ้นหรือจัดกิจกรรมได้คล่องขึ้น?", threatPrompt: "มีนโยบายหรือคำสั่งด่วนไหนที่เพิ่มภาระและกระทบเวลาสอนของคุณครูบ้าง?" },
  { key: "economic", label: "E - Economic", thaiLabel: "เศรษฐกิจและงบประมาณ", focus: "งบประมาณสนับสนุน สภาพครอบครัวของผู้เรียน", opportunityPrompt: "มีงบหรือทรัพยากรทางเศรษฐกิจใดที่กำลังช่วยหนุนการจัดการเรียนรู้ของคุณครูได้บ้าง?", threatPrompt: "ปัญหาเศรษฐกิจของครอบครัวผู้เรียนกำลังกระทบต่อความพร้อมในการเรียนอย่างไร?" },
  { key: "social", label: "S - Social", thaiLabel: "สังคมและครอบครัว", focus: "เทรนด์สังคม พฤติกรรมวัยรุ่น สภาพครอบครัว", opportunityPrompt: "มีกระแสหรือความสนใจของเด็กยุคนี้อะไรที่สามารถหยิบมาเชื่อมกับการเรียนได้ดี?", threatPrompt: "ปัญหาครอบครัวหรือค่านิยมจากสังคมเรื่องไหนที่กำลังกระทบสมาธิหรือพฤติกรรมของนักเรียน?" },
  { key: "technological", label: "T - Technological", thaiLabel: "เทคโนโลยีและโลกดิจิทัล", focus: "AI โซเชียลมีเดีย ความพร้อมด้านอุปกรณ์", opportunityPrompt: "มีเทคโนโลยีหรือ AI ใดที่ถ้านำมาใช้กับห้องเรียนจะช่วยเปิดโลกให้ผู้เรียนได้ชัดเจน?", threatPrompt: "ความเหลื่อมล้ำด้านอุปกรณ์ อินเทอร์เน็ต หรือภัยไซเบอร์กำลังสร้างอุปสรรคอะไรให้ห้องเรียน?" },
  { key: "environmental", label: "E - Environmental", thaiLabel: "สภาพแวดล้อมและพื้นที่", focus: "ธรรมชาติ ชุมชน PM2.5 อาคารสถานที่", opportunityPrompt: "พื้นที่รอบโรงเรียนหรือชุมชนส่วนไหนที่สามารถต่อยอดเป็นแหล่งเรียนรู้นอกห้องได้?", threatPrompt: "อากาศร้อน ฝุ่น หรือสภาพอาคารส่วนไหนที่กำลังกระทบสมาธิและสุขภาพของครูหรือนักเรียน?" },
  { key: "legal", label: "L - Legal", thaiLabel: "กฎหมาย กติกา และความปลอดภัย", focus: "กฎหมายคุ้มครองเด็ก ระเบียบโรงเรียน ข้อบังคับวิชาชีพ", opportunityPrompt: "มีกฎหรือมาตรการด้านความปลอดภัยใดที่ช่วยให้ห้องเรียนปลอดภัยและเป็นธรรมขึ้น?", threatPrompt: "มีข้อกังวลด้านระเบียบหรือความปลอดภัยเรื่องไหนที่จำกัดการออกแบบกิจกรรมของคุณครูอยู่บ้าง?" },
];

export const swotBuckets = [
  { key: "strengths", label: "Strengths", thaiLabel: "จุดแข็ง" },
  { key: "weaknesses", label: "Weaknesses", thaiLabel: "จุดอ่อน" },
  { key: "opportunities", label: "Opportunities", thaiLabel: "โอกาส" },
  { key: "threats", label: "Threats", thaiLabel: "อุปสรรค" },
];

const resourceTypes = ["Text", "Image", "VDO", "Presentation", "Blog"];

const makeArticleLesson = (
  id,
  title,
  summary,
  outcomes,
  deliverables,
  mentorTip,
  options = {},
) => ({
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
    lessonUrl: options.lessonUrl,
    lessonUrlLabel: options.lessonUrlLabel || "เปิดบทเรียนต้นฉบับ",
    focusList: options.focusList || [],
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
    { id: "pre-1", question: "The 9 Dimensions ใน Module 1 มีเป้าหมายหลักเพื่ออะไร?", options: ["รวบรวมข้อมูลภายในห้องเรียนให้เห็นทั้งจุดแข็งและจุดอ่อนอย่างเป็นระบบ", "ใช้แทนการสอบปลายภาค", "คัดเลือกครูเข้า PLC", "สร้างเกียรติบัตรทันที"], correctAnswer: 0 },
    { id: "pre-2", question: "Look Out Of The Room ช่วยคุณครูเรื่องใดมากที่สุด?", options: ["มองเห็นปัจจัยภายนอกที่เป็นโอกาสและอุปสรรคต่อห้องเรียน", "เลือกสีของแพลตฟอร์ม", "ทำตารางสอนแทนผู้บริหาร", "ลดจำนวนผู้เรียนในห้อง"], correctAnswer: 0 },
    { id: "pre-3", question: "TOWS Matrix ต่างจาก SWOT อย่างไร?", options: ["TOWS ใช้จับคู่ปัจจัยเพื่อสร้างกลยุทธ์ ส่วน SWOT ใช้วิเคราะห์สถานการณ์", "TOWS ใช้สอบเท่านั้น", "SWOT ใช้เฉพาะงานงบประมาณ", "ไม่มีความต่างกัน"], correctAnswer: 0 },
    { id: "pre-4", question: "Roadmap 30 วันใน Module 2 ควรเชื่อมกับอะไร?", options: ["Pain Point หรือแนวทางแก้จาก Module 1", "รูปโปรไฟล์ของผู้ใช้", "ระบบ SOS", "รายชื่อผู้ปกครองทั้งหมด"], correctAnswer: 0 },
    { id: "pre-5", question: "AI Mentor ในแพลตฟอร์มนี้ควรทำหน้าที่อย่างไร?", options: ["ให้กำลังใจ ชวนคิด และช่วยสะท้อนมุมมองในแต่ละภารกิจ", "ตัดสินคำตอบแทนครู", "ปลดล็อกทุกโมดูลทันที", "ลบข้อมูลที่กรอกผิดอัตโนมัติ"], correctAnswer: 0 },
  ],
  module1Posttest: [
    { id: "m1-1", question: "Mission 1 ของ Module 1 ให้คุณครูวิเคราะห์อะไรเป็นหลัก?", options: ["9 มิติของการจัดการชั้นเรียนทั้งด้านจุดแข็งและจุดอ่อน", "เฉพาะผลสอบของนักเรียน", "เฉพาะงบประมาณโรงเรียน", "เฉพาะแผนการประชุม PLC"], correctAnswer: 0 },
    { id: "m1-2", question: "Look Out Of The Room ใช้กรอบใดในการมองปัจจัยภายนอก?", options: ["PESTEL", "SMART", "PDCA", "5W1H"], correctAnswer: 0 },
    { id: "m1-3", question: "Mission 3 ต้องสร้างกลยุทธ์อย่างน้อยกี่แนวทาง?", options: ["1", "2", "3", "5"], correctAnswer: 2 },
    { id: "m1-4", question: "Needs Detective มีเป้าหมายหลักคืออะไร?", options: ["คัดเลือกกลยุทธ์ที่เหมาะที่สุดและสรุป Core Problem / Real Need / Solution", "ข้ามไป Module 2 ทันที", "ปิดระบบ SWOT", "เปลี่ยนโจทย์ Module 1"], correctAnswer: 0 },
    { id: "m1-5", question: "Mission 5 ใช้กรอบใดในการออกแบบ Action Plan?", options: ["OECD", "PDCA", "TOWS", "SEZ"], correctAnswer: 1 },
  ],
  module2Posttest: [
    { id: "m2-1", question: "Dream Lab ใน PDF ใช้คำถามกี่กรอบ?", options: ["2", "3", "4", "6"], correctAnswer: 2 },
    { id: "m2-2", question: "Vibe Check ให้บรรยายบรรยากาศผ่านผัสสะใดบ้าง?", options: ["Visual, Audio, Feeling", "Past, Present, Future", "Warm, Cold, Neutral", "Fast, Slow, Medium"], correctAnswer: 0 },
    { id: "m2-3", question: "Roadmap 30 วันแบ่งเป็นกี่ช่วงหลัก?", options: ["2", "3", "4", "5"], correctAnswer: 2 },
    { id: "m2-4", question: "SMART Objective ที่ดีควรมีลักษณะอย่างไร?", options: ["เฉพาะเจาะจง วัดผลได้ ทำได้จริง สอดคล้อง และมีกรอบเวลา", "ยาวที่สุดเท่าที่ทำได้", "ใช้คำทั่วไปเพื่อเปิดกว้าง", "ไม่มีตัวชี้วัด"], correctAnswer: 0 },
    { id: "m2-5", question: "SMART Quality Check ต้องเชื่อมกับมิติใดบ้าง?", options: ["OECD Learning Compass 2030, พระบรมราโชบาย ร.10, และ Tak SEZ", "เฉพาะคะแนนสอบ", "เฉพาะ PLC", "เฉพาะ Dashboard"], correctAnswer: 0 },
  ],
  module3Reflection: [
    { id: "m3-reflection-1", question: "จากการได้ร่วมวง PLC และแลกเปลี่ยนไอเดียกับเพื่อนครู คุณครูค้นพบพลังหรือมุมมองใหม่อะไรที่ช่วยให้โปรเจกต์สมบูรณ์ขึ้น?", options: ["ได้เห็นมุมมองใหม่จากเครือข่ายและนำไปปรับใช้กับแผนของตนเอง", "ไม่มีอะไรเปลี่ยนแปลง", "PLC มีไว้เพียงนัดประชุม", "ควรข้ามขั้นตอนนี้ไป"], correctAnswer: 0 },
  ],
  module4Posttest: [
    { id: "m4-1", question: "Innovation Lab เน้นการจับคู่สิ่งใดเข้าด้วยกัน?", options: ["เครื่องมือกับรูปแบบ Active Learning", "คะแนนกับเกียรติบัตร", "PLC กับ SOS", "Dashboard กับ Profile"], correctAnswer: 0 },
    { id: "m4-2", question: "Master Blueprint แบ่งคาบเรียนเป็นกี่ช่วงสำคัญ?", options: ["2", "3", "4", "5"], correctAnswer: 1 },
    { id: "m4-3", question: "Crafting Session ต้องมีหลักฐานลักษณะใด?", options: ["ลิงก์สื่อดิจิทัลหรือภาพ/คำอธิบายของสื่อที่สร้างจริง", "เฉพาะคะแนนสอบ", "เฉพาะรายชื่อผู้เข้าประชุม", "ไม่ต้องมีหลักฐาน"], correctAnswer: 0 },
    { id: "m4-4", question: "Beta Test มีเป้าหมายเพื่ออะไร?", options: ["ทดสอบต้นแบบก่อนใช้จริงและรับฟีดแบ็กเพื่อพัฒนาเวอร์ชันถัดไป", "แทนที่การสอนจริง", "ลดจำนวนภารกิจให้เหลือหนึ่ง", "ใช้เพื่อเปลี่ยนรหัส enroll"], correctAnswer: 0 },
    { id: "m4-5", question: "หลังผ่าน Module 4 ผู้เรียนจะได้รับอะไร?", options: ["Report Card Module 4 และ In-Innovation Badge", "Certificate ทันที", "สิทธิ์ admin", "ปิดคอร์สโดยอัตโนมัติ"], correctAnswer: 0 },
  ],
  module5Posttest: [
    { id: "m5-1", question: "Mission 1 ของ Module 5 ต้องส่งคลิปความยาวเท่าใดตาม PDF?", options: ["10 นาที", "20 นาที", "30 นาที", "50-60 นาที"], correctAnswer: 3 },
    { id: "m5-2", question: "Reflection Log มีประโยชน์อย่างไร?", options: ["ช่วยสรุปสิ่งที่เกิดขึ้นจริงและใช้พัฒนาการสอนรอบต่อไป", "ใช้แทนแผนการสอนทั้งหมด", "ใช้แทน Module 4", "ไม่มีผลต่อการพัฒนา"], correctAnswer: 0 },
    { id: "m5-3", question: "Next Growth Plan ควรอ้างอิงจากอะไร?", options: ["หลักฐานและบทเรียนจากการนำแผนไปใช้จริง", "สีของหน้าเว็บ", "จำนวนผู้ใช้งานออนไลน์", "รหัส enroll"], correctAnswer: 0 },
    { id: "m5-4", question: "หลังผ่าน Module 5 จะปลดล็อกอะไรต่อ?", options: ["Final Post-test", "Module 2", "Dashboard", "Admin"], correctAnswer: 0 },
    { id: "m5-5", question: "เป้าหมายของ RE-Reflection คืออะไร?", options: ["สะท้อนผลจากการสอนจริงและต่อยอดแผนหรือนวัตกรรม", "เริ่ม SWOT ใหม่ทั้งหมด", "ปิดการใช้งานคอร์ส", "เปลี่ยนบทบาทผู้ใช้"], correctAnswer: 0 },
  ],
  finalPosttest: [
    { id: "f-1", question: "The 9 Dimensions ช่วยลดสิ่งใดได้มากที่สุด?", options: ["Blind Spots", "เวลาพักกลางวัน", "จำนวนผู้ใช้", "คาบเรียน"], correctAnswer: 0 },
    { id: "f-2", question: "Look Out Of The Room ใช้เพื่ออะไร?", options: ["มองหาโอกาสและอุปสรรคจากปัจจัยภายนอก", "สร้างรายงานการเงิน", "เปลี่ยนบทบาทผู้ใช้", "เปิด SOS"], correctAnswer: 0 },
    { id: "f-3", question: "Roadmap 30 วันใน Module 2 ควรเริ่มจากอะไร?", options: ["Pain Point หรือ Strategy ที่ได้จาก Module 1", "Final Post-test", "รายชื่อ admin", "จำนวนผู้ใช้ออนไลน์"], correctAnswer: 0 },
    { id: "f-4", question: "PLC ที่ดีควรมีองค์ประกอบใด?", options: ["การแลกเปลี่ยนจริง บทบาทชัด และต่อยอดเป็นการลงมือทำ", "ประชุมให้นานที่สุด", "มีเอกสารมากที่สุด", "ไม่มีการสะท้อนผล"], correctAnswer: 0 },
    { id: "f-5", question: "Innovation Lab เน้นสิ่งใดเป็นพิเศษ?", options: ["จับคู่เครื่องมือกับ pedagogy เพื่อแก้ปัญหาจริง", "ใช้เทคโนโลยีใหม่โดยไม่คำนึงบริบท", "ลดกิจกรรมเหลือหนึ่งอย่าง", "ตัดขั้น beta test ออก"], correctAnswer: 0 },
    { id: "f-6", question: "Reflection หลังสอนสำคัญเพราะอะไร?", options: ["ใช้พัฒนารอบถัดไปจากหลักฐานจริง", "ใช้แทนการสอน", "ใช้แทน roadmap", "ใช้แทนการประเมิน"], correctAnswer: 0 },
    { id: "f-7", question: "SMART Objective ต้องมีอะไรบ้าง?", options: ["Specific, Measurable, Achievable, Relevant, Time-bound", "Short, Massive, Accurate, Rich, Technical", "System, Manual, Agile, Rapid, Timely", "Simple, Mixed, Aware, Real, Tiny"], correctAnswer: 0 },
    { id: "f-8", question: "AI Mentor ควรมีน้ำเสียงแบบใด?", options: ["ให้กำลังใจและชวนคิดต่อ", "ตัดสินถูกผิดทันที", "บังคับกรอกคำตอบ", "ลดจำนวนขั้นตอนอัตโนมัติ"], correctAnswer: 0 },
    { id: "f-9", question: "ถ้า Final Post-test ไม่ผ่านครบ 3 ครั้ง ระบบควรทำอย่างไร?", options: ["รอ 12 ชั่วโมงก่อนเริ่มใหม่", "ปิดบัญชีผู้ใช้", "ย้อนกลับไป Pre-test ทันที", "ข้ามไป Certificate"], correctAnswer: 0 },
    { id: "f-10", question: "ก่อนรับ Certificate ผู้เรียนต้องทำอะไรให้ครบ?", options: ["ผ่าน Final Post-test และส่งแบบประเมินความพึงพอใจ", "อัปโหลดรูปโปรไฟล์ใหม่", "เข้า SOS อย่างน้อยหนึ่งครั้ง", "สร้างคอร์สใหม่"], correctAnswer: 0 },
  ],
};
export const teacherCourseData = {
  id: "course-teacher",
  title: "InSPIRE 360° for Teacher",
  description:
    "แพลตฟอร์มพัฒนาเรียนรู้สำหรับครูที่ผสาน AI Mentor, interactive learning และ gamification เพื่อยกระดับห้องเรียนจริงอย่างเป็นขั้นตอน",
  modules: [
    {
      id: "module-pretest",
      navigationLabel: "Pre-test",
      title: "Pre-test (ไม่กำหนดเกณฑ์ผ่าน)",
      description: "สำรวจจุดตั้งต้นของคุณครูก่อนเริ่มเส้นทาง InSPIRE 360°",
      lessons: [
        makeArticleLesson(
          "pretest-intro",
          "ก่อนเริ่มคอร์ส InSPIRE 360°",
          "ทำความเข้าใจเส้นทางการเรียนรู้ วิธีปลดล็อกโมดูล และวิธีสะสม badge ตลอดหลักสูตร",
          [
            "เห็นภาพรวมของเส้นทาง InSPIRE 360° for Teacher",
            "เข้าใจระบบภารกิจ แบบทดสอบ รายงาน และ certificate",
          ],
          ["ทำ Pre-test ให้ครบก่อนเข้าสู่ Module 1"],
          "เริ่มจากความจริงของห้องเรียนตัวเองก่อน แล้วค่อยออกแบบการเปลี่ยนแปลงทีละขั้นครับ",
        ),
        makeQuizLesson("pretest-exam", "แบบทดสอบก่อนเรียน", "pretest", 0, {
          description:
            "Pre-test ไม่มีเกณฑ์ผ่าน ใช้เพื่อสำรวจความพร้อมและจุดตั้งต้นของผู้เรียน",
        }),
      ],
    },
    {
      id: "module-1",
      navigationLabel: "Module 1",
      title: "Module 1 - In-Sight [เปิดตา เปิดใจ ค้นหาความต้องการ]",
      description:
        "สำรวจห้องเรียนอย่างเป็นระบบจากทั้งปัจจัยภายในและภายนอก ก่อนพัฒนาเป็นกลยุทธ์และ Action Plan",
      lessons: [
        makeArticleLesson(
          "m1-intro",
          "ภาพรวม Module 1 : In-Sight",
          "เริ่มจาก 9 มิติของการจัดการชั้นเรียน ต่อด้วยการมองปัจจัยภายนอกแบบ PESTEL แล้วพัฒนาเป็น TOWS, In-Sight Card และ PDCA Action Plan",
          [
            "เห็นจุดแข็ง จุดอ่อน โอกาส และอุปสรรคของห้องเรียนอย่างเป็นระบบ",
            "สร้างกลยุทธ์ที่นำไปใช้ได้จริงและสรุปเป็น In-Sight Card",
          ],
          [
            "ทำ Mission 1-5 ให้ครบ",
            "ผ่าน Post-test อย่างน้อย 3/5",
            "รับ In-Sight Badge และปลดล็อก Module 2",
          ],
          "ลองฟังเสียงห้องเรียนของตัวเองอย่างละเอียดก่อนนะครับ คำตอบที่จริงที่สุดจะพาเราไปสู่กลยุทธ์ที่ใช้ได้จริงที่สุด",
          {
            lessonUrl:
              "https://www.canva.com/design/DAHFgpFnz8E/VXANS3zHrTRdvU7XGSIG8Q/view",
            focusList: [
              "Mission 1: วิเคราะห์ 9 มิติของการจัดการชั้นเรียน",
              "Mission 2: มองปัจจัยภายนอกแบบ Political, Economic, Social, Technological, Environmental, Legal",
              "Mission 3-5: สร้างกลยุทธ์ สกัด In-Sight Card และออกแบบ PDCA",
            ],
          },
        ),
        { id: "m1-mission-1", title: "Mission 1 : The 9 Dimensions", type: "activity", iconName: "Sparkles", activityType: "insight_dimensions", content: { mentorTip: "ค่อย ๆ มองทั้งจุดแข็งและจุดอ่อนของห้องเรียนในแต่ละมิติ แล้วให้ระดับความเจ็บปวดเพื่อเห็นจุดที่ต้องเร่งพัฒนา" } },
        { id: "m1-mission-2", title: "Mission 2 : Look Out Of The Room", type: "activity", iconName: "Layout", activityType: "swot_visualizer", content: { mentorTip: "ถอยออกมาดูโลกภายนอกห้องเรียนอีกนิดครับ ลองมองว่ามีอะไรเป็นลมใต้ปีก และอะไรคือพายุที่เราต้องรับมือ" } },
        { id: "m1-mission-3", title: "Mission 3 : Strategy Fusion (TOWS Matrix)", type: "activity", iconName: "PenTool", activityType: "tows_matrix", content: { mentorTip: "เลือก 1 ปัจจัยภายใน จับคู่กับ 1 ปัจจัยภายนอก แล้วสร้างกลยุทธ์ที่ลงมือทำได้จริงอย่างน้อย 3 แนวทาง" } },
        { id: "m1-mission-4", title: "Mission 4 : Needs Detective", type: "activity", iconName: "CheckSquare", activityType: "needs_detective", content: { mentorTip: "ลองให้คะแนนแต่ละกลยุทธ์ แล้วเลือกแนวทางที่ดีที่สุดมาสกัดเป็น Core Problem, Real Need และ Solution" } },
        { id: "m1-mission-5", title: "Mission 5 : Action Plan (PDCA)", type: "activity", iconName: "ArrowRight", activityType: "pdca_action_plan", content: { mentorTip: "เมื่อได้กลยุทธ์ที่ชัดแล้ว ลองแปลงให้เป็นแผน PDCA ที่เริ่มทำได้จริงในบริบทของโรงเรียนคุณครูครับ" } },
        makeQuizLesson("m1-posttest", "Post-test [Module 1]", "module1Posttest", 3, {
          description: "แบบทดสอบ 5 ข้อ ผ่านเมื่อได้อย่างน้อย 3 คะแนน",
        }),
        makeReportLesson("m1-report-card", "Report Card Module 1 : In-Sight", "module1", "In-Sight Badge", "INS", "ปลดล็อก Module 2 - S-Design"),
      ],
    },
    {
      id: "module-2",
      navigationLabel: "Module 2",
      title: "Module 2 - S-Design [ออกแบบฝัน ปั้นแผนสู่การพัฒนา]",
      description:
        "เปลี่ยนกลยุทธ์จาก Module 1 ให้เป็นภาพฝัน Roadmap 30 วัน และ SMART goal ที่เชื่อมกับ OECD, พระบรมราโชบาย และ Tak SEZ",
      lessons: [
        makeArticleLesson(
          "m2-intro",
          "ภาพรวม Module 2 : S-Design",
          "ย้ายจากการมองปัญหาและกลยุทธ์ มาสู่การออกแบบอนาคตของห้องเรียนผ่าน Dream Lab, Vibe Check, Roadmap 30 วัน, 5W1H และ SMART Quality Check",
          [
            "มองเห็นภาพฝันของโครงการและบรรยากาศการเรียนรู้ที่อยากสร้าง",
            "ออกแบบ Roadmap 30 วันและเชื่อมเป้าหมายกับกรอบระดับโลก ระดับชาติ และระดับพื้นที่",
          ],
          [
            "ทำ Mission 1-6 ให้ครบ",
            "ผ่าน Post-test อย่างน้อย 3/5",
            "รับ S-Design Badge และปลดล็อก Module 3",
          ],
          "ลองกล้าฝันให้ไกลก่อนนะครับ แล้วค่อยใช้กรอบต่าง ๆ ช่วยย่อฝันให้กลายเป็นแผนที่ทำได้จริง",
          {
            lessonUrl:
              "https://www.canva.com/design/DAHFggQuQrA/wjrRXDYOTSIPJ65KkbAlLA/view",
            focusList: [
              "Dream Lab แบบ SO / WO / ST / WT",
              "Vibe Check ผ่าน Visual / Audio / Feeling",
              "Roadmap 30 วันแบบ Set Up, Pilot, Feedback, Showcase",
            ],
          },
        ),
        { id: "m2-mission-1", title: "Mission 1 : Dream Lab & TOWS Matrix", type: "activity", iconName: "Sparkles", activityType: "dream_lab", content: { mentorTip: "ปล่อยไอเดียให้ไหลก่อนครับ ลองตอบทั้ง SO, WO, ST และ WT เพื่อเห็นภาพกลยุทธ์ในโลกไร้ข้อจำกัด" } },
        { id: "m2-mission-2", title: "Mission 2 : Vibe Check", type: "activity", iconName: "Sparkles", activityType: "vibe_check", content: { mentorTip: "ช่วยเปลี่ยนภาพฝันให้เป็นรูปธรรมด้วยสามผัสสะ เพื่อให้ Mood & Tone ของโครงการชัดขึ้น" } },
        { id: "m2-mission-3", title: "Mission 3 : Mapping the Journey", type: "activity", iconName: "ArrowRight", activityType: "roadmap_builder", content: { mentorTip: "แบ่งแผน 30 วันเป็น Quick Wins ทีละสัปดาห์ แล้วกำหนดหลักฐานความก้าวหน้าไว้ตั้งแต่ต้น" } },
        { id: "m2-mission-4", title: "Mission 4 : Define 5W1H", type: "activity", iconName: "Layout", activityType: "fivewoneh", content: { mentorTip: "ลองเขียน 5W1H ให้เหมือน pitch deck สั้น ๆ ที่คนอ่านแล้วเห็นภาพว่าโครงการนี้สำคัญอย่างไร" } },
        { id: "m2-mission-5", title: "Mission 5 : SMART Objective", type: "activity", iconName: "CheckSquare", activityType: "smart_goal", content: { mentorTip: "สรุปเป้าหมายของโครงการให้เป็นประโยคที่ชัด วัดผลได้ ทำได้จริง และมีกรอบเวลา 30 วันครับ" } },
        { id: "m2-mission-6", title: "Mission 6 : SMART Quality Check", type: "activity", iconName: "CheckSquare", activityType: "quality_check", content: { mentorTip: "ลองสวมแว่น 3 มิติของผลกระทบ แล้วเช็กว่าเป้าหมายนี้ตอบทั้ง OECD, พระบรมราโชบาย ร.10 และ Tak SEZ หรือยัง" } },
        makeQuizLesson("m2-posttest", "Post-test [Module 2]", "module2Posttest", 3, {
          description: "แบบทดสอบ 5 ข้อ ผ่านเมื่อได้อย่างน้อย 3 คะแนน",
        }),
        makeReportLesson("m2-report-card", "Report Card Module 2 : Road Map", "module2", "S-Design Badge", "DES", "ปลดล็อก Module 3 - P-PLC"),
      ],
    },
    {
      id: "module-3",
      navigationLabel: "Module 3",
      title: "Module 3 - P-PLC [รวมพลัง สร้างเครือข่ายแห่งการเรียนรู้]",
      description:
        "สร้างเครือข่าย PLC แบบ online/offline เตรียมบทบาท บันทึก logbook และฝึก pitching ไอเดียใน 60 วินาที",
      lessons: [
        makeArticleLesson(
          "m3-intro",
          "ภาพรวม Module 3 : P-PLC",
          "ย้ายจากแผนส่วนตัวไปสู่พลังเครือข่าย จับกลุ่ม 3-4 คน กำหนดบทบาทในวง PLC แล้วนำแผน 30 วันไปแลกเปลี่ยน รับฟีดแบ็ก และฝึก pitch",
          [
            "มีวง PLC ที่ช่วยขัดเกลาไอเดียและเติมมุมมองใหม่",
            "สื่อสารโครงการของตัวเองได้กระชับขึ้นผ่าน pitching 60 วินาที",
          ],
          [
            "จัดกลุ่ม PLC พร้อมวันเวลาและรูปแบบการพบกัน",
            "ส่ง Logbook + Vibe Evidence",
            "บันทึก Pitching และทำ reflection survey",
          ],
          "วง PLC ที่ดีไม่ใช่แค่ประชุมครับ แต่คือพื้นที่ที่เราได้ลองคิดดัง ๆ และมีคนช่วยต่อยอดความเป็นไปได้ให้กัน",
          {
            lessonUrl:
              "https://www.canva.com/design/DAHFglrceqA/WbTYzz93vBYgo8m30raOQg/view",
            focusList: [
              "Mission 1: The Mastermind Match และกำหนดบทบาท Facilitator / Time Keeper / Challenger / Note Taker",
              "Mission 2: One-Page Logbook และ Vibe Evidence",
              "Mission 3: Pitching แบบ Hook / Pain Point / Solution / Impact",
            ],
          },
        ),
        { id: "m3-mission-1", title: "Mission 1 : The Mastermind Match", type: "activity", iconName: "Users", activityType: "plc_matchmaking", content: { mentorTip: "ลองจัดวง PLC ให้ครบทั้งรูปแบบการพบกัน วันเวลา และบทบาทในวง เพื่อให้การคุยลื่นไหลตั้งแต่ต้นครับ" } },
        { id: "m3-mission-2", title: "Mission 2 : The Alchemy Logbook", type: "activity", iconName: "FileText", activityType: "plc_report", content: { mentorTip: "สรุปให้เห็นทั้งหัวข้อ บทบาท Aha! Moment และบรรยากาศของวง PLC เพื่อให้สะท้อนการเรียนรู้จริงของกลุ่ม" } },
        { id: "m3-mission-3", title: "Mission 3 : The 60-Second Spell", type: "activity", iconName: "PlayCircle", activityType: "pitching_session", content: { mentorTip: "ลองเรียงความคิดเป็น Hook, Pain Point, Solution และ Impact แล้วพูดให้คนฟังเห็นภาพใน 1 นาทีครับ" } },
        makeQuizLesson("m3-posttest", "Post-test [Module 3] : Reflection Survey", "module3Reflection", 0, {
          mode: "survey",
          description: "คำถามสะท้อนคิด 1 ข้อ เพื่อบันทึกคุณค่าที่เกิดจากเครือข่าย PLC",
        }),
        makeReportLesson("m3-report-card", "Report Card Module 3 : PLC", "module3", "P-PLC Badge", "PLC", "ปลดล็อก Module 4 - I-Innovation"),
      ],
    },
    {
      id: "module-4",
      navigationLabel: "Module 4",
      title: "Module 4 - I-Innovation [ก้าวสู่ความพร้อม จุดประกายนวัตกรรม]",
      description:
        "สร้างนวัตกรรมจากการจับคู่เครื่องมือกับ pedagogy ออกแบบ one-page blueprint ลงมือสร้างสื่อ และทดสอบต้นแบบก่อนใช้จริง",
      lessons: [
        makeArticleLesson(
          "m4-intro",
          "ภาพรวม Module 4 : I-Innovation",
          "ผสานเครื่องมือกับ Active Learning ให้เป็นนวัตกรรมที่ตอบ pain point สร้าง blueprint แบบหน้าเดียว ลงมือทำสื่อจริง และจบด้วย beta test",
          [
            "ออกแบบนวัตกรรมที่ตอบโจทย์บริบทจริงของผู้เรียน",
            "มีสื่อและ blueprint ที่พร้อมนำไปทดลองใช้ในห้องเรียน",
          ],
          [
            "ทำ Mission 1-4 ให้ครบ",
            "ผ่าน Post-test อย่างน้อย 3/5",
            "รับ In-Innovation Badge และปลดล็อก Module 5",
          ],
          "เทคโนโลยีจะมีพลังมากขึ้นเมื่อมันจับคู่กับ pedagogy ที่ใช่และสอดคล้องกับปัญหาจริงของห้องเรียนครับ",
          {
            lessonUrl:
              "https://www.canva.com/design/DAHFgi56U6Q/zlELbaa9zOznNXxcgepZdQ/view",
            focusList: [
              "Innovation Lab: สูตรผสมเครื่องมือ + Active Learning",
              "Master Blueprint: Hook / Action / Reflect",
              "Crafting Session และ Beta Test ก่อนลงสนามจริง",
            ],
          },
        ),
        { id: "m4-mission-1", title: "Mission 1 : Innovation Lab", type: "activity", iconName: "Zap", activityType: "innovation_lab", content: { mentorTip: "เริ่มจากสูตรผสมที่เรียบง่ายแต่เฉียบคมนะครับ เครื่องมือที่ใช่บวกวิธีสอนที่เหมาะจะกลายเป็นนวัตกรรมที่มีพลังมาก" } },
        { id: "m4-mission-2", title: "Mission 2 : The Master Blueprint", type: "activity", iconName: "FileText", activityType: "lesson_plan", content: { mentorTip: "ลองย่อแผนให้เหลือ Hook, Action และ Reflect ที่อ่านแล้วเห็นภาพทันทีว่าจะเกิดอะไรขึ้นใน 1 คาบเรียน" } },
        { id: "m4-mission-3", title: "Mission 3 : Crafting Session", type: "activity", iconName: "PenTool", activityType: "crafting_session", content: { mentorTip: "ถึงเวลาเปลี่ยน blueprint ให้เป็นชิ้นงานจริงครับ จะเป็นสื่อดิจิทัลหรือสื่อทำมือก็ได้ ขอให้พร้อมใช้และอธิบายได้ชัด" } },
        { id: "m4-mission-4", title: "Mission 4 : The Beta Test", type: "activity", iconName: "CheckSquare", activityType: "beta_test", content: { mentorTip: "ก่อนใช้จริงเต็มรูปแบบ ลองรับฟีดแบ็กสั้น ๆ จากเพื่อนครูหรือผู้เรียนกลุ่มเล็ก แล้วมองหาจุดเด่นกับจุดที่อยากอัปเกรดครับ" } },
        makeQuizLesson("m4-posttest", "Post-test [Module 4]", "module4Posttest", 3, {
          description: "แบบทดสอบ 5 ข้อ ผ่านเมื่อได้อย่างน้อย 3 คะแนน",
        }),
        makeReportLesson("m4-report-card", "Report Card Module 4 : Innovation", "module4", "In-Innovation Badge", "INV", "ปลดล็อก Module 5 - RE-Reflection"),
      ],
    },
    {
      id: "module-5",
      navigationLabel: "Module 5",
      title: "Module 5 - RE-Reflection [สะท้อนผล ต่อยอดการพัฒนา]",
      description:
        "นำแผนหรือนวัตกรรมไปใช้จริง ส่งคลิปการสอน 50-60 นาที บันทึก reflection และออกแบบแนวทางพัฒนารอบถัดไป",
      lessons: [
        makeArticleLesson(
          "m5-intro",
          "ภาพรวม Module 5 : RE-Reflection",
          "ภารกิจปิดวงจรจากการออกแบบสู่การใช้จริงในห้องเรียน สะท้อนผลจากหลักฐานที่เกิดขึ้น และวางแผนต่อยอดในรอบถัดไป",
          [
            "เห็นผลลัพธ์จริงจากการนำแผนหรือนวัตกรรมไปใช้",
            "ได้แนวทางปรับปรุงเพื่อพัฒนารอบถัดไปอย่างชัดเจน",
          ],
          [
            "ส่งคลิปการสอนจริงความยาว 50-60 นาที",
            "บันทึก reflection และเสียงตอบรับของผู้เรียน",
            "ออกแบบแผนต่อยอดหลังจบการทดลองใช้",
          ],
          "ภารกิจนี้ไม่ใช่การตัดสินว่าดีหรือไม่ดีนะครับ แต่คือการเรียนรู้จากของจริงเพื่อพัฒนาเวอร์ชันถัดไปอย่างแม่นยำ",
          {
            lessonUrl:
              "https://www.canva.com/design/DAHFgqmbbOo/SOLFw8FFKEblrDUr3_1UQg/view",
            focusList: [
              "Mission 1: นำแผนไปสอนจริงและส่งคลิป 50-60 นาที",
              "Mission 2: บันทึกหลังการใช้แผนการจัดการเรียนรู้",
              "Mission 3: วางแนวทางการพัฒนา/ต่อยอดแผนหรือนวัตกรรม",
            ],
          },
        ),
        { id: "m5-mission-1", title: "Mission 1 : Teaching in Action", type: "activity", iconName: "PlayCircle", activityType: "classroom_trial", content: { mentorTip: "เก็บหลักฐานให้เห็นทั้งบริบทของห้องเรียนและการลงมือสอนจริงนะครับ คลิป 50-60 นาทีจะช่วยให้สะท้อนผลได้ละเอียดขึ้น" } },
        { id: "m5-mission-2", title: "Mission 2 : Reflection Log", type: "activity", iconName: "FileText", activityType: "reflection_log", content: { mentorTip: "ลองบันทึกสิ่งที่เกิดขึ้นจริง สิ่งที่เวิร์ก และสิ่งที่ยังต้องปรับ โดยยึดจากพฤติกรรมผู้เรียนและหลักฐานในคาบครับ" } },
        { id: "m5-mission-3", title: "Mission 3 : Next Growth Plan", type: "activity", iconName: "ArrowRight", activityType: "growth_plan", content: { mentorTip: "ต่อยอดจาก reflection ให้เป็นแผนพัฒนารอบใหม่ที่ชัดขึ้น กล้าลองเวอร์ชัน 2.0 ได้เลยครับ" } },
        makeQuizLesson("m5-posttest", "Post-test [Module 5]", "module5Posttest", 3, {
          description: "แบบทดสอบ 5 ข้อ ผ่านเมื่อได้อย่างน้อย 3 คะแนน",
        }),
        makeReportLesson("m5-report-card", "Report Card Module 5 : RE-Reflection", "module5", "RE-Reflection Badge", "REF", "ปลดล็อก Final Post-test"),
      ],
    },
    {
      id: "module-final-posttest",
      navigationLabel: "Final Test",
      title: "Final Post-test",
      description:
        "ผ่านเมื่อได้ 80% หากไม่ผ่านทำใหม่ได้ 3 ครั้ง และหากครบ 3 ครั้งแล้วยังไม่ผ่านต้องรออีก 12 ชั่วโมง",
      lessons: [
        makeQuizLesson("final-posttest", "Final Post-test", "finalPosttest", 8, {
          maxAttempts: 3,
          cooldownHours: 12,
          description: "แบบทดสอบ 10 ข้อ ผ่านเมื่อได้อย่างน้อย 8 คะแนน",
        }),
      ],
    },
    {
      id: "module-survey",
      navigationLabel: "Survey",
      title: "แบบประเมินความพึงพอใจการใช้ Platform",
      description:
        "สะท้อนประสบการณ์ใช้งานแพลตฟอร์ม เพื่อช่วยให้ทีมพัฒนาปรับปรุง InSPIRE 360° ต่อไป",
      lessons: [
        { id: "platform-survey", title: "แบบประเมินความพึงพอใจ", type: "activity", iconName: "FileText", activityType: "platform_survey", content: { mentorTip: "ทุกความเห็นมีคุณค่ามากครับ เพราะจะช่วยให้แพลตฟอร์มนี้ตอบโจทย์ครูและผู้เรียนได้ดีขึ้นจริง" } },
      ],
    },
    {
      id: "module-certificate",
      navigationLabel: "Certificate",
      title: "Certificate of InSPIRE 360°",
      description: "รับ certificate หลังผ่านทุกโมดูล Final Post-test และแบบประเมินความพึงพอใจ",
      lessons: [
        { id: "final-certificate", title: "รับ Certificate", type: "certificate", iconName: "Award", content: { certificateType: "final-certificate", badgeName: "InSPIRE 360° Teacher Certificate", uniquePrefix: "CRT" } },
      ],
    },
  ],
};

