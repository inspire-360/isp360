import { insightDimensions, swotBuckets } from "../data/teacherCourse";

export function makeUniqueId(prefix, userId) {
  const year = new Date().getFullYear();
  const tail = String(userId || "0000").slice(-4).toUpperCase();
  return `${prefix}-${year}-${tail}`;
}

export function downloadSvgFile(filename, svgText) {
  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildModuleReportSvg({
  moduleKey,
  reportId,
  badgeName,
  userName,
  courseState,
}) {
  const sections = getModuleSections(moduleKey, courseState);

  return buildReportTemplate({
    title: `InSPIRE 360° Report Card`,
    subtitle: badgeName,
    reportId,
    ownerName: userName,
    footer: "Generated from the InSPIRE 360° Teacher pathway",
    sections,
  });
}

export function buildFinalCertificateSvg({
  userName,
  reportId,
  badges = [],
}) {
  return buildReportTemplate({
    title: "Certificate of InSPIRE 360°",
    subtitle: "Teacher Development Pathway",
    reportId,
    ownerName: userName,
    footer: "Completed all teacher modules, final post-test and platform survey",
    sections: [
      {
        heading: "ความสำเร็จ",
        lines: [
          "ผ่านเส้นทางการเรียนรู้ครบทุกโมดูล",
          "ผ่าน Final Post-test ตามเกณฑ์ 80%",
          "ส่งแบบประเมินความพึงพอใจของแพลตฟอร์มครบถ้วน",
        ],
      },
      {
        heading: "Badges",
        lines:
          badges.length > 0
            ? [badges.join(" • ")]
            : ["In-Sight Badge • S-Design Badge • P-PLC Badge • In-Innovation Badge • RE-Reflection Badge"],
      },
    ],
  });
}

function getModuleSections(moduleKey, courseState) {
  const moduleState = courseState[moduleKey];

  if (moduleKey === "module1") {
    return [
      {
        heading: "9 Dimensions",
        lines: insightDimensions.map((dimension) => {
          const entry = moduleState.dimensions[dimension.key];
          return `${dimension.label}: ${trimText(entry.answer)} (ระดับปัญหา ${entry.rating || 0}/5)`;
        }),
      },
      {
        heading: "SWOT Snapshot",
        lines: swotBuckets.map(
          (bucket) =>
            `${bucket.thaiLabel}: ${trimText((moduleState.swot[bucket.key] || []).join(" • "), 120) || "-"}`,
        ),
      },
      {
        heading: "กลยุทธ์ที่พัฒนาแล้ว",
        lines:
          moduleState.strategies.length > 0
            ? moduleState.strategies.map(
                (strategy, index) =>
                  `${index + 1}. ${strategy.type} | ${trimText(strategy.title || strategy.description, 120)}`,
              )
            : ["ยังไม่มีกลยุทธ์"],
      },
      {
        heading: "In-Sight Card",
        lines: [
          `Core Problem: ${trimText(moduleState.insightCard.coreProblem)}`,
          `Real Need: ${trimText(moduleState.insightCard.realNeed)}`,
          `Solution: ${trimText(moduleState.insightCard.solution)}`,
          `Selected Strategy: ${trimText(findSelectedStrategy(moduleState))}`,
          `PDCA Plan: ${trimText(moduleState.actionPlan.plan)}`,
          `PDCA Do: ${trimText(moduleState.actionPlan.do)}`,
          `PDCA Check: ${trimText(moduleState.actionPlan.check)}`,
          `PDCA Act: ${trimText(moduleState.actionPlan.act)}`,
        ],
      },
    ];
  }

  if (moduleKey === "module2") {
    return [
      {
        heading: "Dream & Vibe",
        lines: [
          `Dream Lab: ${trimText(moduleState.dreamLab)}`,
          `Vibe Check: ${trimText(moduleState.vibeCheck)}`,
        ],
      },
      {
        heading: "Roadmap 30 วัน",
        lines: moduleState.roadmap.map(
          (week) =>
            `${week.week}: ${trimText(week.focus)} | ${trimText(week.actions)} | หลักฐาน ${trimText(week.evidence)}`,
        ),
      },
      {
        heading: "5W1H + SMART",
        lines: [
          `Who: ${trimText(moduleState.fiveWOneH.who)}`,
          `What: ${trimText(moduleState.fiveWOneH.what)}`,
          `When: ${trimText(moduleState.fiveWOneH.when)}`,
          `Where: ${trimText(moduleState.fiveWOneH.where)}`,
          `Why: ${trimText(moduleState.fiveWOneH.why)}`,
          `How: ${trimText(moduleState.fiveWOneH.how)}`,
          `SMART: ${trimText(Object.values(moduleState.smartGoal).join(" | "), 140)}`,
          `Quality Check: OECD ${trimText(moduleState.qualityCheck.oecd)} | ร.10 ${trimText(moduleState.qualityCheck.royalPolicy)} | SEZ ${trimText(moduleState.qualityCheck.sez)}`,
        ],
      },
    ];
  }

  if (moduleKey === "module3") {
    return [
      {
        heading: "PLC Matchmaking",
        lines: [
          `หัวข้อ PLC: ${trimText(moduleState.meetingTopic)}`,
          `คู่ PLC: ${trimText(moduleState.pairedTeacherName)}`,
          `วันเวลา: ${trimText(`${moduleState.meetingDate} ${moduleState.meetingTime}`)}`,
          `ลิงก์ห้องประชุม: ${trimText(moduleState.meetLink)}`,
        ],
      },
      {
        heading: "PLC Reflection",
        lines: [
          `สรุป PLC: ${trimText(moduleState.plcReport, 140)}`,
          `หลักฐาน: ${trimText(moduleState.plcScreenshotUrl)}`,
          `Pitch Script: ${trimText(moduleState.pitchScript, 140)}`,
          `Pitch Audio: ${trimText(moduleState.pitchAudioUrl)}`,
        ],
      },
    ];
  }

  if (moduleKey === "module4") {
    return [
      {
        heading: "Innovation Lab",
        lines: [
          `ชื่อนวัตกรรม: ${trimText(moduleState.innovationName)}`,
          `Hardware: ${trimText(moduleState.hardware)}`,
          `Software: ${trimText(moduleState.software)}`,
          `Active Learning: ${trimText(moduleState.activeLearning)}`,
        ],
      },
      {
        heading: "Lesson Plan & Crafting",
        lines: [
          `Lesson Plan: ${trimText(moduleState.lessonPlan, 140)}`,
          `Assessment: ${trimText(moduleState.assessmentPlan)}`,
          `หลักฐานสื่อ: ${trimText(moduleState.mediaEvidenceUrl)}`,
          `คำอธิบายสื่อ: ${trimText(moduleState.mediaDescription, 120)}`,
        ],
      },
    ];
  }

  if (moduleKey === "module5") {
    return [
      {
        heading: "Teaching in Action",
        lines: [
          `คลิปการสอน: ${trimText(moduleState.teachingClipUrl)}`,
          `บริบทชั้นเรียน: ${trimText(moduleState.classroomContext, 120)}`,
        ],
      },
      {
        heading: "Reflection & Growth",
        lines: [
          `Reflection Log: ${trimText(moduleState.reflectionLog, 140)}`,
          `Learner Response: ${trimText(moduleState.learnerResponse, 120)}`,
          `Next Growth Plan: ${trimText(moduleState.nextGrowthPlan, 120)}`,
        ],
      },
    ];
  }

  return [
    {
      heading: "Report Summary",
      lines: ["ยังไม่มีข้อมูลสรุปสำหรับโมดูลนี้"],
    },
  ];
}

function buildReportTemplate({
  title,
  subtitle,
  reportId,
  ownerName,
  footer,
  sections,
}) {
  const header = [
    `<text x="80" y="110" font-size="44" font-family="Sarabun, Arial" font-weight="700" fill="#0f172a">${escapeXml(
      title,
    )}</text>`,
    `<text x="80" y="152" font-size="24" font-family="Sarabun, Arial" fill="#7c3aed">${escapeXml(
      subtitle,
    )}</text>`,
    `<text x="80" y="190" font-size="20" font-family="Sarabun, Arial" fill="#475569">รายงานผู้เรียน: ${escapeXml(
      ownerName || "Teacher",
    )}</text>`,
    `<text x="80" y="222" font-size="18" font-family="Sarabun, Arial" fill="#64748b">Report ID: ${escapeXml(
      reportId,
    )}</text>`,
  ].join("");

  let y = 285;
  const renderedSections = sections
    .map((section) => {
      const sectionHeader = `<text x="80" y="${y}" font-size="22" font-family="Sarabun, Arial" font-weight="700" fill="#0f172a">${escapeXml(
        section.heading,
      )}</text>`;
      y += 34;

      const lines = section.lines
        .flatMap((line) => wrapLine(trimText(line, 155), 78))
        .map((line) => {
          const rendered = `<text x="96" y="${y}" font-size="16" font-family="Sarabun, Arial" fill="#334155">${escapeXml(
            line,
          )}</text>`;
          y += 24;
          return rendered;
        })
        .join("");

      y += 18;
      return `${sectionHeader}${lines}`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
  <rect width="1200" height="1600" fill="#f8fafc" />
  <rect x="40" y="40" width="1120" height="1520" rx="28" fill="#ffffff" stroke="#dbeafe" stroke-width="4" />
  <rect x="40" y="40" width="1120" height="220" rx="28" fill="#eef2ff" />
  ${header}
  ${renderedSections}
  <text x="80" y="1520" font-size="18" font-family="Sarabun, Arial" fill="#64748b">${escapeXml(
    footer,
  )}</text>
</svg>`;
}

function wrapLine(text, maxLength) {
  if (!text) {
    return ["-"];
  }

  if (text.length <= maxLength) {
    return [text];
  }

  const words = text.split(" ");
  if (words.length === 1) {
    return [text.slice(0, maxLength), `${text.slice(maxLength, maxLength * 2)}...`];
  }

  const lines = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) {
    lines.push(current);
  }
  return lines.slice(0, 3);
}

function trimText(text, maxLength = 90) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (!value) {
    return "-";
  }
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function escapeXml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function findSelectedStrategy(moduleState) {
  const selected = moduleState.strategies.find(
    (strategy) => strategy.id === moduleState.selectedStrategyId,
  );
  return selected?.title || selected?.description || "-";
}
