"use strict";

// DOM
const form = document.getElementById('task-form');
const inputTitle = document.getElementById('task-title');
const inputLabel = document.getElementById('task-label');
const btnAdd = document.getElementById('btn-add');
const btnCancel = document.getElementById('btn-cancel');
const listElm = document.getElementById('task-list');
const footer = document.getElementById('completed-count');

// Estado
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let editingId = null;

// Helpers
const save = () => localStorage.setItem('tasks', JSON.stringify(tasks));
const genId = () => Date.now().toString();
const updateFooter = () => {
  const doneCount = tasks.filter(t => t.done).length;
  footer.textContent = `${doneCount} tarefa(s) concluída(s)`;
};
const parsetags = str =>
  str.split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length);
const resetForm = () => {
  editingId = null;
  inputTitle.value = '';
  inputLabel.value = '';
  btnAdd.textContent = '+';
  btnCancel.style.display = 'none';
};

// Render
function render() {
  listElm.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-card ${task.done ? 'completed' : ''}`;
    li.dataset.id = task.id;

    console.log(task);

    const badgesHtml = task.tags
      .map(tag => `<span class="badge">${tag}</span>`)
      .join('');

    li.innerHTML = `
      <div class=\"task-content\">
        <p class=\"task-title\">${task.title}</p>
        <div class=\"badges\">${badgesHtml}</div>
        <small class=\"task-date\">Criado em: ${new Date(task.createdAt).toLocaleDateString()}</small>
      </div>
      <div class=\"task-actions\">
      <button class=\"btn-action btn-complete ${task.done ? 'checkmark' : 'unchecked'}\" title=\"${task.done ? 'Reverter' : 'Concluir'}\">${task.done ? '✔︎' : '⍻'}</button>
        <button class=\"btn-action btn-edit\" title=\"Editar\">✎</button>
        <button class=\"btn-action btn-delete\" title=\"Excluir\">✕</button>
      </div>
    `;
    listElm.appendChild(li);
  });
  updateFooter();
}

// Submit (criar/atualizar)
form.addEventListener('submit', e => {
  e.preventDefault();
  const title = inputTitle.value.trim();
  const tags = parsetags(inputLabel.value);
  if (!title || tags.length === 0) return;

  if (editingId) {
    // Atualizar tarefa existente
    const task = tasks.find(t => t.id === editingId);
    task.title = title;
    task.tags = tags;
  } else {
    // Criar nova
    tasks.push({ id: genId(), title, tags, createdAt: new Date(), done: false });
  }

  save();
  resetForm();
  render();
});

// Cancelar edição
btnCancel.addEventListener('click', () => {
  resetForm();
});

// Ações na lista
listElm.addEventListener('click', e => {
  const li = e.target.closest('li.task-card');
  if (!li) return;
  const id = li.dataset.id;
  const task = tasks.find(t => t.id === id);

  if (e.target.matches('.btn-complete')) {
    task.done = !task.done;
  } else if (e.target.matches('.btn-delete')) {
    const delConfirm = confirm('Deseja excluir esta tarefa?');
    if (delConfirm == true) {
      tasks = tasks.filter(t => t.id !== id);
    }
  } else if (e.target.matches('.btn-edit')) {
    // Carrega no formulário
    editingId = id;
    inputTitle.value = task.title;
    inputLabel.value = task.tags.join(', ');
    btnAdd.textContent = '↻';
    btnCancel.style.display = 'inline';
    inputTitle.focus();
    return;
  } else return;

  save();
  render();
});

// Inicializa
resetForm();
render();