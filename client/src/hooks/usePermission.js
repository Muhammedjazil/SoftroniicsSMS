export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isSuperAdminUser = (user) => {
  if (!user) return false;
  const roleName =
    typeof user.role === "object" ? user.role?.role : user.role;

  return (
    user.userType === "admin" ||
    (typeof roleName === "string" && /^super\s*admin$/i.test(roleName))
  );
};

export const checkUserPermission = (user, moduleKey, actionKey) => {
  if (!user) return false;
  if (isSuperAdminUser(user)) return true;
  if (!moduleKey || !actionKey) return true;

  return !!user.permissions?.[moduleKey]?.[actionKey];
};

const usePermission = () => {
  const user = getStoredUser();
  const can = (moduleKey, actionKey) =>
    checkUserPermission(user, moduleKey, actionKey);

  return {
    user,
    isAdmin: isSuperAdminUser(user),
    can,
  };
};

export default usePermission;