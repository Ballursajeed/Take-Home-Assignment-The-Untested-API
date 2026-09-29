const VALID_STATUSES = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

const UPDATE_FIELDS = [
  'title',
  'description',
  'status',
  'priority',
  'dueDate',
];

const ASSIGN_FIELDS = ['assignee'];

const ISO_DATE_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/;

const isValidISODate = (value) => {
  if (typeof value !== 'string') return false;

  const match = value.match(ISO_DATE_RE);

  if (!match) return false;

  const [
    ,
    yearStr,
    monthStr,
    dayStr,
    hourStr,
    minuteStr,
    secondStr,
  ] = match;

  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const second = Number(secondStr);

  if (month < 1 || month > 12) return false;

  if (hour > 23 || minute > 59 || second > 59) {
    return false;
  }

  const daysInMonth = new Date(
    Date.UTC(year, month, 0)
  ).getUTCDate();

  if (day < 1 || day > daysInMonth) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
};

const validateCreateTask = (body) => {
  if (
    !body.title ||
    typeof body.title !== 'string' ||
    body.title.trim() === ''
  ) {
    return 'title is required and must be a non-empty string';
  }

  if (
    body.description !== undefined &&
    typeof body.description !== 'string'
  ) {
    return 'description must be a string';
  }

  if (
    body.status !== undefined &&
    !VALID_STATUSES.includes(body.status)
  ) {
    return `status must be one of: ${VALID_STATUSES.join(', ')}`;
  }

  if (
    body.priority !== undefined &&
    !VALID_PRIORITIES.includes(body.priority)
  ) {
    return `priority must be one of: ${VALID_PRIORITIES.join(', ')}`;
  }

  if (
    body.dueDate !== undefined &&
    body.dueDate !== null &&
    !isValidISODate(body.dueDate)
  ) {
    return 'dueDate must be a valid ISO date string';
  }

  return null;
};

const validateUpdateTask = (body) => {
  const unknownFields = Object.keys(body).filter(
    (key) => !UPDATE_FIELDS.includes(key)
  );

  if (unknownFields.length > 0) {
    return `unknown field(s): ${unknownFields.join(', ')}`;
  }

  if (
    body.title !== undefined &&
    (
      typeof body.title !== 'string' ||
      body.title.trim() === ''
    )
  ) {
    return 'title must be a non-empty string';
  }

  if (
    body.description !== undefined &&
    typeof body.description !== 'string'
  ) {
    return 'description must be a string';
  }

  if (
    body.status !== undefined &&
    !VALID_STATUSES.includes(body.status)
  ) {
    return `status must be one of: ${VALID_STATUSES.join(', ')}`;
  }

  if (
    body.priority !== undefined &&
    !VALID_PRIORITIES.includes(body.priority)
  ) {
    return `priority must be one of: ${VALID_PRIORITIES.join(', ')}`;
  }

  if (
    body.dueDate !== undefined &&
    body.dueDate !== null &&
    !isValidISODate(body.dueDate)
  ) {
    return 'dueDate must be a valid ISO date string';
  }

  return null;
};

const validateAssignTask = (body) => {
  const unknownFields = Object.keys(body).filter(
    (key) => !ASSIGN_FIELDS.includes(key)
  );

  if (unknownFields.length > 0) {
    return `unknown field(s): ${unknownFields.join(', ')}`;
  }

  if (
    !Object.prototype.hasOwnProperty.call(body, 'assignee') ||
    typeof body.assignee !== 'string' ||
    body.assignee.trim() === ''
  ) {
    return 'assignee is required and must be a non-empty string';
  }

  return null;
};

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateAssignTask,
  isValidISODate,
};