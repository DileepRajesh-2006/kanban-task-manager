let tasks = JSON.parse(localStorage.getItem('kanbanTasks')) || [];

function saveTasks() {
  localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
}

function addTask() {
  const title = document.getElementById('taskInput').value.trim();
  const priority = document.getElementById('prioritySelect').value;
  const dueDate = document.getElementById('dueDate').value;

  if (title === '') return;

  const newTask = {
    id: Date.now(),
    title,
    priority,
    dueDate,
    status: 'todo'
  };
  tasks.push(newTask);
  saveTasks();
  document.getElementById('taskInput').value = '';
  document.getElementById('dueDate').value = '';
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function makeEditable(element, id) {
  const oldText = element.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = oldText;
  input.className = 'form-control form-control-sm';
  input.onblur = () => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.title = input.value.trim() || oldText;
      saveTasks();
      renderTasks();
    }
  };
  element.replaceWith(input);
  input.focus();
}

function renderTasks() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const statusList = ['todo', 'inprogress', 'done'];
  let doneCount = 0;

  statusList.forEach(status => {
    const column = document.getElementById(status);
    column.querySelectorAll('.task').forEach(el => el.remove());

    const filteredTasks = tasks.filter(t => 
      t.status === status && t.title.toLowerCase().includes(search)
    );

    filteredTasks.forEach(task => {
      const taskDiv = document.createElement('div');
      taskDiv.className = `task ${task.priority}`;
      taskDiv.draggable = true;
      taskDiv.id = task.id;
      taskDiv.ondragstart = drag;

      const info = document.createElement('div');
      info.className = 'info';
      const title = document.createElement('span');
      title.textContent = task.title;
      title.onclick = () => makeEditable(title, task.id);
      info.appendChild(title);

      if (task.dueDate) {
        const date = document.createElement('small');
        const today = new Date().toISOString().split('T')[0];
        date.textContent = ` | Due: ${task.dueDate}`;
        if (task.dueDate < today) {
          date.style.color = 'red';
        } else if (task.dueDate === today) {
          date.style.color = 'orange';
        } else {
          date.style.color = 'green';
        }
        info.appendChild(date);
      }

      const delBtn = document.createElement('button');
      delBtn.innerHTML = '❌';
      delBtn.className = 'btn btn-sm btn-danger py-0 px-2 ms-2';
      delBtn.onclick = () => deleteTask(task.id);

      taskDiv.appendChild(info);
      taskDiv.appendChild(delBtn);
      column.appendChild(taskDiv);

      if (status === 'done') doneCount++;
    });

    column.querySelector('h5').textContent = `${statusToTitle(status)} (${filteredTasks.length})`;
  });

  updateProgress(doneCount, tasks.length);
}

function updateProgress(done, total) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  const bar = document.getElementById('progressBar');
  bar.style.width = `${percent}%`;
  bar.textContent = `${percent}%`;
}

function allowDrop(event) {
  event.preventDefault();
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
  event.preventDefault();
  const id = event.dataTransfer.getData("text");
  const task = tasks.find(t => t.id == id);
  if (task) {
    task.status = event.currentTarget.id;
    saveTasks();
    renderTasks();
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

function statusToTitle(status) {
  switch (status) {
    case 'todo': return 'To Do';
    case 'inprogress': return 'In Progress';
    case 'done': return 'Done';
    default: return status;
  }
}

function exportTasks() {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kanban-tasks.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importTasks(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        tasks = data;
        saveTasks();
        renderTasks();
      } else {
        alert("Invalid file format.");
      }
    } catch {
      alert("Failed to parse file.");
    }
  };
  reader.readAsText(file);
}

window.onload = () => {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }
  renderTasks();
};
