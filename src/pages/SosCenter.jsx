import React, { useEffect, useMemo, useState } from "react";
import { addDoc, collection, collectionGroup, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { AlertTriangle, EyeOff, LifeBuoy, Loader2, Send, Tags } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { getRoleLabel } from "../data/profileOptions";
import { formatLastSeenLabel } from "../lib/presence";
import { getSosApprovalMeta, getSosLevelMeta, getSosWorkflowStatusMeta, SOS_LEVELS } from "../data/sosLevels";
import {
  buildSosCategorySummary,
  buildSosTagSummary,
  getSosCategoryMeta,
  getSosTagMeta,
  getSosTagOptions,
  isPublicSosTicket,
  normalizeSosVisibility,
  SOS_CATEGORIES,
} from "../data/sosTaxonomy";

const INITIAL_FORM = {
  level: "yellow",
  categoryId: SOS_CATEGORIES[0].id,
  tagId: SOS_CATEGORIES[0].tags[0].id,
  title: "",
  details: "",
  preferredContact: "",
  anonymous: false,
};

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

export default function SosCenter() {
  const { currentUser, userRole } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [publicTickets, setPublicTickets] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [ready, setReady] = useState({ profile: false, mine: false, board: false });

  const selectedCategory = useMemo(() => getSosCategoryMeta(form.categoryId), [form.categoryId]);
  const tagOptions = useMemo(() => getSosTagOptions(form.categoryId), [form.categoryId]);
  const selectedTag = useMemo(() => getSosTagMeta(form.categoryId, form.tagId), [form.categoryId, form.tagId]);
  const loading = !Object.values(ready).every(Boolean);

  useEffect(() => {
    if (!tagOptions.some((tag) => tag.id === form.tagId)) {
      setForm((previous) => ({
        ...previous,
        tagId: tagOptions[0]?.id || "",
        anonymous: selectedCategory.sensitive ? true : previous.anonymous,
      }));
    }
  }, [form.tagId, selectedCategory.sensitive, tagOptions]);

  useEffect(() => {
    if (!currentUser) return undefined;

    const unsubProfile = onSnapshot(
      doc(db, "users", currentUser.uid),
      (snapshot) => {
        setProfile(snapshot.exists() ? snapshot.data() : null);
        setReady((previous) => ({ ...previous, profile: true }));
      },
      (error) => {
        console.error("Error loading SOS profile:", error);
        setReady((previous) => ({ ...previous, profile: true }));
      },
    );

    const unsubMine = onSnapshot(
      collection(db, "users", currentUser.uid, "sosTickets"),
      (snapshot) => {
        setTickets(
          sortTickets(
            snapshot.docs.map((docSnapshot) => ({
              id: docSnapshot.id,
              path: docSnapshot.ref.path,
              ...docSnapshot.data(),
            })),
          ),
        );
        setReady((previous) => ({ ...previous, mine: true }));
      },
      (error) => {
        console.error("Error loading personal SOS:", error);
        setReady((previous) => ({ ...previous, mine: true }));
      },
    );

    const unsubBoard = onSnapshot(
      collectionGroup(db, "sosTickets"),
      (snapshot) => {
        setPublicTickets(
          sortTickets(
            snapshot.docs
              .map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))
              .filter((ticket) => isPublicSosTicket(ticket))
              .filter((ticket) => !ticket.isSensitive),
          ).slice(0, 10),
        );
        setReady((previous) => ({ ...previous, board: true }));
      },
      (error) => {
        console.error("Error loading SOS board:", error);
        setReady((previous) => ({ ...previous, board: true }));
      },
    );

    return () => {
      unsubProfile();
      unsubMine();
      unsubBoard();
    };
  }, [currentUser]);

  const myStats = useMemo(
    () => ({
      pending: tickets.filter((ticket) => ticket.approvalStatus === "pending").length,
      active: tickets.filter((ticket) => ticket.workflowStatus !== "resolved").length,
      approved: tickets.filter((ticket) => ticket.approvalStatus === "approved").length,
    }),
    [tickets],
  );
  const categorySummary = useMemo(() => buildSosCategorySummary(publicTickets), [publicTickets]);
  const tagSummary = useMemo(() => buildSosTagSummary(publicTickets).slice(0, 8), [publicTickets]);

  const handleChange = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
      ...(key === "categoryId"
        ? {
            tagId: getSosTagOptions(value)[0]?.id || "",
            anonymous: getSosCategoryMeta(value).sensitive ? true : previous.anonymous,
          }
        : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser) return;
    if (!form.title.trim() || !form.details.trim()) {
      setFeedback("กรุณากรอกหัวข้อและรายละเอียดปัญหาให้ครบ");
      return;
    }

    setSubmitting(true);
    setFeedback("");

    try {
      const levelMeta = getSosLevelMeta(form.level);
      const categoryMeta = getSosCategoryMeta(form.categoryId);
      const tagMeta = getSosTagMeta(form.categoryId, form.tagId);
      const visibilityMeta = normalizeSosVisibility(form.categoryId, form.anonymous);

      await addDoc(collection(db, "users", currentUser.uid, "sosTickets"), {
        level: levelMeta.value,
        levelLabel: levelMeta.label,
        levelPriority: levelMeta.priority,
        categoryId: categoryMeta.id,
        categoryLabel: categoryMeta.label,
        categoryShortLabel: categoryMeta.shortLabel,
        tagId: tagMeta.id,
        tagLabel: tagMeta.label,
        title: form.title.trim(),
        details: form.details.trim(),
        publicSummary: visibilityMeta.isSensitive ? "" : form.details.trim().slice(0, 280),
        preferredContact: form.preferredContact.trim(),
        anonymous: visibilityMeta.anonymous,
        visibility: visibilityMeta.visibility,
        isSensitive: visibilityMeta.isSensitive,
        approvalStatus: "pending",
        workflowStatus: "submitted",
        userId: currentUser.uid,
        userName: profile?.name || currentUser.displayName || currentUser.email || "ผู้ใช้งาน",
        userEmail: currentUser.email || "",
        userPhotoURL: profile?.photoURL || currentUser.photoURL || "",
        userRole: userRole || profile?.role || "learner",
        school: profile?.school || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setForm({
        ...INITIAL_FORM,
        categoryId: form.categoryId,
        tagId: getSosTagOptions(form.categoryId)[0]?.id || INITIAL_FORM.tagId,
      });
      setFeedback(
        visibilityMeta.isSensitive
          ? "ส่งเรื่องสำเร็จแล้ว เรื่องนี้จะไม่แสดงบนบอร์ดสาธารณะและรอ Admin อนุมัติ"
          : "ส่งเรื่องสำเร็จแล้ว ระบบจะรอ Admin อนุมัติก่อนแสดงบนบอร์ดสรุป",
      );
    } catch (error) {
      console.error("Error creating SOS ticket:", error);
      const permissionError =
        error.code === "permission-denied" ||
        error.message?.includes("Missing or insufficient permissions");
      setFeedback(
        permissionError
          ? "ยังบันทึกลง Firebase ไม่ได้ กรุณา deploy Firestore rules ชุดใหม่ก่อน"
          : "ส่งเรื่องไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrap space-y-6">
      <section className="dark-panel p-6 sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-red-200">Help & Escalation</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.08em] text-white">SOS Support Center</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">ส่งเรื่องแบบมีระดับความเร่งด่วน, จัดหมวดหมู่ด้วยแท็ก, รอการอนุมัติจาก Admin และติดตามผลแบบเรียลไทม์ได้จากหน้านี้</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="ผู้แจ้งเรื่อง" value={profile?.name || currentUser?.displayName || currentUser?.email || "-"} detail={getRoleLabel(userRole || profile?.role || "learner")} />
          <StatCard label="รออนุมัติ" value={myStats.pending} detail="Admin ต้องอนุมัติก่อนขึ้นบอร์ดสรุป" />
          <StatCard label="เรื่องที่ยังเปิดอยู่" value={myStats.active} detail={`${myStats.approved} เรื่องผ่านการอนุมัติแล้ว`} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <form onSubmit={handleSubmit} className="surface-panel p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-50 p-3 text-red-600"><AlertTriangle size={22} /></div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">แจ้งเรื่องใหม่</p>
              <h3 className="mt-1 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">ระบุปัญหาให้ชัดเพื่อให้ทีมช่วยได้เร็วขึ้น</h3>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {SOS_LEVELS.map((level) => (
              <button key={level.value} type="button" onClick={() => handleChange("level", level.value)} className={`rounded-[22px] border px-4 py-4 text-left transition ${level.cardClass} ${form.level === level.value ? "ring-2 ring-slate-950/10" : "opacity-85"}`}>
                <p className="text-xs uppercase tracking-[0.24em]">ระดับที่ {level.priority} {level.colorName}</p>
                <h4 className="mt-2 text-base font-semibold">{level.label}</h4>
                <p className="mt-1 text-sm opacity-80">{level.englishLabel}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="field-label" htmlFor="sos-category">หมวดหมู่ปัญหา</label>
              <select id="sos-category" value={form.categoryId} onChange={(event) => handleChange("categoryId", event.target.value)} className="field-select">
                {SOS_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.icon} {category.label}</option>)}
              </select>
              <p className="mt-3 text-sm leading-7 text-slate-500">{selectedCategory.description}</p>
            </div>

            <div>
              <label className="field-label">แท็กปัญหา</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <button key={tag.id} type="button" onClick={() => handleChange("tagId", tag.id)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${form.tagId === tag.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                    {tag.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                {selectedTag.examples.map((item) => <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1">{item}</span>)}
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              {selectedCategory.sensitive ? "หมวดนี้เป็นข้อมูลลับ ระบบจะตั้งค่าเป็น Anonymous และ Private ให้อัตโนมัติ" : "หากต้องการซ่อนชื่อบนบอร์ดสรุป สามารถเปิดโหมด Anonymous ได้"}
              {!selectedCategory.sensitive && (
                <label className="mt-3 flex items-center gap-3 font-semibold text-slate-900">
                  <input type="checkbox" checked={form.anonymous} onChange={(event) => handleChange("anonymous", event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-slate-950 focus:ring-slate-300" />
                  ปิดบังชื่อบนบอร์ดสรุป
                </label>
              )}
            </div>

            <InputField label="หัวข้อเรื่อง" value={form.title} onChange={(value) => handleChange("title", value)} placeholder="สรุปปัญหาให้เข้าใจง่ายใน 1 บรรทัด" />
            <div>
              <label className="field-label" htmlFor="sos-details">รายละเอียด</label>
              <textarea id="sos-details" rows={8} value={form.details} onChange={(event) => handleChange("details", event.target.value)} className="field-input min-h-[220px] resize-y" placeholder="อธิบายสิ่งที่เกิดขึ้น ผลกระทบ และสิ่งที่ต้องการให้ช่วย" />
            </div>
            <InputField label="ช่องทางติดต่อกลับ" value={form.preferredContact} onChange={(value) => handleChange("preferredContact", value)} placeholder="เช่น เบอร์โทร, LINE, อีเมล หรือช่วงเวลาที่สะดวก" />
          </div>

          {feedback && <div className="mt-6 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">{feedback}</div>}

          <button type="submit" disabled={submitting} className="primary-button mt-6 w-full justify-center">
            {submitting ? <><Loader2 size={16} className="animate-spin" />กำลังส่งเรื่อง...</> : <><Send size={16} />ส่งเรื่อง SOS</>}
          </button>
        </form>

        <section className="space-y-4">
          <PanelHeader icon={<LifeBuoy size={22} />} title="ติดตามสถานะแบบเรียลไทม์" eyebrow="เรื่องของฉัน" />
          {loading ? (
            <div className="surface-panel flex min-h-[220px] items-center justify-center p-6"><Loader2 size={28} className="animate-spin text-slate-400" /></div>
          ) : tickets.length === 0 ? (
            <div className="surface-panel p-8 text-center text-sm leading-7 text-slate-500">เมื่อส่งเรื่องแล้ว ระบบจะบันทึกเรื่องของคุณไว้ที่นี่และอัปเดตสถานะให้อัตโนมัติ</div>
          ) : (
            tickets.map((ticket) => {
              const levelMeta = getSosLevelMeta(ticket.level);
              const approvalMeta = getSosApprovalMeta(ticket.approvalStatus);
              const workflowMeta = getSosWorkflowStatusMeta(ticket.workflowStatus);
              return (
                <article key={ticket.path} className="surface-panel p-6">
                  <div className="flex flex-wrap gap-2">
                    <Chip className={levelMeta.badgeClass}>ระดับ {levelMeta.priority} {levelMeta.label}</Chip>
                    <Chip className={approvalMeta.badgeClass}>{approvalMeta.label}</Chip>
                    <Chip className={workflowMeta.badgeClass}>{workflowMeta.label}</Chip>
                    <Chip className="border-slate-200 bg-white text-slate-700">{ticket.categoryShortLabel || ticket.categoryLabel}</Chip>
                    <Chip className="border-slate-200 bg-white text-slate-700">{ticket.tagLabel}</Chip>
                    {ticket.isSensitive && <Chip className="border-slate-900 bg-slate-950 text-white">ลับ</Chip>}
                    {ticket.anonymous && <Chip className="border-slate-200 bg-slate-100 text-slate-700">Anonymous</Chip>}
                  </div>
                  <h4 className="mt-4 font-display text-2xl font-semibold text-slate-950">{ticket.title}</h4>
                  <p className="mt-3 text-sm leading-8 text-slate-600">{ticket.details}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoCard label="อัปเดตล่าสุด" value={formatLastSeenLabel(ticket.updatedAt || ticket.createdAt)} />
                    <InfoCard label="ติดต่อกลับ" value={ticket.preferredContact || "ยังไม่ได้ระบุ"} />
                  </div>
                </article>
              );
            })
          )}

          <PanelHeader icon={<Tags size={22} />} title="บอร์ดสรุป SOS ที่อนุมัติแล้ว" eyebrow="Approved Board" />
          <div className="surface-panel p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">สรุปตามหมวดหมู่</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categorySummary.length > 0 ? categorySummary.map((item) => <Chip key={item.id} className="border-slate-200 bg-white text-slate-700">{item.icon} {item.shortLabel} {item.count}</Chip>) : <span className="text-sm text-slate-500">ยังไม่มีเรื่องที่ผ่านการอนุมัติ</span>}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">แท็กที่พบบ่อย</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tagSummary.length > 0 ? tagSummary.map((item) => <Chip key={item.key} className="border-slate-200 bg-white text-slate-700">{item.categoryLabel}: {item.label} ({item.count})</Chip>) : <span className="text-sm text-slate-500">ยังไม่มีแท็กสรุป</span>}
              </div>
            </div>
            <div className="space-y-3">
              {publicTickets.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-300 bg-white px-4 py-5 text-sm leading-7 text-slate-500">เรื่องในหมวดลับจะไม่ถูกแสดงบนบอร์ดนี้ และทุกเรื่องต้องผ่านการอนุมัติจาก Admin ก่อนเสมอ</div>
              ) : (
                publicTickets.map((ticket) => (
                  <article key={`${ticket.userId}-${ticket.title}`} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip className="border-slate-200 bg-slate-50 text-slate-700">{ticket.categoryShortLabel || ticket.categoryLabel}</Chip>
                      <Chip className="border-slate-200 bg-slate-50 text-slate-700">{ticket.tagLabel}</Chip>
                      {ticket.anonymous && <Chip className="border-slate-200 bg-slate-50 text-slate-700"><EyeOff size={12} />Anonymous</Chip>}
                    </div>
                    <h4 className="mt-3 text-base font-semibold text-slate-900">{ticket.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{ticket.publicSummary || ticket.details}</p>
                    <div className="mt-3 text-xs text-slate-500">โดย {ticket.anonymous ? "ไม่เปิดเผยชื่อ" : ticket.userName || "ผู้ใช้งาน"} • {formatLastSeenLabel(ticket.updatedAt || ticket.createdAt)}</div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}

function PanelHeader({ icon, eyebrow, title }) {
  return (
    <div className="surface-panel p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">{icon}</div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{eyebrow}</p>
          <h3 className="mt-1 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">{title}</h3>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, detail }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-3 text-lg font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-300">{detail}</div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="field-input" placeholder={placeholder} />
    </div>
  );
}

function Chip({ children, className }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function InfoCard({ label, value }) {
  return <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">{label}: {value}</div>;
}
