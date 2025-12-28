'use strict';

// DOM elements
const taskSearch = document.querySelector('.search-input');
const taskSelect = document.querySelector('.task-select');
const toggleTheme = document.querySelector('.toggle-theme-btn');
const newTaskBtn = document.querySelector('.new-task-btn');
const tasksList = document.querySelector('.tasks-list');
const clearTasksBtn = document.querySelector('.clear-tasks-btn');
const modal = document.querySelector('.modal-container');
const modalForm = document.querySelector('.modal-form');
const modalInput = document.querySelector('.modal-input');
const cancelBtn = document.querySelector('.cancel--btn');
const message = document.querySelector('.message');

const loadTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const icon = toggleTheme.querySelector('i');

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    icon.classList.replace('fa-moon', 'fa-sun');
  } else {
    document.documentElement.classList.remove('dark');
    icon.classList.replace('fa-sun', 'fa-moon');
  }
};

// Tasks array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

loadTheme();

// Render task to DOM
const render = function () {
  let tasksCountDOM = 0;

  const searchValue = taskSearch.value.toLowerCase().trim();
  const filter = taskSelect.value;

  clearTasksBtn.disabled = tasks.length === 0;
  taskSelect.disabled = tasks.length === 0;

  const task = tasks
    .map((task) => {
      if (filter === 'completed' && !task.completed) return '';
      if (filter === 'pending' && task.completed) return '';
      if (!task.title.toLowerCase().includes(searchValue)) return '';

      tasksCountDOM++;

      return `
        <li class="task-item ${task.completed ? 'done' : ''}" data-id="${
        task.id
      }">
            <div class="task-item-text">
              ${
                !task.editing
                  ? `<input type="checkbox" class="task-checkbox" ${
                      task.completed ? 'checked' : ''
                    } />`
                  : ''
              }
              ${
                task.editing
                  ? `<input type="text" class="task-edit-input" value="${task.title}" />`
                  : `<p class="task-name">${task.title}</p>`
              }
            </div>

            <div class="task-item-actions">
            ${
              task.editing
                ? `
                <button class="task-mark-btn"><i class="fas fa-check"></i></button>
                <button class="task-times-btn"><i class="fas fa-times"></i></button>
                `
                : `
                  ${
                    task.completed
                      ? '<span class="completed">Completed</span>'
                      : '<button class="task-edit-btn"><i class="fas fa-pen"></i> Edit</button>'
                  }
                  <button class="task-delete-btn">
                    <i class="fas fa-times-circle"></i> Delete
                  </button>        
          `
            }
            </div>
        </li>
    `;
    })
    .join('');

  tasksList.innerHTML = '';
  tasksList.insertAdjacentHTML('beforeend', task);

  if (tasks.length === 0) {
    message.textContent = 'Not found tasks. Add your first task!';
  } else if (tasksCountDOM === 0 && searchValue !== '') {
    message.textContent = `No results for "${searchValue}"`;
  } else if (tasksCountDOM === 0 && filter === 'completed') {
    message.textContent = 'No completed tasks yet.';
  } else if (tasksCountDOM === 0 && filter === 'pending') {
    message.textContent = 'No pending tasks yet.';
  } else {
    message.textContent =
      tasks.filter((task) => !task.completed).length > 0
        ? `You have ${
            tasks.filter((task) => !task.completed).length
          } tasks pending.`
        : '';
  }
};

// Update DOM & state & saved tasks into localStorage
const update = function () {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  render();
};

// Add task
const addTask = function (title) {
  const task = {
    id: Date.now(),
    title,
    completed: false,
    editing: false,
  };

  tasks = [...tasks, task];
  update();
};

// Edit task
const editTask = function (taskID) {
  tasks = tasks.map((task) =>
    task.id === taskID ? { ...task, editing: true } : task
  );
  update();
};

// Delete task
const deleteTask = function (taskID) {
  tasks = tasks.filter((task) => task.id !== taskID);
  update();
};

// Update task
const updateTask = function (taskID, checked) {
  tasks = tasks.map((task) =>
    task.id === taskID ? { ...task, completed: checked } : task
  );
  update();
};

// Clear all tasks
const clearTasks = () => {
  tasks = [];
  update();
};

// Edit task with new name
const saveEditedTask = function (taskID, newTitle) {
  tasks = tasks.map((task) =>
    task.id === taskID ? { ...task, title: newTitle, editing: false } : task
  );
  update();
};

// Cancel edit task
const cancelEditing = function (taskID) {
  tasks = tasks.map((task) =>
    task.id === taskID ? { ...task, editing: false } : task
  );
  update();
};

// Helper functions
const openModal = () => {
  modal.classList.add('show');
  modalInput.focus();
};

const closeModal = () => {
  modal.classList.remove('show');
  modalInput.value = '';
};

const fadeInModal = () =>
  document.querySelector('.new-task-modal').classList.add('show');

const fadeOutModal = () =>
  document.querySelector('.new-task-modal').classList.remove('show');

const toggleDarkMode = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  const icon = toggleTheme.querySelector('i');

  localStorage.setItem('theme', isDark ? 'dark' : '');

  if (isDark) {
    icon.classList.replace('fa-moon', 'fa-sun');
  } else {
    icon.classList.replace('fa-sun', 'fa-moon');
  }
};

/////// Event listeners ///////

// Initial load
document.addEventListener('DOMContentLoaded', render);

// Task search listener
taskSearch.addEventListener('input', render);

// Toggle theme listener
toggleTheme.addEventListener('click', toggleDarkMode);

// Close & Open modal
newTaskBtn.addEventListener('click', () => {
  openModal();
  fadeInModal();
});

cancelBtn.addEventListener('click', () => {
  closeModal();
  fadeOutModal();
});

modal.addEventListener('click', (e) => {
  if (e.target.closest('.new-task-modal')) return;

  closeModal();
  fadeOutModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('show')) {
    closeModal();
    fadeOutModal();
  } else if (e.key === 'Enter' && !modal.classList.contains('show')) {
    openModal();
    fadeInModal();
  }
});

// Select task status listener
taskSelect.addEventListener('change', render);

// Task checkbox listener
tasksList.addEventListener('change', (e) => {
  const checkbox = e.target.closest('.task-checkbox');
  if (!checkbox) return;

  const taskID = +checkbox.closest('.task-item').dataset.id;
  const checked = checkbox.checked;

  updateTask(taskID, checked);
});

// Task name listener
tasksList.addEventListener('click', (e) => {
  const taskName = e.target.closest('.task-name');
  if (!taskName) return;

  const checkbox = taskName
    .closest('.task-item')
    .querySelector('.task-checkbox');

  checkbox.click();
});

// Add task listener
modalForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (modal.classList.contains('show') && modalInput.value.trim() !== '') {
    addTask(modalInput.value.trim());

    closeModal();
  }
});

// Edit task listener
tasksList.addEventListener('click', (e) => {
  const editBtn = e.target.closest('.task-edit-btn');
  if (!editBtn) return;

  const taskID = +editBtn.closest('.task-item').dataset.id;
  editTask(taskID);

  const editInput = document.querySelector(
    `.task-item[data-id="${taskID}"] .task-edit-input`
  );
  if (editInput) editInput.focus();
});

// Delete task listener
tasksList.addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('.task-delete-btn');
  if (!deleteBtn) return;

  const taskID = +deleteBtn.closest('.task-item').dataset.id;
  deleteTask(taskID);
});

// Clear all tasks listener
clearTasksBtn.addEventListener('click', () => {
  if (!clearTasksBtn.disabled) {
    clearTasks();
  }
});

// Mark & Cancel edit task buttons
tasksList.addEventListener('click', (e) => {
  const markBtn = e.target.closest('.task-mark-btn');
  const cancelBtn = e.target.closest('.task-times-btn');

  if (markBtn) {
    const task = markBtn.closest('.task-item');
    const taskID = +task.dataset.id;

    const editInput = task.querySelector('.task-edit-input');
    const value = editInput.value.trim();

    if (value !== '') saveEditedTask(taskID, value);
  } else if (cancelBtn) {
    const task = cancelBtn.closest('.task-item');
    const taskID = +task.dataset.id;

    cancelEditing(taskID);
  }
});
