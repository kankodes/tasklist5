// Theme toggle
const toggle = document.getElementById('toggleTheme');
const currentTheme = localStorage.getItem('theme') || 'light';
document.body.classList.toggle('dark', currentTheme === 'dark');
toggle.checked = currentTheme === 'dark';
toggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', toggle.checked);
  localStorage.setItem('theme', toggle.checked ? 'dark' : 'light');
});

// Filters
let currentFilter = 'all';
document.querySelectorAll('.filters button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filters button.active').classList.remove('active');
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Show current date and time
function updateTime() {
  const now = new Date();
  document.getElementById('currentTime').innerText =
    `it’s ${now.toLocaleString('en-GB',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})} right now.`;
}
setInterval(updateTime, 1000);
updateTime();

// Local Storage keys
const tasksKey = 'tasks';

function getTasks() {
  return JSON.parse(localStorage.getItem(tasksKey)) || [];
}

function saveTasks(tasks) {
  localStorage.setItem(tasksKey, JSON.stringify(tasks));
}

function addTask() {
  const name = document.getElementById('taskName').value;
  const date = document.getElementById('taskDate').value;
  const time = document.getElementById('taskTime').value;
  if (!name || !date || !time) {
    alert('Please fill all fields!');
    return;
  }
  const task = { id: Date.now(), name, date, time, completed: false };
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
  renderTasks();
  closePopup();
  clearFields();
}

function deleteTask(id) {
  const tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks();
}

function toggleComplete(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  task.completed = !task.completed;
  saveTasks(tasks);
  renderTasks();
}

function editTime(id) {
  const time = prompt("Enter new time (HH:MM)", "11:00");
  const date = prompt("Enter new date (YYYY-MM-DD)", new Date().toISOString().slice(0,10));
  if (time && date) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    task.time = time;
    task.date = date;
    saveTasks(tasks);
    renderTasks();
  }
}

function editName(id) {
  const newName = prompt("Edit task name", getTasks().find(t => t.id === id).name);
  if (newName) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    task.name = newName;
    saveTasks(tasks);
    renderTasks();
  }
}

function clearAll() {
  if (confirm("Clear all tasks?")) {
    saveTasks([]);
    renderTasks();
  }
}

function formatTime(t) {
  const [h, m] = t.split(":");
  let hour = parseInt(h);
  let ampm = "AM";
  if (hour >= 12) {
    ampm = "PM";
    if (hour > 12) hour -= 12;
  }
  if (hour === 0) hour = 12;
  return `${hour}:${m} ${ampm}`;
}

function formatDate(d) {
  const today = new Date();
  const selected = new Date(d);
  if (today.toDateString() === selected.toDateString()) return "Today";
  return selected.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function clearFields() {
  document.getElementById('taskName').value = '';
  document.getElementById('taskDate').value = '';
  document.getElementById('taskTime').value = '';
}

function renderTasks() {
  const container = document.getElementById('tasks');
  container.innerHTML = '';
  const tasks = getTasks().filter(t => {
    if (currentFilter === 'pending') return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });
  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task-item' + (task.completed ? ' completed' : '');
    div.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${task.id})" />
      <label ondblclick="editName(${task.id})">${task.name}</label>
      <div class="task-time" onclick="editTime(${task.id})">
        <span>${formatTime(task.time)}</span>
        <span>${formatDate(task.date)}</span>
      </div>
      <button class="delete-btn" onclick="deleteTask(${task.id})">delete</button>
    `;
    if (new Date(task.date).toDateString() === new Date().toDateString()) {
      div.style.backgroundColor = 'var(--highlight)';
    }
    container.appendChild(div);
  });
  const all = getTasks();
  const done = all.filter(t => t.completed).length;
  document.getElementById('progress').innerText = `${done} of ${all.length} completed`;
}

// Popup controls
function openPopup() { document.getElementById('popup').style.display = 'flex'; }
function closePopup() { document.getElementById('popup').style.display = 'none'; }

// Initial render
renderTasks();
