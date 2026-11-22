document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;

  const form = document.getElementById("scheduleForm");
  if (!form) return;

  const dateInput = document.getElementById("date");
  dateInput.min = new Date().toISOString().split("T")[0];

  form.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const date = dateInput.value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const platform = document.getElementById("platform").value;
    const meetingLink = document.getElementById("meetingLink").value.trim();
    const participants = document.getElementById("participants").value
      .split(",").map(email => email.trim().toLowerCase()).filter(Boolean);

    const message = document.getElementById("scheduleMessage");
    message.classList.remove("success");

    if (startTime >= endTime) {
      message.textContent = "The end time must be later than the start time.";
      return;
    }

    if (new Date(`${date}T${startTime}`) <= new Date()) {
      message.textContent = "Please choose a future meeting date and time.";
      return;
    }

    const conflict = checkConflict(date, startTime, endTime, participants);
    if (conflict) {
      message.textContent = `Scheduling conflict: a participant is already booked for "${conflict.title}".`;
      return;
    }

    const user = currentUser();
    const meeting = {
      id: "meeting-" + Date.now(),
      title,
      description,
      date,
      startTime,
      endTime,
      platform,
      meetingLink,
      participants,
      createdBy: user.email,
      createdByName: user.name,
      cancelled: false,
      createdAt: new Date().toISOString()
    };

    const meetings = getMeetings();
    meetings.push(meeting);
    saveMeetings(meetings);

    addNotification(
      "Meeting scheduled",
      `${title} has been scheduled for ${formatDate(date)}.`,
      user.email
    );

    message.textContent = "Meeting successfully scheduled.";
    message.classList.add("success");
    form.reset();

    setTimeout(() => window.location.href = "meetings.html", 800);
  });
});