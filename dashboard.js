document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;

  const meetings = getMeetings();
  const upcoming = meetings.filter(m => getMeetingStatus(m) === "upcoming");
  const completed = meetings.filter(m => getMeetingStatus(m) === "completed");
  const cancelled = meetings.filter(m => getMeetingStatus(m) === "cancelled");
  const unread = getNotifications().filter(n => !n.read).length;

  document.getElementById("totalMeetings").textContent = meetings.length;
  document.getElementById("upcomingMeetings").textContent = upcoming.length;
  document.getElementById("completedMeetings").textContent = completed.length;
  document.getElementById("unreadNotifications").textContent = unread;

  const recent = document.getElementById("recentMeetings");
  const sorted = upcoming.sort((a, b) => meetingStartDate(a) - meetingStartDate(b)).slice(0, 6);

  recent.innerHTML = sorted.length ? sorted.map(meeting => `
    <tr>
      <td>${escapeHTML(meeting.title)}</td>
      <td>${formatDate(meeting.date)}</td>
      <td>${formatTime(meeting.startTime)}</td>
      <td>${statusBadge(meeting)}</td>
    </tr>
  `).join("") : `<tr><td colspan="4" class="empty-state">No upcoming meetings.</td></tr>`;

  const canvas = document.getElementById("meetingChart");
  if (canvas && window.Chart) {
    new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["Upcoming", "Completed", "Cancelled"],
        datasets: [{
          data: [upcoming.length, completed.length, cancelled.length],
          backgroundColor: ["#438cff", "#35c995", "#f16c80"],
          borderColor: "#20232b",
          borderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#cbd1df", padding: 20 }
          }
        }
      }
    });
  }
});