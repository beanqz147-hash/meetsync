document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;

  const list = document.getElementById("meetingsList");
  const search = document.getElementById("meetingSearch");
  const filter = document.getElementById("meetingFilter");

  function render() {
    const query = search.value.toLowerCase();
    const statusFilter = filter.value;

    const meetings = getMeetings().filter(meeting => {
      const matchesSearch = meeting.title.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || getMeetingStatus(meeting) === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => meetingStartDate(a) - meetingStartDate(b));

    if (!meetings.length) {
      list.innerHTML = `<div class="panel empty-state">No meetings found. Schedule a new meeting to get started.</div>`;
      return;
    }

    list.innerHTML = meetings.map(meeting => `
      <article class="meeting-card">
        <div class="panel-heading">
          <h3>${escapeHTML(meeting.title)}</h3>
          ${statusBadge(meeting)}
        </div>
        <p><strong>Date:</strong> ${formatDate(meeting.date)}</p>
        <p><strong>Time:</strong> ${formatTime(meeting.startTime)} – ${formatTime(meeting.endTime)}</p>
        <p><strong>Platform:</strong> ${escapeHTML(meeting.platform)}</p>
        <p><strong>Participants:</strong> ${meeting.participants.length ? meeting.participants.map(escapeHTML).join(", ") : "None added"}</p>
        <p>${escapeHTML(meeting.description)}</p>
        ${meeting.meetingLink ? `<p><a class="small" href="${escapeHTML(meeting.meetingLink)}" target="_blank" rel="noopener">Open meeting link ↗</a></p>` : ""}
        ${getMeetingStatus(meeting) !== "cancelled" ? `
          <div class="card-actions">
            <button class="btn btn-secondary" data-edit="${meeting.id}">Edit</button>
            <button class="btn btn-danger" data-cancel="${meeting.id}">Cancel Meeting</button>
          </div>` : ""}
      </article>
    `).join("");
  }

  list.addEventListener("click", event => {
    const editId = event.target.dataset.edit;
    const cancelId = event.target.dataset.cancel;

    if (editId) editMeeting(editId);
    if (cancelId) cancelMeeting(cancelId);
  });

  function editMeeting(id) {
    const meetings = getMeetings();
    const meeting = meetings.find(m => m.id === id);
    if (!meeting) return;

    const title = prompt("Meeting title:", meeting.title);
    if (title === null) return;

    const date = prompt("Date (YYYY-MM-DD):", meeting.date);
    if (date === null) return;

    const startTime = prompt("Start time (HH:MM):", meeting.startTime);
    if (startTime === null) return;

    const endTime = prompt("End time (HH:MM):", meeting.endTime);
    if (endTime === null) return;

    const participantsText = prompt("Participant emails, separated by commas:", meeting.participants.join(", "));
    if (participantsText === null) return;

    const participants = participantsText.split(",").map(x => x.trim().toLowerCase()).filter(Boolean);

    if (!title.trim() || !date || !startTime || !endTime || startTime >= endTime) {
      alert("Please enter valid meeting details.");
      return;
    }

    if (new Date(`${date}T${startTime}`) <= new Date()) {
      alert("Please choose a future meeting time.");
      return;
    }

    const conflict = checkConflict(date, startTime, endTime, participants, id);
    if (conflict) {
      alert(`Scheduling conflict with "${conflict.title}".`);
      return;
    }

    meeting.title = title.trim();
    meeting.date = date;
    meeting.startTime = startTime;
    meeting.endTime = endTime;
    meeting.participants = participants;

    saveMeetings(meetings);
    addNotification("Meeting updated", `${meeting.title} has been updated.`);
    render();
  }

  function cancelMeeting(id) {
    if (!confirm("Are you sure you want to cancel this meeting?")) return;

    const meetings = getMeetings();
    const meeting = meetings.find(m => m.id === id);
    if (!meeting) return;

    meeting.cancelled = true;
    saveMeetings(meetings);
    addNotification("Meeting cancelled", `${meeting.title} has been cancelled.`);
    render();
  }

  search.addEventListener("input", render);
  filter.addEventListener("change", render);
  render();
});