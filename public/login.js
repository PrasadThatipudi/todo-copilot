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
  // For demo: just store username in localStorage and redirect
  localStorage.setItem("todo-username", username);
  globalThis.location.href = "index.html";
});

// If already logged in, redirect to main app
if (localStorage.getItem("todo-username")) {
  globalThis.location.href = "index.html";
}
