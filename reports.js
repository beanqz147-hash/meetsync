document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;

  const meetings = getMeetings();
  const upcoming = meetings.filter(m => getMeetingStatus(m) === "upcoming");
  const completed = meetings.filter(m => getMeetingStatus(m) === "completed");
  const cancelled = meetings.filter(m => getMeetingStatus(m) === "cancelled");

  document.getElementById("reportTotal").textContent = meetings.length;
  document.getElementById("reportCompleted").textContent = completed.length;
  document.getElementById("reportCancelled").textContent = cancelled.length;

  const platformCounts = {};
  meetings.forEach(meeting => {
    platformCounts[meeting.platform] = (platformCounts[meeting.platform] || 0) + 1;
  });

  document.getElementById("platformBreakdown").innerHTML =
    Object.entries(platformCounts).map(([platform, count]) =>
      `<tr><td>${escapeHTML(platform)}</td><td>${count}</td></tr>`
    ).join("") || `<tr><td colspan="2">No platform data available.</td></tr>`;

  document.getElementById("reportMeetings").innerHTML =
    meetings.map(meeting => `
      <tr>
        <td>${escapeHTML(meeting.title)}</td>
        <td>${formatDate(meeting.date)}</td>
        <td>${escapeHTML(meeting.platform)}</td>
        <td>${statusBadge(meeting)}</td>
      </tr>
    `).join("") || `<tr><td colspan="4">No meetings available.</td></tr>`;

  const canvas = document.getElementById("reportChart");
  if (canvas && window.Chart) {
    new Chart(canvas, {
      type: "bar",
      data: {
        labels: ["Upcoming", "Completed", "Cancelled"],
        datasets: [{
          label: "Meetings",
          data: [upcoming.length, completed.length, cancelled.length],
          backgroundColor: ["#438cff", "#35c995", "#f16c80"],
          borderRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#b9c1d0" }, grid: { color: "#343945" } },
          y: { beginAtZero: true, ticks: { color: "#b9c1d0", precision: 0 }, grid: { color: "#343945" } }
        }
      }
    });
  }

  document.getElementById("exportReport").addEventListener("click", () => {
    const rows = [
      ["Meeting", "Date", "Start Time", "End Time", "Platform", "Status"],
      ...meetings.map(m => [
        m.title, m.date, m.startTime, m.endTime, m.platform, getMeetingStatus(m)
      ])
    ];

    const csv = rows.map(row =>
      row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "meetsync-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  });
});