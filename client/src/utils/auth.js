export const saveAuthSession = (token, user) => {
  localStorage.setItem("authToken", token);

  localStorage.setItem(
    "currentUser",
    JSON.stringify(user)
  );

  if (user.role === "resident") {
    localStorage.setItem(
      "loggedInResident",
      JSON.stringify(user)
    );
  }

  if (user.role === "guard") {
    localStorage.setItem(
      "loggedInGuard",
      JSON.stringify(user)
    );
  }

  if (user.role === "admin") {
    localStorage.setItem(
      "loggedInAdmin",
      JSON.stringify(user)
    );
  }
};

export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(
      "currentUser"
    );

    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const isLoggedIn = () => {
  return Boolean(
    localStorage.getItem("authToken") &&
    localStorage.getItem("currentUser")
  );
};

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");

  localStorage.removeItem(
    "loggedInResident"
  );

  localStorage.removeItem(
    "loggedInGuard"
  );

  localStorage.removeItem(
    "loggedInAdmin"
  );
};

export const getRoleHome = (role) => {
  if (role === "resident") {
    return "/resident/dashboard";
  }

  if (role === "guard") {
    return "/guard/dashboard";
  }

  if (role === "admin") {
    return "/admin/dashboard";
  }

  return "/";
};