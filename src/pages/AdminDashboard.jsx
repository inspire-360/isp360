import React, { useEffect, useMemo, useState } from "react";
import { collection, collectionGroup, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { AlertTriangle, BookOpen, EyeOff, GraduationCap, LifeBuoy, Loader2, ShieldCheck, UserCog, Users, Wifi } from "lucide-react";
import { db } from "../lib/firebase";
import { courseCatalog } from "../data/courseCatalog";
import { getRoleLabel } from "../data/profileOptions";
import { buildSosCategorySummary, buildSosTagSummary } from "../data/sosTaxonomy";
import { getSosApprovalMeta, getSosLevelMeta, getSosWorkflowStatusMeta, SOS_APPROVAL_OPTIONS, SOS_WORKFLOW_STATUS_OPTIONS } from "../data/sosLevels";
import { formatLastSeenLabel, isUserCurrentlyOnline } from "../lib/presence";
import { buildTeacherModuleStatuses, getTeacherCourseProgressPercent, getTeacherCourseStatus, TOTAL_TEACHER_LESSONS } from "../lib/teacherCourseHelpers";

const ROLE_OPTIONS = ["learner", "teacher", "admin"];
const COURSE_STATUS_META = {
  active: "border-sky-200 bg-sky-50 text-sky-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};
const MODULE_STATUS_META = {
  active: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  locked: "border-slate-200 bg-slate-100 text-slate-600",
};

function getTimestampValue(value) {
  return value?.toMillis?.() || new Date(value || 0).getTime() || 0;
}

function shortenText(value, fallback = "ยังไม่มีข้อมูล", limit = 120) {
  const text = value?.trim();
  if (!text) return fallback;
  return text.length <= limit ? text : `${text.slice(0, limit)}...`;
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
    return getTimestampValue(right.createdAt) - getTimestampValue(left.createdAt);
  });
}

function avatar(name, photoURL) {
  return photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=0f172a&color=fff`;
}

function Chip({ className, children }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function MiniStat({ text }) {
  return <div className="rounded-[18px] border border-white bg-white px-4 py-3 text-sm leading-7 text-slate-600">{text}</div>;
}

function AnswerBlock({ label, value }) {
  return <div className="rounded-[18px] border border-white bg-white px-4 py-3"><p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</p><p className="mt-2 text-sm leading-7 text-slate-700">{value}</p></div>;
}

export default function AdminDashboard() {
  const [userSearch, setUserSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [presence, setPresence] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [sosTickets, setSosTickets] = useState([]);
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [updatingTicketPath, setUpdatingTicketPath] = useState("");
  const [ready, setReady] = useState({ users: false, presence: false, enrollments: false, sos: false });

  const loading = !Object.values(ready).every(Boolean);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((item) => ({ uid: item.id, ...item.data() })));
      setReady((prev) => ({ ...prev, users: true }));
    }, () => setReady((prev) => ({ ...prev, users: true })));
    const unsubPresence = onSnapshot(collection(db, "presence"), (snapshot) => {
      setPresence(snapshot.docs.map((item) => ({ uid: item.id, ...item.data() })));
      setReady((prev) => ({ ...prev, presence: true }));
    }, () => setReady((prev) => ({ ...prev, presence: true })));
    const unsubEnrollments = onSnapshot(collectionGroup(db, "enrollments"), (snapshot) => {
      setEnrollments(snapshot.docs.map((item) => ({ id: item.id, path: item.ref.path, userId: item.ref.parent.parent?.id || "", ...item.data() })));
      setReady((prev) => ({ ...prev, enrollments: true }));
    }, () => setReady((prev) => ({ ...prev, enrollments: true })));
    const unsubSos = onSnapshot(collectionGroup(db, "sosTickets"), (snapshot) => {
      setSosTickets(snapshot.docs.map((item) => ({ id: item.id, path: item.ref.path, ...item.data() })));
      setReady((prev) => ({ ...prev, sos: true }));
    }, () => setReady((prev) => ({ ...prev, sos: true })));
    return () => {
      unsubUsers();
      unsubPresence();
      unsubEnrollments();
      unsubSos();
    };
  }, []);

  const usersById = useMemo(() => new Map(users.map((item) => [item.uid, item])), [users]);
  const presenceById = useMemo(() => new Map(presence.map((item) => [item.uid, item])), [presence]);
  const enrollmentsByUserId = useMemo(() => enrollments.reduce((map, item) => {
    const current = map.get(item.userId) || [];
    current.push(item);
    map.set(item.userId, current);
    return map;
  }, new Map()), [enrollments]);

  const userDirectory = useMemo(() => {
    const ids = [...new Set([...users.map((item) => item.uid), ...presence.map((item) => item.uid)])];
    return ids.map((uid) => {
      const user = usersById.get(uid) || {};
      const live = presenceById.get(uid) || {};
      const source = live.lastSeen ? live : user;
      const userEnrollments = enrollmentsByUserId.get(uid) || [];
      return {
        uid,
        name: user.name || live.name || user.email || "ผู้ใช้ยังไม่ได้ระบุชื่อ",
        email: user.email || "",
        school: user.school || "ยังไม่ได้ระบุ",
        position: user.position || "ยังไม่ได้ระบุ",
        role: user.role || live.role || "learner",
        photoURL: live.photoURL || user.photoURL || "",
        isOnline: isUserCurrentlyOnline(source),
        lastSeen: source.lastSeen,
        enrolledCount: userEnrollments.length,
        completedCourses: userEnrollments.filter((item) => item.status === "completed").length,
      };
    }).sort((left, right) => {
      if (left.isOnline !== right.isOnline) return left.isOnline ? -1 : 1;
      return left.name.localeCompare(right.name, "th");
    });
  }, [enrollmentsByUserId, presence, presenceById, users, usersById]);

  const filteredUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase();
    if (!keyword) return userDirectory;
    return userDirectory.filter((item) => [item.name, item.email, item.school, item.position, getRoleLabel(item.role)].join(" ").toLowerCase().includes(keyword));
  }, [userDirectory, userSearch]);

  const onlineUsers = useMemo(() => userDirectory.filter((item) => item.isOnline), [userDirectory]);
  const teacherEnrollments = useMemo(() => enrollments.filter((item) => (item.courseId || item.id) === "course-teacher"), [enrollments]);
  const teacherSummaries = useMemo(() => teacherEnrollments.map((item) => {
    const user = usersById.get(item.userId) || {};
    const live = presenceById.get(item.userId) || {};
    const courseState = item.courseState || {};
    const completedLessons = item.completedLessons || [];
    return {
      id: item.userId,
      name: user.name || live.name || user.email || "ผู้ใช้ยังไม่ได้ระบุชื่อ",
      photoURL: live.photoURL || user.photoURL || "",
      role: user.role || live.role || "learner",
      school: user.school || "ยังไม่ได้ระบุ",
      isOnline: isUserCurrentlyOnline(live.lastSeen ? live : user),
      lastSeen: (live.lastSeen ? live : user).lastSeen,
      progressPercent: typeof item.progress === "number" ? item.progress : getTeacherCourseProgressPercent(completedLessons),
      courseStatus: item.status || getTeacherCourseStatus(completedLessons),
      badges: item.badges || [],
      moduleStatuses: Array.isArray(item.moduleStatuses) && item.moduleStatuses.length > 0 ? item.moduleStatuses : buildTeacherModuleStatuses(completedLessons),
      module1Problem: shortenText(courseState.module1?.insightCard?.coreProblem),
      module2Goal: shortenText(courseState.module2?.smartGoal?.specific),
      module3Topic: shortenText(courseState.module3?.meetingTopic),
      module4Innovation: shortenText(courseState.module4?.innovationName),
      module5Growth: shortenText(courseState.module5?.nextGrowthPlan),
    };
  }).sort((left, right) => right.progressPercent - left.progressPercent), [presenceById, teacherEnrollments, usersById]);

  const filteredTeacherSummaries = useMemo(() => {
    const keyword = teacherSearch.trim().toLowerCase();
    if (!keyword) return teacherSummaries;
    return teacherSummaries.filter((item) => [item.name, item.school, item.module1Problem, item.module4Innovation, item.module5Growth].join(" ").toLowerCase().includes(keyword));
  }, [teacherSearch, teacherSummaries]);

  const courseStats = useMemo(() => courseCatalog.map((course) => {
    const items = enrollments.filter((enrollment) => (enrollment.courseId || enrollment.id) === course.id);
    return {
      ...course,
      enrolledCount: items.length,
      activeCount: items.filter((item) => (item.status || "active") !== "completed").length,
      completedCount: items.filter((item) => item.status === "completed").length,
    };
  }), [enrollments]);

  const categorySummary = useMemo(() => buildSosCategorySummary(sosTickets), [sosTickets]);
  const tagSummary = useMemo(() => buildSosTagSummary(sosTickets).slice(0, 10), [sosTickets]);
  const sortedTickets = useMemo(() => sortTickets(sosTickets), [sosTickets]);

  const stats = [
    { label: "ผู้ใช้ทั้งหมด", value: userDirectory.length, icon: <Users size={18} /> },
    { label: "ออนไลน์ตอนนี้", value: onlineUsers.length, icon: <Wifi size={18} /> },
    { label: "ผู้ดูแลระบบ", value: userDirectory.filter((item) => item.role === "admin").length, icon: <UserCog size={18} /> },
    { label: "ลงทะเบียนคอร์สทั้งหมด", value: enrollments.length, icon: <GraduationCap size={18} /> },
    { label: "SOS รออนุมัติ", value: sosTickets.filter((item) => item.approvalStatus === "pending").length, icon: <LifeBuoy size={18} /> },
    { label: "ครูที่เรียนจบแล้ว", value: teacherEnrollments.filter((item) => (item.status || "active") === "completed").length, icon: <BookOpen size={18} /> },
  ];

  const handleRoleUpdate = async (user, role) => {
    setUpdatingUserId(user.uid);
    try {
      await setDoc(doc(db, "users", user.uid), { uid: user.uid, name: user.name, email: user.email || "", school: user.school !== "ยังไม่ได้ระบุ" ? user.school : "", position: user.position !== "ยังไม่ได้ระบุ" ? user.position : "", photoURL: user.photoURL || "", role, updatedAt: serverTimestamp() }, { merge: true });
      await setDoc(doc(db, "presence", user.uid), { uid: user.uid, name: user.name, photoURL: user.photoURL || "", role, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setUpdatingUserId("");
    }
  };

  const handleTicketUpdate = async (ticket, patch) => {
    setUpdatingTicketPath(ticket.path);
    try {
      const approvalStatus = patch.approvalStatus || ticket.approvalStatus;
      const workflowStatus = patch.workflowStatus || (patch.approvalStatus === "approved" && ticket.workflowStatus === "submitted" ? "in_review" : ticket.workflowStatus);
      await setDoc(doc(db, ticket.path), { ...patch, workflowStatus, updatedAt: serverTimestamp(), ...(approvalStatus === "approved" ? { approvedAt: serverTimestamp() } : {}), ...(approvalStatus === "rejected" ? { rejectedAt: serverTimestamp() } : {}), ...(workflowStatus === "resolved" ? { resolvedAt: serverTimestamp() } : {}) }, { merge: true });
    } catch (error) {
      console.error("Error updating SOS ticket:", error);
    } finally {
      setUpdatingTicketPath("");
    }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 size={36} className="animate-spin text-white" /></div>;

  return (
    <div className="page-wrap space-y-6">
      <section className="dark-panel p-6 sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200">Admin Control Center</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.08em] text-white">ศูนย์จัดการระบบ ผู้ใช้ คอร์ส และ SOS</h2>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-300">หน้า Admin นี้เชื่อมกับ Firebase โดยตรงเพื่อให้ผู้ดูแลระบบกำหนดบทบาทผู้ใช้ ตรวจสอบความคืบหน้าคอร์ส อนุมัติ SOS และมองเห็นผู้ใช้ที่ออนไลน์จริงแบบเรียลไทม์</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{stats.map((stat) => <div key={stat.label} className="rounded-[24px] border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-2 text-amber-200">{stat.icon}<span className="text-xs uppercase tracking-[0.24em]">{stat.label}</span></div><div className="mt-3 font-display text-3xl font-semibold tracking-[-0.06em] text-white">{stat.value}</div></div>)}</div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="surface-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">User Management</p><h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">จัดการผู้ใช้และบทบาท</h3></div>
            <input type="text" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} className="field-input max-w-md" placeholder="ค้นหาชื่อ อีเมล โรงเรียน หรือตำแหน่ง" />
          </div>
          <div className="mt-6 grid gap-4">{filteredUsers.map((user) => <article key={user.uid} className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><img src={avatar(user.name, user.photoURL)} alt={user.name} className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white" referrerPolicy="no-referrer" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="font-display text-2xl font-semibold text-slate-950">{user.name}</h4><Chip className={user.isOnline ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}>{user.isOnline ? "ออนไลน์" : formatLastSeenLabel(user.lastSeen)}</Chip><Chip className="border-slate-200 bg-white text-slate-700">{getRoleLabel(user.role)}</Chip></div><p className="mt-2 text-sm leading-7 text-slate-600">{user.email || "ยังไม่ได้ระบุอีเมล"}</p></div></div><div className="w-full max-w-[240px]"><label className="field-label">บทบาทผู้ใช้</label><select value={user.role} disabled={updatingUserId === user.uid} onChange={(event) => handleRoleUpdate(user, event.target.value)} className="field-select">{ROLE_OPTIONS.map((role) => <option key={role} value={role}>{getRoleLabel(role)}</option>)}</select></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MiniStat text={`โรงเรียน ${user.school}`} /><MiniStat text={`ตำแหน่ง ${user.position}`} /><MiniStat text={`คอร์สที่ลงทะเบียน ${user.enrolledCount}`} /><MiniStat text={`คอร์สที่เรียนจบ ${user.completedCourses}`} /></div></article>)}</div>
        </div>

        <div className="surface-panel p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Presence</p>
          <h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">ผู้ใช้ที่ออนไลน์อยู่จริง</h3>
          <div className="mt-6 space-y-3">{onlineUsers.length > 0 ? onlineUsers.map((user) => <div key={user.uid} className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3"><img src={avatar(user.name, user.photoURL)} alt={user.name} className="h-11 w-11 rounded-2xl object-cover ring-2 ring-white" referrerPolicy="no-referrer" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-950">{user.name}</p><div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500"><span>{getRoleLabel(user.role)}</span><span>{user.school}</span></div></div><div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Online</div></div>) : <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-500">ยังไม่มีผู้ใช้ที่ออนไลน์อยู่ในขณะนี้</div>}</div>
        </div>
      </section>

      <section className="surface-panel p-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Course Operations</p>
        <h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">ภาพรวมการลงทะเบียนและสถานะคอร์ส</h3>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">{courseStats.map((course) => <article key={course.id} className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"><p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{course.shortTitle}</p><h3 className="mt-2 font-display text-2xl font-semibold text-slate-950">{course.title}</h3><div className="mt-5 grid gap-3"><MiniStat text={`ลงทะเบียน ${course.enrolledCount} คน`} /><MiniStat text={`กำลังเรียน ${course.activeCount} คน`} /><MiniStat text={`เรียนจบ ${course.completedCount} คน`} /></div></article>)}</div>
      </section>

      <section className="surface-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Teacher Module Answers</p><h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">สรุปคำตอบและสถานะโมดูลของครู</h3><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">ติดตามความคืบหน้า {TOTAL_TEACHER_LESSONS} ขั้นตอนของ InSPIRE 360 for Teacher พร้อมคำตอบสำคัญจากแต่ละโมดูล</p></div><input type="text" value={teacherSearch} onChange={(event) => setTeacherSearch(event.target.value)} className="field-input max-w-md" placeholder="ค้นหาชื่อ โรงเรียน หรือคำตอบสำคัญ" /></div>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">{filteredTeacherSummaries.map((summary) => <article key={summary.id} className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"><div className="flex flex-wrap items-center gap-3"><img src={avatar(summary.name, summary.photoURL)} alt={summary.name} className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white" referrerPolicy="no-referrer" /><Chip className="border-slate-200 bg-white text-slate-700">{summary.name}</Chip><Chip className="border-sky-200 bg-sky-50 text-sky-700">{getRoleLabel(summary.role)}</Chip><Chip className={COURSE_STATUS_META[summary.courseStatus] || COURSE_STATUS_META.active}>{summary.courseStatus === "completed" ? "เรียนจบแล้ว" : "กำลังเรียน"}</Chip><Chip className={summary.isOnline ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}>{summary.isOnline ? "ออนไลน์" : formatLastSeenLabel(summary.lastSeen)}</Chip></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><MiniStat text={`ความคืบหน้า ${summary.progressPercent}%`} /><MiniStat text={`โรงเรียน ${summary.school}`} /><MiniStat text={`Badge ${summary.badges.length} รายการ`} /></div><div className="mt-4 flex flex-wrap gap-2">{summary.moduleStatuses.map((module) => <Chip key={module.id} className={MODULE_STATUS_META[module.status] || MODULE_STATUS_META.locked}>{module.title} {module.completedLessons}/{module.totalLessons}</Chip>)}</div><div className="mt-4 space-y-3"><AnswerBlock label="Module 1 ปัญหาแกนหลัก" value={summary.module1Problem} /><AnswerBlock label="Module 2 SMART Goal" value={summary.module2Goal} /><AnswerBlock label="Module 3 PLC Topic" value={summary.module3Topic} /><AnswerBlock label="Module 4 Innovation" value={summary.module4Innovation} /><AnswerBlock label="Module 5 Next Growth Plan" value={summary.module5Growth} /></div></article>)}</div>
      </section>

      <section className="surface-panel p-6">
        <div className="flex items-center gap-3"><div className="rounded-2xl bg-red-50 p-3 text-red-600"><AlertTriangle size={22} /></div><div><p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">SOS Analytics</p><h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">สรุปหมวดหมู่และแท็กปัญหา</h3></div></div>
        <div className="mt-6 grid gap-4 xl:grid-cols-2"><div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">ภาพรวมตามหมวดหมู่</p><div className="mt-3 flex flex-wrap gap-2">{categorySummary.length > 0 ? categorySummary.map((item) => <Chip key={item.id} className="border-slate-200 bg-white text-slate-700">{item.icon} {item.shortLabel} {item.count}</Chip>) : <span className="text-sm text-slate-500">ยังไม่มีข้อมูล SOS</span>}</div></div><div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">แท็กที่พบบ่อย</p><div className="mt-3 flex flex-wrap gap-2">{tagSummary.length > 0 ? tagSummary.map((item) => <Chip key={item.key} className="border-slate-200 bg-white text-slate-700">{item.categoryLabel} / {item.groupLabel}: {item.label} ({item.count})</Chip>) : <span className="text-sm text-slate-500">ยังไม่มีแท็กสรุป</span>}</div></div></div>
      </section>

      <section className="surface-panel p-6">
        <div className="flex items-center gap-3"><div className="rounded-2xl bg-red-50 p-3 text-red-600"><LifeBuoy size={22} /></div><div><p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">SOS Inbox</p><h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">อนุมัติ จัดคิว และปิดเรื่อง</h3></div></div>
        <div className="mt-6 space-y-4">{sortedTickets.map((ticket) => { const busy = updatingTicketPath === ticket.path; const levelMeta = getSosLevelMeta(ticket.level); const approvalMeta = getSosApprovalMeta(ticket.approvalStatus); const workflowMeta = getSosWorkflowStatusMeta(ticket.workflowStatus); return <article key={ticket.path} className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><Chip className={levelMeta.badgeClass}>ระดับ {levelMeta.priority} {levelMeta.label}</Chip><Chip className={approvalMeta.badgeClass}>{approvalMeta.label}</Chip><Chip className={workflowMeta.badgeClass}>{workflowMeta.label}</Chip><Chip className="border-slate-200 bg-white text-slate-700">{ticket.categoryShortLabel || ticket.categoryLabel}</Chip>{ticket.groupShortLabel || ticket.groupLabel ? <Chip className="border-slate-200 bg-white text-slate-700">{ticket.groupShortLabel || ticket.groupLabel}</Chip> : null}<Chip className="border-slate-200 bg-white text-slate-700">{ticket.tagLabel || "ยังไม่ได้ระบุแท็ก"}</Chip>{ticket.isSensitive && <Chip className="border-slate-900 bg-slate-950 text-white">ลับ</Chip>}{ticket.anonymous && <Chip className="border-slate-200 bg-slate-100 text-slate-700">Anonymous</Chip>}</div><h4 className="mt-4 font-display text-2xl font-semibold text-slate-950">{ticket.title}</h4><p className="mt-3 text-sm leading-8 text-slate-600">{ticket.details}</p><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MiniStat text={`ผู้แจ้ง ${ticket.userName || "ไม่ระบุชื่อ"}`} /><MiniStat text={`บทบาท ${getRoleLabel(ticket.userRole || "learner")}`} /><MiniStat text={`โรงเรียน ${ticket.school || "ยังไม่ได้ระบุ"}`} /><MiniStat text={`อัปเดตล่าสุด ${formatLastSeenLabel(ticket.updatedAt || ticket.createdAt)}`} /></div>{ticket.isSensitive && <div className="mt-4 rounded-[18px] border border-slate-900/10 bg-slate-950 px-4 py-3 text-sm leading-7 text-white"><span className="inline-flex items-center gap-2 font-semibold"><EyeOff size={15} />เรื่องนี้เป็นข้อมูลลับ</span><p className="mt-2 text-slate-300">จะไม่แสดงบนบอร์ดสาธารณะแม้ได้รับการอนุมัติแล้ว</p></div>}</div><div className="w-full max-w-[280px] space-y-4"><div><label className="field-label">การอนุมัติ</label><select value={ticket.approvalStatus || "pending"} disabled={busy} onChange={(event) => handleTicketUpdate(ticket, { approvalStatus: event.target.value })} className="field-select">{SOS_APPROVAL_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div><div><label className="field-label">ขั้นตอนดำเนินงาน</label><select value={ticket.workflowStatus || "submitted"} disabled={busy} onChange={(event) => handleTicketUpdate(ticket, { workflowStatus: event.target.value })} className="field-select">{SOS_WORKFLOW_STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div><button type="button" disabled={busy} onClick={() => handleTicketUpdate(ticket, { approvalStatus: "approved", workflowStatus: "in_review" })} className="secondary-button w-full justify-center">อนุมัติเรื่อง</button><button type="button" disabled={busy} onClick={() => handleTicketUpdate(ticket, { approvalStatus: "approved", workflowStatus: "resolved" })} className="primary-button w-full justify-center">{busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}ปิดเรื่อง</button></div></div></article>; })}</div>
      </section>
    </div>
  );
}
