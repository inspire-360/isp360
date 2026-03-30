import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  AlertTriangle,
  CheckCircle2,
  LifeBuoy,
  Loader2,
  Send,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import {
  getSosLevelMeta,
  getSosStatusMeta,
  SOS_LEVELS,
} from "../data/sosLevels";
import { getRoleLabel } from "../data/profileOptions";
import { formatLastSeenLabel } from "../lib/presence";

const INITIAL_FORM = {
  level: "yellow",
  category: "",
  title: "",
  details: "",
  preferredContact: "",
};

export default function SosCenter() {
  const { currentUser, userRole } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }

    let isMounted = true;

    async function loadProfile() {
      try {
        const profileSnapshot = await getDoc(doc(db, "users", currentUser.uid));

        if (!isMounted) {
          return;
        }

        setProfile(profileSnapshot.exists() ? profileSnapshot.data() : null);
      } catch (error) {
        console.error("Error loading SOS profile:", error);
      }
    }

    loadProfile();

    const ticketRef = collection(db, "users", currentUser.uid, "sosTickets");
    const unsubscribe = onSnapshot(
      ticketRef,
      (snapshot) => {
        const nextTickets = snapshot.docs
          .map((docSnapshot) => ({
            id: docSnapshot.id,
            path: docSnapshot.ref.path,
            ...docSnapshot.data(),
          }))
          .sort((left, right) => {
            const leftTime = left.createdAt?.toMillis?.() || 0;
            const rightTime = right.createdAt?.toMillis?.() || 0;
            return rightTime - leftTime;
          });

        setTickets(nextTickets);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading SOS tickets:", error);
        setLoading(false);
      },
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser]);

  const activeTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status !== "resolved").length,
    [tickets],
  );

  const handleChange = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      return;
    }

    if (!form.title.trim() || !form.details.trim()) {
      setFeedback("กรุณากรอกหัวข้อและรายละเอียดปัญหาให้ครบ");
      return;
    }

    setSubmitting(true);
    setFeedback("");

    try {
      const levelMeta = getSosLevelMeta(form.level);

      await addDoc(collection(db, "users", currentUser.uid, "sosTickets"), {
        level: levelMeta.value,
        levelLabel: levelMeta.label,
        levelPriority: levelMeta.priority,
        category: form.category.trim(),
        title: form.title.trim(),
        details: form.details.trim(),
        preferredContact: form.preferredContact.trim(),
        status: "open",
        userId: currentUser.uid,
        userName:
          profile?.name || currentUser.displayName || currentUser.email || "ผู้ใช้งาน",
        userEmail: currentUser.email || "",
        userRole: userRole || profile?.role || "learner",
        school: profile?.school || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setForm(INITIAL_FORM);
      setFeedback(
        "ส่งเรื่อง SOS เรียบร้อยแล้ว ทีมงานจะดำเนินการตามระดับความเร่งด่วน",
      );
    } catch (error) {
      console.error("Error creating SOS ticket:", error);
      setFeedback("ส่งเรื่องไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrap space-y-6">
      <section className="dark-panel p-6 sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-red-200">
          Help & Escalation
        </p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.08em] text-white">
          SOS Support Center
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          แจ้งปัญหา ขอความช่วยเหลือ หรือส่งเคสด่วนเข้าสู่ระบบตามระดับสี
          เพื่อให้ทีมดูแลเห็นความเร่งด่วนได้ชัดเจนและตอบสนองได้ทันที
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="ผู้แจ้งเรื่อง"
            value={profile?.name || currentUser?.displayName || currentUser?.email || "-"}
            detail={getRoleLabel(userRole || profile?.role || "learner")}
          />
          <StatCard
            label="เรื่องที่ยังเปิดอยู่"
            value={activeTickets}
            detail="ติดตามได้ด้านล่างแบบเรียลไทม์"
          />
          <StatCard
            label="สถานศึกษา"
            value={profile?.school || "ยังไม่ได้ระบุ"}
            detail="ช่วยให้ทีมช่วยเหลือได้ตรงบริบท"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleSubmit} className="surface-panel p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-50 p-3 text-red-600">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                แจ้งเรื่องใหม่
              </p>
              <h3 className="mt-1 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">
                ระบุปัญหาและระดับความเร่งด่วน
              </h3>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {SOS_LEVELS.map((level) => {
              const selected = form.level === level.value;

              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleChange("level", level.value)}
                  className={`rounded-[22px] border px-4 py-4 text-left transition ${level.cardClass} ${
                    selected ? "ring-2 ring-slate-950/10" : "opacity-80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em]">
                        ระดับที่ {level.priority} {level.colorName}
                      </p>
                      <h4 className="mt-2 text-base font-semibold">{level.label}</h4>
                      <p className="mt-1 text-sm opacity-80">{level.englishLabel}</p>
                    </div>
                    {selected && <CheckCircle2 size={18} />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4">
            <LabeledInput
              id="sos-category"
              label="หมวดปัญหา"
              value={form.category}
              onChange={(value) => handleChange("category", value)}
              placeholder="เช่น เข้าเรียนไม่ได้, ระบบค้าง, ขอความช่วยเหลือด่วน"
            />
            <LabeledInput
              id="sos-title"
              label="หัวข้อเรื่อง"
              value={form.title}
              onChange={(value) => handleChange("title", value)}
              placeholder="สรุปปัญหาให้เข้าใจง่ายใน 1 บรรทัด"
            />
            <div>
              <label className="field-label" htmlFor="sos-details">
                รายละเอียด
              </label>
              <textarea
                id="sos-details"
                rows={7}
                value={form.details}
                onChange={(event) => handleChange("details", event.target.value)}
                className="field-input min-h-[200px] resize-y"
                placeholder="อธิบายสิ่งที่เกิดขึ้น ผลกระทบ และสิ่งที่ต้องการให้ช่วย"
              />
            </div>
            <LabeledInput
              id="sos-contact"
              label="ช่องทางติดต่อกลับ"
              value={form.preferredContact}
              onChange={(value) => handleChange("preferredContact", value)}
              placeholder="เช่น เบอร์โทร, LINE, อีเมล หรือช่วงเวลาที่สะดวก"
            />
          </div>

          {feedback && (
            <div className="mt-6 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              {feedback}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="primary-button mt-6 w-full justify-center"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                กำลังส่งเรื่อง...
              </>
            ) : (
              <>
                <Send size={16} />
                ส่งเรื่อง SOS
              </>
            )}
          </button>
        </form>

        <section className="space-y-4">
          <div className="surface-panel p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <LifeBuoy size={22} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  เรื่องของฉัน
                </p>
                <h3 className="mt-1 font-display text-3xl font-semibold tracking-[-0.06em] text-slate-950">
                  ติดตามสถานะล่าสุด
                </h3>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="surface-panel flex min-h-[260px] items-center justify-center p-6">
              <Loader2 size={30} className="animate-spin text-slate-400" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="surface-panel p-8 text-center">
              <h4 className="font-display text-2xl font-semibold text-slate-950">
                ยังไม่มีรายการ SOS
              </h4>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                เมื่อคุณส่งเรื่องแล้ว ระบบจะแสดงคิวและสถานะล่าสุดไว้ตรงนี้
              </p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const levelMeta = getSosLevelMeta(ticket.level);
              const statusMeta = getSosStatusMeta(ticket.status);

              return (
                <article key={ticket.id} className="surface-panel overflow-hidden p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${levelMeta.badgeClass}`}
                    >
                      ระดับ {levelMeta.priority} {levelMeta.label}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  <h4 className="mt-4 font-display text-2xl font-semibold text-slate-950">
                    {ticket.title}
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {ticket.details}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoCard label="หมวดปัญหา" value={ticket.category || "ไม่ได้ระบุ"} />
                    <InfoCard
                      label="อัปเดตล่าสุด"
                      value={formatLastSeenLabel(ticket.updatedAt || ticket.createdAt)}
                    />
                  </div>
                </article>
              );
            })
          )}
        </section>
      </section>
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

function LabeledInput({ id, label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-input"
        placeholder={placeholder}
      />
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      {label}: {value}
    </div>
  );
}
