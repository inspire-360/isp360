import { insightDimensions, teacherCourseData } from "../data/teacherCourse";

const MODULE_PATH_ALIASES = {
  module1: "module-1",
  module2: "module-2",
  module3: "module-3",
  module4: "module-4",
  module5: "module-5",
  final: "module-final-posttest",
  survey: "module-survey",
  certificate: "module-certificate",
};

export const MODULE_STATE_KEY_BY_ID = {
  "module-1": "module1",
  "module-2": "module2",
  "module-3": "module3",
  "module-4": "module4",
  "module-5": "module5",
};

export const PLC_TEACHER_POOL = [
  { name: "ครูมาลินี ตากสิน", uid: "PLC-2401" },
  { name: "ครูสุภาวดี เมฆา", uid: "PLC-2402" },
  { name: "ครูธีรภัทร แสงทอง", uid: "PLC-2403" },
  { name: "ครูจิราภรณ์ ลำน้ำ", uid: "PLC-2404" },
  { name: "ครูภาณุพงศ์ รุ่งเรือง", uid: "PLC-2405" },
  { name: "ครูณัฐชยา เสถียร", uid: "PLC-2406" },
];

export const TOTAL_TEACHER_LESSONS = teacherCourseData.modules.reduce(
  (sum, module) => sum + module.lessons.length,
  0,
);

export function deepMerge(baseValue, incomingValue) {
  if (Array.isArray(baseValue)) {
    return Array.isArray(incomingValue) ? incomingValue : baseValue;
  }

  if (isPlainObject(baseValue)) {
    const result = {};

    Object.keys(baseValue).forEach((key) => {
      result[key] = deepMerge(baseValue[key], incomingValue?.[key]);
    });

    Object.keys(incomingValue || {}).forEach((key) => {
      if (!(key in result)) {
        result[key] = incomingValue[key];
      }
    });

    return result;
  }

  return incomingValue ?? baseValue;
}

export function normalizeProgress(defaultProgress, remoteData = {}, localDraft = null) {
  const remoteProgress = {
    completedLessons: Array.isArray(remoteData.completedLessons)
      ? remoteData.completedLessons
      : [],
    currentModuleIndex: Number(remoteData.currentModuleIndex || 0),
    quizAttempts: remoteData.quizAttempts || {},
    quizScores: remoteData.quizScores || {},
    quizCooldowns: normalizeCooldownMap(remoteData.quizCooldowns || {}),
    badges: Array.isArray(remoteData.badges) ? remoteData.badges : [],
  };

  const localProgress = localDraft?.progress
    ? {
        ...localDraft.progress,
        quizCooldowns: normalizeCooldownMap(localDraft.progress.quizCooldowns || {}),
      }
    : {};

  return {
    ...defaultProgress,
    ...remoteProgress,
    ...localProgress,
    completedLessons: uniqueList([
      ...defaultProgress.completedLessons,
      ...remoteProgress.completedLessons,
      ...(localProgress.completedLessons || []),
    ]),
    badges: uniqueList([
      ...remoteProgress.badges,
      ...(localProgress.badges || []),
    ]),
    currentModuleIndex: clamp(
      localProgress.currentModuleIndex ?? remoteProgress.currentModuleIndex,
      0,
      teacherCourseData.modules.length - 1,
    ),
  };
}

export function normalizeCooldownMap(cooldowns) {
  return Object.fromEntries(
    Object.entries(cooldowns).map(([key, value]) => [key, normalizeTimestamp(value)]),
  );
}

export function normalizeTimestamp(value) {
  if (!value) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return new Date(value).getTime();
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value.seconds === "number") {
    return value.seconds * 1000;
  }

  return 0;
}

export function createExpandedMap(currentModuleIndex) {
  return teacherCourseData.modules.reduce((accumulator, _, index) => {
    accumulator[index] = index <= currentModuleIndex;
    return accumulator;
  }, {});
}

export function getTeacherCourseProgressPercent(completedLessons = []) {
  if (!TOTAL_TEACHER_LESSONS) {
    return 0;
  }

  return Math.round((completedLessons.length / TOTAL_TEACHER_LESSONS) * 100);
}

export function getTeacherCourseStatus(completedLessons = []) {
  return completedLessons.length >= TOTAL_TEACHER_LESSONS && TOTAL_TEACHER_LESSONS > 0
    ? "completed"
    : "active";
}

export function buildTeacherModuleStatuses(completedLessons = []) {
  const completedSet = new Set(completedLessons);
  let unlocked = true;

  return teacherCourseData.modules.map((module) => {
    const lessonIds = module.lessons.map((lesson) => lesson.id);
    const completedCount = lessonIds.filter((lessonId) => completedSet.has(lessonId)).length;
    const totalLessons = lessonIds.length;
    const isCompleted = totalLessons > 0 && completedCount === totalLessons;
    const isActive = unlocked && !isCompleted;
    const status = isCompleted ? "completed" : isActive ? "active" : "locked";

    if (!isCompleted && unlocked) {
      unlocked = false;
    }

    return {
      id: module.id,
      title: module.title,
      completedLessons: completedCount,
      totalLessons,
      progressPercent: totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0,
      status,
    };
  });
}

export function getModuleIndexFromPath(pathname) {
  const slug = pathname.replace("/course/teacher", "").replaceAll("/", "");
  if (!slug) {
    return null;
  }

  const resolvedSlug = MODULE_PATH_ALIASES[slug] || slug;
  const moduleIndex = teacherCourseData.modules.findIndex(
    (module) => module.id === resolvedSlug,
  );

  return moduleIndex === -1 ? null : moduleIndex;
}

export function getFirstIncompleteLessonIndex(module, completedLessons) {
  const lessonIndex = module.lessons.findIndex(
    (lesson) => !completedLessons.includes(lesson.id),
  );

  return lessonIndex === -1 ? Math.max(0, module.lessons.length - 1) : lessonIndex;
}

export function isLessonLocked(moduleIndex, lessonIndex, progress) {
  if (moduleIndex > progress.currentModuleIndex) {
    return true;
  }

  if (moduleIndex < progress.currentModuleIndex || lessonIndex === 0) {
    return false;
  }

  const previousLessonId =
    teacherCourseData.modules[moduleIndex].lessons[lessonIndex - 1]?.id;

  return !progress.completedLessons.includes(previousLessonId);
}

export function withCompletedLesson(progress, moduleIndex, lessonId, badgeName = "") {
  const completedLessons = progress.completedLessons.includes(lessonId)
    ? progress.completedLessons
    : [...progress.completedLessons, lessonId];

  const badges =
    badgeName && !progress.badges.includes(badgeName)
      ? [...progress.badges, badgeName]
      : progress.badges;

  let currentModuleIndex = progress.currentModuleIndex;
  const moduleLessons = teacherCourseData.modules[moduleIndex].lessons.map(
    (lesson) => lesson.id,
  );
  const moduleCompleted = moduleLessons.every((item) =>
    completedLessons.includes(item),
  );

  if (moduleCompleted && moduleIndex + 1 < teacherCourseData.modules.length) {
    currentModuleIndex = Math.max(currentModuleIndex, moduleIndex + 1);
  }

  return {
    ...progress,
    completedLessons,
    currentModuleIndex,
    badges,
  };
}

export function buildQuizProgress(progress, lessonContent, score, passed) {
  const quizId = lessonContent.quizId;
  const nextAttempts = { ...progress.quizAttempts };
  const nextScores = { ...progress.quizScores, [quizId]: score };
  const nextCooldowns = { ...progress.quizCooldowns };

  if (passed || lessonContent.mode === "survey" || lessonContent.passScore === 0) {
    nextAttempts[quizId] = 0;
    delete nextCooldowns[quizId];

    return {
      ...progress,
      quizAttempts: nextAttempts,
      quizScores: nextScores,
      quizCooldowns: nextCooldowns,
    };
  }

  const attemptCount = (progress.quizAttempts[quizId] || 0) + 1;
  const maxAttempts = lessonContent.maxAttempts || Infinity;

  if (attemptCount >= maxAttempts && lessonContent.cooldownHours) {
    nextAttempts[quizId] = 0;
    nextCooldowns[quizId] =
      Date.now() + lessonContent.cooldownHours * 60 * 60 * 1000;
  } else {
    nextAttempts[quizId] = attemptCount;
  }

  return {
    ...progress,
    quizAttempts: nextAttempts,
    quizScores: nextScores,
    quizCooldowns: nextCooldowns,
  };
}

export function buildInsightTokens(dimensions, swot) {
  const existingSwotItems = uniqueList(
    Object.values(swot).flatMap((items) => items),
  );

  const tokens = insightDimensions.flatMap((dimension) =>
    splitInsightText(dimensions[dimension.key].answer),
  );

  return uniqueList(tokens)
    .filter((token) => !existingSwotItems.includes(token))
    .slice(0, 18);
}

export function splitInsightText(value) {
  const text = String(value || "").trim();
  if (!text) {
    return [];
  }

  const chunks = text
    .split(/\n|,|;|•|-/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (chunks.length > 0) {
    return chunks.map((item) => (item.length > 80 ? `${item.slice(0, 79)}…` : item));
  }

  return [text.length > 80 ? `${text.slice(0, 79)}…` : text];
}

export function getStrategyType(internalBucket, externalBucket) {
  if (internalBucket === "strengths" && externalBucket === "opportunities") {
    return "SO Strategy";
  }
  if (internalBucket === "weaknesses" && externalBucket === "opportunities") {
    return "WO Strategy";
  }
  if (internalBucket === "strengths" && externalBucket === "threats") {
    return "ST Strategy";
  }
  return "WT Strategy";
}

export function getStrategyGuidance(strategyType) {
  const mapping = {
    "SO Strategy": "ใช้จุดแข็งคว้าโอกาสให้เกิดผลเชิงรุก",
    "WO Strategy": "ใช้โอกาสมาช่วยลดหรือแก้จุดอ่อน",
    "ST Strategy": "ใช้จุดแข็งเพื่อลดผลกระทบจากอุปสรรค",
    "WT Strategy": "วางแผนรับมือเพื่อไม่ให้จุดอ่อนซ้ำเติมสถานการณ์",
  };

  return mapping[strategyType] || "";
}

export function formatCountdown(milliseconds) {
  const totalMinutes = Math.ceil(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} ชม. ${minutes} นาที`;
  }

  if (hours > 0) {
    return `${hours} ชม.`;
  }

  return `${minutes} นาที`;
}

export function uniqueList(values) {
  return [...new Set(values)];
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
