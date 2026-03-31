function getProfileCacheKey(userId) {
  return `profile-cache:${userId}`;
}

function getProfileTimestamp(value) {
  if (!value) {
    return 0;
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().getTime();
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}

function pickProfileField(cloudProfile, localProfile, key, preferLocal) {
  return preferLocal
    ? localProfile?.[key] || cloudProfile?.[key] || ""
    : cloudProfile?.[key] || localProfile?.[key] || "";
}

export function mergeProfileSources(cloudProfile = null, localProfile = null) {
  const cloud = cloudProfile || {};
  const local = localProfile || {};
  const preferLocalEditable =
    getProfileTimestamp(local.updatedAt) > getProfileTimestamp(cloud.updatedAt);

  return {
    ...cloud,
    uid: cloud.uid || local.uid || "",
    email: cloud.email || local.email || "",
    role: cloud.role || local.role || "learner",
    prefix: pickProfileField(cloud, local, "prefix", preferLocalEditable),
    firstName: pickProfileField(cloud, local, "firstName", preferLocalEditable),
    lastName: pickProfileField(cloud, local, "lastName", preferLocalEditable),
    name: pickProfileField(cloud, local, "name", preferLocalEditable),
    position: pickProfileField(cloud, local, "position", preferLocalEditable),
    school: pickProfileField(cloud, local, "school", preferLocalEditable),
    photoURL: pickProfileField(cloud, local, "photoURL", preferLocalEditable),
    updatedAt: preferLocalEditable ? local.updatedAt || cloud.updatedAt : cloud.updatedAt || local.updatedAt,
  };
}

export function readLocalProfileCache(userId) {
  if (!userId || typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getProfileCacheKey(userId));
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    console.error("Error reading local profile cache:", error);
    return null;
  }
}

export function writeLocalProfileCache(userId, payload) {
  if (!userId || typeof window === "undefined") {
    return null;
  }

  try {
    const nextValue = {
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      getProfileCacheKey(userId),
      JSON.stringify(nextValue),
    );

    return nextValue;
  } catch (error) {
    console.error("Error writing local profile cache:", error);
    return null;
  }
}
