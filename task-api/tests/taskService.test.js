const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

// ==================== CREATE ====================

describe('create', () => {
  test('should create a task with default values', () => {
    const task = taskService.create({
      title: 'Test task',
    });

    expect(task.title).toBe('Test task');
    expect(task.description).toBe('');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('medium');
    expect(task.dueDate).toBeNull();
    expect(task.assignee).toBeNull();
    expect(task.completedAt).toBeNull();
    expect(task.id).toBeDefined();
    expect(task.createdAt).toBeDefined();
  });

  test('should create a task with provided values', () => {
    const task = taskService.create({
      title: 'Important task',
      description: 'Finish assignment',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2026-10-10T10:00:00.000Z',
    });

    expect(task.title).toBe('Important task');
    expect(task.description).toBe('Finish assignment');
    expect(task.status).toBe('in_progress');
    expect(task.priority).toBe('high');
    expect(task.dueDate).toBe('2026-10-10T10:00:00.000Z');
  });
});

// ==================== GET ALL ====================

describe('getAll', () => {
  test('should return all tasks', () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });

    const tasks = taskService.getAll();

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Task 1');
    expect(tasks[1].title).toBe('Task 2');
  });

  test('should return empty array when no tasks exist', () => {
    const tasks = taskService.getAll();

    expect(tasks).toEqual([]);
  });
});

// ==================== FIND BY ID ====================

describe('findById', () => {
  test('should find a task by id', () => {
    const created = taskService.create({
      title: 'Find me',
    });

    const task = taskService.findById(created.id);

    expect(task).toEqual(created);
  });

  test('should return undefined for unknown id', () => {
    const task = taskService.findById('fake-id');

    expect(task).toBeUndefined();
  });
});

// ==================== FILTER STATUS ====================

describe('getByStatus', () => {
  test('should filter tasks by exact status', () => {
    taskService.create({
      title: 'Task 1',
      status: 'todo',
    });

    taskService.create({
      title: 'Task 2',
      status: 'in_progress',
    });

    const tasks = taskService.getByStatus('in_progress');

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Task 2');
  });

  test('should not match partial status', () => {
    taskService.create({
      title: 'Task 1',
      status: 'in_progress',
    });

    const tasks = taskService.getByStatus('progress');

    expect(tasks).toHaveLength(0);
  });
});

// ==================== PAGINATION ====================

describe('getPaginated', () => {
  beforeEach(() => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });
    taskService.create({ title: 'Task 3' });
    taskService.create({ title: 'Task 4' });
    taskService.create({ title: 'Task 5' });
    taskService.create({ title: 'Task 6' });
  });

  test('should return first page correctly', () => {
    const tasks = taskService.getPaginated(1, 5);

    expect(tasks).toHaveLength(5);
    expect(tasks[0].title).toBe('Task 1');
    expect(tasks[4].title).toBe('Task 5');
  });

  test('should return second page correctly', () => {
    const tasks = taskService.getPaginated(2, 3);

    expect(tasks).toHaveLength(3);
    expect(tasks[0].title).toBe('Task 4');
    expect(tasks[2].title).toBe('Task 6');
  });
});

// ==================== UPDATE ====================

describe('update', () => {
  test('should update an existing task', () => {
    const task = taskService.create({
      title: 'Old title',
      priority: 'low',
    });

    const updated = taskService.update(task.id, {
      title: 'New title',
    });

    expect(updated.title).toBe('New title');
    expect(updated.priority).toBe('low');
  });

  test('should return null for unknown task id', () => {
    const updated = taskService.update('fake-id', {
      title: 'New title',
    });

    expect(updated).toBeNull();
  });

  test('should not allow arbitrary fields to be added', () => {
    const task = taskService.create({
      title: 'Test task',
    });

    const updated = taskService.update(task.id, {
      randomField: 'hello',
    });

    expect(updated.randomField).toBeUndefined();
  });
});

// ==================== DELETE ====================

describe('remove', () => {
  test('should delete an existing task', () => {
    const task = taskService.create({
      title: 'Delete me',
    });

    const result = taskService.remove(task.id);

    expect(result).toBe(true);
    expect(taskService.findById(task.id)).toBeUndefined();
  });

  test('should return false for unknown task id', () => {
    const result = taskService.remove('fake-id');

    expect(result).toBe(false);
  });
});

// ==================== COMPLETE ====================

describe('completeTask', () => {
  test('should mark task as done', () => {
    const task = taskService.create({
      title: 'Complete me',
      status: 'in_progress',
    });

    const completed = taskService.completeTask(task.id);

    expect(completed.status).toBe('done');
    expect(completed.completedAt).toBeDefined();
    expect(completed.completedAt).not.toBeNull();
  });

  test('should preserve task priority when completed', () => {
    const task = taskService.create({
      title: 'High priority task',
      priority: 'high',
    });

    const completed = taskService.completeTask(task.id);

    expect(completed.priority).toBe('high');
  });

  test('should return null for unknown task id', () => {
    const result = taskService.completeTask('fake-id');

    expect(result).toBeNull();
  });
});

// ==================== STATS ====================

describe('getStats', () => {
  test('should count tasks by status', () => {
    taskService.create({
      title: 'Task 1',
      status: 'todo',
    });

    taskService.create({
      title: 'Task 2',
      status: 'in_progress',
    });

    taskService.create({
      title: 'Task 3',
      status: 'done',
    });

    const stats = taskService.getStats();

    expect(stats.todo).toBe(1);
    expect(stats.in_progress).toBe(1);
    expect(stats.done).toBe(1);
  });

  test('should count overdue unfinished tasks', () => {
    taskService.create({
      title: 'Old task',
      status: 'todo',
      dueDate: '2000-01-01T00:00:00.000Z',
    });

    taskService.create({
      title: 'Future task',
      status: 'todo',
      dueDate: '2999-01-01T00:00:00.000Z',
    });

    const stats = taskService.getStats();

    expect(stats.overdue).toBe(1);
  });

  test('should not count completed task as overdue', () => {
    taskService.create({
      title: 'Completed old task',
      status: 'done',
      dueDate: '2000-01-01T00:00:00.000Z',
    });

    const stats = taskService.getStats();

    expect(stats.overdue).toBe(0);
  });
});

// ==================== ASSIGN ====================

describe('assignTask', () => {
  test('should assign a task to a user', () => {
    const task = taskService.create({
      title: 'Assign me',
    });

    const assigned = taskService.assignTask(
      task.id,
      'Alice'
    );

    expect(assigned.assignee).toBe('Alice');

    expect(
      taskService.findById(task.id).assignee
    ).toBe('Alice');
  });

  test('should trim assignee and allow reassignment', () => {
    const task = taskService.create({
      title: 'Assign me',
    });

    taskService.assignTask(task.id, 'Alice');

    const reassigned = taskService.assignTask(
      task.id,
      '  Bob  '
    );

    expect(reassigned.assignee).toBe('Bob');
  });

  test('should return null for unknown task id', () => {
    const result = taskService.assignTask(
      'fake-id',
      'Alice'
    );

    expect(result).toBeNull();
  });
});