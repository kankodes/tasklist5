document.addEventListener('DOMContentLoaded', () => {
  // 1) THEME TOGGLE (guarded)
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

  // 2) FILTER BUTTONS
  let currentFilter = 'all';
  document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.filters button.active').classList.remove('active');
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // 3) CLOCK
  function updateTime() {
    const now = new Date();
    document.getElementById('currentTime').innerText =
      `it’s ${now.toLocaleString('en-GB',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})} right now.`;
  }
  setInterval(updateTime, 1000);
  updateTime();

  // 4) STORAGE HELPERS
  const tasksKey = 'tasks';
  function getTasks() { return JSON.parse(localStorage.getItem(tasksKey)) || []; }
  function saveTasks(tasks) { localStorage.setItem(tasksKey, JSON.stringify(tasks)); }

  // 5) CORE ACTIONS
  function addTask() {
    const name = document.getElementById('taskName').value.trim();
    const date = document.getElementById('taskDate').value;
    const time = document.getElementById('taskTime').value;
    if (!name || !date || !time) {
      return alert('Please fill all fields!');
    }
    const tasks = getTasks();
    tasks.push({ id: Date.now(), name, date, time, completed: false });
    saveTasks(tasks);
    renderTasks();
    closePopup();
    clearFields();
  }
  function deleteTask(id) {
    saveTasks(getTasks().filter(t => t.id !== id));
    renderTasks();
  }
  function toggleComplete(id) {
    const tasks = getTasks();
    const t = tasks.find(x => x.id === id);
    t.completed = !t.completed;
    saveTasks(tasks);
    renderTasks();
  }
  function editTime(id) {
    const time = prompt("New time (HH:MM)", "11:00");
    const date = prompt("New date (YYYY-MM-DD)", new Date().toISOString().slice(0,10));
    if (time && date) {
      const tasks = getTasks();
      const t = tasks.find(x => x.id === id);
      t.time = time; t.date = date;
      saveTasks(tasks);
      renderTasks();
    }
  }
  function editName(id) {
    const newName = prompt("Edit task name", getTasks().find(x => x.id===id).name);
    if (newName) {
      const tasks = getTasks();
      tasks.find(x => x.id===id).name = newName;
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
    let [h,m] = t.split(':').map(Number);
    const ampm = h>=12 ? 'PM' : 'AM';
    if (h>12) h-=12;
    if (h===0) h=12;
    return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
  }
  function formatDate(d) {
    const today = new Date().toDateString();
    const sel = new Date(d).toDateString();
    return today===sel ? 'Today' : new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  }
  function clearFields() {
    ['taskName','taskDate','taskTime'].forEach(id=>document.getElementById(id).value = '');
  }

  // 6) RENDERER
  function renderTasks() {
    const all = getTasks();
    const list = document.getElementById('tasks');
    list.innerHTML = '';
    all
      .filter(t => currentFilter==='all' || (currentFilter==='completed')===t.completed || (currentFilter==='pending')===!t.completed)
      .forEach(task => {
        const div = document.createElement('div');
        div.className = 'task-item' + (task.completed ? ' completed' : '');
        if (new Date(task.date).toDateString() === new Date().toDateString()) {
          div.style.backgroundColor = 'var(--highlight)';
        }
        div.innerHTML = `
          <input type="checkbox" ${task.completed?'checked':''} onchange="toggleComplete(${task.id})">
          <label ondblclick="editName(${task.id})">${task.name}</label>
          <div class="task-time" onclick="editTime(${task.id})">
            <span>${formatTime(task.time)}</span>
            <span>${formatDate(task.date)}</span>
          </div>
          <button class="delete-btn" onclick="deleteTask(${task.id})">delete</button>
        `;
        list.appendChild(div);
      });
    // update progress
    document.getElementById('progress').innerText =
      `${all.filter(t=>t.completed).length} of ${all.length} completed`;
  }

  // 7) POPUP CONTROLS
  window.openPopup  = () => document.getElementById('popup').style.display = 'flex';
  window.closePopup = () => document.getElementById('popup').style.display = 'none';
  window.addTask     = addTask;
  window.deleteTask  = deleteTask;
  window.toggleComplete = toggleComplete;
  window.editTime    = editTime;
  window.editName    = editName;
  window.clearAll    = clearAll;

  // initial render
  renderTasks();
});
