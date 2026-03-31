export const courseCatalog = [
  {
    id: "course-teacher",
    title: "InSPIRE 360° for Teacher",
    shortTitle: "เส้นทางครู",
    eyebrow: "เส้นทางหลักสำหรับครู",
    audience: "สำหรับครูและผู้นำทางการศึกษา",
    description:
      "เส้นทางพัฒนาแบบ PWA สำหรับครู ที่รวมกิจกรรม interactive, gamification, AI mentor และรายงานผลครบทั้ง Pre-test, 5 โมดูล, Final Post-test, Survey และ Certificate.",
    modules: 9,
    hours: 28,
    iconName: "BookOpen",
    requiresCode: true,
    accessCode: "TEACHER360",
    path: "/course/teacher/module-1",
    accessLabel: "เข้าเรียนด้วยรหัสรุ่น",
    outcomes: [
      "เส้นทางเรียนรู้ครบทั้งวิเคราะห์ปัญหา ออกแบบแผน PLC นวัตกรรม และ reflection",
      "มีกิจกรรม mission-based พร้อมรายงานและ badge ในแต่ละโมดูล",
      "ติดตามความคืบหน้าและกลับมาเรียนต่อได้ง่ายบนทุกอุปกรณ์",
    ],
    theme: {
      line: "bg-sky-400/45",
      ring: "ring-sky-300/25",
      glow: "from-sky-500/18 via-sky-500/5 to-transparent",
      chip: "border-sky-300/25 bg-sky-400/10 text-sky-200",
      iconWrap: "bg-sky-400/12 text-sky-200",
      button: "bg-sky-400 text-slate-950 hover:bg-sky-300",
      text: "text-sky-200",
      subtle: "text-sky-100/70",
    },
  },
  {
    id: "course-student",
    title: "InSPIRE for Student",
    shortTitle: "พื้นที่ผู้เรียน",
    eyebrow: "พื้นที่เรียนรู้แบบเปิด",
    audience: "สำหรับการเรียนรู้และความสุขของผู้เรียน",
    description:
      "พื้นที่เรียนรู้แบบเปิดที่เชื่อมความอยากรู้ ความคิดสร้างสรรค์ และ wellbeing ของผู้เรียนไว้ในประสบการณ์เดียว",
    modules: 8,
    hours: 12,
    iconName: "Layout",
    requiresCode: false,
    accessCode: "",
    path: "/course/student",
    accessLabel: "เข้าได้ทันที",
    outcomes: [
      "เข้าใช้งานง่ายสำหรับการค้นพบการเรียนรู้ของผู้เรียน",
      "เป็นพื้นที่ที่เบาและเป็นมิตรควบคู่กับเส้นทางของครู",
      "ออกแบบให้ใช้งานบนมือถือได้ง่าย",
    ],
    theme: {
      line: "bg-emerald-400/45",
      ring: "ring-emerald-300/25",
      glow: "from-emerald-500/18 via-emerald-500/5 to-transparent",
      chip: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
      iconWrap: "bg-emerald-400/12 text-emerald-200",
      button: "bg-emerald-400 text-slate-950 hover:bg-emerald-300",
      text: "text-emerald-200",
      subtle: "text-emerald-100/70",
    },
  },
  {
    id: "course-ai",
    title: "AI & Innovation",
    shortTitle: "ยุค AI",
    eyebrow: "เตรียมเปิดตัว",
    audience: "สำหรับการสอนดิจิทัลและนวัตกรรมยุคใหม่",
    description:
      "เส้นทางถัดไปที่โฟกัสเรื่อง AI literacy การทดลองในชั้นเรียน และนวัตกรรมการสอนเชิงปฏิบัติ",
    modules: 4,
    hours: 10,
    iconName: "Zap",
    requiresCode: false,
    accessCode: "",
    path: "/course/ai-era",
    accessLabel: "โหมดตัวอย่าง",
    outcomes: [
      "พื้นฐานการใช้ AI เพื่อยกระดับการสอน",
      "กรอบคิดเรื่องการทดลองและจริยธรรมที่ชัดเจน",
      "เป็นฐานสำหรับการขยายแพลตฟอร์มในอนาคต",
    ],
    theme: {
      line: "bg-amber-300/55",
      ring: "ring-amber-300/25",
      glow: "from-amber-400/18 via-amber-400/5 to-transparent",
      chip: "border-amber-300/25 bg-amber-300/10 text-amber-100",
      iconWrap: "bg-amber-300/12 text-amber-100",
      button: "bg-amber-300 text-slate-950 hover:bg-amber-200",
      text: "text-amber-100",
      subtle: "text-amber-50/70",
    },
  },
];

export const courseCatalogById = Object.fromEntries(
  courseCatalog.map((course) => [course.id, course]),
);

export const platformSignals = [
  { label: "ครูในระบบ", value: "5,000+" },
  { label: "สถานศึกษาพันธมิตร", value: "100+" },
  { label: "เส้นทางการเรียนรู้", value: "3" },
];

export const landingWorkflow = [
  {
    title: "เริ่มต้นด้วยตัวตนที่ใช่",
    description:
      "รองรับการเข้าสู่ระบบด้วยอีเมล Google และ LINE เพื่อให้ครูและผู้เรียนเริ่มจากเส้นทางที่เหมาะกับบริบทของตนเอง",
  },
  {
    title: "ปลดล็อกห้องเรียนรู้ที่ตรงกับบริบท",
    description:
      "ใช้ห้องเรียนแบบมีรหัสสำหรับรุ่นเฉพาะ และพื้นที่แบบเปิดเมื่ออยากให้ประสบการณ์เบาและเข้าถึงได้กว้างขึ้น",
  },
  {
    title: "ทำงานจาก workspace เดียวที่ชัดเจน",
    description:
      "ติดตามการลงทะเบียน ความคืบหน้า สัญญาณการใช้งานของรุ่น และข้อมูลโปรไฟล์ได้ในที่เดียว",
  },
];

export const operatorNotes = [
  "Workspace ถูกออกแบบให้อ่านง่ายทั้งบนมือถือและเดสก์ท็อป",
  "ข้อมูลคอร์สสอดคล้องกันทั้งหน้า landing, dashboard และ my courses",
  "ห้องเรียนที่ใช้รหัสช่วยแยกรุ่นเฉพาะได้โดยไม่ทำให้ UI ซับซ้อน",
];

export const getCourseById = (courseId) => courseCatalogById[courseId];
