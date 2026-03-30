import { serverTimestamp } from "firebase/firestore";
import {
  createDefaultTeacherCourseState,
  createDefaultTeacherProgress,
} from "../data/teacherCourseState";

export function getPendingEnrollmentStorageKey(courseId) {
  return `pending-enrollment:${courseId}`;
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
    courseState: createDefaultTeacherCourseState(),
    completedLessons: defaultProgress.completedLessons,
    currentModuleIndex: defaultProgress.currentModuleIndex,
    quizAttempts: defaultProgress.quizAttempts,
    quizScores: defaultProgress.quizScores,
    quizCooldowns: defaultProgress.quizCooldowns,
    badges: defaultProgress.badges,
  };
}
