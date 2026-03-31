import { serverTimestamp } from "firebase/firestore";
import {
  createDefaultTeacherCourseState,
  createDefaultTeacherProgress,
} from "../data/teacherCourseState";
import {
  buildTeacherModuleStatuses,
  getTeacherCourseProgressPercent,
  getTeacherCourseStatus,
} from "./teacherCourseHelpers";

export function getPendingEnrollmentStorageKey(courseId) {
  return `pending-enrollment:${courseId}`;
}

function getLocalEnrollmentStorageKey(userId) {
  return `enrollments:${userId}`;
}

export function createEnrollmentPayload(course, codeUsed) {
  const basePayload = {
    courseId: course.id,
    courseTitle: course.title,
    progress: 0,
    status: "active",
    accessCodeUsed: codeUsed,
    enrolledAt: serverTimestamp(),
    lastAccess: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (course.id !== "course-teacher") {
    return basePayload;
  }

  const defaultProgress = createDefaultTeacherProgress();

  return {
    ...basePayload,
    progress: getTeacherCourseProgressPercent(defaultProgress.completedLessons),
    status: getTeacherCourseStatus(defaultProgress.completedLessons),
    courseState: createDefaultTeacherCourseState(),
    completedLessons: defaultProgress.completedLessons,
    currentModuleIndex: defaultProgress.currentModuleIndex,
    quizAttempts: defaultProgress.quizAttempts,
    quizScores: defaultProgress.quizScores,
    quizCooldowns: defaultProgress.quizCooldowns,
    badges: defaultProgress.badges,
    moduleStatuses: buildTeacherModuleStatuses(defaultProgress.completedLessons),
  };
}

export function createLocalEnrollmentPayload(course, codeUsed) {
  const basePayload = {
    courseId: course.id,
    courseTitle: course.title,
    progress: 0,
    status: "active",
    accessCodeUsed: codeUsed,
    enrolledAt: new Date().toISOString(),
    lastAccess: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (course.id !== "course-teacher") {
    return basePayload;
  }

  const defaultProgress = createDefaultTeacherProgress();

  return {
    ...basePayload,
    progress: getTeacherCourseProgressPercent(defaultProgress.completedLessons),
    status: getTeacherCourseStatus(defaultProgress.completedLessons),
    courseState: createDefaultTeacherCourseState(),
    completedLessons: defaultProgress.completedLessons,
    currentModuleIndex: defaultProgress.currentModuleIndex,
    quizAttempts: defaultProgress.quizAttempts,
    quizScores: defaultProgress.quizScores,
    quizCooldowns: defaultProgress.quizCooldowns,
    badges: defaultProgress.badges,
    moduleStatuses: buildTeacherModuleStatuses(defaultProgress.completedLessons),
  };
}

export function readLocalEnrollmentMap(userId) {
  if (!userId || typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(getLocalEnrollmentStorageKey(userId));
    return rawValue ? JSON.parse(rawValue) : {};
  } catch (error) {
    console.error("Error reading local enrollments:", error);
    return {};
  }
}

export function listLocalEnrollments(userId) {
  return Object.values(readLocalEnrollmentMap(userId));
}

export function getLocalEnrollment(userId, courseId) {
  const enrollmentMap = readLocalEnrollmentMap(userId);
  return enrollmentMap[courseId] || null;
}

export function writeLocalEnrollment(userId, courseId, payload) {
  if (!userId || !courseId || typeof window === "undefined") {
    return null;
  }

  try {
    const currentMap = readLocalEnrollmentMap(userId);
    const nextEntry = {
      ...(currentMap[courseId] || {}),
      ...payload,
      courseId,
      updatedAt: new Date().toISOString(),
      lastAccess: payload.lastAccess || new Date().toISOString(),
    };

    currentMap[courseId] = nextEntry;
    window.localStorage.setItem(
      getLocalEnrollmentStorageKey(userId),
      JSON.stringify(currentMap),
    );

    return nextEntry;
  } catch (error) {
    console.error("Error writing local enrollment:", error);
    return null;
  }
}
