const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

describe('Task API', () => {
  describe('POST /tasks', () => {
    test('should create a task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Test task',
          priority: 'high',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test task');
      expect(response.body.priority).toBe('high');
      expect(response.body.status).toBe('todo');
      expect(response.body.assignee).toBeNull();
      expect(response.body.id).toBeDefined();
    });

    test('should reject missing title', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should reject invalid status', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Task',
          status: 'random',
        });

      expect(response.status).toBe(400);
    });

    test('should reject non ISO dueDate', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Task',
          dueDate: 'nov-21',
        });

      expect(response.status).toBe(400);

      expect(response.body.error).toBe(
        'dueDate must be a valid ISO date string'
      );
    });
  });

  describe('GET /tasks', () => {
    test('should return all tasks', async () => {
      taskService.create({
        title: 'Task 1',
      });

      taskService.create({
        title: 'Task 2',
      });

      const response = await request(app)
        .get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should filter tasks by status', async () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      taskService.create({
        title: 'Progress task',
        status: 'in_progress',
      });

      const response = await request(app)
        .get('/tasks?status=in_progress');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);

      expect(
        response.body[0].title
      ).toBe('Progress task');
    });

    test('should paginate tasks correctly', async () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });
      taskService.create({ title: 'Task 4' });
      taskService.create({ title: 'Task 5' });
      taskService.create({ title: 'Task 6' });

      const response = await request(app)
        .get('/tasks?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(5);

      expect(
        response.body[0].title
      ).toBe('Task 1');

      expect(
        response.body[4].title
      ).toBe('Task 5');
    });
  });

  describe('GET /tasks/stats', () => {
    test('should return task statistics', async () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      taskService.create({
        title: 'Progress task',
        status: 'in_progress',
      });

      taskService.create({
        title: 'Done task',
        status: 'done',
      });

      const response = await request(app)
        .get('/tasks/stats');

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        todo: 1,
        in_progress: 1,
        done: 1,
        overdue: 0,
      });
    });
  });

  describe('PUT /tasks/:id', () => {
    test('should update an existing task', async () => {
      const task = taskService.create({
        title: 'Old title',
        priority: 'low',
      });

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
          title: 'New title',
          priority: 'high',
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('New title');
      expect(response.body.priority).toBe('high');
    });

    test('should return 404 for unknown task', async () => {
      const response = await request(app)
        .put('/tasks/fake-id')
        .send({
          title: 'New title',
        });

      expect(response.status).toBe(404);

      expect(response.body.error).toBe(
        'Task not found'
      );
    });

    test('should reject arbitrary fields', async () => {
      const task = taskService.create({
        title: 'Task',
      });

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
          randomField: 'hello',
        });

      expect(response.status).toBe(400);
    });

    test('should reject invalid dueDate', async () => {
      const task = taskService.create({
        title: 'Task',
      });

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
          dueDate: 'nov 21',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    test('should delete an existing task', async () => {
      const task = taskService.create({
        title: 'Delete me',
      });

      const response = await request(app)
        .delete(`/tasks/${task.id}`);

      expect(response.status).toBe(204);

      expect(
        taskService.findById(task.id)
      ).toBeUndefined();
    });

    test('should return 404 for unknown task', async () => {
      const response = await request(app)
        .delete('/tasks/fake-id');

      expect(response.status).toBe(404);

      expect(response.body.error).toBe(
        'Task not found'
      );
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    test('should complete a task', async () => {
      const task = taskService.create({
        title: 'Complete me',
        priority: 'high',
      });

      const response = await request(app)
        .patch(`/tasks/${task.id}/complete`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('done');

      expect(
        response.body.completedAt
      ).toBeDefined();

      expect(response.body.priority).toBe('high');
    });

    test('should return 404 for unknown task', async () => {
      const response = await request(app)
        .patch('/tasks/fake-id/complete');

      expect(response.status).toBe(404);

      expect(response.body.error).toBe(
        'Task not found'
      );
    });
  });

  describe('PATCH /tasks/:id/assign', () => {
    test('should assign a task to a user', async () => {
      const task = taskService.create({
        title: 'Assign me',
      });

      const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
          assignee: 'Alice',
        });

      expect(response.status).toBe(200);
      expect(response.body.assignee).toBe('Alice');

      expect(
        taskService.findById(task.id).assignee
      ).toBe('Alice');
    });

    test('should trim assignee and allow reassignment', async () => {
      const task = taskService.create({
        title: 'Assign me',
      });

      taskService.assignTask(
        task.id,
        'Alice'
      );

      const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
          assignee: '  Bob  ',
        });

      expect(response.status).toBe(200);
      expect(response.body.assignee).toBe('Bob');
    });

    test('should reject empty assignee', async () => {
      const task = taskService.create({
        title: 'Assign me',
      });

      const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
          assignee: '   ',
        });

      expect(response.status).toBe(400);

      expect(response.body.error).toBe(
        'assignee is required and must be a non-empty string'
      );
    });

    test('should return 404 for unknown task', async () => {
      const response = await request(app)
        .patch('/tasks/fake-id/assign')
        .send({
          assignee: 'Alice',
        });

      expect(response.status).toBe(404);

      expect(response.body.error).toBe(
        'Task not found'
      );
    });
  });
});