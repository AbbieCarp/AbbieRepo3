import { TASK_PRIORITIES, TASK_STATUSES } from './task-model.js';
import { ValidationError } from './errors.js';

const ISO_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate create-task payload.
 *
 * @param {Record<string, unknown>} input
 */
export function validateCreateTaskInput(input) {
  assertObject(input, 'Create input must be an object.');
  rejectUnknownFields(input, ['title', 'description', 'status', 'priority', 'category']);

  validateTitle(input.title);
  validateDescription(input.description);
  validateStatus(input.status);
  validatePriority(input.priority);
  validateCategory(input.category);
}

/**
 * Validate update-task payload.
 *
 * @param {Record<string, unknown>} input
 */
export function validateUpdateTaskInput(input) {
  assertObject(input, 'Update input must be an object.');
  rejectUnknownFields(input, ['title', 'description', 'status', 'priority', 'category']);

  if (Object.keys(input).length === 0) {
    throw new ValidationError('Update input must include at least one field.');
  }

  validateTitle(input.title, true);
  validateDescription(input.description, true);
  validateStatus(input.status, true);
  validatePriority(input.priority, true);
  validateCategory(input.category, true);
}

/**
 * Validate list query payload.
 *
 * @param {Record<string, unknown>} query
 */
export function validateListTaskQuery(query) {
  assertObject(query, 'List query must be an object.');
  rejectUnknownFields(query, ['status', 'priority', 'category', 'sortBy', 'order']);

  validateStatus(query.status, true);
  validatePriority(query.priority, true);
  validateCategory(query.category, true);

  if (query.sortBy !== undefined && !['priority', 'createdAt'].includes(query.sortBy)) {
    throw new ValidationError("sortBy must be 'priority' or 'createdAt'.");
  }

  if (query.order !== undefined && !['asc', 'desc'].includes(query.order)) {
    throw new ValidationError("order must be 'asc' or 'desc'.");
  }
}

/**
 * Validate a full task object.
 *
 * @param {Record<string, unknown>} task
 */
export function validateTask(task) {
  assertObject(task, 'Task must be an object.');
  rejectUnknownFields(task, [
    'id',
    'title',
    'description',
    'status',
    'priority',
    'category',
    'createdAt',
    'updatedAt'
  ]);

  validateId(task.id);
  validateTitle(task.title);
  validateDescription(task.description);
  validateStatus(task.status);
  validatePriority(task.priority);
  validateCategory(task.category);
  validateIsoTimestamp(task.createdAt, 'createdAt');
  validateIsoTimestamp(task.updatedAt, 'updatedAt');

  if (task.updatedAt < task.createdAt) {
    throw new ValidationError('updatedAt must be greater than or equal to createdAt.');
  }
}

/**
 * Validate and normalize task title.
 *
 * @param {unknown} value
 * @param {boolean} [optional=false]
 */
export function validateTitle(value, optional = false) {
  if (value === undefined && optional) {
    return;
  }

  if (typeof value !== 'string') {
    throw new ValidationError('title must be a string.');
  }

  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > 120) {
    throw new ValidationError('title length must be between 1 and 120 characters.');
  }
}

/**
 * Validate and normalize task description.
 *
 * @param {unknown} value
 * @param {boolean} [optional=false]
 */
export function validateDescription(value, optional = false) {
  if (value === undefined && optional) {
    return;
  }

  if (value === undefined) {
    return;
  }

  if (typeof value !== 'string') {
    throw new ValidationError('description must be a string.');
  }

  if (value.trim().length > 500) {
    throw new ValidationError('description length must be 500 characters or fewer.');
  }
}

/**
 * Validate task status enum value.
 *
 * @param {unknown} value
 * @param {boolean} [optional=false]
 */
export function validateStatus(value, optional = false) {
  if (value === undefined && optional) {
    return;
  }

  if (value === undefined) {
    return;
  }

  if (typeof value !== 'string' || !TASK_STATUSES.includes(value)) {
    throw new ValidationError("status must be one of: 'todo', 'in-progress', 'done'.");
  }
}

/**
 * Validate task priority enum value.
 *
 * @param {unknown} value
 * @param {boolean} [optional=false]
 */
export function validatePriority(value, optional = false) {
  if (value === undefined && optional) {
    return;
  }

  if (value === undefined) {
    return;
  }

  if (typeof value !== 'string' || !TASK_PRIORITIES.includes(value)) {
    throw new ValidationError("priority must be one of: 'low', 'medium', 'high'.");
  }
}

/**
 * Validate task category string.
 *
 * @param {unknown} value
 * @param {boolean} [optional=false]
 */
export function validateCategory(value, optional = false) {
  if (value === undefined && optional) {
    return;
  }

  if (value === undefined) {
    return;
  }

  if (typeof value !== 'string') {
    throw new ValidationError('category must be a string.');
  }

  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > 100) {
    throw new ValidationError('category length must be between 1 and 100 characters.');
  }
}

/**
 * Validate task identifier format.
 *
 * @param {unknown} value
 */
export function validateId(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError('id must be a non-empty string.');
  }

  if (!UUID_V4_REGEX.test(value)) {
    throw new ValidationError('id must be a valid UUID v4 string.');
  }
}

/**
 * Validate a UTC ISO timestamp string.
 *
 * @param {unknown} value
 * @param {string} field
 */
export function validateIsoTimestamp(value, field) {
  if (typeof value !== 'string' || !ISO_UTC_REGEX.test(value)) {
    throw new ValidationError(`${field} must be a valid ISO 8601 UTC timestamp.`);
  }

  if (Number.isNaN(Date.parse(value))) {
    throw new ValidationError(`${field} must be parseable as a date.`);
  }
}

/**
 * @param {unknown} value
 * @param {string} message
 */
function assertObject(value, message) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(message);
  }
}

/**
 * @param {Record<string, unknown>} payload
 * @param {string[]} allowed
 */
function rejectUnknownFields(payload, allowed) {
  for (const key of Object.keys(payload)) {
    if (!allowed.includes(key)) {
      throw new ValidationError(`Unknown field: ${key}.`);
    }
  }
}
