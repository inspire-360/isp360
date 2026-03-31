import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Home,
  LifeBuoy,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLine } from "../contexts/LineContext";
import { usePresence, writePresence } from "../hooks/usePresence";
import { getRoleLabel } from "../data/profileOptions";
import { readLocalProfileCache } from "../lib/profileCache";
import BrandMark from "./BrandMark";

const PAGE_COPY = [
  {
    match: (pathname) => pathname.startsWith("/dashboard"),
    title: "พื้นที่ทำงานการเรียนรู้",
    description: "ติดตามรุ่นผู้เรียน ปลดล็อกพื้นที่ และเห็นขั้นตอนถัดไปได้ชัดเจน",
  },
  {
    match: (pathname) => pathname.startsWith("/courses"),
    title: "เส้นทางการเรียนรู้ที่ใช้งานอยู่",
    description: "รวมทุกคอร์สที่คุณเข้าร่วม พร้อมความคืบหน้าและจุดกลับมาเรียนต่อในที่เดียว",
  },
  {
    match: (pathname) => pathname.startsWith("/profile"),
    title: "ตั้งค่าโปรไฟล์",
    description: "อัปเดตข้อมูลส่วนตัว สถานศึกษา และรายละเอียดบัญชีให้เป็นปัจจุบัน",
  },
  {
    match: (pathname) => pathname.startsWith("/sos"),
    title: "ศูนย์รับเรื่อง SOS",
    description: "แจ้งปัญหา ขอความช่วยเหลือ และติดตามสถานะเรื่องตามระดับความเร่งด่วน",
  },
  {
    match: (pathname) => pathname.startsWith("/admin"),
    title: "แผงควบคุมผู้ดูแลระบบ",
    description: "ภาพรวมผู้ใช้ คำตอบจากแต่ละโมดูล สถานะเรียน และคิว SOS สำหรับทีมดูแล",
  },
];

export default function Layout() {
  const { currentUser } = useAuth();
  const { logoutLine } = useLine();
  const location = useLocation();
  const navigate = useNavigate();


  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showFocusNotice, setShowFocusNotice] = useState(false);
  const [userData, setUserData] = useState({
    name: currentUser?.displayName || currentUser?.email?.split("@")[0] || "ผู้เรียน",
    role: "learner",
    photoURL: currentUser?.photoURL || "",
  });

  usePresence(userData);

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }

    const fallbackName =
      currentUser.displayName || currentUser.email?.split("@")[0] || "ผู้เรียน";

    const applyUserProfile = (cloudProfile = null) => {
      const localProfile = readLocalProfileCache(currentUser.uid) || {};
      const mergedProfile = { ...(cloudProfile || {}), ...localProfile };

      setUserData({
        name: mergedProfile.name || fallbackName,
        role: mergedProfile.role || "learner",
        photoURL: mergedProfile.photoURL || currentUser.photoURL || "",
      });
    };

    const unsubscribe = onSnapshot(
      doc(db, "users", currentUser.uid),
      (snapshot) => {
        if (!snapshot.exists()) {
          applyUserProfile();
          return;
        }

        applyUserProfile(snapshot.data());
      },
      (error) => {
        console.error("Error reading user profile:", error);
        applyUserProfile();
      },
    );

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    let timeoutId;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        return;
      }

      setShowFocusNotice(true);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setShowFocusNotice(false), 3200);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearTimeout(timeoutId);
    };
  }, []);

  const pageMeta =
    PAGE_COPY.find((item) => item.match(location.pathname)) ?? PAGE_COPY[0];

  const avatarUrl = useMemo(
    () =>
      userData.photoURL ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userData.name,
      )}&background=0f172a&color=fff`,
    [userData.name, userData.photoURL],
  );

  const navItems = useMemo(() => {
    const items = [
      {
        icon: Home,
        label: "แดชบอร์ด",
        path: "/dashboard",
        description: "ภาพรวม สิทธิ์เข้าใช้ และการใช้งานล่าสุด",
      },
      {
        icon: BookOpen,
        label: "คอร์สของฉัน",
        path: "/courses",
        description: "เส้นทางการเรียนรู้ที่คุณลงทะเบียนแล้ว",
      },
      {
        icon: LifeBuoy,
        label: "SOS",
        path: "/sos",
        description: "แจ้งปัญหา ขอความช่วยเหลือ และติดตามสถานะเรื่อง",
      },
      {
        icon: User,
        label: "โปรไฟล์",
        path: "/profile",
        description: "ข้อมูลส่วนตัวและการตั้งค่าบัญชี",
      },
    ];

    if (userData.role === "admin") {
      items.splice(3, 0, {
        icon: ShieldCheck,
        label: "Admin",
        path: "/admin",
        description: "จัดการผู้ใช้ คอร์ส และคิว SOS",
      });
    }

    return items;
  }, [userData.role]);

  const handleLogout = async () => {
    try {
      sessionStorage.setItem("manualLogout", "true");
      try {
        await writePresence(
          {
            uid: currentUser?.uid,
            name: userData.name,
            photoURL: userData.photoURL,
            role: userData.role,
          },
          false,
          userData.role,
        );
      } catch (presenceError) {
        console.warn("Presence update before logout failed:", presenceError);
      }
      try {
        logoutLine();
      } catch (lineError) {
        console.warn("LINE logout failed:", lineError);
      }
      await auth.signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111d] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.2),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(216,163,95,0.14),transparent_22%)]" />

      {showFocusNotice && (
        <div className="fixed right-4 top-4 z-[70] max-w-sm rounded-2xl border border-amber-300/20 bg-slate-950/85 px-4 py-3 text-sm text-slate-100 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-amber-400/15 p-2 text-amber-200">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="font-semibold">กลับเข้าสู่โหมดใช้งานแล้ว</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">
                ระบบกำลังอัปเดตสถานะการใช้งานของคุณอีกครั้ง
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex min-h-screen">
        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[19rem] flex-col border-r border-white/10 bg-slate-950/88 px-4 py-4 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-2 py-1">
            <BrandMark invert compact href="/dashboard" />
            <button
              type="button"
              className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 rounded-[28px] border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200">
              พื้นที่ปัจจุบัน
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.06em] text-white">
              {pageMeta.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {pageMeta.description}
            </p>
          </div>

          <nav className="mt-5 flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-[24px] px-4 py-4 transition ${
                      isActive
                        ? "border border-white/10 bg-white text-slate-950 shadow-lg shadow-slate-950/25"
                        : "border border-transparent bg-white/0 text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                          isActive
                            ? "bg-slate-950 text-white"
                            : "bg-white/10 text-slate-200"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{item.label}</p>
                        <p
                          className={`mt-1 text-xs ${
                            isActive ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`transition ${
                          isActive
                            ? "translate-x-0 text-slate-400"
                            : "-translate-x-1 text-slate-500 group-hover:translate-x-0"
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-5 space-y-3 rounded-[28px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl}
                alt={userData.name}
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white/10"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{userData.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                  {getRoleLabel(userData.role)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-300/20 hover:bg-red-400/10 hover:text-red-100"
            >
              <LogOut size={16} />
              ออกจากระบบ
            </button>
          </div>
        </aside>

        <div className="relative flex min-h-screen flex-1 flex-col lg:pl-0">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07111d]/78 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="page-wrap flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={18} />
                </button>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                    InSPIRE Workspace
                  </p>
                  <h1 className="truncate font-display text-2xl font-semibold tracking-[-0.05em] text-white">
                    {pageMeta.title}
                  </h1>
                </div>
              </div>

              <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 md:block">
                บัญชี{getRoleLabel(userData.role)}กำลังใช้งาน
              </div>
            </div>
          </header>

          <main className="relative flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
