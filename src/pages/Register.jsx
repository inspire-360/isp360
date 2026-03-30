import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ArrowRight, CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { auth, db } from "../lib/firebase";
import { positionOptions, prefixOptions } from "../data/profileOptions";

const HIGHLIGHTS = [
  {
    title: "ลงทะเบียนเป็นขั้นตอนชัดเจน",
    description: "ข้อมูลบัญชี บริบทสถานศึกษา และการยินยอม ถูกจัดให้อ่านง่ายในฟอร์มเดียว",
  },
  {
    title: "เริ่มต้นใช้งานได้ทันที",
    description: "บัญชีใหม่จะเข้าสู่ระบบด้วยโครงสร้างโปรไฟล์เดียวกันกับที่ใช้ทั่วทั้งแอป",
  },
  {
    title: "พร้อมรองรับรุ่นเรียน",
    description: "โครงสร้างบัญชีรองรับทั้งรหัสเข้าร่วมรุ่น และการปลดล็อกคอร์สในอนาคตได้ชัดเจน",
  },
];

export default function Register() {
  const [formData, setFormData] = useState({
    prefix: "นาย",
    otherPrefix: "",
    firstName: "",
    lastName: "",
    position: "ครู",
    otherPosition: "",
    school: "",
    email: "",
    password: "",
    confirmPassword: "",
    pdpaAccepted: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      return;
    }

    if (!formData.pdpaAccepted) {
      setError("กรุณายอมรับการยินยอม PDPA ก่อนดำเนินการต่อ");
      setLoading(false);
      return;
    }

    try {
      const finalPrefix =
        formData.prefix === "อื่นๆ" ? formData.otherPrefix : formData.prefix;
      const finalPosition =
        formData.position === "อื่นๆ"
          ? formData.otherPosition
          : formData.position;

      if (!finalPrefix || !formData.firstName || !formData.lastName) {
        throw new Error("กรุณากรอกข้อมูลชื่อ-นามสกุลให้ครบ");
      }

      const fullName = `${finalPrefix}${formData.firstName} ${formData.lastName}`;
      const credential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const user = credential.user;

      await updateProfile(user, {
        displayName: fullName,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          `${formData.firstName} ${formData.lastName}`,
        )}&background=0f172a&color=fff`,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        prefix: finalPrefix,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: fullName,
        position: finalPosition,
        school: formData.school,
        email: formData.email,
        role: "learner",
        photoURL: user.photoURL,
        createdAt: new Date(),
        pdpaAccepted: true,
        pdpaAcceptedAt: new Date(),
        badges: [],
      });

      navigate("/dashboard");
    } catch (registerError) {
      console.error("Register Error:", registerError);
      if (registerError.code === "auth/email-already-in-use") {
        setError("อีเมลนี้ถูกใช้งานแล้ว");
      } else {
        setError(registerError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="สมาชิกใหม่"
      title="สร้างบัญชี InSPIRE ของคุณ"
      description="ตั้งค่าตัวตนและบริบทสถานศึกษาเพียงครั้งเดียว แล้วเข้าสู่ workspace เวอร์ชันใหม่ได้ทันที"
      asideTitle="ขั้นตอนสมัครสมาชิกที่อ่านง่ายขึ้นสำหรับครูและผู้เรียน"
      asideCopy="ประสบการณ์การลงทะเบียนเวอร์ชันใหม่นี้ถูกออกแบบให้เป็นส่วนหนึ่งของแพลตฟอร์มเดียวกัน ทั้งลำดับข้อมูลที่ชัดขึ้นและภาพรวมที่สบายตากว่าเดิม"
      highlights={HIGHLIGHTS}
    >
      {error && (
        <div className="mb-6 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-8">
        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
              ข้อมูลตัวตน
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.05em] text-slate-950">
              รายละเอียดส่วนบุคคล
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-[0.9fr_1.15fr_1fr]">
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
              {formData.prefix === "อื่นๆ" && (
                <input
                  type="text"
                  name="otherPrefix"
                  value={formData.otherPrefix}
                  onChange={handleChange}
                  className="field-input mt-3"
                  placeholder="ระบุคำนำหน้า"
                  required
                />
              )}
            </div>

            <div>
              <label htmlFor="firstName" className="field-label">
                ชื่อ
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="field-input"
                placeholder="ชื่อจริง"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="field-label">
                นามสกุล
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="field-input"
                placeholder="นามสกุล"
                required
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
              บริบทการทำงาน
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.05em] text-slate-950">
              ข้อมูลบทบาทและสถานศึกษา
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="position" className="field-label">
                ตำแหน่ง
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="field-select"
              >
                {positionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {formData.position === "อื่นๆ" && (
                <input
                  type="text"
                  name="otherPosition"
                  value={formData.otherPosition}
                  onChange={handleChange}
                  className="field-input mt-3"
                  placeholder="ระบุตำแหน่ง"
                  required
                />
              )}
            </div>

            <div>
              <label htmlFor="school" className="field-label">
                สังกัด / สถานศึกษา
              </label>
              <input
                id="school"
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="field-input"
                placeholder="เช่น โรงเรียนตัวอย่าง"
                required
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
              บัญชีผู้ใช้
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.05em] text-slate-950">
              ข้อมูลสำหรับเข้าสู่ระบบ
            </h3>
          </div>

          <div>
            <label htmlFor="email" className="field-label">
              อีเมล
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="field-input pl-11"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="password" className="field-label">
                รหัสผ่าน
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="field-input"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="field-label">
                ยืนยันรหัสผ่าน
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="field-input"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                required
              />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex items-start gap-3">
            <input
              id="pdpa"
              type="checkbox"
              name="pdpaAccepted"
              checked={formData.pdpaAccepted}
              onChange={handleChange}
              className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-950 focus:ring-slate-300"
            />
            <div>
              <label htmlFor="pdpa" className="font-medium text-slate-800">
                ฉันยอมรับข้อตกลง PDPA / การยินยอมด้านความเป็นส่วนตัว
              </label>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                ข้อมูลโปรไฟล์ของคุณจะถูกใช้เพื่อปรับประสบการณ์การเรียนรู้ ลงทะเบียนเข้าสู่เส้นทางที่เหมาะสม และสนับสนุนการใช้งานคอร์สอย่างต่อเนื่อง
              </p>
            </div>
          </div>
        </section>

        <button type="submit" disabled={loading} className="primary-button w-full justify-center">
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              กำลังสร้างบัญชี...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              สร้างบัญชี
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 text-slate-400" />
            <p className="leading-6">
              มีบัญชีอยู่แล้วใช่ไหม?{" "}
              <Link to="/login" className="font-semibold text-slate-950">
                เข้าสู่ระบบที่นี่
              </Link>
              .
            </p>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}
