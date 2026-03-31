import {
  externalScanFactors,
  insightDimensions,
  teacherQuizBank,
} from "./teacherCourse";

const roadmapWeeks = [
  "Week 1 (Set Up)",
  "Week 2 (Pilot)",
  "Week 3 (Feedback)",
  "Week 4 (Showcase)",
];

export function createDefaultTeacherCourseState() {
  return {
    module1: {
      dimensions: insightDimensions.reduce((accumulator, dimension) => {
        accumulator[dimension.key] = {
          answer: "",
          strength: "",
          weakness: "",
          rating: 0,
        };
        return accumulator;
      }, {}),
      externalScan: externalScanFactors.reduce((accumulator, factor) => {
        accumulator[factor.key] = {
          summary: "",
          opportunity: "",
          threat: "",
        };
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
      dreamLabMatrix: {
        so: "",
        wo: "",
        st: "",
        wt: "",
      },
      vibeCheck: "",
      vibeBoard: {
        visual: "",
        audio: "",
        feeling: "",
      },
      roadmap: roadmapWeeks.map((week) => ({
        week,
        focus: "",
        actions: "",
        evidence: "",
      })),
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
      meetingFormat: "online",
      meetingTopic: "",
      pairedTeacherName: "",
      pairedTeacherUid: "",
      meetingDate: "",
      meetingTime: "",
      meetingSize: "3-4 คน",
      meetLink: "",
      meetingLocation: "",
      plcRoles: {
        facilitator: "",
        timeKeeper: "",
        challenger: "",
        noteTaker: "",
      },
      plcLogbook: "",
      ahaMoment: "",
      plcReport: "",
      plcScreenshotUrl: "",
      plcVibeEvidenceUrl: "",
      pitchScript: "",
      pitchOutline: {
        hook: "",
        painPoint: "",
        solution: "",
        impact: "",
      },
      pitchAudioUrl: "",
      pitchMediaUrl: "",
    },
    module4: {
      innovationName: "",
      innovationFormula: "",
      hardware: "",
      software: "",
      activeLearning: "",
      lessonPlan: "",
      lessonBlueprint: {
        hook: "",
        action: "",
        reflect: "",
      },
      lessonPlanUrl: "",
      assessmentPlan: "",
      mediaEvidenceUrl: "",
      mediaDescription: "",
      betaStrength: "",
      betaImprove: "",
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
