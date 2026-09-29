const { v4: uuidv4 } = require('uuid');

let tasks = [];

const EDITABLE_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];

const getAll = () => [...tasks];

const findById = (id) => tasks.find((t) => t.id === id);

const getByStatus = (status) => tasks.filter((t) => t.status === status);

const getPaginated = (page, limit) => {
  const offset = (page - 1) * limit;
  return tasks.slice(offset, offset + limit);
};

const getStats = () => {
  const now = new Date();
  const counts = { todo: 0, in_progress: 0, done: 0 };
  let overdue = 0;

  tasks.forEach((t) => {
    if (counts[t.status] !== undefined) counts[t.status]++;

    if (t.dueDate && t.status !== 'done') {
      const dueDate = new Date(t.dueDate);

      if (!Number.isNaN(dueDate.getTime()) && dueDate < now) {
        overdue++;
      }
    }
  });

  return { ...counts, overdue };
};

const create = ({
  title,
  description = '',
  status = 'todo',
  priority = 'medium',
  dueDate = null,
}) => {
  const task = {
    id: uuidv4(),
    title,
    description,
    status,
    priority,
    dueDate,
    assignee: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  return task;
};

const update = (id, fields) => {
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) return null;

  const safeFields = {};

  EDITABLE_FIELDS.forEach((field) => {
    if (fields[field] !== undefined) {
      safeFields[field] = fields[field];
    }
  });

  const updated = {
    ...tasks[index],
    ...safeFields,
  };

  tasks[index] = updated;

  return updated;
};

const remove = (id) => {
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) return false;

  tasks.splice(index, 1);

  return true;
};

const completeTask = (id) => {
  const task = findById(id);

  if (!task) return null;

  const updated = {
    ...task,
    status: 'done',
    completedAt: new Date().toISOString(),
  };

  const index = tasks.findIndex((t) => t.id === id);

  tasks[index] = updated;

  return updated;
};

const assignTask = (id, assignee) => {
  const task = findById(id);

  if (!task) return null;

  if (task.status === 'done') {
    return { error: 'Completed tasks cannot be assigned' };
  }

  const updated = {
    ...task,
    assignee: assignee.trim(),
  };

  const index = tasks.findIndex((t) => t.id === id);
  tasks[index] = updated;

  return updated;
};

const _reset = () => {
  tasks = [];
};

module.exports = {
  getAll,
  findById,
  getByStatus,
  getPaginated,
  getStats,
  create,
  update,
  remove,
  completeTask,
  assignTask,
  _reset,
};