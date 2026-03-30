function getProfileCacheKey(userId) {
  return `profile-cache:${userId}`;
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
