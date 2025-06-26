document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const errorDiv = document.getElementById("login-error");
  errorDiv.textContent = "";
  if (!username || !password) {
    errorDiv.textContent = "Please enter both username and password.";
    return;
  }
  // Set username in cookie (expires in 7 days)
  document.cookie = `todo-username=${encodeURIComponent(
    username
  )}; path=/; max-age=604800`;
  globalThis.location.href = "index.html";
});

// If already logged in, redirect to main app
if (document.cookie.includes("todo-username=")) {
  globalThis.location.href = "index.html";
}
