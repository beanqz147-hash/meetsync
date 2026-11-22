document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;

  const list = document.getElementById("notificationsList");

  function render() {
    const items = getNotifications();

    if (!items.length) {
      list.innerHTML = `<div class="panel empty-state">You have no notifications.</div>`;
      return;
    }

    list.innerHTML = items.map(item => `
      <article class="notification-card ${item.read ? "read" : ""}">
        <span class="notification-dot"></span>
        <div>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.message)}</p>
          <p>${new Date(item.date).toLocaleString()}</p>
          ${!item.read ? `<button class="btn btn-secondary" data-read="${item.id}">Mark as read</button>` : ""}
        </div>
      </article>
    `).join("");
  }

  list.addEventListener("click", event => {
    const id = event.target.dataset.read;
    if (!id) return;

    const items = getNotifications();
    const item = items.find(n => n.id === id);
    if (item) item.read = true;
    saveNotifications(items);
    render();
  });

  document.getElementById("markAllRead").addEventListener("click", () => {
    const items = getNotifications().map(item => ({ ...item, read: true }));
    saveNotifications(items);
    render();
  });

  document.getElementById("clearNotifications").addEventListener("click", () => {
    if (!confirm("Clear all notifications?")) return;
    saveNotifications([]);
    render();
  });

  render();
});