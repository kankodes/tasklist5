document.addEventListener('DOMContentLoaded', function() {
  // ------------------ THEME TOGGLE ------------------
  const toggle = document.getElementById('toggleTheme');
  if (toggle) {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark', currentTheme === 'dark');
    toggle.checked = currentTheme === 'dark';
    toggle.addEventListener('change', () => {
      document.body.classList.toggle('dark', toggle.checked);
      localStorage.setItem('theme', toggle.checked ? 'dark' : 'light');
    });
  }

  // ------------------ FILTERS ------------------
  let currentFilter = 'all';
  document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.filters button.active').classList.remove('active');
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // ------------------ CLOCK ------------------
  function updateTime() {
    const now = new Date();
    document.getElementById('currentTime').innerText =
      `it’s ${now.toLocaleString('en-GB',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})} right now.`;
  }
  setInterval(updateTime, 1000);
  updateTime();

  // ------------------ STORAGE HELPERS ------------------
  const tasksKey = 'tasks';
  function getTasks() {
    return JSON.parse(localStorage.getItem(tasksKey)) || [];
  }
  function saveTasks(tasks) {
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
  }

  // ------------------ CORE FUNCTIONS ------------------
  function addTask() {
    const name = document.getElementById('taskName').value.trim();
    const date = document.getElementById('taskDate').value;
    const time = document.getElementById('taskTime').value;
    if (!name || !date || !time) {
      alert('Please fill all fields!');
      return;
    }
    const tasks = getTasks();
    tasks.push({ id: Date.now(), name, date, time, completed: false });
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
    const time = prompt("New time (HH:MM)", "11:00");
    const date = prompt("New date (YYYY-MM-DD)", new Date().toISOString().slice(0,10));
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
    let [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
  }

  function formatDate(d) {
    const today = new Date().toDateString();
    const selected = new Date(d).toDateString();
    if (today === selected) return "Today";
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function clearFields() {
    document.getElementById('taskName').value = '';
    document.getElementById('taskDate').value = '';
    document.getElementById('taskTime').value = '';
  }

  // ------------------ RENDER TASKS ------------------
  function renderTasks() {
    const allTasks = getTasks();
    const tasksContainer = document.getElementById('tasks');
    tasksContainer.innerHTML = '';

    allTasks
      .filter(task => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'completed') return task.completed;
        if (currentFilter === 'pending') return !task.completed;
      })
      .forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item' + (task.completed ? ' completed' : '');

        if (new Date(task.date).toDateString() === new Date().toDateString()) {
          taskDiv.style.backgroundColor = 'var(--highlight)';
        }

        taskDiv.innerHTML = `
          <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${task.id})">
          <label ondblclick="editName(${task.id})">${task.name}</label>
          <div class="task-time" onclick="editTime(${task.id})">
            <span>${formatTime(task.time)}</span>
            <span>${formatDate(task.date)}</span>
          </div>
          <button class="delete-btn" onclick="deleteTask(${task.id})">delete</button>
        `;
        tasksContainer.appendChild(taskDiv);
      });

    // Update progress
    const doneCount = allTasks.filter(t => t.completed).length;
    document.getElementById('progress').innerText = `${doneCount} of ${allTasks.length} completed`;
  }

  // ------------------ POPUP FUNCTIONS ------------------
  function openPopup() {
    document.getElementById('popup').style.display = 'flex';
  }
  function closePopup() {
    document.getElementById('popup').style.display = 'none';
  }

  // ------------------ BIND EVENTS ------------------
  document.getElementById('doneButton').addEventListener('click', addTask);
  window.openPopup = openPopup;
  window.closePopup = closePopup;
  window.deleteTask = deleteTask;
  window.toggleComplete = toggleComplete;
  window.editTime = editTime;
  window.editName = editName;
  window.clearAll = clearAll;

  // ------------------ INITIALIZE ------------------
  renderTasks();
});
