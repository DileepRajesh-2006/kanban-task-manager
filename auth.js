function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || [];
}

function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function signUp() {
  const username = document.getElementById('signupUsername').value.trim();
  const password = document.getElementById('signupPassword').value;

  if (!username || !password) return alert("Please fill in all fields.");

  const users = getUsers();
  if (users.find(u => u.username === username)) {
    return alert("Username already taken.");
  }

  users.push({ username, password });
  setUsers(users);
  alert("Sign-up successful. Please login.");
  window.location.href = "login.html";
}

function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem("currentUser", username);
    window.location.href = "kanban.html";
  } else {
    alert("Invalid username or password.");
  }
}
