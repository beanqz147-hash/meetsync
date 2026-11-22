document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("loginForm");
    const message = document.getElementById("loginMessage");

    if (!form || !message) return;

    const USERS_KEY = "meetsync_users";
    const SESSION_KEY = "meetsync_session";

    let users = [];

    try {
        users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch (error) {
        users = [];
    }

    if (!Array.isArray(users)) users = [];

    const adminEmail = "admin@meetsync.local";

    let admin = users.find(user =>
        user.email?.toLowerCase() === adminEmail
    );

    if (!admin) {
        admin = {
            id: "admin-001",
            name: "System Administrator",
            email: adminEmail,
            password: "Admin@123",
            role: "admin"
        };

        users.push(admin);
    } else {
        admin.name = "System Administrator";
        admin.password = "Admin@123";
        admin.role = "admin";
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        message.textContent = "";

        const email = document.getElementById("email")
            .value.trim().toLowerCase();

        const password = document.getElementById("password").value;

        const user = users.find(account =>
            account.email?.toLowerCase() === email &&
            account.password === password
        );

        if (!user) {
            message.textContent = "Incorrect email or password.";
            return;
        }

        const session = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify(session)
        );

        window.location.replace("dashboard.html");
    });

});