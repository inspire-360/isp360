import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Circle, Users } from "lucide-react";
import { db } from "../lib/firebase";
import { getRoleLabel } from "../data/profileOptions";
import { formatLastSeenLabel, isUserCurrentlyOnline } from "../lib/presence";

function getPresenceMeta(user) {
  if (user.isOnline) {
    return { label: "กำลังใช้งาน", tone: "text-emerald-300" };
  }

  return {
    label: formatLastSeenLabel(user.lastSeen),
    tone: "text-slate-400",
  };
}

function UserPresenceRow({ user }) {
  const presence = getPresenceMeta(user);
  const avatarUrl =
    user.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name || user.email || "User",
    )}&background=0f172a&color=fff`;

  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3">
      <div className="relative">
        <img
          src={avatarUrl}
          alt={user.name || "User"}
          className="h-11 w-11 rounded-2xl object-cover ring-2 ring-white/10"
          referrerPolicy="no-referrer"
        />
        <Circle
          size={10}
          className={`absolute -bottom-0.5 -right-0.5 fill-current ${
            user.isOnline ? "text-emerald-400" : "text-slate-500"
          }`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {user.name || user.email || "ผู้ใช้ยังไม่ได้ระบุชื่อ"}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">
            {getRoleLabel(user.role || "learner")}
          </span>
          <span className={presence.tone}>{presence.label}</span>
        </div>
      </div>
    </div>
  );
}

function PresenceGroup({ title, users, tone }) {
  if (users.length === 0) {
    return null;
  }

  return (
    <div>
      <div className={`mb-3 text-[11px] uppercase tracking-[0.24em] ${tone}`}>
        {title} {users.length} คน
      </div>
      <div className="space-y-3">
        {users.map((user) => (
          <UserPresenceRow key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

export default function OnlineUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "presence"), (snapshot) => {
      const allUsers = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();

        return {
          id: docSnapshot.id,
          ...data,
          isOnline: isUserCurrentlyOnline(data),
        };
      });

      const sortedUsers = [...allUsers].sort((left, right) => {
        if (left.isOnline !== right.isOnline) {
          return left.isOnline ? -1 : 1;
        }

        const leftTime = left.lastSeen?.toMillis?.() || 0;
        const rightTime = right.lastSeen?.toMillis?.() || 0;
        return rightTime - leftTime;
      });

      setUsers(sortedUsers);
    });

    return () => unsubscribe();
  }, []);

  const onlineUsers = useMemo(
    () => users.filter((user) => user.isOnline),
    [users],
  );
  const offlineUsers = useMemo(
    () => users.filter((user) => !user.isOnline),
    [users],
  );

  return (
    <section className="dark-panel overflow-hidden p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            สถานะผู้ใช้งาน
          </p>
          <h3 className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold text-white">
            <Users size={20} className="text-sky-200" />
            ผู้ใช้ที่กำลังใช้งานระบบ
          </h3>
        </div>
        <div className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-200">
          ออนไลน์ {onlineUsers.length} / ทั้งหมด {users.length}
        </div>
      </div>

      {users.length === 0 ? (
        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
          สถานะผู้ใช้งานจะปรากฏที่นี่เมื่อระบบเริ่มซิงก์การเข้าใช้งานแล้ว
        </div>
      ) : (
        <div className="mt-6 max-h-[34rem] space-y-5 overflow-y-auto pr-1 custom-scrollbar">
          <PresenceGroup
            title="ออนไลน์ตอนนี้"
            users={onlineUsers}
            tone="text-emerald-200"
          />
          <PresenceGroup
            title="ใช้งานล่าสุด"
            users={offlineUsers}
            tone="text-slate-400"
          />
        </div>
      )}
    </section>
  );
}
