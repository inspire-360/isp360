import React, { useEffect, useMemo, useState } from "react";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Mail,
  Save,
  School,
  ShieldCheck,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { getRoleLabel, prefixOptions } from "../data/profileOptions";
import { writePresence } from "../hooks/usePresence";
import {
  readLocalProfileCache,
  writeLocalProfileCache,
} from "../lib/profileCache";

function buildAvatar(firstName, lastName) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${firstName || "User"} ${lastName || ""}`.trim(),
  )}&background=0f172a&color=fff`;
}

function splitName(fullName = "") {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

export default function Profile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    prefix: "นาย",
    firstName: "",
    lastName: "",
    position: "ครู",
    school: "",
    email: "",
    role: "learner",
    photoURL: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchUserData() {
      if (!currentUser) {
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userRef);
        const localProfile = readLocalProfileCache(currentUser.uid);

        if (!isMounted) {
          return;
        }

        const authName = splitName(currentUser.displayName || "");

        if (userSnapshot.exists()) {
          const data = userSnapshot.data();
          const storedName = splitName(data.name || "");
          const mergedData = { ...data, ...localProfile };

          setFormData({
            prefix: mergedData.prefix || "นาย",
            firstName:
              mergedData.firstName ||
              storedName.firstName ||
              authName.firstName ||
              "",
            lastName:
              mergedData.lastName ||
              storedName.lastName ||
              authName.lastName ||
              "",
            position: mergedData.position || "ครู",
            school: mergedData.school || "",
            email: mergedData.email || currentUser.email || "",
            role: mergedData.role || "learner",
            photoURL: mergedData.photoURL || currentUser.photoURL || "",
          });
          return;
        }

        setFormData((previous) => ({
          ...previous,
          prefix: localProfile?.prefix || previous.prefix,
          firstName: localProfile?.firstName || authName.firstName || "",
          lastName: localProfile?.lastName || authName.lastName || "",
          position: localProfile?.position || previous.position,
          school: localProfile?.school || "",
          email: localProfile?.email || currentUser.email || "",
          role: localProfile?.role || previous.role,
          photoURL: localProfile?.photoURL || currentUser.photoURL || "",
        }));
      } catch (error) {
        console.error("Error fetching profile:", error);
        const localProfile = readLocalProfileCache(currentUser.uid);

        if (isMounted && localProfile) {
          setFormData((previous) => ({
            ...previous,
            ...localProfile,
            email: localProfile.email || currentUser.email || "",
            role: localProfile.role || previous.role,
          }));
        } else if (isMounted) {
          setMessage({
            type: "error",
            text: "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ในขณะนี้",
          });
        }
      }
    }

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const avatarUrl = useMemo(
    () => formData.photoURL || buildAvatar(formData.firstName, formData.lastName),
    [formData.firstName, formData.lastName, formData.photoURL],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!currentUser) {
      setMessage({
        type: "error",
        text: "กรุณาเข้าสู่ระบบอีกครั้งก่อนแก้ไขโปรไฟล์",
      });
      setLoading(false);
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setMessage({
        type: "error",
        text: "กรุณากรอกชื่อและนามสกุลให้ครบ",
      });
      setLoading(false);
      return;
    }

    try {
      const nextPhotoURL =
        formData.photoURL || buildAvatar(formData.firstName, formData.lastName);
      const fullName = `${formData.prefix}${formData.firstName} ${formData.lastName}`.trim();
      const userRef = doc(db, "users", currentUser.uid);
      const editableProfilePayload = {
        prefix: formData.prefix,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        name: fullName,
        position: formData.position.trim(),
        school: formData.school.trim(),
        photoURL: nextPhotoURL,
        updatedAt: serverTimestamp(),
      };
      const localProfilePayload = {
        prefix: editableProfilePayload.prefix,
        firstName: editableProfilePayload.firstName,
        lastName: editableProfilePayload.lastName,
        name: editableProfilePayload.name,
        position: editableProfilePayload.position,
        school: editableProfilePayload.school,
        photoURL: editableProfilePayload.photoURL,
        email: formData.email || currentUser.email || "",
        role: formData.role || "learner",
        updatedAt: new Date().toISOString(),
      };
      let firestoreSaved = false;

      try {
        await setDoc(userRef, editableProfilePayload, { merge: true });
        firestoreSaved = true;
      } catch (firestoreError) {
        const isPermissionError =
          firestoreError.code === "permission-denied" ||
          firestoreError.message?.includes("Missing or insufficient permissions");

        if (!isPermissionError) {
          throw firestoreError;
        }
      }

      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, {
            displayName: fullName,
            photoURL: nextPhotoURL,
          });
        } catch (authError) {
          console.error("Error syncing auth profile:", authError);
        }
      }

      writeLocalProfileCache(currentUser.uid, localProfilePayload);
      try {
        await writePresence(
          {
            uid: currentUser.uid,
            name: fullName,
            photoURL: nextPhotoURL,
            role: formData.role || "learner",
          },
          true,
          formData.role || "learner",
        );
      } catch (presenceError) {
        console.error("Error syncing presence profile:", presenceError);
      }
      setFormData((previous) => ({
        ...previous,
        photoURL: nextPhotoURL,
      }));
      setMessage({
        type: firestoreSaved ? "success" : "success",
        text: firestoreSaved
          ? "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว"
          : "อัปเดตชื่อบัญชีและบันทึกโปรไฟล์บนอุปกรณ์นี้แล้ว แม้ฐานข้อมูลจะยังไม่อนุญาตให้เขียนข้อมูลส่วนนี้",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: `ไม่สามารถอัปเดตโปรไฟล์ได้: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            ตั้งค่าบัญชี
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-white">
            อัปเดตโปรไฟล์ให้เป็นปัจจุบัน
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            ปรับข้อมูลส่วนตัว บทบาทการทำงาน และบริบทสถานศึกษาให้ครบถ้วน
            เพื่อให้ระบบแนะนำการเรียนรู้และการช่วยเหลือได้แม่นยำขึ้น
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="secondary-button self-start border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          <ArrowLeft size={16} />
          กลับไปแดชบอร์ด
        </button>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="dark-panel p-7">
          <div className="flex flex-col items-center text-center">
            <img
              src={avatarUrl}
              alt={`${formData.firstName} ${formData.lastName}`.trim()}
              referrerPolicy="no-referrer"
              className="h-28 w-28 rounded-[28px] object-cover ring-4 ring-white/10"
            />
            <h3 className="mt-6 font-display text-3xl font-semibold text-white">
              {formData.firstName || "โปรไฟล์"} {formData.lastName || "ของคุณ"}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {formData.email || "ไม่พบอีเมลในระบบ"}
            </p>
            <span className="mt-5 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-sky-200">
              {getRoleLabel(formData.role)}
            </span>
          </div>

          <div className="mt-8 space-y-4">
            <SummaryCard
              label="ตำแหน่งปัจจุบัน"
              value={formData.position || "ยังไม่ได้ระบุ"}
            />
            <SummaryCard
              label="สถานศึกษา"
              value={formData.school || "ยังไม่ได้ระบุ"}
            />
          </div>
        </section>

        <section className="surface-panel p-7 sm:p-9">
          {message.text && (
            <div
              className={`mb-7 rounded-[22px] px-4 py-4 text-sm leading-7 ${
                message.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-9">
            <section className="space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  ข้อมูลตัวตน
                </p>
                <h3 className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold text-slate-950">
                  <User size={18} />
                  รายละเอียดส่วนบุคคล
                </h3>
              </div>

              <div className="grid gap-5 md:grid-cols-[0.9fr_1.15fr_1fr]">
                <div>
                  <label htmlFor="prefix" className="field-label">
                    คำนำหน้า
                  </label>
                  <select
                    id="prefix"
                    name="prefix"
                    value={formData.prefix}
                    onChange={handleChange}
                    className="field-select"
                  >
                    {prefixOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <TextField
                  id="firstName"
                  name="firstName"
                  label="ชื่อ"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="ชื่อจริง"
                />

                <TextField
                  id="lastName"
                  name="lastName"
                  label="นามสกุล"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="นามสกุล"
                />
              </div>
            </section>

            <section className="space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  บริบทการทำงาน
                </p>
                <h3 className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold text-slate-950">
                  <Briefcase size={18} />
                  ข้อมูลการทำงาน
                </h3>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  id="position"
                  name="position"
                  label="ตำแหน่ง"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="เช่น ครูชำนาญการ"
                />

                <div>
                  <label htmlFor="school" className="field-label">
                    สถานศึกษา
                  </label>
                  <div className="relative">
                    <School
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="school"
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      className="field-input pl-11"
                      placeholder="ระบุโรงเรียนหรือสังกัด"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  ข้อมูลการเข้าใช้งาน
                </p>
                <h3 className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold text-slate-950">
                  <Mail size={18} />
                  รายละเอียดบัญชี
                </h3>
              </div>

              <div>
                <label htmlFor="email" className="field-label">
                  อีเมล
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="field-input cursor-not-allowed bg-slate-100 text-slate-500"
                />
                <p className="mt-3 flex items-center gap-2 text-xs leading-6 text-slate-400">
                  <ShieldCheck size={14} />
                  อีเมลถูกล็อกไว้เพื่อความปลอดภัยของบัญชี
                </p>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="primary-button w-full justify-center"
            >
              {loading ? (
                <>
                  <Save size={16} />
                  กำลังบันทึกโปรไฟล์...
                </>
              ) : (
                <>
                  <Save size={16} />
                  บันทึกการเปลี่ยนแปลง
                  <CheckCircle2 size={16} />
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function TextField({ id, name, label, value, onChange, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="field-input"
        placeholder={placeholder}
      />
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-7 text-slate-200">{value}</p>
    </div>
  );
}
