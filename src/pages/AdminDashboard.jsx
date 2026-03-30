import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  AlertTriangle,
  BookOpen,
  LifeBuoy,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { db } from "../lib/firebase";
import { teacherCourseData } from "../data/teacherCourse";
import {
  getSosLevelMeta,
  getSosStatusMeta,
  SOS_STATUS_OPTIONS,
} from "../data/sosLevels";
import { getRoleLabel } from "../data/profileOptions";
import { formatLastSeenLabel, isUserCurrentlyOnline } from "../lib/presence";

const TOTAL_TEACHER_LESSONS = teacherCourseData.modules.reduce(
  (sum, module) => sum + module.lessons.length,
  0,
);

function shortenText(value, fallback = "ยังไม่มีข้อมูล", limit = 140) {
  const text = value?.trim();

  if (!text) {
    return fallback;
  }

  return text.length <= limit ? text : `${text.slice(0, limit)}...`;
}

function buildTeacherSummary(enrollment, user) {
  const courseState = enrollment.courseState || {};
  const completedLessons = enrollment.completedLessons || [];
  const badges = enrollment.badges || [];
  const survey = courseState.survey || {};

  return {
    id: `${user?.uid || "unknown"}-course-teacher`,
    name: user?.name || user?.email || "ผู้ใช้งานไม่ระบุชื่อ",
    role: user?.role || "learner",
    school: user?.school || "ยังไม่ได้ระบุ",
    isOnline: isUserCurrentlyOnline(user),
    lastSeen: user?.lastSeen,
    badges,
    progressPercent: TOTAL_TEACHER_LESSONS
      ? Math.round((completedLessons.length / TOTAL_TEACHER_LESSONS) * 100)
      : 0,
    module1Problem: shortenText(courseState.module1?.insightCard?.coreProblem),
    module1Need: shortenText(courseState.module1?.insightCard?.realNeed),
    module1Solution: shortenText(courseState.module1?.insightCard?.solution),
    module2Dream: shortenText(courseState.module2?.dreamLab),
    module2Goal: shortenText(courseState.module2?.smartGoal?.specific),
    module3Topic: shortenText(courseState.module3?.meetingTopic),
    module4Innovation: shortenText(courseState.module4?.innovationName),
    module5Growth: shortenText(courseState.module5?.nextGrowthPlan),
    satisfaction: survey.satisfaction || 0,
    easeOfUse: survey.easeOfUse || 0,
    aiHelpfulness: survey.aiHelpfulness || 0,
  };
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [teacherSummaries, setTeacherSummaries] = useState([]);
  const [sosTickets, setSosTickets] = useState([]);

  const loadAdminData = async (showRefreshState = false) => {
    if (showRefreshState) {
      setRefreshing(true);
    }

    try {
      const [usersSnapshot, enrollmentsSnapshot, sosSnapshot] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collectionGroup(db, "enrollments")),
        getDocs(collectionGroup(db, "sosTickets")),
      ]);

      const nextUsers = usersSnapshot.docs.map((docSnapshot) => ({
        uid: docSnapshot.id,
        ...docSnapshot.data(),
      }));

      const usersById = new Map(nextUsers.map((user) => [user.uid, user]));

      const nextTeacherSummaries = enrollmentsSnapshot.docs
        .filter(
          (docSnapshot) =>
            docSnapshot.id === "course-teacher" ||
            docSnapshot.data().courseId === "course-teacher",
        )
        .map((docSnapshot) => {
          const userId = docSnapshot.ref.parent.parent?.id || "";
          return buildTeacherSummary(docSnapshot.data(), usersById.get(userId));
        })
        .sort((left, right) => right.progressPercent - left.progressPercent);

      const nextTickets = sosSnapshot.docs
        .map((docSnapshot) => ({
          id: docSnapshot.id,
          path: docSnapshot.ref.path,
          ...docSnapshot.data(),
        }))
        .sort((left, right) => {
          const leftPriority = left.levelPriority || 99;
          const rightPriority = right.levelPriority || 99;

          if (left.status !== right.status) {
            if (left.status === "resolved") {
              return 1;
            }

            if (right.status === "resolved") {
              return -1;
            }
          }

          if (leftPriority !== rightPriority) {
            return leftPriority - rightPriority;
          }

          const leftTime = left.createdAt?.toMillis?.() || 0;
          const rightTime = right.createdAt?.toMillis?.() || 0;
          return rightTime - leftTime;
        });

      setUsers(nextUsers);
      setTeacherSummaries(nextTeacherSummaries);
      setSosTickets(nextTickets);
    } catch (error) {
      console.error("Error loading admin dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const filteredSummaries = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return teacherSummaries;
    }

    return teacherSummaries.filter((summary) => {
      const haystack = [
        summary.name,
        summary.school,
        summary.module1Problem,
        summary.module2Dream,
        summary.module4Innovation,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [searchTerm, teacherSummaries]);

  const stats = useMemo(() => {
    const onlineCount = users.filter((user) => isUserCurrentlyOnline(user)).length;
    const openSosCount = sosTickets.filter((ticket) => ticket.status !== "resolved").length;

    return [
      { label: "ผู้ใช้งานทั้งหมด", value: users.length, icon: <Users size={18} /> },
      { label: "ออนไลน์ตอนนี้", value: onlineCount, icon: <ShieldCheck size={18} /> },
      {
        label: "ครูใน InSPIRE 360",
        value: teacherSummaries.length,
        icon: <BookOpen size={18} />,
      },
      {
        label: "คิว SOS ที่ยังเปิดอยู่",
        value: openSosCount,
        icon: <LifeBuoy size={18} />,
      },
    ];
  }, [sosTickets, teacherSummaries.length, users]);

  const handleTicketStatusChange = async (ticketPath, nextStatus) => {
    try {
      await setDoc(
        doc(db, ticketPath),
        {
          status: nextStatus,
          updatedAt: serverTimestamp(),
          ...(nextStatus === "resolved" ? { resolvedAt: serverTimestamp() } : {}),
        },
        { merge: true },
      );

      setSosTickets((previous) =>
        previous.map((ticket) =>
          ticket.path === ticketPath ? { ...ticket, status: nextStatus } : ticket,
        ),
      );
    } catch (error) {
      console.error("Error updating SOS ticket status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={36} className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="page-wrap space-y-6">
      <section className="dark-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200">
              Admin Backend
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.08em] text-white">
              ศูนย์จัดการระบบผู้ดูแล
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              พื้นที่นี้รวมข้อมูลผู้ใช้ คำตอบจากแต่ละโมดูลของ InSPIRE 360 for
              Teacher และคิว SOS เพื่อให้ทีมดูแลตัดสินใจและตอบสนองได้เร็วขึ้น
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAdminData(true)}
            className="secondary-button border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            {refreshing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                กำลังรีเฟรช
              </>
            ) : (
              <>
                <RefreshCcw size={16} />
                รีเฟรชข้อมูล
              </>
            )}
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[24px] border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center gap-2 text-amber-200">
                {stat.icon}
                <span className="text-xs uppercase tracking-[0.24em]">{stat.label}</span>
              </div>
              <div className="mt-3 font-display text-3xl font-semibold tracking-[-0.06em] text-white">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
              User Module Answers
            </p>
            <h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">
              สรุปคำตอบจากแต่ละโมดูล
            </h3>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="field-input max-w-md"
            placeholder="ค้นหาจากชื่อ โรงเรียน หรือคำสำคัญ"
          />
        </div>

        {filteredSummaries.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            ยังไม่พบข้อมูลคำตอบของผู้ใช้ตามคำค้นนี้
          </div>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {filteredSummaries.map((summary) => (
              <article
                key={summary.id}
                className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    text={summary.name}
                    className="border-slate-200 bg-white text-slate-700"
                  />
                  <Badge
                    text={getRoleLabel(summary.role)}
                    className="border-sky-200 bg-sky-50 text-sky-700"
                  />
                  <Badge
                    text={
                      summary.isOnline ? "ออนไลน์" : formatLastSeenLabel(summary.lastSeen)
                    }
                    className={
                      summary.isOnline
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MiniStat text={`ความคืบหน้า ${summary.progressPercent}%`} />
                  <MiniStat text={`โรงเรียน ${summary.school}`} />
                  <MiniStat text={`Badge ${summary.badges.length} รายการ`} />
                </div>

                <div className="mt-4 space-y-3">
                  <AnswerBlock label="Module 1 ปัญหาแกนหลัก" value={summary.module1Problem} />
                  <AnswerBlock label="Module 1 ความต้องการจริง" value={summary.module1Need} />
                  <AnswerBlock label="Module 1 แนวทางแก้" value={summary.module1Solution} />
                  <AnswerBlock label="Module 2 Dream Lab" value={summary.module2Dream} />
                  <AnswerBlock label="Module 2 SMART Goal" value={summary.module2Goal} />
                  <AnswerBlock label="Module 3 PLC Topic" value={summary.module3Topic} />
                  <AnswerBlock label="Module 4 Innovation" value={summary.module4Innovation} />
                  <AnswerBlock label="Module 5 Next Growth Plan" value={summary.module5Growth} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MiniStat text={`พึงพอใจ ${summary.satisfaction}/5`} />
                  <MiniStat text={`ใช้งานง่าย ${summary.easeOfUse}/5`} />
                  <MiniStat text={`AI ช่วยได้ ${summary.aiHelpfulness}/5`} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="surface-panel p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-red-50 p-3 text-red-600">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
              SOS Inbox
            </p>
            <h3 className="mt-1 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">
              คิวรับเรื่องและจัดการสถานะ
            </h3>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {sosTickets.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              ยังไม่มีรายการ SOS ในระบบ
            </div>
          ) : (
            sosTickets.map((ticket) => {
              const levelMeta = getSosLevelMeta(ticket.level);
              const statusMeta = getSosStatusMeta(ticket.status);

              return (
                <article
                  key={ticket.path}
                  className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge
                          text={`ระดับ ${levelMeta.priority} ${levelMeta.label}`}
                          className={levelMeta.badgeClass}
                        />
                        <Badge text={statusMeta.label} className={statusMeta.badgeClass} />
                        <Badge
                          text={ticket.userName || "ไม่ระบุชื่อ"}
                          className="border-slate-200 bg-white text-slate-700"
                        />
                      </div>

                      <h4 className="mt-4 font-display text-2xl font-semibold text-slate-950">
                        {ticket.title}
                      </h4>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {ticket.details}
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <MiniStat text={`บทบาท ${getRoleLabel(ticket.userRole || "learner")}`} />
                        <MiniStat text={`โรงเรียน ${ticket.school || "ยังไม่ได้ระบุ"}`} />
                        <MiniStat
                          text={`ล่าสุด ${formatLastSeenLabel(ticket.updatedAt || ticket.createdAt)}`}
                        />
                      </div>
                    </div>

                    <div className="w-full max-w-[220px]">
                      <label className="field-label" htmlFor={`status-${ticket.id}`}>
                        เปลี่ยนสถานะ
                      </label>
                      <select
                        id={`status-${ticket.id}`}
                        value={ticket.status || "open"}
                        onChange={(event) =>
                          handleTicketStatusChange(ticket.path, event.target.value)
                        }
                        className="field-select"
                      >
                        {SOS_STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function Badge({ text, className }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      {text}
    </span>
  );
}

function MiniStat({ text }) {
  return (
    <div className="rounded-[18px] border border-white bg-white px-4 py-3 text-sm text-slate-600">
      {text}
    </div>
  );
}

function AnswerBlock({ label, value }) {
  return (
    <div className="rounded-[18px] border border-white bg-white px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}
