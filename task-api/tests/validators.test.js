const {
  validateCreateTask,
  validateUpdateTask,
  validateAssignTask,
  isValidISODate,
} = require('../src/utils/validators');

describe('dueDate validation', () => {
  test('accepts valid ISO 8601 date strings', () => {
    expect(
      isValidISODate('2026-10-10T10:00:00.000Z')
    ).toBe(true);

    expect(
      isValidISODate('2026-10-10T10:00:00Z')
    ).toBe(true);

    expect(
      isValidISODate('2026-10-10T10:00:00+05:30')
    ).toBe(true);
  });

  test('rejects parseable but non-ISO date strings', () => {
    expect(
      validateCreateTask({
        title: 'Task',
        dueDate: 'nov-21',
      })
    ).toBe(
      'dueDate must be a valid ISO date string'
    );

    expect(
      validateUpdateTask({
        dueDate: 'nov 21',
      })
    ).toBe(
      'dueDate must be a valid ISO date string'
    );
  });

  test('rejects impossible ISO-shaped dates', () => {
    expect(
      validateCreateTask({
        title: 'Task',
        dueDate: '2026-02-30T10:00:00.000Z',
      })
    ).toBe(
      'dueDate must be a valid ISO date string'
    );
  });
});

describe('update validation', () => {
  test('rejects unknown fields', () => {
    expect(
      validateUpdateTask({
        randomField: 'hello',
      })
    ).toBe(
      'unknown field(s): randomField'
    );
  });

  test('rejects empty status and priority values', () => {
    expect(
      validateUpdateTask({
        status: '',
      })
    ).toBe(
      'status must be one of: todo, in_progress, done'
    );

    expect(
      validateUpdateTask({
        priority: '',
      })
    ).toBe(
      'priority must be one of: low, medium, high'
    );
  });
});

describe('assign validation', () => {
  test('accepts a non-empty assignee string', () => {
    expect(
      validateAssignTask({
        assignee: 'Alice',
      })
    ).toBeNull();
  });

  test('rejects a missing assignee', () => {
    expect(
      validateAssignTask({})
    ).toBe(
      'assignee is required and must be a non-empty string'
    );
  });

  test('rejects empty or whitespace-only assignee values', () => {
    expect(
      validateAssignTask({
        assignee: '',
      })
    ).toBe(
      'assignee is required and must be a non-empty string'
    );

    expect(
      validateAssignTask({
        assignee: '   ',
      })
    ).toBe(
      'assignee is required and must be a non-empty string'
    );
  });

  test('rejects non-string and unknown fields', () => {
    expect(
      validateAssignTask({
        assignee: 123,
      })
    ).toBe(
      'assignee is required and must be a non-empty string'
    );

    expect(
      validateAssignTask({
        assignee: 'Alice',
        role: 'admin',
      })
    ).toBe(
      'unknown field(s): role'
    );
  });
});