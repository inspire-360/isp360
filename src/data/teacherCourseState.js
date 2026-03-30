import { insightDimensions, teacherQuizBank } from "./teacherCourse";

export function createDefaultTeacherCourseState() {
  return {
    module1: {
      dimensions: insightDimensions.reduce((accumulator, dimension) => {
        accumulator[dimension.key] = { answer: "", rating: 0 };
        return accumulator;
      }, {}),
      swot: {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      },
      strategies: [],
      selectedStrategyId: "",
      strategyRatings: {},
      insightCard: {
        coreProblem: "",
        realNeed: "",
        solution: "",
      },
      actionPlan: {
        plan: "",
        do: "",
        check: "",
        act: "",
      },
    },
    module2: {
      dreamLab: "",
      vibeCheck: "",
      roadmap: [
        { week: "สัปดาห์ที่ 1", focus: "", actions: "", evidence: "" },
        { week: "สัปดาห์ที่ 2", focus: "", actions: "", evidence: "" },
        { week: "สัปดาห์ที่ 3", focus: "", actions: "", evidence: "" },
        { week: "สัปดาห์ที่ 4", focus: "", actions: "", evidence: "" },
      ],
      fiveWOneH: {
        who: "",
        what: "",
        when: "",
        where: "",
        why: "",
        how: "",
      },
      smartGoal: {
        specific: "",
        measurable: "",
        achievable: "",
        relevant: "",
        timeBound: "",
      },
      qualityCheck: {
        oecd: "",
        royalPolicy: "",
        sez: "",
      },
    },
    module3: {
      meetingTopic: "",
      pairedTeacherName: "",
      pairedTeacherUid: "",
      meetingDate: "",
      meetingTime: "",
      meetLink: "",
      plcReport: "",
      plcScreenshotUrl: "",
      pitchScript: "",
      pitchAudioUrl: "",
    },
    module4: {
      innovationName: "",
      hardware: "",
      software: "",
      activeLearning: "",
      lessonPlan: "",
      assessmentPlan: "",
      mediaEvidenceUrl: "",
      mediaDescription: "",
    },
    module5: {
      teachingClipUrl: "",
      classroomContext: "",
      reflectionLog: "",
      learnerResponse: "",
      nextGrowthPlan: "",
    },
    survey: {
      satisfaction: 0,
      easeOfUse: 0,
      aiHelpfulness: 0,
      comments: "",
    },
  };
}

export function createDefaultTeacherProgress() {
  return {
    completedLessons: [],
    currentModuleIndex: 0,
    quizAttempts: {},
    quizScores: {},
    quizCooldowns: {},
    badges: [],
  };
}

export function getQuizQuestionsById(quizId) {
  return shuffleArray(teacherQuizBank[quizId] || []).map(shuffleQuestionOptions);
}

export function getQuizCooldownRemaining(cooldowns, quizId) {
  const cooldownUntil = cooldowns?.[quizId];
  if (!cooldownUntil) {
    return 0;
  }

  const timestamp =
    typeof cooldownUntil === "number"
      ? cooldownUntil
      : new Date(cooldownUntil).getTime();

  return Math.max(0, timestamp - Date.now());
}

export function formatThaiDateTime(value) {
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  return date.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function shuffleQuestionOptions(question) {
  const optionsWithIndex = question.options.map((option, index) => ({
    option,
    originalIndex: index,
  }));
  const shuffledOptions = shuffleArray(optionsWithIndex);

  return {
    ...question,
    options: shuffledOptions.map((item) => item.option),
    correctAnswer: shuffledOptions.findIndex(
      (item) => item.originalIndex === question.correctAnswer,
    ),
  };
}

function shuffleArray(items) {
  const clonedItems = [...items];
  for (let index = clonedItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clonedItems[index], clonedItems[randomIndex]] = [
      clonedItems[randomIndex],
      clonedItems[index],
    ];
  }
  return clonedItems;
}
