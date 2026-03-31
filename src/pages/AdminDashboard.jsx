import React, { useEffect, useMemo, useState } from "react";
import { collection, collectionGroup, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { AlertTriangle, BookOpen, EyeOff, LifeBuoy, Loader2, ShieldCheck, Users } from "lucide-react";
import { db } from "../lib/firebase";
import { teacherCourseData } from "../data/teacherCourse";
import { getSosApprovalMeta, getSosLevelMeta, getSosWorkflowStatusMeta, SOS_APPROVAL_OPTIONS, SOS_WORKFLOW_STATUS_OPTIONS } from "../data/sosLevels";
import { buildSosCategorySummary, buildSosTagSummary } from "../data/sosTaxonomy";
import { getRoleLabel } from "../data/profileOptions";
import { formatLastSeenLabel, isUserCurrentlyOnline } from "../lib/presence";

const TOTAL_TEACHER_LESSONS = teacherCourseData.modules.reduce((sum, module) => sum + module.lessons.length, 0);

function shortenText(value, fallback = "ยังไม่มีข้อมูล", limit = 160) {
  const text = value?.trim();
  if (!text) return fallback;
  return text.length <= limit ? text : `${text.slice(0, limit)}...`;
}

function getTimestampValue(value) {
  return value?.toMillis?.() || new Date(value || 0).getTime() || 0;
}

function sortTickets(items) {
  return [...items].sort((left, right) => {
    if (left.approvalStatus !== right.approvalStatus) {
      if (left.approvalStatus === "pending") return -1;
      if (right.approvalStatus === "pending") return 1;
    }
    if (left.workflowStatus !== right.workflowStatus) {
      if (left.workflowStatus === "resolved") return 1;
      if (right.workflowStatus === "resolved") return -1;
    }
    if ((left.levelPriority || 99) !== (right.levelPriority || 99)) {
      return (left.levelPriority || 99) - (right.levelPriority || 99);
    }
    return getTimestampValue(right.createdAt) - getTimestampValue(left.createdAt);
  });
}

function buildTeacherSummary(enrollment, user, presence) {
  const profile = user || {};
  const live = presence || {};
  const courseState = enrollment.courseState || {};
  const survey = courseState.survey || {};
  const completedLessons = enrollment.completedLessons || [];
  const activePresence = live.lastSeen ? live : profile;

  return {
    id: `${enrollment.userId || "unknown"}-teacher`,
    name: profile.name || live.name || profile.email || "ผู้ใช้งานไม่ระบุชื่อ",
    photoURL: live.photoURL || profile.photoURL || "",
    role: profile.role || live.role || "learner",
    school: profile.school || "ยังไม่ได้ระบุ",
    isOnline: isUserCurrentlyOnline(activePresence),
    lastSeen: activePresence.lastSeen,
    progressPercent: TOTAL_TEACHER_LESSONS ? Math.round((completedLessons.length / TOTAL_TEACHER_LESSONS) * 100) : 0,
    badges: enrollment.badges || [],
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
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [presence, setPresence] = useState([]);
  const [teacherEnrollments, setTeacherEnrollments] = useState([]);
  const [sosTickets, setSosTickets] = useState([]);
  const [updatingPath, setUpdatingPath] = useState("");
  const [ready, setReady] = useState({ users: false, presence: false, enrollments: false, sos: false });

  const loading = !Object.values(ready).every(Boolean);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((docSnapshot) => ({ uid: docSnapshot.id, ...docSnapshot.data() })));
      setReady((previous) => ({ ...previous, users: true }));
    }, (error) => {
      console.error("Error loading users:", error);
      setReady((previous) => ({ ...previous, users: true }));
    });

    const unsubPresence = onSnapshot(collection(db, "presence"), (snapshot) => {
      setPresence(snapshot.docs.map((docSnapshot) => ({ uid: docSnapshot.id, ...docSnapshot.data() })));
      setReady((previous) => ({ ...previous, presence: true }));
    }, (error) => {
      console.error("Error loading presence:", error);
      setReady((previous) => ({ ...previous, presence: true }));
    });

    const unsubEnrollments = onSnapshot(collectionGroup(db, "enrollments"), (snapshot) => {
      setTeacherEnrollments(
        snapshot.docs
          .filter((docSnapshot) => docSnapshot.id === "course-teacher" || docSnapshot.data().courseId === "course-teacher")
          .map((docSnapshot) => ({ userId: docSnapshot.ref.parent.parent?.id || "", ...docSnapshot.data() })),
      );
      setReady((previous) => ({ ...previous, enrollments: true }));
    }, (error) => {
      console.error("Error loading teacher enrollments:", error);
      setReady((previous) => ({ ...previous, enrollments: true }));
    });

    const unsubSos = onSnapshot(collectionGroup(db, "sosTickets"), (snapshot) => {
      setSosTickets(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, path: docSnapshot.ref.path, ...docSnapshot.data() })));
      setReady((previous) => ({ ...previous, sos: true }));
    }, (error) => {
      console.error("Error loading SOS tickets:", error);
      setReady((previous) => ({ ...previous, sos: true }));
    });

    return () => {
      unsubUsers();
      unsubPresence();
      unsubEnrollments();
      unsubSos();
    };
  }, []);

  const usersById = useMemo(() => new Map(users.map((user) => [user.uid, user])), [users]);
  const presenceById = useMemo(() => new Map(presence.map((item) => [item.uid, item])), [presence]);

  const teacherSummaries = useMemo(
    () => teacherEnrollments.map((enrollment) => buildTeacherSummary(enrollment, usersById.get(enrollment.userId), presenceById.get(enrollment.userId))).sort((left, right) => right.progressPercent - left.progressPercent),
    [presenceById, teacherEnrollments, usersById],
  );

  const filteredSummaries = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return teacherSummaries;
    return teacherSummaries.filter((summary) => [summary.name, summary.school, summary.module1Problem, summary.module4Innovation].join(" ").toLowerCase().includes(keyword));
  }, [searchTerm, teacherSummaries]);

  const sortedSosTickets = useMemo(() => sortTickets(sosTickets), [sosTickets]);
  const categorySummary = useMemo(() => buildSosCategorySummary(sosTickets), [sosTickets]);
  const tagSummary = useMemo(() => buildSosTagSummary(sosTickets).slice(0, 10), [sosTickets]);

  const stats = useMemo(() => {
    const onlineCount = presence.filter((item) => isUserCurrentlyOnline(item)).length;
    const pending = sosTickets.filter((ticket) => ticket.approvalStatus === "pending").length;
    const active = sosTickets.filter((ticket) => ticket.workflowStatus !== "resolved").length;
    return [
      { label: "ผู้ใช้งานทั้งหมด", value: users.length, icon: <Users size={18} /> },
      { label: "ออนไลน์ตอนนี้", value: onlineCount, icon: <ShieldCheck size={18} /> },
      { label: "ครูใน InSPIRE 360", value: teacherSummaries.length, icon: <BookOpen size={18} /> },
      { label: "SOS รออนุมัติ / เปิดอยู่", value: `${pending} / ${active}`, icon: <LifeBuoy size={18} /> },
    ];
  }, [presence, sosTickets, teacherSummaries.length, users.length]);

  const handleTicketUpdate = async (ticket, patch) => {
    setUpdatingPath(ticket.path);
    try {
      const nextApprovalStatus = patch.approvalStatus || ticket.approvalStatus;
      const nextWorkflowStatus = patch.workflowStatus || (patch.approvalStatus === "approved" && ticket.workflowStatus === "submitted" ? "in_review" : ticket.workflowStatus);
      await setDoc(doc(db, ticket.path), {
        ...patch,
        workflowStatus: nextWorkflowStatus,
        updatedAt: serverTimestamp(),
        ...(nextApprovalStatus === "approved" ? { approvedAt: serverTimestamp() } : {}),
        ...(nextApprovalStatus === "rejected" ? { rejectedAt: serverTimestamp() } : {}),
        ...(nextWorkflowStatus === "resolved" ? { resolvedAt: serverTimestamp() } : {}),
      }, { merge: true });
    } catch (error) {
      console.error("Error updating SOS ticket:", error);
    } finally {
      setUpdatingPath("");
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 size={36} className="animate-spin text-white" /></div>;
  }

  return (
    <div className="page-wrap space-y-6">
      <section className="dark-panel p-6 sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200">Admin Backend</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.08em] text-white">ศูนย์จัดการผู้ใช้ คำตอบโมดูล และ SOS</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">รวมข้อมูลผู้ใช้, สถานะออนไลน์, คำตอบจากแต่ละโมดูลของครู และคิว SOS แบบเรียลไทม์ในหน้าเดียว</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => <div key={stat.label} className="rounded-[24px] border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-2 text-amber-200">{stat.icon}<span className="text-xs uppercase tracking-[0.24em]">{stat.label}</span></div><div className="mt-3 font-display text-3xl font-semibold tracking-[-0.06em] text-white">{stat.value}</div></div>)}
        </div>
      </section>

      <section className="surface-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">User Module Answers</p>
            <h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">สรุปคำตอบและความคืบหน้าของครู</h3>
          </div>
          <input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="field-input max-w-md" placeholder="ค้นหาจากชื่อ โรงเรียน หรือคำสำคัญ" />
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {filteredSummaries.map((summary) => {
            const avatarUrl = summary.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(summary.name)}&background=0f172a&color=fff`;
            return (
              <article key={summary.id} className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <img src={avatarUrl} alt={summary.name} className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white" referrerPolicy="no-referrer" />
                  <Chip className="border-slate-200 bg-white text-slate-700">{summary.name}</Chip>
                  <Chip className="border-sky-200 bg-sky-50 text-sky-700">{getRoleLabel(summary.role)}</Chip>
                  <Chip className={summary.isOnline ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}>{summary.isOnline ? "ออนไลน์" : formatLastSeenLabel(summary.lastSeen)}</Chip>
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
            );
          })}
        </div>
      </section>

      <section className="surface-panel p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-red-50 p-3 text-red-600"><AlertTriangle size={22} /></div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">SOS Analytics</p>
            <h3 className="mt-1 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">สรุปหมวดหมู่และแท็กปัญหา</h3>
          </div>
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">ภาพรวมตามหมวดหมู่</p><div className="mt-3 flex flex-wrap gap-2">{categorySummary.length > 0 ? categorySummary.map((item) => <Chip key={item.id} className="border-slate-200 bg-white text-slate-700">{item.icon} {item.shortLabel} {item.count}</Chip>) : <span className="text-sm text-slate-500">ยังไม่มีข้อมูล SOS</span>}</div></div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">แท็กที่พบบ่อย</p><div className="mt-3 flex flex-wrap gap-2">{tagSummary.length > 0 ? tagSummary.map((item) => <Chip key={item.key} className="border-slate-200 bg-white text-slate-700">{item.categoryLabel}: {item.label} ({item.count})</Chip>) : <span className="text-sm text-slate-500">ยังไม่มีแท็กสรุป</span>}</div></div>
        </div>
      </section>

      <section className="surface-panel p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-red-50 p-3 text-red-600"><LifeBuoy size={22} /></div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">SOS Inbox</p>
            <h3 className="mt-1 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">อนุมัติ จัดคิว และปิดเรื่อง</h3>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {sortedSosTickets.map((ticket) => {
            const busy = updatingPath === ticket.path;
            const levelMeta = getSosLevelMeta(ticket.level);
            const approvalMeta = getSosApprovalMeta(ticket.approvalStatus);
            const workflowMeta = getSosWorkflowStatusMeta(ticket.workflowStatus);
            return (
              <article key={ticket.path} className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <Chip className={levelMeta.badgeClass}>ระดับ {levelMeta.priority} {levelMeta.label}</Chip>
                      <Chip className={approvalMeta.badgeClass}>{approvalMeta.label}</Chip>
                      <Chip className={workflowMeta.badgeClass}>{workflowMeta.label}</Chip>
                      <Chip className="border-slate-200 bg-white text-slate-700">{ticket.categoryShortLabel || ticket.categoryLabel}</Chip>
                      <Chip className="border-slate-200 bg-white text-slate-700">{ticket.tagLabel || "ยังไม่ระบุแท็ก"}</Chip>
                      {ticket.isSensitive && <Chip className="border-slate-900 bg-slate-950 text-white">ลับ</Chip>}
                      {ticket.anonymous && <Chip className="border-slate-200 bg-slate-100 text-slate-700">Anonymous</Chip>}
                    </div>
                    <h4 className="mt-4 font-display text-2xl font-semibold text-slate-950">{ticket.title}</h4>
                    <p className="mt-3 text-sm leading-8 text-slate-600">{ticket.details}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <MiniStat text={`ผู้แจ้ง ${ticket.userName || "ไม่ระบุชื่อ"}`} />
                      <MiniStat text={`บทบาท ${getRoleLabel(ticket.userRole || "learner")}`} />
                      <MiniStat text={`โรงเรียน ${ticket.school || "ยังไม่ได้ระบุ"}`} />
                      <MiniStat text={`ล่าสุด ${formatLastSeenLabel(ticket.updatedAt || ticket.createdAt)}`} />
                    </div>
                    {ticket.isSensitive && <div className="mt-4 rounded-[18px] border border-slate-900/10 bg-slate-950 px-4 py-3 text-sm leading-7 text-white"><span className="inline-flex items-center gap-2 font-semibold"><EyeOff size={15} />เรื่องนี้เป็นข้อมูลลับ</span><p className="mt-2 text-slate-300">จะไม่ถูกแสดงบนบอร์ดสาธารณะ แม้ได้รับการอนุมัติแล้ว</p></div>}
                  </div>
                  <div className="w-full max-w-[280px] space-y-4">
                    <div>
                      <label className="field-label">การอนุมัติ</label>
                      <select value={ticket.approvalStatus || "pending"} disabled={busy} onChange={(event) => handleTicketUpdate(ticket, { approvalStatus: event.target.value })} className="field-select">
                        {SOS_APPROVAL_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="field-label">ขั้นตอนดำเนินงาน</label>
                      <select value={ticket.workflowStatus || "submitted"} disabled={busy} onChange={(event) => handleTicketUpdate(ticket, { workflowStatus: event.target.value })} className="field-select">
                        {SOS_WORKFLOW_STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                      </select>
                    </div>
                    <button type="button" disabled={busy} onClick={() => handleTicketUpdate(ticket, { approvalStatus: "approved", workflowStatus: "in_review" })} className="secondary-button w-full justify-center">อนุมัติเรื่อง</button>
                    <button type="button" disabled={busy} onClick={() => handleTicketUpdate(ticket, { approvalStatus: "approved", workflowStatus: "resolved" })} className="primary-button w-full justify-center">{busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}ปิดเรื่อง</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Chip({ children, className }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function MiniStat({ text }) {
  return <div className="rounded-[18px] border border-white bg-white px-4 py-3 text-sm leading-7 text-slate-600">{text}</div>;
}

function AnswerBlock({ label, value }) {
  return <div className="rounded-[18px] border border-white bg-white px-4 py-3"><p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</p><p className="mt-2 text-sm leading-7 text-slate-700">{value}</p></div>;
}
