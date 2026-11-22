const DB = {
  users: "meetsync_users",
  session: "meetsync_session",
  meetings: "meetsync_meetings",
  notifications: "meetsync_notifications"
};

function readStore(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function saveStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return readStore(DB.users, []);
}

function saveUsers(users) {
  saveStore(DB.users, users);
}

function getMeetings() {
  return readStore(DB.meetings, []);
}

function saveMeetings(meetings) {
  saveStore(DB.meetings, meetings);
}

function getNotifications() {
  return readStore(DB.notifications, []);
}

function saveNotifications(items) {
  saveStore(DB.notifications, items);
}

function currentUser() {
  return readStore(DB.session, null);
}

function initializeAdmin() {
  const users = getUsers();
  const adminEmail = "admin@meetsync.local";

  const existingAdmin = users.find(
    user => user.email?.toLowerCase() === adminEmail
  );

  if (existingAdmin) {
    existingAdmin.name = "System Administrator";
    existingAdmin.password = "Admin@123";
    existingAdmin.role = "admin";
  } else {
    users.push({
      id: "admin-001",
      name: "System Administrator",
      email: adminEmail,
      password: "Admin@123",
      role: "admin"
    });
  }

  saveUsers(users);
}

function setSession(user) {
  saveStore(DB.session, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
}

function logout() {
  localStorage.removeItem(DB.session);
  window.location.href = "index.html";
}

function requireAuth() {
  const user = currentUser();

  if (!user) {
    window.location.href = "index.html";
    return null;
  }

  return user;
}

function requireAdmin() {
  const user = requireAuth();

  if (!user) return null;

  if (user.role !== "admin") {
    alert("Administrator access required.");
    window.location.href = "dashboard.html";
    return null;
  }

  return user;
}

function formatDate(date) {
  if (!date) return "";

  return new Date(date + "T00:00:00").toLocaleDateString(
    undefined,
    { day: "numeric", month: "short", year: "numeric" }
  );
}

function formatTime(time) {
  if (!time) return "";

  const [hour, minute] = time.split(":");
  const date = new Date();

  date.setHours(Number(hour), Number(minute));

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function meetingStartDate(meeting) {
  return new Date(`${meeting.date}T${meeting.startTime}`);
}

function getMeetingStatus(meeting) {
  if (meeting.cancelled) return "cancelled";

  const end = new Date(`${meeting.date}T${meeting.endTime}`);

  return end < new Date() ? "completed" : "upcoming";
}

function statusBadge(meeting) {
  const status = getMeetingStatus(meeting);
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return `<span class="status ${status}">${label}</span>`;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function addNotification(title, message, userEmail = "") {
  const items = getNotifications();

  items.unshift({
    id: "notice-" + Date.now(),
    title,
    message,
    userEmail,
    date: new Date().toISOString(),
    read: false
  });

  saveNotifications(items);
}

function checkConflict(date, startTime, endTime, participants, ignoreId = null) {
  const requested = participants.map(email =>
    email.trim().toLowerCase()
  );

  return getMeetings().find(meeting => {
    if (
      meeting.id === ignoreId ||
      meeting.cancelled ||
      meeting.date !== date
    ) return false;

    const existing = (meeting.participants || []).map(email =>
      email.toLowerCase()
    );

    const shared = requested.some(email => existing.includes(email));

    return shared &&
      startTime < meeting.endTime &&
      endTime > meeting.startTime;
  });
}

function initializePage() {
  initializeAdmin();

  const user = currentUser();

  if (document.body.classList.contains("auth-page")) return;

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const nameElement = document.getElementById("userName");
  const avatar = document.getElementById("userAvatar");

  if (nameElement) nameElement.textContent = user.name;

  if (avatar) {
    avatar.textContent = user.name.charAt(0).toUpperCase();
  }

  const adminLink = document.getElementById("adminNav");

  if (adminLink && user.role !== "admin") {
    adminLink.style.display = "none";
  }

  const logoutLink = document.getElementById("logoutLink");

  if (logoutLink) {
    logoutLink.addEventListener("click", event => {
      event.preventDefault();
      logout();
    });
  }
}

document.addEventListener("DOMContentLoaded", initializePage);