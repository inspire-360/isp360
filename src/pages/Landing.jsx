import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import BrandMark from "../components/BrandMark";
import { courseCatalog, landingWorkflow, platformSignals } from "../data/courseCatalog";
import { getIcon } from "../utils/iconHelper";
import { useLine } from "../contexts/LineContext";

const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};
const MotionDiv = motion.div;
const MotionArticle = motion.article;

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const { lineProfile } = useLine();
  const navigate = useNavigate();

  useEffect(() => {
    if (lineProfile) {
      navigate("/login");
    }
  }, [lineProfile, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="overflow-x-hidden bg-[#09182a] text-white">
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-[#09182a]/82 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <BrandMark invert href="/" />
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 sm:inline-flex"
            >
              เข้าสู่ระบบ
            </Link>
            <Link to="/register" className="primary-button">
              เริ่มใช้งาน
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen overflow-hidden pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(47,124,246,0.34),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_28%),linear-gradient(180deg,#09182a_0%,#0b1d31_58%,#102841_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:56px_56px] opacity-25" />

        <div className="relative grid min-h-[calc(100vh-6rem)] items-center gap-10 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-10">
          <MotionDiv
            initial="hidden"
            animate="show"
            variants={reveal}
            className="mx-auto w-full max-w-xl lg:mx-0"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-medium tracking-[0.18em] text-sky-100">
              <Sparkles size={14} />
              LEARNING EXPERIENCE PLATFORM
            </div>
            <h1 className="mt-7 max-w-[10ch] font-display text-5xl font-semibold text-white sm:text-6xl lg:text-7xl">
              InSPIRE 360
            </h1>
            <p className="mt-5 max-w-lg text-xl font-medium text-sky-50/90 sm:text-2xl">
              พื้นที่เรียนรู้ดิจิทัลที่ช่วยให้ครูและผู้เรียนเห็นเส้นทางของตัวเองชัดขึ้น
            </p>
            <p className="mt-6 max-w-xl text-base text-slate-200">
              จากการลงทะเบียน เข้าคอร์ส ทำภารกิจ ไปจนถึงการติดตามความก้าวหน้า
              ทุกอย่างถูกออกแบบให้ใช้ง่าย สงบ สบายตา และพร้อมใช้งานบนทุกอุปกรณ์
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="primary-button">
                สร้างบัญชี
                <ArrowRight size={16} />
              </Link>
              <a
                href="#pathways"
                className="secondary-button border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                ดูเส้นทางเรียนรู้
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-sky-100/78">
              {platformSignals.map((signal) => (
                <div key={signal.label}>
                  <div className="font-display text-2xl font-semibold text-white">
                    {signal.value}
                  </div>
                  <div className="mt-1">{signal.label}</div>
                </div>
              ))}
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.12 }}
            className="relative mx-auto flex w-full max-w-4xl items-center justify-center"
          >
            <div className="absolute inset-x-[10%] top-[8%] h-[30rem] rounded-full bg-sky-400/18 blur-3xl" />
            <div className="absolute bottom-[8%] right-[4%] h-56 w-56 rounded-full bg-emerald-400/16 blur-3xl" />
            <HeroVisual />
          </MotionDiv>
        </div>
      </section>

      <section
        id="pathways"
        className="border-t border-white/10 bg-[#eef5ff] px-4 py-20 text-slate-950 sm:px-6 lg:px-10"
      >
        <div className="page-wrap">
          <div className="max-w-2xl">
            <p className="section-tag">Pathways</p>
            <h2 className="mt-5 font-display text-4xl font-semibold text-slate-950">
              เลือกทางเข้าได้ชัด แล้วไปต่อในพื้นที่ที่เหมาะกับบทบาทของคุณ
            </h2>
            <p className="mt-4 max-w-2xl text-base text-slate-600">
              แต่ละเส้นทางถูกจัดให้มีหน้าที่ของตัวเองชัดเจน
              เพื่อให้ผู้ใช้ไม่หลงทางตั้งแต่หน้าแรก
            </p>
          </div>

          <div className="mt-12 divide-y divide-slate-200 border-y border-slate-200">
            {courseCatalog.map((course, index) => (
              <MotionArticle
                key={course.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="grid gap-6 py-8 lg:grid-cols-[0.2fr_0.8fr_1.1fr_0.55fr]"
              >
                <div className="font-display text-4xl font-semibold text-slate-300">
                  0{index + 1}
                </div>
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${course.theme.iconWrap}`}
                  >
                    {getIcon(course.iconName, "h-6 w-6")}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${course.theme.text}`}>
                      {course.eyebrow}
                    </p>
                    <h3 className="mt-3 font-display text-3xl font-semibold text-slate-950">
                      {course.title}
                    </h3>
                    <p className="mt-3 text-sm text-slate-500">{course.audience}</p>
                  </div>
                </div>
                <div>
                  <p className="max-w-2xl text-base text-slate-600">{course.description}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {course.outcomes.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-start justify-between gap-4 lg:items-end">
                  <div className="text-sm text-slate-500">
                    <div>{course.modules} ขั้นตอน</div>
                    <div className="mt-1">{course.hours} ชั่วโมง</div>
                  </div>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    เข้าสู่เส้นทาง
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </MotionArticle>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 text-slate-950 sm:px-6 lg:px-10">
        <div className="page-wrap grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <MotionDiv
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
            className="max-w-xl"
          >
            <p className="section-tag">Experience</p>
            <h2 className="mt-5 font-display text-4xl font-semibold text-slate-950">
              ประสบการณ์ที่ช่วยให้คิดต่อ ทำต่อ และจำประเด็นสำคัญได้ง่ายขึ้น
            </h2>
            <p className="mt-4 text-base text-slate-600">
              เราจัดลำดับข้อมูล สี และจังหวะการเคลื่อนไหวใหม่
              ให้พื้นที่ใช้งานสงบขึ้น แต่ยังเน้นจุดสำคัญชัดในจังหวะที่ควรเห็น
            </p>
          </MotionDiv>

          <div className="space-y-6">
            {landingWorkflow.map((item, index) => (
              <MotionDiv
                key={item.title}
                initial={{ opacity: 0, x: 22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="grid gap-4 border-b border-slate-200 pb-6 last:border-b-0"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                  Step 0{index + 1}
                </div>
                <div className="grid gap-3 lg:grid-cols-[0.72fr_1.28fr]">
                  <h3 className="font-display text-2xl font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0d2035] px-4 py-20 sm:px-6 lg:px-10">
        <div className="page-wrap flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-tag border-white/15 bg-white/8 text-sky-100">
              Ready To Start
            </p>
            <h2 className="mt-5 font-display text-4xl font-semibold text-white">
              เริ่มต้นในพื้นที่เรียนรู้ที่อ่านง่าย ใช้งานง่าย และพาไปต่อได้จริง
            </h2>
            <p className="mt-4 text-base text-slate-300">
              เข้าสู่ระบบเพื่อเรียนต่อ หรือสร้างบัญชีใหม่แล้วเริ่มใช้งาน InSPIRE
              360 เวอร์ชันล่าสุดได้ทันที
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="secondary-button border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              เข้าสู่ระบบ
            </Link>
            <Link to="/register" className="primary-button">
              สร้างบัญชี
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-[1.02/0.92] w-full max-w-[46rem] overflow-hidden rounded-[42px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_32px_120px_rgba(2,8,23,0.42)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_28%,rgba(255,255,255,0.14),transparent_20%),radial-gradient(circle_at_76%_18%,rgba(47,124,246,0.22),transparent_22%),radial-gradient(circle_at_70%_76%,rgba(16,185,129,0.18),transparent_22%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-35" />

      <svg viewBox="0 0 860 760" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="pathA" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="50%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        <path
          d="M120 520C220 430 300 394 404 358C520 318 610 278 720 166"
          fill="none"
          stroke="url(#pathA)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M152 610C262 534 336 520 468 484C566 458 646 402 740 286"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="10 12"
        />
        <circle cx="154" cy="610" r="18" fill="#f3c35c" />
        <circle cx="404" cy="358" r="22" fill="#2f7cf6" />
        <circle cx="720" cy="166" r="22" fill="#10b981" />
        <circle cx="468" cy="484" r="12" fill="rgba(255,255,255,0.7)" />
        <circle cx="300" cy="394" r="12" fill="rgba(255,255,255,0.7)" />
      </svg>

      <div className="absolute left-[8%] top-[12%] max-w-[16rem]">
        <div className="rounded-[26px] border border-white/10 bg-slate-950/44 px-5 py-4 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.18em] text-sky-100/80">
            Learning Map
          </div>
          <div className="mt-3 font-display text-3xl font-semibold text-white">
            ทางเดียวกัน
          </div>
          <div className="mt-2 text-sm text-slate-200/88">
            แต่มีพื้นที่เฉพาะสำหรับครู ผู้เรียน และการต่อยอดด้าน AI
          </div>
        </div>
      </div>

      <div className="absolute bottom-[10%] left-[8%] max-w-[18rem]">
        <div className="rounded-[26px] border border-white/10 bg-white/8 px-5 py-4 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.18em] text-amber-100/80">
            Designed For Focus
          </div>
          <div className="mt-3 text-sm leading-7 text-slate-100/90">
            สีเย็นช่วยพยุงสมาธิ สีอุ่นใช้เฉพาะจุดตัดสินใจและสถานะสำคัญ
            เพื่อให้เห็นสิ่งที่ต้องทำต่อทันที
          </div>
        </div>
      </div>

      <div className="absolute right-[8%] top-[16%] flex w-[13rem] flex-col gap-3">
        <MiniNode tone="bg-sky-400/18 text-sky-100" label="Teacher" value="Mission-based modules" />
        <MiniNode tone="bg-emerald-400/16 text-emerald-100" label="Student" value="Open learning space" />
        <MiniNode tone="bg-amber-300/16 text-amber-50" label="AI Era" value="Next-stage pathway" />
      </div>
    </div>
  );
}

function MiniNode({ label, value, tone }) {
  return (
    <div className={`rounded-[22px] border border-white/10 px-4 py-3 backdrop-blur-xl ${tone}`}>
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/72">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}
