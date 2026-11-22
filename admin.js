document.addEventListener("DOMContentLoaded", () => {
  const admin = requireAdmin();
  if (!admin) return;

  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("newEmail").value.trim().toLowerCase();
    const password = document.getElementById("newPassword").value;
    const confirmation = document.getElementById("confirmPassword").value;
    const message = document.getElementById("registerMessage");

    message.classList.remove("success");

    if (password.length < 6) {
      message.textContent = "Password must be at least six characters.";
      return;
    }

    if (password !== confirmation) {
      message.textContent = "The passwords do not match.";
      return;
    }

    const users = getUsers();

    if (users.some(user => user.email.toLowerCase() === email)) {
      message.textContent = "An account with this email already exists.";
      return;
    }

    users.push({
      id: "user-" + Date.now(),
      name,
      email,
      password,
      role: "user"
    });

    saveUsers(users);

    message.textContent = "User account created successfully.";
    message.classList.add("success");
    form.reset();
  });
});