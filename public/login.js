// --- Simple in-memory user store for demo purposes ---
const USERS_KEY = "todo-demo-users";
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}
function setUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// --- Signup logic ---
document.getElementById("signup-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value;
  const errorDiv = document.getElementById("signup-error");
  errorDiv.textContent = "";
  if (!username || !password) {
    errorDiv.textContent = "Please enter both username and password.";
    return;
  }
  const users = getUsers();
  if (users[username]) {
    errorDiv.textContent = "Username already exists.";
    return;
  }
  users[username] = password;
  setUsers(users);
  errorDiv.style.color = '#388e3c';
  errorDiv.textContent = "Signup successful! Please login.";
  setTimeout(() => {
    errorDiv.textContent = "";
    document.getElementById("signup-form").reset();
    document.getElementById("login-tab").click();
  }, 1200);
});

// --- Login logic ---
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
  const users = getUsers();
  if (!users[username] || users[username] !== password) {
    errorDiv.textContent = "Invalid username or password.";
    return;
  }
  // Set username in cookie (expires in 7 days)
  document.cookie = `todo-username=${encodeURIComponent(
    username
  )}; path=/; max-age=604800`;
  globalThis.location.href = "index.html";
});

// Tab switching logic for login/signup
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const loginBox = document.getElementById("login-box");
const signupBox = document.getElementById("signup-box");
if (loginTab && signupTab && loginBox && signupBox) {
  loginTab.onclick = () => {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginBox.style.display = "block";
    signupBox.style.display = "none";
  };
  signupTab.onclick = () => {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupBox.style.display = "block";
    loginBox.style.display = "none";
  };
}

// If already logged in, redirect to main app
if (document.cookie.includes("todo-username=")) {
  globalThis.location.href = "index.html";
}
