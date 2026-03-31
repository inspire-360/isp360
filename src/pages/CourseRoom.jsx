import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Loader2,
  Lock,
  Menu,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import SwotBalanceChart from "../components/activities/SwotBalanceChart";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import {
  externalScanFactors,
  insightDimensions,
  swotBuckets,
  teacherCourseData,
} from "../data/teacherCourse";
import {
  createDefaultTeacherCourseState,
  createDefaultTeacherProgress,
  getQuizCooldownRemaining,
  getQuizQuestionsById,
} from "../data/teacherCourseState";
import {
  buildFinalCertificateSvg,
  buildModuleReportSvg,
  downloadSvgFile,
  makeUniqueId,
} from "../lib/teacherCourseReports";
import {
  createLocalEnrollmentPayload,
  getLocalEnrollment,
  writeLocalEnrollment,
} from "../lib/enrollment";
import {
  MODULE_STATE_KEY_BY_ID,
  PLC_TEACHER_POOL,
  buildInsightTokens,
  buildQuizProgress,
  buildTeacherModuleStatuses,
  buildModule1Swot,
  createExpandedMap,
  deepMerge,
  formatCountdown,
  getLessonSelectionFromPath,
  getPreferredLessonIndex,
  getTeacherCourseProgressPercent,
  getTeacherCourseStatus,
  getStrategyGuidance,
  getStrategyType,
  isLessonLocked,
  normalizeProgress,
  normalizeTimestamp,
  TOTAL_TEACHER_LESSONS,
  withCompletedLesson,
} from "../lib/teacherCourseHelpers";
import { getIcon } from "../utils/iconHelper";

const COURSE_ID = teacherCourseData.id;
const STAR_COPY = ["ยังไม่ชัด", "พอเห็นทาง", "เริ่มใช่", "ดีมาก", "โดดเด่น"];
const pageReveal = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
const MotionDiv = motion.div;
const MotionSection = motion.section;

export default function CourseRoom() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [courseState, setCourseState] = useState(createDefaultTeacherCourseState);
  const [progress, setProgress] = useState(createDefaultTeacherProgress);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [syncState, setSyncState] = useState("idle");
  const [feedback, setFeedback] = useState(null);
  const [swotDrafts, setSwotDrafts] = useState({
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
  });
  const [towsDraft, setTowsDraft] = useState({
    internalBucket: "strengths",
    internalValue: "",
    externalBucket: "opportunities",
    externalValue: "",
    title: "",
    description: "",
  });
  const [initialized, setInitialized] = useState(false);

  const feedbackTimeoutRef = useRef(null);
  const initialPathRef = useRef(location.pathname);
  const completedAtRef = useRef(null);

  const currentModule = teacherCourseData.modules[activeModuleIndex];
  const currentLesson = currentModule?.lessons?.[activeLessonIndex];
  const currentUserName =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "ครูผู้เรียน";
  const currentQuizId =
    currentLesson?.type === "quiz" ? currentLesson.content?.quizId : "";
  const cooldownRemaining = currentQuizId
    ? getQuizCooldownRemaining(progress.quizCooldowns, currentQuizId)
    : 0;
  const totalLessons = TOTAL_TEACHER_LESSONS;
  const moduleStatuses = useMemo(
    () => buildTeacherModuleStatuses(progress.completedLessons),
    [progress.completedLessons],
  );
  const overallProgress = getTeacherCourseProgressPercent(progress.completedLessons);
  const enrollmentStatus = getTeacherCourseStatus(progress.completedLessons);
  const completedRequiredLessonCount = teacherCourseData.modules
    .flatMap((module) =>
      module.lessons.filter(
        (lesson, lessonIndex) =>
          !(lessonIndex === 0 && lesson.type === "article") &&
          progress.completedLessons.includes(lesson.id),
      ),
    ).length;
  const currentModuleRequiredLessons = currentModule
    ? currentModule.lessons.filter(
        (lesson, lessonIndex) => !(lessonIndex === 0 && lesson.type === "article"),
      )
    : [];
  const moduleCompletionCount = currentModule
    ? currentModuleRequiredLessons.filter((lesson) =>
        progress.completedLessons.includes(lesson.id),
      ).length
    : 0;
  const currentModuleKey = currentModule
    ? MODULE_STATE_KEY_BY_ID[currentModule.id]
    : null;
  const module1Swot = useMemo(
    () => buildModule1Swot(courseState.module1),
    [courseState.module1],
  );
  const insightTokens = useMemo(
    () => buildInsightTokens(courseState.module1.dimensions, module1Swot),
    [courseState.module1.dimensions, module1Swot],
  );
  const swotChartValues = useMemo(
    () =>
      swotBuckets.map((bucket, index) => ({
        label: bucket.thaiLabel,
        value: module1Swot[bucket.key].length,
        color: ["#6366f1", "#f97316", "#22c55e", "#ef4444"][index],
      })),
    [module1Swot],
  );

  useEffect(() => {
    const timeoutRef = feedbackTimeoutRef.current;
    return () => {
      if (timeoutRef) {
        window.clearTimeout(timeoutRef);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadCourseState() {
      if (!currentUser) {
        return;
      }

      setLoading(true);
      const defaultState = createDefaultTeacherCourseState();
      const defaultProgress = createDefaultTeacherProgress();
      const enrollmentRef = doc(db, "users", currentUser.uid, "enrollments", COURSE_ID);
      const localEnrollment = getLocalEnrollment(currentUser.uid, COURSE_ID);

      try {
        const [snapshot, localDraft] = await Promise.all([
          getDoc(enrollmentRef),
          Promise.resolve(readLocalDraft(currentUser.uid)),
        ]);

        const remoteData = snapshot.exists() ? snapshot.data() : {};
        const baseEnrollment =
          snapshot.exists()
            ? remoteData
            : localEnrollment || createLocalEnrollmentPayload(teacherCourseData, "local-cache");
        const completedAtValue = baseEnrollment.completedAt || localEnrollment?.completedAt || null;
        const completedAtTimestamp = normalizeTimestamp(completedAtValue);
        completedAtRef.current = completedAtTimestamp
          ? new Date(completedAtTimestamp).toISOString()
          : null;
        if (!snapshot.exists()) {
          try {
            await setDoc(
              enrollmentRef,
              {
                enrolledAt: new Date(),
                status: "active",
                lastAccess: new Date(),
                courseState: defaultState,
                completedLessons: [],
                currentModuleIndex: 0,
                quizAttempts: {},
                quizScores: {},
                quizCooldowns: {},
                badges: [],
              },
              { merge: true },
            );
          } catch (error) {
            console.error("Error creating remote enrollment:", error);
          }
        }

        const mergedState = deepMerge(
          deepMerge(defaultState, baseEnrollment.courseState || {}),
          localDraft?.courseState || {},
        );
        const mergedProgress = normalizeProgress(defaultProgress, baseEnrollment, localDraft);
        const routeSelection = getLessonSelectionFromPath(initialPathRef.current);
        const routeModuleIndex = routeSelection?.moduleIndex ?? null;
        const initialModuleIndex =
          routeModuleIndex !== null && routeModuleIndex <= mergedProgress.currentModuleIndex
            ? routeModuleIndex
            : mergedProgress.currentModuleIndex;
        const requestedLessonIndex = routeSelection?.lessonIndex;
        const preferredLessonIndex = getPreferredLessonIndex(
          teacherCourseData.modules[initialModuleIndex],
          mergedProgress.completedLessons,
        );
        const initialLessonIndex =
          requestedLessonIndex !== null &&
          requestedLessonIndex !== undefined &&
          !isLessonLocked(initialModuleIndex, requestedLessonIndex, mergedProgress)
            ? requestedLessonIndex
            : preferredLessonIndex;

        const mergedModuleStatuses = buildTeacherModuleStatuses(mergedProgress.completedLessons);
        const mergedEnrollmentStatus = getTeacherCourseStatus(mergedProgress.completedLessons);
        writeLocalEnrollment(currentUser.uid, COURSE_ID, {
          ...baseEnrollment,
          courseState: mergedState,
          completedLessons: mergedProgress.completedLessons,
          currentModuleIndex: mergedProgress.currentModuleIndex,
          quizAttempts: mergedProgress.quizAttempts,
          quizScores: mergedProgress.quizScores,
          quizCooldowns: mergedProgress.quizCooldowns,
          badges: mergedProgress.badges,
          moduleStatuses: mergedModuleStatuses,
          progress: getTeacherCourseProgressPercent(mergedProgress.completedLessons),
          status: mergedEnrollmentStatus,
          ...(mergedEnrollmentStatus === "completed"
            ? { completedAt: baseEnrollment.completedAt || new Date().toISOString() }
            : {}),
          lastAccess: new Date().toISOString(),
        });

        if (!isMounted) {
          return;
        }

        setCourseState(mergedState);
        setProgress(mergedProgress);
        setActiveModuleIndex(initialModuleIndex);
        setActiveLessonIndex(initialLessonIndex);
        setExpandedModules(createExpandedMap(mergedProgress.currentModuleIndex));
        setInitialized(true);
      } catch (error) {
        console.error("Error loading teacher course:", error);
        const fallbackDraft = readLocalDraft(currentUser.uid);
        const cachedEnrollment =
          getLocalEnrollment(currentUser.uid, COURSE_ID) ||
          createLocalEnrollmentPayload(teacherCourseData, "local-cache");
        const fallbackState = deepMerge(
          deepMerge(defaultState, cachedEnrollment.courseState || {}),
          fallbackDraft?.courseState || {},
        );
        const fallbackProgress = normalizeProgress(
          defaultProgress,
          cachedEnrollment,
          fallbackDraft,
        );

        if (isMounted) {
          setCourseState(fallbackState);
          setProgress(fallbackProgress);
          setActiveModuleIndex(fallbackProgress.currentModuleIndex);
          setActiveLessonIndex(
            getPreferredLessonIndex(
              teacherCourseData.modules[fallbackProgress.currentModuleIndex],
              fallbackProgress.completedLessons,
            ),
          );
          setExpandedModules(createExpandedMap(fallbackProgress.currentModuleIndex));
          setInitialized(true);
        }
        showFeedback(setFeedback, feedbackTimeoutRef, "error", "เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเนเธกเนเธชเธณเน€เธฃเนเธ", "เธฃเธฐเธเธเธเธฐเนเธเนเนเธเธเธฃเนเธฒเธเธเธเธญเธธเธเธเธฃเธ“เนเธเธฑเนเธงเธเธฃเธฒเธงเธเนเธญเธ");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCourseState();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  useEffect(() => {
    if (!initialized || !currentUser) {
      return undefined;
    }

    if (enrollmentStatus === "completed" && !completedAtRef.current) {
      completedAtRef.current = new Date().toISOString();
    }

    writeLocalDraft(currentUser.uid, { courseState, progress });
    writeLocalEnrollment(currentUser.uid, COURSE_ID, {
      courseId: COURSE_ID,
      courseTitle: teacherCourseData.title,
      courseState,
      completedLessons: progress.completedLessons,
      currentModuleIndex: progress.currentModuleIndex,
      quizAttempts: progress.quizAttempts,
      quizScores: progress.quizScores,
      quizCooldowns: progress.quizCooldowns,
      badges: progress.badges,
      moduleStatuses,
      progress: overallProgress,
      status: enrollmentStatus,
      ...(enrollmentStatus === "completed"
        ? { completedAt: completedAtRef.current }
        : {}),
      lastAccess: new Date().toISOString(),
    });
    const enrollmentRef = doc(db, "users", currentUser.uid, "enrollments", COURSE_ID);
    setSyncState("saving");

    const timeoutId = window.setTimeout(async () => {
      try {
        await setDoc(
          enrollmentRef,
          {
            courseState,
            completedLessons: progress.completedLessons,
            currentModuleIndex: progress.currentModuleIndex,
            quizAttempts: progress.quizAttempts,
            quizScores: progress.quizScores,
            quizCooldowns: progress.quizCooldowns,
            badges: progress.badges,
            moduleStatuses,
            progress: overallProgress,
            status: enrollmentStatus,
            ...(enrollmentStatus === "completed"
              ? { completedAt: new Date(completedAtRef.current) }
              : {}),
            lastAccess: new Date(),
          },
          { merge: true },
        );
        setSyncState("saved");
      } catch (error) {
        console.error("Error saving teacher course:", error);
        setSyncState("error");
      }
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [courseState, currentUser, enrollmentStatus, initialized, moduleStatuses, overallProgress, progress]);

  useEffect(() => {
    if (!currentLesson || currentLesson.type !== "quiz") {
      return;
    }

    setQuizQuestions(getQuizQuestionsById(currentLesson.content.quizId));
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(progress.quizScores[currentLesson.content.quizId] || 0);
  }, [currentLesson, progress.quizScores]);

  useEffect(() => {
    if (!initialized || !currentModule) {
      return;
    }

    const targetPath = `/course/teacher/${currentModule.id}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [currentModule, initialized, location.pathname, navigate]);

  function updateModuleState(moduleKey, updater) {
    setCourseState((previous) => ({
      ...previous,
      [moduleKey]: updater(previous[moduleKey]),
    }));
  }

  function moveToNextStep(nextProgress) {
    const nextLessonIndex = activeLessonIndex + 1;
    if (nextLessonIndex < currentModule.lessons.length) {
      setActiveLessonIndex(nextLessonIndex);
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      return;
    }

    if (activeModuleIndex + 1 <= nextProgress.currentModuleIndex) {
      setActiveModuleIndex(activeModuleIndex + 1);
      setActiveLessonIndex(
        getPreferredLessonIndex(
          teacherCourseData.modules[activeModuleIndex + 1],
          nextProgress.completedLessons,
        ),
      );
      setExpandedModules((previous) => ({
        ...previous,
        [activeModuleIndex + 1]: true,
      }));
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  function completeCurrentLesson(options = {}) {
    const nextProgress = withCompletedLesson(
      progress,
      activeModuleIndex,
      currentLesson.id,
      options.badgeName,
    );
    setProgress(nextProgress);
    moveToNextStep(nextProgress);
  }

  function toggleModule(index) {
    setExpandedModules((previous) => ({
      ...previous,
      [index]: !previous[index],
    }));
  }

  function selectLesson(moduleIndex, lessonIndex) {
    if (isLessonLocked(moduleIndex, lessonIndex, progress)) {
      showFeedback(
        setFeedback,
        feedbackTimeoutRef,
        "warning",
        "ยังเข้าไม่ได้",
        "กรุณาทำขั้นตอนก่อนหน้าให้เสร็จ หรือปลดล็อกโมดูลนี้ก่อนครับ",
      );
      return;
    }

    setActiveModuleIndex(moduleIndex);
    setActiveLessonIndex(lessonIndex);
    setExpandedModules((previous) => ({
      ...previous,
      [moduleIndex]: true,
    }));
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }

  function handleCompleteArticle() {
    completeCurrentLesson();
    showFeedback(
      setFeedback,
      feedbackTimeoutRef,
      "success",
      "อ่านบทนำเรียบร้อยแล้ว",
      "พร้อมเข้าสู่ภารกิจถัดไป และระบบบันทึกความคืบหน้าไว้ให้แล้วครับ",
    );
  }

  function handleCompleteActivity() {
    const errorMessage = getActivityValidationError(currentLesson?.activityType, courseState);
    if (errorMessage) {
      showFeedback(
        setFeedback,
        feedbackTimeoutRef,
        "warning",
        "ข้อมูลยังไม่ครบ",
        errorMessage,
      );
      return;
    }

    completeCurrentLesson();
    showFeedback(
      setFeedback,
      feedbackTimeoutRef,
      "success",
      "บันทึกภารกิจสำเร็จ",
      "ดีมากครับ ระบบเก็บความคืบหน้าและปลดล็อกขั้นตอนถัดไปให้แล้ว",
    );
  }

  function handleQuizSelect(questionId, optionIndex) {
    if (quizSubmitted) {
      return;
    }

    setQuizAnswers((previous) => ({
      ...previous,
      [questionId]: optionIndex,
    }));
  }

  function handleRetryQuiz() {
    if (!currentLesson?.content?.quizId) {
      return;
    }

    setQuizQuestions(getQuizQuestionsById(currentLesson.content.quizId));
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  }

  function handleSubmitQuiz() {
    if (!currentLesson || currentLesson.type !== "quiz") {
      return;
    }

    if (cooldownRemaining > 0) {
      showFeedback(
        setFeedback,
        feedbackTimeoutRef,
        "warning",
        "อยู่ในช่วงพักรอ",
        `แบบทดสอบนี้จะเริ่มได้อีกครั้งใน ${formatCountdown(cooldownRemaining)}`,
      );
      return;
    }

    if (Object.keys(quizAnswers).length !== quizQuestions.length) {
      showFeedback(
        setFeedback,
        feedbackTimeoutRef,
        "warning",
        "ตอบคำถามให้ครบก่อน",
        "กรุณาเลือกคำตอบทุกข้อก่อนส่งแบบทดสอบครับ",
      );
      return;
    }

    const score = quizQuestions.reduce(
      (sum, question) => sum + Number(quizAnswers[question.id] === question.correctAnswer),
      0,
    );
    const passed = score >= (currentLesson.content.passScore || 0);
    const nextProgress = buildQuizProgress(progress, currentLesson.content, score, passed);

    setQuizSubmitted(true);
    setQuizScore(score);

    if (passed || currentLesson.content.mode === "survey" || currentLesson.content.passScore === 0) {
      const completedProgress = withCompletedLesson(
        nextProgress,
        activeModuleIndex,
        currentLesson.id,
      );
      setProgress(completedProgress);
      moveToNextStep(completedProgress);
      showFeedback(
        setFeedback,
        feedbackTimeoutRef,
        "success",
        currentLesson.content.mode === "survey" ? "บันทึกคำตอบแล้ว" : "ผ่านแบบทดสอบแล้ว",
        currentLesson.content.mode === "survey"
          ? "ระบบบันทึกคำตอบสะท้อนผลของคุณครูเรียบร้อยแล้ว"
          : `คุณได้ ${score} คะแนน และปลดล็อกขั้นตอนถัดไปแล้วครับ`,
      );
      return;
    }

    setProgress(nextProgress);

    const cooldownAfterSubmit = getQuizCooldownRemaining(
      nextProgress.quizCooldowns,
      currentLesson.content.quizId,
    );

    showFeedback(
      setFeedback,
      feedbackTimeoutRef,
      "warning",
      cooldownAfterSubmit > 0 ? "ครบจำนวนครั้งที่กำหนด" : "ยังไม่ผ่านเกณฑ์",
      cooldownAfterSubmit > 0
        ? `ระบบจะเปิดให้เริ่มอีกครั้งใน ${formatCountdown(cooldownAfterSubmit)}`
        : `คุณได้ ${score} คะแนนจาก ${quizQuestions.length} ข้อ ลองทบทวนอีกนิดแล้วทำใหม่ได้เลยครับ`,
    );
  }

  function handleDownloadReport() {
    if (!currentLesson?.content) {
      return;
    }

    if (currentLesson.content.certificateType === "module-report") {
      const reportId = makeUniqueId(currentLesson.content.uniquePrefix, currentUser?.uid);
      const svgText = buildModuleReportSvg({
        moduleKey: currentLesson.content.moduleKey,
        reportId,
        badgeName: currentLesson.content.badgeName,
        userName: currentUserName,
        courseState,
      });

      downloadSvgFile(`${currentLesson.content.moduleKey}-${reportId}.svg`, svgText);
      completeCurrentLesson({ badgeName: currentLesson.content.badgeName });
      showFeedback(
        setFeedback,
        feedbackTimeoutRef,
        "success",
        "ดาวน์โหลด Report Card แล้ว",
        `คุณได้รับ ${currentLesson.content.badgeName} และ ${currentLesson.content.unlockLabel}`,
      );
      return;
    }

    const reportId = makeUniqueId(currentLesson.content.uniquePrefix, currentUser?.uid);
    const svgText = buildFinalCertificateSvg({
      userName: currentUserName,
      reportId,
      badges: progress.badges,
    });

    downloadSvgFile(`inspire-360-certificate-${reportId}.svg`, svgText);
    completeCurrentLesson();
    showFeedback(
      setFeedback,
      feedbackTimeoutRef,
      "success",
      "รับ Certificate เรียบร้อย",
      "ยอดเยี่ยมมากครับ คุณครูจบเส้นทาง InSPIRE 360° for Teacher แล้ว",
    );
  }

  function addSwotItem(bucketKey, rawValue) {
    const value = rawValue.trim();
    if (!value) {
      return;
    }

    updateModuleState("module1", (module) => ({
      ...module,
      swot: {
        ...module.swot,
        [bucketKey]: module.swot[bucketKey].includes(value)
          ? module.swot[bucketKey]
          : [...module.swot[bucketKey], value],
      },
    }));

    setSwotDrafts((previous) => ({
      ...previous,
      [bucketKey]: "",
    }));
  }

  function removeSwotItem(bucketKey, item) {
    updateModuleState("module1", (module) => ({
      ...module,
      swot: {
        ...module.swot,
        [bucketKey]: module.swot[bucketKey].filter((value) => value !== item),
      },
    }));
  }

  function addStrategy() {
    if (!towsDraft.internalValue || !towsDraft.externalValue || !towsDraft.description.trim()) {
      showFeedback(
        setFeedback,
        feedbackTimeoutRef,
        "warning",
        "เติมข้อมูลกลยุทธ์ก่อน",
        "กรุณาเลือกปัจจัยภายในและภายนอก พร้อมเขียนแนวทางลงมือทำให้ครบครับ",
      );
      return;
    }

    const strategyType = getStrategyType(
      towsDraft.internalBucket,
      towsDraft.externalBucket,
    );

    updateModuleState("module1", (module) => ({
      ...module,
      strategies: [
        ...module.strategies,
        {
          id: `strategy-${Date.now()}`,
          type: strategyType,
          title:
            towsDraft.title.trim() ||
            `${strategyType} | ${towsDraft.internalValue} x ${towsDraft.externalValue}`,
          description: towsDraft.description.trim(),
          internalBucket: towsDraft.internalBucket,
          internalValue: towsDraft.internalValue,
          externalBucket: towsDraft.externalBucket,
          externalValue: towsDraft.externalValue,
        },
      ],
    }));

    setTowsDraft({
      internalBucket: "strengths",
      internalValue: "",
      externalBucket: "opportunities",
      externalValue: "",
      title: "",
      description: "",
    });
  }

  function removeStrategy(strategyId) {
    updateModuleState("module1", (module) => ({
      ...module,
      strategies: module.strategies.filter((strategy) => strategy.id !== strategyId),
    }));
  }

  function generatePlcMatch() {
    const options = PLC_TEACHER_POOL.filter((teacher) => teacher.name !== currentUserName);
    const selectedTeacher =
      options[Math.floor(Math.random() * options.length)] || PLC_TEACHER_POOL[0];
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 2 + Math.floor(Math.random() * 4));
    scheduledDate.setHours(19, 0, 0, 0);

    updateModuleState("module3", (module) => ({
      ...module,
      meetingFormat: module.meetingFormat || "online",
      meetingSize: module.meetingSize || "3-4 คน",
      pairedTeacherName: selectedTeacher.name,
      pairedTeacherUid: selectedTeacher.uid,
      meetingDate: scheduledDate.toISOString().slice(0, 10),
      meetingTime: "19:00",
      meetLink: module.meetLink || "https://meet.google.com/new",
      plcRoles: {
        facilitator: module.plcRoles.facilitator || currentUserName,
        timeKeeper: module.plcRoles.timeKeeper || selectedTeacher.name,
        challenger: module.plcRoles.challenger || "ทีม PLC",
        noteTaker: module.plcRoles.noteTaker || "ทีม PLC",
      },
    }));
  }

  function renderLessonBody() {
    if (!currentLesson) {
      return null;
    }

    if (currentLesson.type === "article") {
      return renderArticleLesson({
        lesson: currentLesson,
        onComplete: handleCompleteArticle,
      });
    }

    if (currentLesson.type === "quiz") {
      return renderQuizLesson({
        lesson: currentLesson,
        quizQuestions,
        quizAnswers,
        quizSubmitted,
        quizScore,
        cooldownRemaining,
        onSelect: handleQuizSelect,
        onSubmit: handleSubmitQuiz,
        onRetry: handleRetryQuiz,
        lastSavedScore: progress.quizScores[currentLesson.content.quizId],
      });
    }

    if (currentLesson.type === "certificate") {
      return renderCertificateLesson({
        lesson: currentLesson,
        progress,
        currentUser,
        currentUserName,
        onDownload: handleDownloadReport,
      });
    }

    return renderActivityLesson({
      lesson: currentLesson,
      courseState,
      currentUser,
      currentUserName,
      currentModuleKey,
      insightTokens,
      module1Swot,
      swotChartValues,
      swotDrafts,
      towsDraft,
      updateModuleState,
      setSwotDrafts,
      setTowsDraft,
      addSwotItem,
      removeSwotItem,
      addStrategy,
      removeStrategy,
      generatePlcMatch,
      onComplete: handleCompleteActivity,
    });
  }

  if (loading || !currentModule || !currentLesson) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="dark-panel flex max-w-md items-center gap-4 p-5">
          <Loader2 size={24} className="animate-spin text-amber-200" />
          <div>
            <p className="font-semibold text-white">กำลังเตรียมห้องเรียนรู้</p>
            <p className="mt-1 text-sm text-slate-300">
              ระบบกำลังโหลดโมดูล กิจกรรม และความคืบหน้าล่าสุดของคุณครู
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-teacher-course-root="true" className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#07111d] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_26%)]" />

      <AnimatePresence>
        {feedback && (
          <MotionDiv
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed right-4 top-4 z-[90] max-w-sm"
          >
            <div className="rounded-[24px] border border-white/10 bg-slate-950/90 px-4 py-4 text-white shadow-2xl backdrop-blur">
              <p className="font-semibold">{feedback.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-200">{feedback.message}</p>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <div className="relative flex min-h-[calc(100vh-8rem)]">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="ปิดเมนูโมดูล"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[21rem] flex-col border-r border-white/10 bg-slate-950/92 px-4 py-4 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-[calc(100vh-8rem)] lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200">InSPIRE 360°</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.06em] text-white">
                ห้องเรียนรู้ของครู
              </h2>
            </div>
            <button
              type="button"
              className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 rounded-[28px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Progress</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-white"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
              <span>{completedRequiredLessonCount}/{totalLessons} ขั้นตอน</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              Badge ที่ได้รับ {progress.badges.length} รายการ
            </div>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="space-y-3">
              {teacherCourseData.modules.map((module, moduleIndex) => {
                const moduleLocked = moduleIndex > progress.currentModuleIndex;
                const moduleCompleted = module.lessons
                  .filter(
                    (lesson, lessonIndex) => !(lessonIndex === 0 && lesson.type === "article"),
                  )
                  .every((lesson) => progress.completedLessons.includes(lesson.id));

                return (
                  <div key={module.id} className={`overflow-hidden rounded-[26px] border ${
                    moduleIndex === activeModuleIndex ? "border-white/15 bg-white/10" : "border-white/10 bg-white/5"
                  }`}>
                    <button
                      type="button"
                      onClick={() => {
                        if (moduleLocked) {
                          showFeedback(setFeedback, feedbackTimeoutRef, "warning", "เนเธกเธ”เธนเธฅเธขเธฑเธเนเธกเนเธเธฅเธ”เธฅเนเธญเธ", "เธ—เธณเธเธฑเนเธเธ•เธญเธเธเธญเธเนเธกเธ”เธนเธฅเธเนเธญเธเธซเธเนเธฒเนเธซเนเธเธฃเธเธเนเธญเธเธเธฃเธฑเธ");
                          return;
                        }
                        toggleModule(moduleIndex);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{module.navigationLabel}</p>
                        <h3 className="mt-1 text-sm font-semibold leading-6 text-white">{module.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {moduleLocked ? <Lock size={16} className="text-slate-500" /> : moduleCompleted ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Circle size={16} className="text-slate-500" />}
                        {expandedModules[moduleIndex] ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                      </div>
                    </button>

                    {expandedModules[moduleIndex] && (
                      <div className="border-t border-white/10 px-3 pb-3 pt-2">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const lessonLocked = isLessonLocked(moduleIndex, lessonIndex, progress);
                          const lessonCompleted = progress.completedLessons.includes(lesson.id);

                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => selectLesson(moduleIndex, lessonIndex)}
                              className={`mt-2 flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left transition ${
                                moduleIndex === activeModuleIndex && lessonIndex === activeLessonIndex
                                  ? "bg-white text-slate-950"
                                  : lessonLocked
                                    ? "text-slate-500"
                                    : "bg-white/0 text-slate-200 hover:bg-white/5"
                              }`}
                            >
                              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                                moduleIndex === activeModuleIndex && lessonIndex === activeLessonIndex
                                  ? "bg-slate-950 text-white"
                                  : "bg-white/10 text-slate-100"
                              }`}>
                                {getIcon(lesson.iconName, "h-5 w-5")}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{lesson.title}</p>
                              </div>
                              {lessonLocked ? <Lock size={14} /> : lessonCompleted ? <CheckCircle2 size={16} className={moduleIndex === activeModuleIndex && lessonIndex === activeLessonIndex ? "text-emerald-600" : "text-emerald-300"} /> : <Circle size={14} className="text-slate-500" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-[26px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Badges Shelf</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {progress.badges.length > 0 ? progress.badges.map((badge) => (
                <span key={badge} className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100">
                  {badge}
                </span>
              )) : <p className="text-sm text-slate-400">เมื่อดาวน์โหลด report card แล้ว badge จะปรากฏที่นี่</p>}
            </div>
          </div>
        </aside>

        <div className="relative flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="dark-panel overflow-hidden p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(true)}
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10 lg:hidden"
                    >
                      <Menu size={18} />
                    </button>
                    <div className="glass-chip border-white/10 bg-white/5 text-slate-200">{teacherCourseData.title}</div>
                  </div>
                  <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.08em] text-white sm:text-5xl">{currentLesson.title}</h1>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{currentModule.description}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DarkStatCard label="โมดูลปัจจุบัน" value={currentModule.navigationLabel} />
                  <DarkStatCard label="ความคืบหน้าโมดูล" value={`${moduleCompletionCount}/${currentModuleRequiredLessons.length || currentModule.lessons.length}`} />
                  <DarkStatCard label="บันทึกล่าสุด" value={getSyncLabel(syncState)} icon={<Clock3 size={16} className="text-amber-200" />} />
                  <DarkStatCard label="Badge ที่ได้" value={`${progress.badges.length} รายการ`} icon={<Trophy size={16} className="text-amber-200" />} />
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-amber-300/15 p-3 text-amber-200">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-amber-200">AI Mentor</p>
                    <p className="mt-2 text-sm leading-7 text-slate-100">{buildMentorMessage(currentLesson, progress)}</p>
                    {currentLesson.content?.mentorTip && (
                      <p className="mt-2 text-sm leading-7 text-slate-300">Tip: {currentLesson.content.mentorTip}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 overflow-x-auto">
                <div className="flex min-w-max gap-3">
                  {currentModule.lessons.map((lesson, lessonIndex) => {
                    const isActive = lessonIndex === activeLessonIndex;
                    const isComplete = progress.completedLessons.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => selectLesson(activeModuleIndex, lessonIndex)}
                        className={`rounded-[22px] border px-4 py-3 text-left transition ${
                          isActive
                            ? "border-amber-300/30 bg-amber-300/15 text-white"
                            : isComplete
                              ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-[11px] uppercase tracking-[0.24em]">Step {lessonIndex + 1}</div>
                        <div className="mt-2 text-sm font-semibold">{lesson.title}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <AnimatePresence mode="wait">
              <MotionSection
                key={currentLesson.id}
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={pageReveal}
                className="surface-panel p-6 sm:p-8"
              >
                <div className="border-b border-slate-200 pb-6">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                    {currentModule.navigationLabel} / Step {activeLessonIndex + 1}
                  </div>
                  <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.07em] text-slate-950">{currentLesson.title}</h2>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
                    {currentLesson.content?.objective || currentLesson.content?.description || currentModule.description}
                  </p>
                </div>

                <div className="pt-8">{renderLessonBody()}</div>
              </MotionSection>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function showFeedback(setFeedback, timeoutRef, tone, title, message) {
  if (timeoutRef.current) {
    window.clearTimeout(timeoutRef.current);
  }
  setFeedback({ tone, title, message });
  timeoutRef.current = window.setTimeout(() => setFeedback(null), 3200);
}

function readLocalDraft(userId) {
  try {
    const rawValue = window.localStorage.getItem(`teacher-course-draft:${userId}`);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    console.error("Error reading teacher draft:", error);
    return null;
  }
}

function writeLocalDraft(userId, payload) {
  try {
    window.localStorage.setItem(`teacher-course-draft:${userId}`, JSON.stringify(payload));
  } catch (error) {
    console.error("Error writing teacher draft:", error);
  }
}

function getSyncLabel(syncState) {
  if (syncState === "saving") {
    return "กำลังบันทึกอัตโนมัติ";
  }
  if (syncState === "saved") {
    return "บันทึกล่าสุดแล้ว";
  }
  if (syncState === "error") {
    return "สำรองบนอุปกรณ์";
  }
  return "พร้อมใช้งาน";
}

function buildMentorMessage(currentLesson, progress) {
  if (currentLesson.type === "article") {
    return "เริ่มจากภาพรวมก่อนนะครับ พอเราเห็นเป้าหมายและหลักฐานที่ต้องส่งชัดขึ้น ภารกิจถัดไปจะออกแบบได้มั่นใจขึ้นมาก";
  }

  if (currentLesson.type === "quiz") {
    return currentLesson.id === "final-posttest"
      ? "ค่อย ๆ ทบทวนเส้นทางทั้งหมดนะครับ Final Post-test คือการสรุปสิ่งที่คุณครูลงมือทำจริง ไม่ใช่การจับผิด"
      : "ลองเชื่อมคำถามกับสิ่งที่คุณครูเพิ่งวิเคราะห์หรือออกแบบในโมดูลนี้ คำตอบจะชัดขึ้นมากครับ";
  }

  if (currentLesson.type === "certificate") {
    return "นี่คือช่วงเก็บหลักฐานความสำเร็จของคุณครูครับ ดาวน์โหลดไฟล์ไว้ใช้งานต่อได้ทันที ทั้ง report card และ certificate จะดึงคำตอบจากงานที่ทำจริง";
  }

  if (currentLesson.activityType === "swot_visualizer") {
    return "ลองถอยออกมาดูโลกนอกห้องเรียนอีกนิดนะครับ ถ้าเราเห็นทั้งโอกาสและอุปสรรคจาก PESTEL ชัด กลยุทธ์ที่ออกมาจะสมจริงและนำไปใช้ได้มากขึ้น";
  }

  if (currentLesson.activityType === "tows_matrix") {
    return "กลยุทธ์ที่ดีไม่จำเป็นต้องซับซ้อนครับ แค่จับคู่ปัจจัยภายในกับบริบทภายนอกให้ตรง ก็จะเห็นแนวทางลงมือทำที่ชัดขึ้นมาก";
  }

  if (currentLesson.activityType === "dream_lab") {
    return "กล้าฝันก่อนนะครับ แล้วค่อยใช้ SO, WO, ST, WT ช่วยจัดระเบียบไอเดียให้กลายเป็นภาพอนาคตที่พาไปได้จริง";
  }

  if (currentLesson.activityType === "plc_matchmaking") {
    return "วง PLC จะทรงพลังขึ้นเมื่อบทบาทชัดและนัดหมายชัดครับ ลองออกแบบวงสนทนาให้พร้อมตั้งแต่ก่อนเริ่มคุยจริง";
  }

  if (currentLesson.activityType === "innovation_lab") {
    return "ลองมองนวัตกรรมเป็นสูตรผสมนะครับ เครื่องมือที่ใช่เมื่อจับคู่กับวิธีสอนที่เหมาะ จะกลายเป็นคำตอบใหม่ของห้องเรียน";
  }

  if (currentLesson.activityType === "beta_test") {
    return "เยี่ยมมากครับ ก่อนลงสนามจริงเต็มรูปแบบ ลองฟังเสียงสะท้อนรอบเล็กก่อน แล้วค่อยอัปเกรดเวอร์ชัน 2.0";
  }

  if (currentLesson.activityType === "classroom_trial") {
    return "ภารกิจนี้ไม่ใช่การตัดสินครับ แต่คือการเก็บหลักฐานจริงจากห้องเรียน เพื่อให้การสะท้อนผลรอบถัดไปแม่นขึ้น";
  }

  return progress.badges.length > 0
    ? "ดีมากครับ ตอนนี้คุณครูกำลังสะสม badge อย่างต่อเนื่องแล้ว ลองรักษาจังหวะนี้ไว้ทีละภารกิจนะครับ"
    : "ค่อย ๆ ไปทีละขั้นได้เลยครับ ระบบจะเก็บความคืบหน้าไว้ให้ และคุณครูกลับมาแก้หรือเติมคำตอบได้เสมอ";
}

function getActivityValidationError(activityType, courseState) {
  switch (activityType) {
    case "insight_dimensions":
      return Object.values(courseState.module1.dimensions).every(
        (entry) => entry.strength.trim() && entry.weakness.trim() && entry.rating > 0,
      )
        ? ""
        : "กรุณากรอกจุดแข็ง จุดอ่อน และระดับ pain point ให้ครบทั้ง 9 มิติ";
    case "swot_visualizer":
      return Object.values(courseState.module1.externalScan).every(
        (entry) => entry.opportunity.trim() && entry.threat.trim(),
      )
        ? ""
        : "กรุณากรอกโอกาสและอุปสรรคให้ครบทั้ง 6 ปัจจัย PESTEL";
    case "tows_matrix":
      return courseState.module1.strategies.length >= 3
        ? ""
        : "กรุณาสร้างกลยุทธ์อย่างน้อย 3 แนวทางก่อนบันทึกภารกิจนี้";
    case "needs_detective":
      return courseState.module1.strategies.length > 0 &&
        courseState.module1.strategies.every(
          (strategy) => Number(courseState.module1.strategyRatings[strategy.id] || 0) > 0,
        ) &&
        courseState.module1.selectedStrategyId &&
        courseState.module1.insightCard.coreProblem.trim() &&
        courseState.module1.insightCard.realNeed.trim() &&
        courseState.module1.insightCard.solution.trim()
        ? ""
        : "กรุณาให้คะแนนทุกกลยุทธ์ เลือก 1 แนวทาง และกรอก Core Problem / Real Need / Solution ให้ครบ";
    case "pdca_action_plan":
      return Object.values(courseState.module1.actionPlan).every((value) => value.trim())
        ? ""
        : "กรุณากรอก PDCA ให้ครบทั้ง Plan, Do, Check และ Act";
    case "dream_lab":
      return courseState.module2.dreamLab.trim() &&
        Object.values(courseState.module2.dreamLabMatrix).every((value) => value.trim())
        ? ""
        : "กรุณาเขียนภาพฝันและตอบมุมมอง SO / WO / ST / WT ให้ครบ";
    case "vibe_check":
      return Object.values(courseState.module2.vibeBoard).every((value) => value.trim())
        ? ""
        : "กรุณาอธิบายบรรยากาศที่อยากเห็นให้ครบทั้งภาพ เสียง และความรู้สึก";
    case "roadmap_builder":
      return courseState.module2.roadmap.every(
        (week) => week.focus.trim() && week.actions.trim() && week.evidence.trim(),
      )
        ? ""
        : "กรุณากรอก roadmap ทั้ง 4 สัปดาห์ให้ครบ";
    case "fivewoneh":
      return Object.values(courseState.module2.fiveWOneH).every((value) => value.trim())
        ? ""
        : "กรุณาตอบ 5W1H ให้ครบทุกข้อ";
    case "smart_goal":
      return Object.values(courseState.module2.smartGoal).every((value) => value.trim())
        ? ""
        : "กรุณาเขียน SMART Objective ให้ครบทั้ง 5 ด้าน";
    case "quality_check":
      return Object.values(courseState.module2.qualityCheck).every((value) => value.trim())
        ? ""
        : "กรุณาเชื่อมเป้าหมายกับ OECD, พระบรมราโชบาย ร.10 และ Tak SEZ ให้ครบ";
    case "plc_matchmaking":
      return courseState.module3.meetingTopic.trim() &&
        courseState.module3.meetingFormat &&
        courseState.module3.pairedTeacherName.trim() &&
        courseState.module3.pairedTeacherUid.trim() &&
        courseState.module3.meetingDate &&
        courseState.module3.meetingTime &&
        Object.values(courseState.module3.plcRoles).every((value) => value.trim()) &&
        (
          courseState.module3.meetingFormat === "online"
            ? courseState.module3.meetLink.trim()
            : courseState.module3.meetingLocation.trim()
        )
        ? ""
        : "กรุณากรอกหัวข้อ PLC ผู้ร่วมวง วันเวลา บทบาท และลิงก์หรือสถานที่นัดหมายให้ครบ";
    case "plc_report":
      return courseState.module3.plcLogbook.trim() &&
        courseState.module3.ahaMoment.trim() &&
        courseState.module3.plcReport.trim() &&
        (courseState.module3.plcVibeEvidenceUrl.trim() ||
          courseState.module3.plcScreenshotUrl.trim())
        ? ""
        : "กรุณากรอก Logbook, Aha! Moment, สรุป PLC และแนบหลักฐานบรรยากาศหรือภาพจากการประชุม";
    case "pitching_session":
      return Object.values(courseState.module3.pitchOutline).every((value) => value.trim()) &&
        courseState.module3.pitchScript.trim() &&
        (courseState.module3.pitchMediaUrl.trim() ||
          courseState.module3.pitchAudioUrl.trim())
        ? ""
        : "กรุณากรอก Hook, Pain Point, Solution, Impact พร้อมสคริปต์และลิงก์ไฟล์ pitch";
    case "innovation_lab":
      return courseState.module4.innovationName.trim() &&
        courseState.module4.innovationFormula.trim() &&
        courseState.module4.hardware.trim() &&
        courseState.module4.software.trim() &&
        courseState.module4.activeLearning.trim()
        ? ""
        : "กรุณากรอกชื่อนวัตกรรม สูตรผสม เครื่องมือ และรูปแบบ Active Learning ให้ครบ";
    case "lesson_plan":
      return Object.values(courseState.module4.lessonBlueprint).every((value) => value.trim()) &&
        courseState.module4.lessonPlanUrl.trim()
        ? ""
        : "กรุณากรอก Hook, Action, Reflect และแนบลิงก์ blueprint หรือ lesson plan";
    case "crafting_session":
      return courseState.module4.mediaEvidenceUrl.trim() &&
        courseState.module4.mediaDescription.trim()
        ? ""
        : "กรุณาแนบลิงก์สื่อหรือหลักฐานชิ้นงาน พร้อมอธิบายสั้น ๆ ว่าใช้อย่างไร";
    case "beta_test":
      return courseState.module4.betaStrength.trim() &&
        courseState.module4.betaImprove.trim()
        ? ""
        : "กรุณาสรุปจุดแข็งของต้นแบบและสิ่งที่อยากพัฒนาในเวอร์ชัน 2.0";
    case "classroom_trial":
      return courseState.module5.teachingClipUrl.trim() &&
        courseState.module5.classroomContext.trim()
        ? ""
        : "กรุณาแนบคลิปการสอนจริง 50-60 นาที และอธิบายบริบทของคาบเรียน";
    case "reflection_log":
      return courseState.module5.reflectionLog.trim() &&
        courseState.module5.learnerResponse.trim()
        ? ""
        : "กรุณาเขียน reflection และเสียงตอบรับของผู้เรียนให้ครบ";
    case "growth_plan":
      return courseState.module5.nextGrowthPlan.trim()
        ? ""
        : "กรุณาออกแบบแนวทางต่อยอดในรอบถัดไปก่อนบันทึก";
    case "platform_survey":
      return courseState.survey.satisfaction > 0 &&
        courseState.survey.easeOfUse > 0 &&
        courseState.survey.aiHelpfulness > 0
        ? ""
        : "กรุณาให้คะแนนทั้ง 3 หัวข้อก่อนส่งแบบประเมิน";
    default:
      return "";
  }
}

function DarkStatCard({ label, value, icon = null }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-3 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {[1, 2, 3, 4, 5].map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
            item <= value
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
          }`}
        >
          {item}
        </button>
      ))}
      <span className="text-sm text-slate-500">{STAR_COPY[value - 1] || "ยังไม่ได้ให้คะแนน"}</span>
    </div>
  );
}

function RatingCard({ title, description, value, onChange }) {
  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-6">
      <h3 className="font-display text-2xl font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
      <div className="mt-5">
        <StarRating value={value} onChange={onChange} />
      </div>
    </section>
  );
}

function getLessonEmbedUrl(url) {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("canva.com") && !parsedUrl.searchParams.has("embed")) {
      parsedUrl.searchParams.set("embed", "1");
      return parsedUrl.toString();
    }

    return parsedUrl.toString();
  } catch {
    return url;
  }
}

function renderArticleLesson({ lesson, onComplete }) {
  const focusList = lesson.content.focusList || [];
  const embeddedLessonUrl = getLessonEmbedUrl(lesson.content.lessonUrl);
  const continueLabel = lesson.id.includes("intro")
    ? "บันทึกบทนำและไปภารกิจถัดไป"
    : "บันทึกและไปขั้นถัดไป";

  return (
    <div className="space-y-8">
      {embeddedLessonUrl && (
        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
            <div>
              <div className="section-tag">Embedded Lesson</div>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                บทเรียนต้นฉบับถูกฝังไว้ในหน้านี้แล้ว คุณครูเรียนรู้ต่อได้ทันทีโดยไม่ต้องออกจากระบบ
              </p>
            </div>
            <a
              href={lesson.content.lessonUrl}
              target="_blank"
              rel="noreferrer"
              className="secondary-button"
            >
              เปิดในแท็บใหม่
            </a>
          </div>
          <div className="bg-slate-950/5 p-3 sm:p-4">
            <iframe
              src={embeddedLessonUrl}
              title={`${lesson.title} embedded lesson`}
              loading="lazy"
              allow="fullscreen"
              className="h-[68vh] min-h-[540px] w-full rounded-[24px] border border-slate-200 bg-white"
            />
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-indigo-100 bg-indigo-50/70 p-6">
            <div className="section-tag border-indigo-200 bg-white text-indigo-700">ภาพรวมบทเรียน</div>
            <p className="mt-5 text-base leading-8 text-slate-700">{lesson.content.summary}</p>

            {focusList.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display text-2xl font-semibold text-slate-950">ประเด็นสำคัญจากเอกสารต้นฉบับ</h3>
                <div className="mt-4 grid gap-3">
                  {focusList.map((item) => (
                    <div
                      key={item}
                      className="rounded-[22px] border border-white bg-white/90 px-4 py-4 text-sm leading-7 text-slate-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {lesson.content.lessonUrl && (
            <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/80 p-6">
              <div className="section-tag border-emerald-200 bg-white text-emerald-700">แหล่งบทเรียน</div>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                เปิดสไลด์หรือเอกสารต้นฉบับเพื่อทบทวนโจทย์ ตัวอย่าง และหลักเกณฑ์ของภารกิจนี้ได้ก่อนลงมือทำจริง
              </p>
              <a
                href={lesson.content.lessonUrl}
                target="_blank"
                rel="noreferrer"
                className="primary-button mt-5 inline-flex"
              >
                {lesson.content.lessonUrlLabel || "เปิดบทเรียนต้นฉบับ"}
                <ArrowRight size={16} />
              </a>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6">
            <h3 className="font-display text-2xl font-semibold text-slate-950">ผลลัพธ์ที่คาดหวัง</h3>
            <div className="mt-4 grid gap-3">
              {lesson.content.outcomes.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6">
            <h3 className="font-display text-2xl font-semibold text-slate-950">สิ่งที่ต้องส่งในโมดูลนี้</h3>
            <div className="mt-4 space-y-3">
              {lesson.content.deliverables.map((item) => (
                <div key={item} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6">
            <h3 className="font-display text-2xl font-semibold text-slate-950">รูปแบบสื่อประกอบ</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {lesson.content.resourceTypes.map((type) => (
                <span key={type} className="rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-semibold tracking-[0.2em] text-amber-700">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onComplete} className="primary-button">
          {continueLabel}
          <ArrowRight size={16} />
        </button>
        {lesson.content.lessonUrl && (
          <a
            href={lesson.content.lessonUrl}
            target="_blank"
            rel="noreferrer"
            className="secondary-button"
          >
            เปิดบทเรียนต้นฉบับ
          </a>
        )}
      </div>
    </div>
  );
}

function renderQuizLesson({
  lesson,
  quizQuestions,
  quizAnswers,
  quizSubmitted,
  quizScore,
  cooldownRemaining,
  onSelect,
  onSubmit,
  onRetry,
  lastSavedScore,
}) {
  const passed = quizScore >= (lesson.content.passScore || 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[26px] border border-indigo-100 bg-indigo-50 px-5 py-5">
          <div className="text-xs uppercase tracking-[0.24em] text-indigo-700">คะแนนผ่าน</div>
          <div className="mt-3 font-display text-3xl font-semibold text-indigo-900">
            {lesson.content.mode === "survey" ? "บันทึกคำตอบ" : `${lesson.content.passScore}/${quizQuestions.length}`}
          </div>
        </div>
        <div className="rounded-[26px] border border-emerald-100 bg-emerald-50 px-5 py-5">
          <div className="text-xs uppercase tracking-[0.24em] text-emerald-700">คะแนนล่าสุด</div>
          <div className="mt-3 font-display text-3xl font-semibold text-emerald-900">
            {typeof lastSavedScore === "number" ? `${lastSavedScore} คะแนน` : "-"}
          </div>
        </div>
        <div className="rounded-[26px] border border-amber-100 bg-amber-50 px-5 py-5">
          <div className="text-xs uppercase tracking-[0.24em] text-amber-700">สถานะ</div>
          <div className="mt-3 font-display text-3xl font-semibold text-amber-900">
            {cooldownRemaining > 0 ? "รอเริ่มใหม่" : "พร้อมทำแบบทดสอบ"}
          </div>
        </div>
      </div>

      {lesson.content.description && (
        <div className="rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-600">
          {lesson.content.description}
        </div>
      )}

      {cooldownRemaining > 0 && (
        <div className="rounded-[26px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-800">
          คุณใช้ครบจำนวนครั้งของแบบทดสอบนี้แล้ว กรุณารออีก{" "}
          <span className="font-semibold">{formatCountdown(cooldownRemaining)}</span> ก่อนเริ่มใหม่อีกครั้ง
        </div>
      )}

      <div className="space-y-4">
        {quizQuestions.map((question, questionIndex) => (
          <div key={question.id} className="rounded-[28px] border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                {questionIndex + 1}
              </div>
              <div className="flex-1">
                <p className="text-base font-medium leading-7 text-slate-900">{question.question}</p>
                <div className="mt-4 grid gap-3">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = quizAnswers[question.id] === optionIndex;
                    const isCorrectAnswer = quizSubmitted && optionIndex === question.correctAnswer;
                    const isWrongSelected = quizSubmitted && isSelected && optionIndex !== question.correctAnswer;

                    return (
                      <button
                        key={`${question.id}-${option}`}
                        type="button"
                        disabled={quizSubmitted || cooldownRemaining > 0}
                        onClick={() => onSelect(question.id, optionIndex)}
                        className={`rounded-[22px] border px-4 py-4 text-left text-sm leading-6 transition ${
                          isCorrectAnswer
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                            : isWrongSelected
                              ? "border-red-300 bg-red-50 text-red-900"
                              : isSelected
                                ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {quizSubmitted && (
        <div className={`rounded-[28px] border px-5 py-5 text-sm leading-7 ${
          passed || lesson.content.mode === "survey" || lesson.content.passScore === 0
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}>
          {lesson.content.mode === "survey"
            ? "บันทึกคำตอบสะท้อนผลเรียบร้อยแล้ว"
            : `คะแนนที่ได้ ${quizScore} จาก ${quizQuestions.length} ข้อ`}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onSubmit} disabled={quizSubmitted || cooldownRemaining > 0} className="primary-button">
          ส่งแบบทดสอบ
          <CheckCircle2 size={16} />
        </button>

        {quizSubmitted &&
          !(passed || lesson.content.mode === "survey" || lesson.content.passScore === 0) &&
          cooldownRemaining === 0 && (
            <button type="button" onClick={onRetry} className="secondary-button">
              ลองใหม่อีกครั้ง
            </button>
          )}
      </div>
    </div>
  );
}

function renderCertificateLesson({ lesson, progress, currentUser, currentUserName, onDownload }) {
  const reportId = makeUniqueId(lesson.content.uniquePrefix, currentUser?.uid);
  const isFinalCertificate = lesson.content.certificateType === "final-certificate";

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6">
          <div className="section-tag">ความสำเร็จ</div>
          <h3 className="mt-5 font-display text-3xl font-semibold text-slate-950">{lesson.title}</h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {isFinalCertificate
              ? "เมื่อดาวน์โหลด certificate ระบบจะบันทึกการจบหลักสูตรให้ทันที พร้อมเก็บ badge ทั้งหมดในเส้นทางของครู"
              : "สร้างรายงานสรุปคำตอบของโมดูลนี้ เพื่อใช้เป็นหลักฐานการเรียนรู้และปลดล็อกโมดูลถัดไป"}
          </p>

          <div className="mt-6 rounded-[26px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">รหัสเอกสาร</div>
            <div className="mt-2 font-display text-2xl font-semibold text-slate-950">{reportId}</div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-[22px] border border-indigo-100 bg-indigo-50 px-4 py-4 text-sm text-indigo-900">
              ผู้เรียน: {currentUserName}
            </div>
            <div className="rounded-[22px] border border-amber-100 bg-amber-50 px-4 py-4 text-sm text-amber-900">
              Badge ที่ได้รับแล้ว: {progress.badges.length > 0 ? progress.badges.join(" • ") : "ยังไม่มี"}
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-slate-950 p-6 text-white">
          <div className="flex items-center gap-3 text-amber-200">
            <Trophy size={18} />
            <span className="text-xs uppercase tracking-[0.24em]">ตัวอย่าง</span>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <p>{isFinalCertificate ? "Certificate นี้จะยืนยันว่าคุณครูผ่านทุกโมดูล, Final Post-test และแบบประเมินความพึงพอใจแล้ว" : "Report Card จะรวมคำตอบและงานสำคัญของโมดูลนี้ไว้ในไฟล์เดียว"}</p>
            <p>รูปแบบไฟล์เป็น SVG เพื่อให้ดาวน์โหลดได้แบบ client-side และนำไปใช้ต่อในงานเอกสารได้ทันที</p>
          </div>
        </div>
      </div>

      <button type="button" onClick={onDownload} className="primary-button">
        ดาวน์โหลดไฟล์
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function renderActivityLesson(props) {
  const { lesson } = props;

  switch (lesson.activityType) {
    case "insight_dimensions":
      return renderInsightDimensions(props);
    case "swot_visualizer":
      return renderSwotVisualizer(props);
    case "tows_matrix":
      return renderTowsMatrix(props);
    case "needs_detective":
      return renderNeedsDetective(props);
    case "pdca_action_plan":
      return renderPdcaActionPlan(props);
    case "dream_lab":
      return renderDreamLab(props);
    case "vibe_check":
      return renderVibeCheck(props);
    default:
      return renderModuleExtension(props);
  }
}

function renderInsightDimensions({ courseState, updateModuleState, onComplete }) {
  const completedCount = Object.values(courseState.module1.dimensions).filter(
    (entry) => entry.strength.trim() && entry.weakness.trim() && entry.rating > 0,
  ).length;

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-indigo-900">Mission 1 : The 9 Dimensions</p>
            <p className="mt-1 text-sm leading-7 text-indigo-700">
              สแกนบริบทภายในห้องเรียนให้ครบทั้ง 9 มิติ โดยมองทั้งจุดแข็ง จุดอ่อน และระดับ pain point เพื่อไม่ให้เกิด blind spots
            </p>
          </div>
          <div className="rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-800">{completedCount}/9 มิติ</div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {insightDimensions.map((dimension, index) => {
          const entry = courseState.module1.dimensions[dimension.key];

          return (
          <section key={dimension.key} className="rounded-[30px] border border-slate-200 bg-white p-5">
            <h3 className="font-display text-2xl font-semibold text-slate-950">
              {dimension.label}
            </h3>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">
              มิติที่ {index + 1} • {dimension.englishLabel}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-500">{dimension.focus}</p>

            <div className="mt-5 rounded-[24px] border border-indigo-100 bg-indigo-50 px-4 py-4 text-sm leading-7 text-indigo-900">
              <span className="font-semibold">Powerful Question:</span> {dimension.strengthPrompt}
            </div>
            <textarea
              value={entry.strength}
              onChange={(event) =>
                updateModuleState("module1", (module) => ({
                  ...module,
                  dimensions: {
                    ...module.dimensions,
                    [dimension.key]: {
                      ...module.dimensions[dimension.key],
                      strength: event.target.value,
                    },
                  },
                }))
              }
              rows={4}
              className="field-input mt-4 min-h-[144px] resize-y"
              placeholder="สิ่งที่เป็นจุดแข็งหรือสิ่งที่กำลังเวิร์กในมิตินี้"
            />

            <div className="mt-4 rounded-[24px] border border-amber-100 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
              <span className="font-semibold">Probe Deeper:</span> {dimension.weaknessPrompt}
            </div>
            <textarea
              value={entry.weakness}
              onChange={(event) =>
                updateModuleState("module1", (module) => ({
                  ...module,
                  dimensions: {
                    ...module.dimensions,
                    [dimension.key]: {
                      ...module.dimensions[dimension.key],
                      weakness: event.target.value,
                    },
                  },
                }))
              }
              rows={4}
              className="field-input mt-4 min-h-[144px] resize-y"
              placeholder="สิ่งที่ยังติดขัดหรือยังเป็น pain point ในมิตินี้"
            />

            <textarea
              value={entry.answer}
              onChange={(event) =>
                updateModuleState("module1", (module) => ({
                  ...module,
                  dimensions: {
                    ...module.dimensions,
                    [dimension.key]: {
                      ...module.dimensions[dimension.key],
                      answer: event.target.value,
                    },
                  },
                }))
              }
              rows={3}
              className="field-input mt-4 min-h-[110px] resize-y"
              placeholder="บันทึกเพิ่มเติมหรือ raw note จากบริบทจริง"
            />

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                <span>ระดับ pain point / problem</span>
                <span className="font-semibold text-slate-900">{entry.rating || 0}/5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={entry.rating}
                onChange={(event) =>
                  updateModuleState("module1", (module) => ({
                    ...module,
                    dimensions: {
                      ...module.dimensions,
                      [dimension.key]: {
                        ...module.dimensions[dimension.key],
                        rating: Number(event.target.value),
                      },
                    },
                  }))
                }
                className="w-full accent-indigo-600"
              />
            </div>
          </section>
          );
        })}
      </div>

      <button type="button" onClick={onComplete} className="primary-button">
        บันทึก Mission 1
        <CheckCircle2 size={16} />
      </button>
    </div>
  );
}

function renderSwotVisualizer({
  courseState,
  module1Swot,
  updateModuleState,
  insightTokens,
  swotChartValues,
  swotDrafts,
  setSwotDrafts,
  addSwotItem,
  removeSwotItem,
  onComplete,
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-900">Mission 2 : Look Out Of The Room</p>
            <p className="mt-1 text-sm leading-7 text-emerald-800">
              มองปัจจัยภายนอกด้วย PESTEL เพื่อเปลี่ยนข้อมูลดิบให้กลายเป็นโอกาสและอุปสรรคเชิงกลยุทธ์
            </p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800">
            {Object.values(courseState.module1.externalScan).filter(
              (entry) => entry.opportunity.trim() && entry.threat.trim(),
            ).length}
            /6 ปัจจัย
          </div>
        </div>
      </div>

      <div className="grid gap-5">
        {externalScanFactors.map((factor) => {
          const entry = courseState.module1.externalScan[factor.key];

          return (
            <section key={factor.key} className="rounded-[30px] border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{factor.label}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-slate-950">{factor.thaiLabel}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-500">{factor.focus}</p>

              <textarea
                rows={3}
                value={entry.summary}
                onChange={(event) =>
                  updateModuleState("module1", (module) => ({
                    ...module,
                    externalScan: {
                      ...module.externalScan,
                      [factor.key]: {
                        ...module.externalScan[factor.key],
                        summary: event.target.value,
                      },
                    },
                  }))
                }
                className="field-input mt-5 min-h-[110px] resize-y"
                placeholder="สรุปบริบทภายนอกของปัจจัยนี้แบบสั้น ๆ"
              />

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/80 p-4">
                  <p className="text-sm font-semibold text-emerald-900">Opportunity</p>
                  <p className="mt-2 text-sm leading-7 text-emerald-800">{factor.opportunityPrompt}</p>
                  <textarea
                    rows={4}
                    value={entry.opportunity}
                    onChange={(event) =>
                      updateModuleState("module1", (module) => ({
                        ...module,
                        externalScan: {
                          ...module.externalScan,
                          [factor.key]: {
                            ...module.externalScan[factor.key],
                            opportunity: event.target.value,
                          },
                        },
                      }))
                    }
                    className="field-input mt-4 min-h-[140px] resize-y"
                    placeholder="โอกาสหรือแรงหนุนจากปัจจัยนี้"
                  />
                </div>

                <div className="rounded-[24px] border border-rose-100 bg-rose-50/80 p-4">
                  <p className="text-sm font-semibold text-rose-900">Threat</p>
                  <p className="mt-2 text-sm leading-7 text-rose-800">{factor.threatPrompt}</p>
                  <textarea
                    rows={4}
                    value={entry.threat}
                    onChange={(event) =>
                      updateModuleState("module1", (module) => ({
                        ...module,
                        externalScan: {
                          ...module.externalScan,
                          [factor.key]: {
                            ...module.externalScan[factor.key],
                            threat: event.target.value,
                          },
                        },
                      }))
                    }
                    className="field-input mt-4 min-h-[140px] resize-y"
                    placeholder="อุปสรรคหรือความเสี่ยงจากปัจจัยนี้"
                  />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6">
          <div className="section-tag">คลังคำช่วยจัด SWOT</div>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            หยิบคำสำคัญจาก Mission 1 ไปจัดกลุ่ม SWOT เพิ่มได้ทันที หรือพิมพ์ประเด็นใหม่เพื่อเก็บ insight ที่เพิ่งนึกออก
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {insightTokens.length > 0 ? insightTokens.map((token) => (
              <div key={token} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-sm font-medium text-slate-800">{token}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {swotBuckets.map((bucket) => (
                    <button
                      key={`${token}-${bucket.key}`}
                      type="button"
                      onClick={() => addSwotItem(bucket.key, token)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      เพิ่มเข้า {bucket.thaiLabel}
                    </button>
                  ))}
                </div>
              </div>
            )) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                เมื่อกรอก Mission 1 แล้ว ระบบจะดึงคำสำคัญมาแนะนำที่นี่อัตโนมัติ
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6">
          <h3 className="font-display text-2xl font-semibold text-slate-950">SWOT Balance Snapshot</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            เช็กว่าตอนนี้คุณครูมองสถานการณ์ครบทั้ง 4 มุมหรือยัง เพื่อเตรียมไปสู่ Mission 3
          </p>
          <div className="mt-5">
            <SwotBalanceChart values={swotChartValues} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {swotBuckets.map((bucket) => (
              <div key={bucket.key} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">{bucket.thaiLabel}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {module1Swot[bucket.key].slice(0, 2).join(" • ") || "ยังไม่มีรายการ"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {swotBuckets.map((bucket) => (
          <section key={bucket.key} className="rounded-[30px] border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-semibold text-slate-950">{bucket.thaiLabel}</h3>
                <p className="mt-1 text-sm text-slate-500">{bucket.label}</p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                {(courseState.module1.swot[bucket.key] || []).length} รายการที่เพิ่มเอง
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <input
                type="text"
                value={swotDrafts[bucket.key]}
                onChange={(event) =>
                  setSwotDrafts((previous) => ({ ...previous, [bucket.key]: event.target.value }))
                }
                className="field-input"
                placeholder={`พิมพ์ประเด็นที่อยากเพิ่มเองใน ${bucket.thaiLabel}`}
              />
              <button
                type="button"
                onClick={() => addSwotItem(bucket.key, swotDrafts[bucket.key])}
                className="secondary-button shrink-0"
              >
                เพิ่ม
              </button>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">รายการสรุปอัตโนมัติ</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {module1Swot[bucket.key].length > 0 ? module1Swot[bucket.key].map((item) => (
                  <span
                    key={`${bucket.key}-derived-${item}`}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {item}
                  </span>
                )) : <p className="text-sm text-slate-400">ยังไม่มีรายการสรุปอัตโนมัติ</p>}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {courseState.module1.swot[bucket.key].length > 0 ? courseState.module1.swot[bucket.key].map((item) => (
                <button
                  key={`${bucket.key}-${item}`}
                  type="button"
                  onClick={() => removeSwotItem(bucket.key, item)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  {item} ×
                </button>
              )) : <p className="text-sm text-slate-400">ยังไม่มีรายการที่เพิ่มเองในหมวดนี้</p>}
            </div>
          </section>
        ))}
      </div>

      <button type="button" onClick={onComplete} className="primary-button">
        บันทึก Mission 2
        <CheckCircle2 size={16} />
      </button>
    </div>
  );
}

function renderTowsMatrix({
  courseState,
  module1Swot,
  towsDraft,
  setTowsDraft,
  addStrategy,
  removeStrategy,
  onComplete,
}) {
  const internalOptions = [
    ...module1Swot.strengths.map((item) => ({ bucket: "strengths", label: item })),
    ...module1Swot.weaknesses.map((item) => ({ bucket: "weaknesses", label: item })),
  ];
  const externalOptions = [
    ...module1Swot.opportunities.map((item) => ({ bucket: "opportunities", label: item })),
    ...module1Swot.threats.map((item) => ({ bucket: "threats", label: item })),
  ];
  const strategyType = getStrategyType(towsDraft.internalBucket, towsDraft.externalBucket);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6">
          <div className="section-tag">Mission 3 : Strategy Fusion</div>
          <div className="mt-5 grid gap-4">
            <div>
              <label className="field-label" htmlFor="internal-factor">ปัจจัยภายใน (S/W)</label>
              <select
                id="internal-factor"
                value={`${towsDraft.internalBucket}|||${towsDraft.internalValue}`}
                onChange={(event) => {
                  const [bucket, value] = event.target.value.split("|||");
                  setTowsDraft((previous) => ({ ...previous, internalBucket: bucket, internalValue: value }));
                }}
                className="field-select"
              >
                <option value="strengths|||">เลือกปัจจัยภายใน</option>
                {internalOptions.map((option) => (
                  <option key={`${option.bucket}-${option.label}`} value={`${option.bucket}|||${option.label}`}>
                    {option.bucket === "strengths" ? "S" : "W"} | {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="external-factor">ปัจจัยภายนอก (O/T)</label>
              <select
                id="external-factor"
                value={`${towsDraft.externalBucket}|||${towsDraft.externalValue}`}
                onChange={(event) => {
                  const [bucket, value] = event.target.value.split("|||");
                  setTowsDraft((previous) => ({ ...previous, externalBucket: bucket, externalValue: value }));
                }}
                className="field-select"
              >
                <option value="opportunities|||">เลือกปัจจัยภายนอก</option>
                {externalOptions.map((option) => (
                  <option key={`${option.bucket}-${option.label}`} value={`${option.bucket}|||${option.label}`}>
                    {option.bucket === "opportunities" ? "O" : "T"} | {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-[24px] border border-indigo-100 bg-indigo-50 px-4 py-4 text-sm leading-7 text-indigo-900">
              <span className="font-semibold">{strategyType}</span> : {getStrategyGuidance(strategyType)}
            </div>

            <input
              type="text"
              value={towsDraft.title}
              onChange={(event) => setTowsDraft((previous) => ({ ...previous, title: event.target.value }))}
              className="field-input"
              placeholder="ชื่อกลยุทธ์"
            />

            <textarea
              rows={5}
              value={towsDraft.description}
              onChange={(event) => setTowsDraft((previous) => ({ ...previous, description: event.target.value }))}
              className="field-input min-h-[140px] resize-y"
              placeholder="อธิบายว่าการจับคู่สองปัจจัยนี้จะกลายเป็นแนวทางลงมือทำจริงอย่างไร"
            />

            <button type="button" onClick={addStrategy} className="primary-button">
              เพิ่มกลยุทธ์
              <Sparkles size={16} />
            </button>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-slate-950 p-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="section-tag border-white/10 bg-white/5 text-slate-200">คลังกลยุทธ์</div>
              <h3 className="mt-4 font-display text-3xl font-semibold">กลยุทธ์ที่สร้างแล้ว</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200">
              {courseState.module1.strategies.length}/3 ขั้นต่ำ
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {courseState.module1.strategies.length > 0 ? courseState.module1.strategies.map((strategy) => (
              <div key={strategy.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-amber-200">{strategy.type}</p>
                    <h4 className="mt-2 text-lg font-semibold text-white">{strategy.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{strategy.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStrategy(strategy.id)}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-red-300/30 hover:bg-red-400/10 hover:text-red-100"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            )) : <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm text-slate-400">ยังไม่มีกลยุทธ์ ลองเริ่มจากจับคู่ S/W กับ O/T ก่อนครับ</div>}
          </div>
        </div>
      </div>

      <button type="button" onClick={onComplete} className="primary-button">
        บันทึก Mission 3
        <CheckCircle2 size={16} />
      </button>
    </div>
  );
}

function renderNeedsDetective({ courseState, currentUser, updateModuleState, onComplete }) {
  const selectedStrategy = courseState.module1.strategies.find(
    (strategy) => strategy.id === courseState.module1.selectedStrategyId,
  );
  const insightCardId = makeUniqueId("INS", currentUser?.uid);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6">
          <div className="section-tag">Mission 4 : Needs Detective</div>
          <div className="mt-5 space-y-4">
            {courseState.module1.strategies.length > 0 ? courseState.module1.strategies.map((strategy) => (
              <div key={strategy.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-indigo-700">{strategy.type}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-950">{strategy.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{strategy.description}</p>
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium text-slate-700">ให้คะแนนความเป็นไปได้ / ผลกระทบ</p>
                      <StarRating
                        value={Number(courseState.module1.strategyRatings[strategy.id] || 0)}
                        onChange={(value) =>
                          updateModuleState("module1", (module) => ({
                            ...module,
                            strategyRatings: {
                              ...module.strategyRatings,
                              [strategy.id]: value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="selected-strategy"
                    checked={courseState.module1.selectedStrategyId === strategy.id}
                    onChange={() =>
                      updateModuleState("module1", (module) => ({
                        ...module,
                        selectedStrategyId: strategy.id,
                        insightCard: {
                          ...module.insightCard,
                          solution: module.insightCard.solution || strategy.title,
                        },
                      }))
                    }
                    className="mt-1 h-5 w-5 accent-indigo-600"
                  />
                </div>
              </div>
            )) : <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">ยังไม่มีกลยุทธ์จาก Mission 3 กรุณากลับไปสร้างอย่างน้อย 3 แนวทางก่อนครับ</div>}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-slate-950 p-6 text-white">
          <div className="section-tag border-white/10 bg-white/5 text-slate-200">The In-Sight Card</div>
          <div className="mt-5 space-y-4">
            <textarea
              rows={3}
              value={courseState.module1.insightCard.coreProblem}
              onChange={(event) =>
                updateModuleState("module1", (module) => ({
                  ...module,
                  insightCard: { ...module.insightCard, coreProblem: event.target.value },
                }))
              }
              className="field-input min-h-[110px] resize-y border-white/10 bg-white/10 text-white placeholder:text-slate-400"
              placeholder="Core Problem"
            />
            <textarea
              rows={3}
              value={courseState.module1.insightCard.realNeed}
              onChange={(event) =>
                updateModuleState("module1", (module) => ({
                  ...module,
                  insightCard: { ...module.insightCard, realNeed: event.target.value },
                }))
              }
              className="field-input min-h-[110px] resize-y border-white/10 bg-white/10 text-white placeholder:text-slate-400"
              placeholder="Real Need"
            />
            <textarea
              rows={3}
              value={courseState.module1.insightCard.solution}
              onChange={(event) =>
                updateModuleState("module1", (module) => ({
                  ...module,
                  insightCard: { ...module.insightCard, solution: event.target.value },
                }))
              }
              className="field-input min-h-[110px] resize-y border-white/10 bg-white/10 text-white placeholder:text-slate-400"
              placeholder="Solution"
            />
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-white">บทสรุปหลักฐาน</p>
            <p className="mt-2">กลยุทธ์ที่เลือก: {selectedStrategy?.title || "-"}</p>
            <p className="mt-1">คะแนนกลยุทธ์: {selectedStrategy ? (courseState.module1.strategyRatings[selectedStrategy.id] || 0) : 0}/5</p>
            <p className="mt-1">รหัสอ้างอิง: {insightCardId}</p>
          </div>
        </div>
      </div>

      <button type="button" onClick={onComplete} className="primary-button">
        บันทึก Mission 4
        <CheckCircle2 size={16} />
      </button>
    </div>
  );
}

function renderPdcaActionPlan({ courseState, updateModuleState, onComplete }) {
  const pdcaFields = [
    { key: "plan", label: "Plan", placeholder: "วางแผนว่าจะเริ่มจากอะไร ใครเกี่ยวข้อง และทรัพยากรใดที่ต้องใช้" },
    { key: "do", label: "Do", placeholder: "ลงมือทำกิจกรรมหรือแนวทางที่ออกแบบไว้จริงอย่างไร" },
    { key: "check", label: "Check", placeholder: "จะวัดหรือตรวจสอบผลลัพธ์อย่างไร" },
    { key: "act", label: "Act", placeholder: "ถ้าผลออกมาดีหรือยังไม่ดี จะปรับหรือขยายผลอย่างไรต่อ" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-2">
        {pdcaFields.map((field) => (
          <section key={field.key} className="rounded-[30px] border border-slate-200 bg-white p-6">
            <h3 className="font-display text-3xl font-semibold text-slate-950">{field.label}</h3>
            <textarea
              rows={6}
              value={courseState.module1.actionPlan[field.key]}
              onChange={(event) =>
                updateModuleState("module1", (module) => ({
                  ...module,
                  actionPlan: { ...module.actionPlan, [field.key]: event.target.value },
                }))
              }
              className="field-input mt-4 min-h-[170px] resize-y"
              placeholder={field.placeholder}
            />
          </section>
        ))}
      </div>

      <button type="button" onClick={onComplete} className="primary-button">
        บันทึก Mission 5
        <CheckCircle2 size={16} />
      </button>
    </div>
  );
}

function renderDreamLab({ courseState, updateModuleState, onComplete }) {
  const matrixPrompts = [
    { key: "so", title: "SO Strategy", prompt: "ถ้าใช้จุดแข็งคว้าโอกาสได้เต็มที่ ห้องเรียนในฝันจะหน้าตาเป็นอย่างไร?" },
    { key: "wo", title: "WO Strategy", prompt: "ถ้าใช้โอกาสภายนอกมาช่วยลบจุดอ่อน จะเกิดการเปลี่ยนแปลงอะไรขึ้น?" },
    { key: "st", title: "ST Strategy", prompt: "ถ้าใช้จุดแข็งมารับมืออุปสรรค คุณครูจะป้องกันความเสี่ยงอย่างไร?" },
    { key: "wt", title: "WT Strategy", prompt: "ถ้าต้องเอาตัวรอดอย่างชาญฉลาด คุณครูจะออกแบบทางหนีทีไล่อย่างไร?" },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 1 : Dream Lab & TOWS Matrix</div>
        <p className="mt-5 text-base leading-8 text-slate-700">
          ถ้าทุกอย่างไม่มีข้อจำกัดเลย คุณครูอยากเห็นอะไรเกิดขึ้นกับผู้เรียน ห้องเรียน หรือชุมชนการเรียนรู้ของตัวเอง?
        </p>
        <textarea
          rows={6}
          value={courseState.module2.dreamLab}
          onChange={(event) =>
            updateModuleState("module2", (module) => ({ ...module, dreamLab: event.target.value }))
          }
          className="field-input mt-5 min-h-[180px] resize-y"
          placeholder="เขียนภาพฝันแบบเปิดกว้างก่อน แล้วค่อยสกัดให้เป็นทิศทางของแผน"
        />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {matrixPrompts.map((item) => (
          <section key={item.key} className="rounded-[30px] border border-slate-200 bg-white p-6">
            <h3 className="font-display text-2xl font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">{item.prompt}</p>
            <textarea
              rows={5}
              value={courseState.module2.dreamLabMatrix[item.key]}
              onChange={(event) =>
                updateModuleState("module2", (module) => ({
                  ...module,
                  dreamLabMatrix: {
                    ...module.dreamLabMatrix,
                    [item.key]: event.target.value,
                  },
                }))
              }
              className="field-input mt-4 min-h-[160px] resize-y"
              placeholder="เขียนภาพอนาคตหรือแนวทางที่อยากทำในมุมนี้"
            />
          </section>
        ))}
      </div>

      <button type="button" onClick={onComplete} className="primary-button">
        บันทึก Mission 1
        <CheckCircle2 size={16} />
      </button>
    </div>
  );
}

function renderVibeCheck({ courseState, updateModuleState, onComplete }) {
  const vibeFields = [
    { key: "visual", title: "Visual", prompt: "เมื่อเดินเข้าห้องเรียนแล้วอยากเห็นภาพอะไรเป็นอย่างแรก?" },
    { key: "audio", title: "Audio", prompt: "อยากได้ยินเสียงแบบไหนในห้องเรียนหรือกิจกรรมนี้?" },
    { key: "feeling", title: "Feeling", prompt: "อยากให้ครูและผู้เรียนรู้สึกอย่างไรหลังผ่านกิจกรรมนี้?" },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 2 : Vibe Check</div>
        <p className="mt-5 text-base leading-8 text-slate-700">
          เปลี่ยนภาพฝันให้จับต้องได้ผ่าน 3 มิติ คือภาพ เสียง และความรู้สึก เพื่อให้ mood & tone ของโครงการชัดขึ้น
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {vibeFields.map((field) => (
          <section key={field.key} className="rounded-[30px] border border-slate-200 bg-white p-6">
            <h3 className="font-display text-2xl font-semibold text-slate-950">{field.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">{field.prompt}</p>
            <textarea
              rows={6}
              value={courseState.module2.vibeBoard[field.key]}
              onChange={(event) =>
                updateModuleState("module2", (module) => ({
                  ...module,
                  vibeBoard: {
                    ...module.vibeBoard,
                    [field.key]: event.target.value,
                  },
                }))
              }
              className="field-input mt-4 min-h-[180px] resize-y"
              placeholder={`อธิบาย ${field.title} ที่คุณครูอยากเห็น`}
            />
          </section>
        ))}
      </div>

      <button type="button" onClick={onComplete} className="primary-button">
        บันทึก Mission 2
        <CheckCircle2 size={16} />
      </button>
    </div>
  );
}

function renderModuleExtension(props) {
  const { lesson } = props;

  switch (lesson.activityType) {
    case "roadmap_builder":
      return renderRoadmapBuilder(props);
    case "fivewoneh":
      return renderFiveWOneH(props);
    case "smart_goal":
      return renderSmartGoal(props);
    case "quality_check":
      return renderQualityCheck(props);
    case "plc_matchmaking":
      return renderPlcMatchmaking(props);
    case "plc_report":
      return renderPlcReport(props);
    case "pitching_session":
      return renderPitchingSession(props);
    case "innovation_lab":
      return renderInnovationLab(props);
    case "lesson_plan":
      return renderLessonPlan(props);
    case "crafting_session":
      return renderCraftingSession(props);
    case "beta_test":
      return renderBetaTest(props);
    case "classroom_trial":
      return renderClassroomTrial(props);
    case "reflection_log":
      return renderReflectionLog(props);
    case "growth_plan":
      return renderGrowthPlan(props);
    case "platform_survey":
      return renderPlatformSurvey(props);
    default:
      return (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
          กิจกรรมนี้ยังอยู่ระหว่างเชื่อมต่อข้อมูล กรุณาตรวจสอบอีกครั้งภายหลัง
        </div>
      );
  }
}

function renderRoadmapBuilder({ courseState, updateModuleState, onComplete }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 3 : Mapping the Journey</div>
        <div className="mt-6 space-y-5">
          {courseState.module2.roadmap.map((week, index) => (
            <div key={week.week} className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-display text-2xl font-semibold text-slate-950">{week.week}</h3>
              <div className="mt-4 grid gap-4">
                <input
                  type="text"
                  value={week.focus}
                  onChange={(event) =>
                    updateModuleState("module2", (module) => ({
                      ...module,
                      roadmap: module.roadmap.map((item, roadmapIndex) => roadmapIndex === index ? { ...item, focus: event.target.value } : item),
                    }))
                  }
                  className="field-input"
                  placeholder="โฟกัสของสัปดาห์นี้"
                />
                <textarea
                  rows={3}
                  value={week.actions}
                  onChange={(event) =>
                    updateModuleState("module2", (module) => ({
                      ...module,
                      roadmap: module.roadmap.map((item, roadmapIndex) => roadmapIndex === index ? { ...item, actions: event.target.value } : item),
                    }))
                  }
                  className="field-input min-h-[110px] resize-y"
                  placeholder="กิจกรรมหรือสิ่งที่จะลงมือทำจริง"
                />
                <input
                  type="text"
                  value={week.evidence}
                  onChange={(event) =>
                    updateModuleState("module2", (module) => ({
                      ...module,
                      roadmap: module.roadmap.map((item, roadmapIndex) => roadmapIndex === index ? { ...item, evidence: event.target.value } : item),
                    }))
                  }
                  className="field-input"
                  placeholder="หลักฐานความก้าวหน้า"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 3<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderFiveWOneH({ courseState, updateModuleState, onComplete }) {
  const labels = [
    ["who", "Who: ใครคือผู้เกี่ยวข้องหลัก"],
    ["what", "What: จะทำอะไร"],
    ["when", "When: จะทำเมื่อไร"],
    ["where", "Where: จะเกิดขึ้นที่ไหน"],
    ["why", "Why: ทำไมจึงสำคัญ"],
    ["how", "How: จะทำอย่างไร"],
  ];
  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 4 : Define 5W1H</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {labels.map(([key, placeholder]) => (
            <textarea
              key={key}
              rows={4}
              value={courseState.module2.fiveWOneH[key]}
              onChange={(event) =>
                updateModuleState("module2", (module) => ({
                  ...module,
                  fiveWOneH: { ...module.fiveWOneH, [key]: event.target.value },
                }))
              }
              className="field-input min-h-[120px] resize-y"
              placeholder={placeholder}
            />
          ))}
        </div>
      </section>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 4<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderSmartGoal({ courseState, updateModuleState, onComplete }) {
  const labels = [
    ["specific", "Specific: เป้าหมายที่ชัดเจน"],
    ["measurable", "Measurable: จะวัดผลอย่างไร"],
    ["achievable", "Achievable: ทำได้จริงด้วยทรัพยากรที่มี"],
    ["relevant", "Relevant: เชื่อมกับ pain point และบริบทอย่างไร"],
    ["timeBound", "Time-bound: กรอบเวลาที่ชัดเจน"],
  ];
  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 5 : SMART Objective</div>
        <div className="mt-6 grid gap-4">
          {labels.map(([key, placeholder]) => (
            <textarea
              key={key}
              rows={3}
              value={courseState.module2.smartGoal[key]}
              onChange={(event) =>
                updateModuleState("module2", (module) => ({
                  ...module,
                  smartGoal: { ...module.smartGoal, [key]: event.target.value },
                }))
              }
              className="field-input min-h-[110px] resize-y"
              placeholder={placeholder}
            />
          ))}
        </div>
      </section>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 5<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderQualityCheck({ courseState, updateModuleState, onComplete }) {
  const fields = [
    { key: "oecd", placeholder: "เชื่อมกับ OECD Learning Compass 2030 อย่างไร" },
    { key: "royalPolicy", placeholder: "เชื่อมกับพระบรมราโชบายด้านการศึกษา ร.10 อย่างไร" },
    { key: "sez", placeholder: "เชื่อมกับ Tak SEZ หรือบริบทพื้นที่อย่างไร" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-3">
        {fields.map((field) => (
          <section key={field.key} className="rounded-[30px] border border-slate-200 bg-white p-6">
            <textarea
              rows={8}
              value={courseState.module2.qualityCheck[field.key]}
              onChange={(event) =>
                updateModuleState("module2", (module) => ({
                  ...module,
                  qualityCheck: { ...module.qualityCheck, [field.key]: event.target.value },
                }))
              }
              className="field-input min-h-[240px] resize-y"
              placeholder={field.placeholder}
            />
          </section>
        ))}
      </div>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 6<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderPlcMatchmaking({ courseState, updateModuleState, generatePlcMatch, onComplete }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="section-tag">Mission 1 : The Mastermind Match</div>
          <button type="button" onClick={generatePlcMatch} className="secondary-button">สุ่มคู่วง PLC</button>
        </div>
        <p className="mt-5 text-sm leading-7 text-slate-500">
          กำหนดหัวข้อ pain point รูปแบบการพบกัน วันเวลา สมาชิกในวง และบทบาทหลัก เพื่อให้การประชุม PLC มีโครงสร้างชัดตั้งแต่ต้น
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            type="text"
            value={courseState.module3.meetingTopic}
            onChange={(event) =>
              updateModuleState("module3", (module) => ({ ...module, meetingTopic: event.target.value }))
            }
            className="field-input md:col-span-2"
            placeholder="หัวข้อ PLC จาก pain point หรือ strategy ที่อยากหยิบไปคุย"
          />

          <select
            value={courseState.module3.meetingFormat}
            onChange={(event) =>
              updateModuleState("module3", (module) => ({ ...module, meetingFormat: event.target.value }))
            }
            className="field-select"
          >
            <option value="online">Online PLC</option>
            <option value="offline">Offline PLC</option>
          </select>

          <input
            type="text"
            value={courseState.module3.meetingSize}
            onChange={(event) =>
              updateModuleState("module3", (module) => ({ ...module, meetingSize: event.target.value }))
            }
            className="field-input"
            placeholder="ขนาดวง เช่น 3-4 คน"
          />

          <input
            type="text"
            value={courseState.module3.pairedTeacherName}
            onChange={(event) =>
              updateModuleState("module3", (module) => ({ ...module, pairedTeacherName: event.target.value }))
            }
            className="field-input"
            placeholder="ชื่อเพื่อนครูหรือผู้ร่วมวง"
          />

          <input
            type="text"
            value={courseState.module3.pairedTeacherUid}
            onChange={(event) =>
              updateModuleState("module3", (module) => ({ ...module, pairedTeacherUid: event.target.value }))
            }
            className="field-input"
            placeholder="รหัสหรือชื่อย่อของผู้ร่วมวง"
          />

          <input
            type="date"
            value={courseState.module3.meetingDate}
            onChange={(event) =>
              updateModuleState("module3", (module) => ({ ...module, meetingDate: event.target.value }))
            }
            className="field-input"
          />

          <input
            type="time"
            value={courseState.module3.meetingTime}
            onChange={(event) =>
              updateModuleState("module3", (module) => ({ ...module, meetingTime: event.target.value }))
            }
            className="field-input"
          />

          {courseState.module3.meetingFormat === "online" ? (
            <input
              type="url"
              value={courseState.module3.meetLink}
              onChange={(event) =>
                updateModuleState("module3", (module) => ({ ...module, meetLink: event.target.value }))
              }
              className="field-input md:col-span-2"
              placeholder="ลิงก์ Google Meet หรือห้องประชุมออนไลน์"
            />
          ) : (
            <input
              type="text"
              value={courseState.module3.meetingLocation}
              onChange={(event) =>
                updateModuleState("module3", (module) => ({ ...module, meetingLocation: event.target.value }))
              }
              className="field-input md:col-span-2"
              placeholder="สถานที่นัดหมาย เช่น ห้อง PLC หรือห้องสมุด"
            />
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["facilitator", "Facilitator"],
            ["timeKeeper", "Time Keeper"],
            ["challenger", "Challenger"],
            ["noteTaker", "Note Taker"],
          ].map(([key, label]) => (
            <input
              key={key}
              type="text"
              value={courseState.module3.plcRoles[key]}
              onChange={(event) =>
                updateModuleState("module3", (module) => ({
                  ...module,
                  plcRoles: { ...module.plcRoles, [key]: event.target.value },
                }))
              }
              className="field-input"
              placeholder={`${label} คือใคร`}
            />
          ))}
        </div>
      </section>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 1<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderPlcReport({ courseState, updateModuleState, onComplete }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 2 : The Alchemy Logbook</div>
        <div className="mt-6 space-y-4">
          <textarea
            rows={8}
            value={courseState.module3.plcLogbook}
            onChange={(event) =>
              updateModuleState("module3", (module) => ({ ...module, plcLogbook: event.target.value }))
            }
            className="field-input min-h-[220px] resize-y"
            placeholder="One-page logbook: สรุปวัตถุประสงค์ สิ่งที่แลกเปลี่ยน และข้อค้นพบจากวง PLC"
          />
          <textarea
            rows={4}
            value={courseState.module3.ahaMoment}
            onChange={(event) =>
              updateModuleState("module3", (module) => ({ ...module, ahaMoment: event.target.value }))
            }
            className="field-input min-h-[140px] resize-y"
            placeholder="Aha! Moment หรือประโยคที่ทำให้มุมมองของคุณครูเปลี่ยนไป"
          />
          <textarea
            rows={4}
            value={courseState.module3.plcReport}
            onChange={(event) =>
              updateModuleState("module3", (module) => ({ ...module, plcReport: event.target.value }))
            }
            className="field-input min-h-[140px] resize-y"
            placeholder="สรุปผลลัพธ์สำคัญหลังจบวง PLC และสิ่งที่อยากนำไปใช้ต่อ"
          />
          <input
            type="url"
            value={courseState.module3.plcVibeEvidenceUrl}
            onChange={(event) =>
              updateModuleState("module3", (module) => ({
                ...module,
                plcVibeEvidenceUrl: event.target.value,
                plcScreenshotUrl: event.target.value,
              }))
            }
            className="field-input"
            placeholder="ลิงก์ภาพ Screenshot หรือหลักฐานบรรยากาศการประชุม PLC"
          />
        </div>
      </section>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 2<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderPitchingSession({ courseState, updateModuleState, onComplete }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 3 : The 60-Second Spell</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["hook", "Hook: ประโยคเปิดที่ดึงความสนใจ"],
            ["painPoint", "Pain Point: ปัญหาที่กำลังอยากแก้"],
            ["solution", "Solution: วิธีการหรือแนวคิดของคุณครู"],
            ["impact", "Impact: ผลลัพธ์ที่อยากเห็น"],
          ].map(([key, placeholder]) => (
            <textarea
              key={key}
              rows={4}
              value={courseState.module3.pitchOutline[key]}
              onChange={(event) =>
                updateModuleState("module3", (module) => ({
                  ...module,
                  pitchOutline: { ...module.pitchOutline, [key]: event.target.value },
                }))
              }
              className="field-input min-h-[130px] resize-y"
              placeholder={placeholder}
            />
          ))}
        </div>

        <div className="mt-4 space-y-4">
          <textarea
            rows={8}
            value={courseState.module3.pitchScript}
            onChange={(event) =>
              updateModuleState("module3", (module) => ({ ...module, pitchScript: event.target.value }))
            }
            className="field-input min-h-[220px] resize-y"
            placeholder="ร่างสคริปต์ 1-1.5 นาที โดยต่อจาก Hook / Pain Point / Solution / Impact"
          />
          <input
            type="url"
            value={courseState.module3.pitchMediaUrl}
            onChange={(event) =>
              updateModuleState("module3", (module) => ({
                ...module,
                pitchMediaUrl: event.target.value,
                pitchAudioUrl: event.target.value,
              }))
            }
            className="field-input"
            placeholder="ลิงก์ไฟล์เสียง วิดีโอ หรือหลักฐานการ pitch"
          />
        </div>
      </section>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 3<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderInnovationLab({ courseState, updateModuleState, onComplete }) {
  const fields = [
    ["innovationName", "ชื่อนวัตกรรม"],
    ["innovationFormula", "สูตรผสมของนวัตกรรม เช่น Tablet + Storytelling + Active Learning"],
    ["hardware", "Hardware"],
    ["software", "Software"],
    ["activeLearning", "รูปแบบ Active Learning"],
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 1 : Innovation Lab</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {fields.map(([key, placeholder]) => (
            <input
              key={key}
              type="text"
              value={courseState.module4[key]}
              onChange={(event) =>
                updateModuleState("module4", (module) => ({ ...module, [key]: event.target.value }))
              }
              className="field-input"
              placeholder={placeholder}
            />
          ))}
        </div>
      </section>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 1<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderLessonPlan({ courseState, updateModuleState, onComplete }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 2 : The Master Blueprint</div>
        <div className="mt-6 grid gap-4">
          {[
            ["hook", "Hook: จุดเริ่มต้นที่ดึงผู้เรียนเข้าสู่กิจกรรม"],
            ["action", "Action: ลำดับกิจกรรมหรือกระบวนการเรียนรู้หลัก"],
            ["reflect", "Reflect: ช่วงสะท้อนคิดหรือหลักฐานการเรียนรู้"],
          ].map(([key, placeholder]) => (
            <textarea
              key={key}
              rows={5}
              value={courseState.module4.lessonBlueprint[key]}
              onChange={(event) =>
                updateModuleState("module4", (module) => ({
                  ...module,
                  lessonBlueprint: { ...module.lessonBlueprint, [key]: event.target.value },
                }))
              }
              className="field-input min-h-[160px] resize-y"
              placeholder={placeholder}
            />
          ))}

          <input
            type="url"
            value={courseState.module4.lessonPlanUrl}
            onChange={(event) =>
              updateModuleState("module4", (module) => ({ ...module, lessonPlanUrl: event.target.value }))
            }
            className="field-input"
            placeholder="ลิงก์ไฟล์ blueprint, lesson plan หรือเอกสารประกอบ"
          />
        </div>
      </section>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 2<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderCraftingSession({ courseState, updateModuleState, onComplete }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 3 : Crafting Session</div>
        <div className="mt-6 space-y-4">
          <input
            type="url"
            value={courseState.module4.mediaEvidenceUrl}
            onChange={(event) =>
              updateModuleState("module4", (module) => ({ ...module, mediaEvidenceUrl: event.target.value }))
            }
            className="field-input"
            placeholder="ลิงก์สื่อ ชิ้นงาน หรือหลักฐานการอัปโหลด"
          />
          <textarea
            rows={6}
            value={courseState.module4.mediaDescription}
            onChange={(event) =>
              updateModuleState("module4", (module) => ({ ...module, mediaDescription: event.target.value }))
            }
            className="field-input min-h-[170px] resize-y"
            placeholder="อธิบายสื่อที่สร้าง วิธีใช้ และความเชื่อมโยงกับ blueprint"
          />
        </div>
      </section>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 3<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderBetaTest({ courseState, updateModuleState, onComplete }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 4 : The Beta Test</div>
        <div className="mt-6 space-y-4">
          <textarea
            rows={5}
            value={courseState.module4.betaStrength}
            onChange={(event) =>
              updateModuleState("module4", (module) => ({ ...module, betaStrength: event.target.value }))
            }
            className="field-input min-h-[160px] resize-y"
            placeholder="จุดแข็งที่สุดของต้นแบบหรือสิ่งที่เวิร์กมากที่สุดในรอบทดลอง"
          />
          <textarea
            rows={5}
            value={courseState.module4.betaImprove}
            onChange={(event) =>
              updateModuleState("module4", (module) => ({ ...module, betaImprove: event.target.value }))
            }
            className="field-input min-h-[160px] resize-y"
            placeholder="ถ้าจะทำเวอร์ชัน 2.0 อยากปรับอะไรต่อและเพราะอะไร"
          />
        </div>
      </section>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 4<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderClassroomTrial({ courseState, updateModuleState, onComplete }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 1 : Teaching in Action</div>
        <div className="mt-6 space-y-4">
          <input
            type="url"
            value={courseState.module5.teachingClipUrl}
            onChange={(event) =>
              updateModuleState("module5", (module) => ({ ...module, teachingClipUrl: event.target.value }))
            }
            className="field-input"
            placeholder="ลิงก์คลิปการสอนจริง 50-60 นาที"
          />
          <textarea
            rows={6}
            value={courseState.module5.classroomContext}
            onChange={(event) =>
              updateModuleState("module5", (module) => ({ ...module, classroomContext: event.target.value }))
            }
            className="field-input min-h-[170px] resize-y"
            placeholder="บริบทของคาบเรียน เช่น ชั้นเรียน จำนวนผู้เรียน วิชา และจุดที่ต้องการสังเกต"
          />
        </div>
      </section>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 1<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderReflectionLog({ courseState, updateModuleState, onComplete }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 2 : Reflection Log</div>
        <div className="mt-6 space-y-4">
          <textarea
            rows={8}
            value={courseState.module5.reflectionLog}
            onChange={(event) =>
              updateModuleState("module5", (module) => ({ ...module, reflectionLog: event.target.value }))
            }
            className="field-input min-h-[220px] resize-y"
            placeholder="บันทึกสิ่งที่เกิดขึ้นจริง สิ่งที่เวิร์ก และสิ่งที่อยากปรับหลังสอน"
          />
          <textarea
            rows={5}
            value={courseState.module5.learnerResponse}
            onChange={(event) =>
              updateModuleState("module5", (module) => ({ ...module, learnerResponse: event.target.value }))
            }
            className="field-input min-h-[150px] resize-y"
            placeholder="เสียงตอบรับ พฤติกรรม หรือสัญญาณสำคัญจากผู้เรียน"
          />
        </div>
      </section>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 2<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderGrowthPlan({ courseState, updateModuleState, onComplete }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="section-tag">Mission 3 : Next Growth Plan</div>
        <textarea
          rows={10}
          value={courseState.module5.nextGrowthPlan}
          onChange={(event) =>
            updateModuleState("module5", (module) => ({ ...module, nextGrowthPlan: event.target.value }))
          }
          className="field-input min-h-[260px] resize-y"
          placeholder="วางแนวทางพัฒนา/ต่อยอดในรอบถัดไปจากหลักฐานที่ได้จริง"
        />
      </section>
      <button type="button" onClick={onComplete} className="primary-button">บันทึก Mission 3<CheckCircle2 size={16} /></button>
    </div>
  );
}

function renderPlatformSurvey({ courseState, updateModuleState, onComplete }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-3">
        <RatingCard title="ความพึงพอใจโดยรวม" description="แพลตฟอร์มนี้ตอบโจทย์การเรียนรู้ของคุณครูมากแค่ไหน" value={courseState.survey.satisfaction} onChange={(value) => updateModuleState("survey", (module) => ({ ...module, satisfaction: value }))} />
        <RatingCard title="ความง่ายในการใช้งาน" description="การนำทางและการกรอกข้อมูลใช้งานได้ลื่นไหลเพียงใด" value={courseState.survey.easeOfUse} onChange={(value) => updateModuleState("survey", (module) => ({ ...module, easeOfUse: value }))} />
        <RatingCard title="ประโยชน์ของ AI Mentor" description="คำแนะนำระหว่างทางช่วยให้คิดต่อและทำงานได้จริงมากแค่ไหน" value={courseState.survey.aiHelpfulness} onChange={(value) => updateModuleState("survey", (module) => ({ ...module, aiHelpfulness: value }))} />
      </div>

      <section className="rounded-[30px] border border-slate-200 bg-white p-6">
        <textarea
          rows={8}
          value={courseState.survey.comments}
          onChange={(event) =>
            updateModuleState("survey", (module) => ({ ...module, comments: event.target.value }))
          }
          className="field-input min-h-[220px] resize-y"
          placeholder="ความคิดเห็นเพิ่มเติม"
        />
      </section>

      <button type="button" onClick={onComplete} className="primary-button">ส่งแบบประเมิน<CheckCircle2 size={16} /></button>
    </div>
  );
}

