import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { Loader2, Lock } from "lucide-react";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  getLocalEnrollment,
  getPendingEnrollmentStorageKey,
} from "../lib/enrollment";

export default function CourseGuard({ children, courseId }) {
  const { currentUser } = useAuth();
  const [guardState, setGuardState] = useState("checking");
  const pendingKey = courseId ? getPendingEnrollmentStorageKey(courseId) : "";
  const hasPendingAccess = pendingKey
    ? sessionStorage.getItem(pendingKey) === "pending"
    : false;
  const hasLocalAccess =
    currentUser && courseId
      ? Boolean(getLocalEnrollment(currentUser.uid, courseId))
      : false;

  useEffect(() => {
    if (!currentUser || !courseId) {
      return undefined;
    }

    const enrollmentRef = doc(db, "users", currentUser.uid, "enrollments", courseId);
    let pendingTimeoutId;

    const unsubscribe = onSnapshot(
      enrollmentRef,
      (enrollmentSnapshot) => {
        if (enrollmentSnapshot.exists() || getLocalEnrollment(currentUser.uid, courseId)) {
          sessionStorage.removeItem(pendingKey);
          window.clearTimeout(pendingTimeoutId);
          setGuardState("allowed");
          return;
        }

        if (sessionStorage.getItem(pendingKey) === "pending") {
          setGuardState("pending");
          window.clearTimeout(pendingTimeoutId);
          pendingTimeoutId = window.setTimeout(() => {
            if (getLocalEnrollment(currentUser.uid, courseId)) {
              setGuardState("allowed");
              return;
            }

            setGuardState("denied");
            sessionStorage.removeItem(pendingKey);
          }, 8000);
          return;
        }

        setGuardState("denied");
      },
      (error) => {
        console.error("Error checking enrollment:", error);

        if (sessionStorage.getItem(pendingKey) === "pending" || getLocalEnrollment(currentUser.uid, courseId)) {
          setGuardState("allowed");
          return;
        }

        setGuardState("denied");
      },
    );

    return () => {
      window.clearTimeout(pendingTimeoutId);
      unsubscribe();
    };
  }, [courseId, currentUser, pendingKey]);

  if (!currentUser || !courseId) {
    return (
      <div className="page-wrap flex min-h-[70vh] items-center justify-center px-4">
        <section className="dark-panel max-w-2xl p-8 text-center sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-400/10 text-red-200">
            <Lock size={36} />
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-red-200">
            ต้องมีสิทธิ์เข้าใช้งาน
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.08em] text-white">
            ห้องนี้ยังไม่พร้อมใช้งาน
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-300">
            กรุณาเข้าสู่ระบบและตรวจสอบสิทธิ์คอร์สอีกครั้ง
          </p>
          <Link
            to="/dashboard"
            className="secondary-button mt-8 border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            กลับไปแดชบอร์ด
          </Link>
        </section>
      </div>
    );
  }

  if (hasPendingAccess || hasLocalAccess) {
    return children;
  }

  if (guardState === "checking" || guardState === "pending") {
    const title =
      guardState === "pending"
        ? "กำลังเตรียมห้องเรียนหลังยืนยันรหัส"
        : "กำลังตรวจสอบสิทธิ์เข้าเรียน";
    const description =
      guardState === "pending"
        ? "ระบบกำลังสร้างสถานะคอร์สและเปิดห้องเรียนให้คุณอัตโนมัติ"
        : "ระบบกำลังยืนยันว่าห้องเรียนนี้ถูกปลดล็อกสำหรับบัญชีของคุณแล้ว";

    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="dark-panel flex max-w-md items-center gap-4 p-5">
          <Loader2 size={24} className="animate-spin text-sky-200" />
          <div>
            <p className="font-semibold text-white">{title}</p>
            <p className="mt-1 text-sm leading-7 text-slate-300">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap flex min-h-[70vh] items-center justify-center px-4">
      <section className="dark-panel max-w-2xl p-8 text-center sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-400/10 text-red-200">
          <Lock size={36} />
        </div>
        <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-red-200">
          ต้องมีสิทธิ์เข้าใช้งาน
        </p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.08em] text-white">
          ห้องนี้ยังไม่ถูกปลดล็อกสำหรับคุณ
        </h2>
        <p className="mt-4 text-base leading-8 text-slate-300">
          กรุณากลับไปที่แดชบอร์ด ลงทะเบียนคอร์สนี้ก่อน แล้วจึงกลับมาเข้าใช้งานอีกครั้ง
        </p>
        <Link
          to="/dashboard"
          className="secondary-button mt-8 border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          กลับไปแดชบอร์ด
        </Link>
      </section>
    </div>
  );
}
