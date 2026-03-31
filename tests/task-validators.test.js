import test from 'node:test';
import assert from 'node:assert/strict';

import { ValidationError } from '../src/domain/errors.js';
import {
  validateCreateTaskInput,
  validateDescription,
  validateId,
  validateIsoTimestamp,
  validateListTaskQuery,
  validatePriority,
  validateStatus,
  validateTask,
  validateTitle,
  validateUpdateTaskInput
} from '../src/domain/task-validators.js';

test('validateCreateTaskInput accepts valid input', () => {
  assert.doesNotThrow(() => {
    validateCreateTaskInput({
      title: 'Write tests',
      description: 'for validators',
      status: 'todo',
      priority: 'low'
    });
  });
});

test('validateCreateTaskInput rejects unknown fields', () => {
  assert.throws(
    () => validateCreateTaskInput({ title: 'A', extra: true }),
    ValidationError
  );
});

test('validateTitle rejects empty values after trim', () => {
  assert.throws(() => validateTitle('   '), ValidationError);
});

test('validateDescription rejects too-long text', () => {
  assert.throws(() => validateDescription('a'.repeat(501)), ValidationError);
});

test('validateId accepts valid uuid v4', () => {
  assert.doesNotThrow(() => validateId('33333333-3333-4333-8333-333333333333'));
});

test('validateId rejects non-v4 uuids', () => {
  assert.throws(() => validateId('33333333-3333-3333-8333-333333333333'), ValidationError);
});

test('validateIsoTimestamp accepts ISO UTC format', () => {
  assert.doesNotThrow(() => validateIsoTimestamp('2026-03-31T12:00:00.000Z', 'createdAt'));
});

test('validateIsoTimestamp rejects invalid format', () => {
  assert.throws(() => validateIsoTimestamp('2026-03-31', 'createdAt'), ValidationError);
});

test('validateUpdateTaskInput requires at least one field', () => {
  assert.throws(() => validateUpdateTaskInput({}), ValidationError);
});

test('validateUpdateTaskInput allows partial valid payload', () => {
  assert.doesNotThrow(() => validateUpdateTaskInput({ priority: 'high' }));
});

test('validateListTaskQuery validates sort parameters', () => {
  assert.throws(() => validateListTaskQuery({ sortBy: 'name' }), ValidationError);
});

test('validateTask accepts a full valid task', () => {
  assert.doesNotThrow(() => {
    validateTask({
      id: '44444444-4444-4444-8444-444444444444'.replace('4444-4444-8444', '4444-4444-8444'),
      title: 'Task',
      description: 'Description',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '2026-03-31T12:00:00.000Z',
      updatedAt: '2026-03-31T12:00:00.000Z'
    });
  });
});

test('validateTask rejects updatedAt before createdAt', () => {
  assert.throws(
    () =>
      validateTask({
        id: '55555555-5555-4555-8555-555555555555',
        title: 'Task',
        description: '',
        status: 'todo',
        priority: 'medium',
        createdAt: '2026-03-31T12:00:01.000Z',
        updatedAt: '2026-03-31T12:00:00.000Z'
      }),
    ValidationError
  );
});

// ── validateStatus ───────────────────────────────────────────────────────────

test('validateStatus accepts all valid enum values', () => {
  assert.doesNotThrow(() => validateStatus('todo'));
  assert.doesNotThrow(() => validateStatus('in-progress'));
  assert.doesNotThrow(() => validateStatus('done'));
});

test('validateStatus rejects an invalid string', () => {
  assert.throws(() => validateStatus('pending'),  ValidationError);
  assert.throws(() => validateStatus('DONE'),     ValidationError);
});

test('validateStatus rejects a non-string value', () => {
  assert.throws(() => validateStatus(1), ValidationError);
});

// ── validatePriority ─────────────────────────────────────────────────────────

test('validatePriority accepts all valid enum values', () => {
  assert.doesNotThrow(() => validatePriority('low'));
  assert.doesNotThrow(() => validatePriority('medium'));
  assert.doesNotThrow(() => validatePriority('high'));
});

test('validatePriority rejects an invalid string', () => {
  assert.throws(() => validatePriority('urgent'), ValidationError);
  assert.throws(() => validatePriority('HIGH'),   ValidationError);
});

test('validatePriority rejects a non-string value', () => {
  assert.throws(() => validatePriority(true), ValidationError);
});

// ── validateTitle (extra edge cases) ─────────────────────────────────────────

test('validateTitle rejects non-string input', () => {
  assert.throws(() => validateTitle(42),   ValidationError);
  assert.throws(() => validateTitle(null), ValidationError);
});

test('validateTitle rejects a title longer than 120 characters', () => {
  assert.throws(() => validateTitle('a'.repeat(121)), ValidationError);
});

test('validateTitle accepts a title of exactly 120 characters', () => {
  assert.doesNotThrow(() => validateTitle('a'.repeat(120)));
});

test('validateTitle accepts a title of exactly 1 character', () => {
  assert.doesNotThrow(() => validateTitle('x'));
});

test('validateTitle throws for undefined when not optional', () => {
  assert.throws(() => validateTitle(undefined), ValidationError);
});

// ── validateId (extra edge cases) ────────────────────────────────────────────

test('validateId rejects an empty string', () => {
  assert.throws(() => validateId(''), ValidationError);
});

test('validateId rejects a whitespace-only string', () => {
  assert.throws(() => validateId('   '), ValidationError);
});

test('validateId rejects non-string values', () => {
  assert.throws(() => validateId(123),  ValidationError);
  assert.throws(() => validateId(null), ValidationError);
});

// ── validateListTaskQuery (extra cases) ──────────────────────────────────────

test('validateListTaskQuery accepts an empty query object', () => {
  assert.doesNotThrow(() => validateListTaskQuery({}));
});

test('validateListTaskQuery accepts a full valid query', () => {
  assert.doesNotThrow(() =>
    validateListTaskQuery({
      status:   'in-progress',
      priority: 'high',
      sortBy:   'createdAt',
      order:    'asc'
    })
  );
});

test('validateListTaskQuery rejects an invalid order value', () => {
  assert.throws(() => validateListTaskQuery({ order: 'random' }), ValidationError);
});

// ── validateUpdateTaskInput (extra cases) ────────────────────────────────────

test('validateUpdateTaskInput rejects unknown fields', () => {
  assert.throws(
    () => validateUpdateTaskInput({ title: 'X', unknownField: true }),
    ValidationError
  );
});

test('validateUpdateTaskInput rejects invalid status value', () => {
  assert.throws(
    () => validateUpdateTaskInput({ status: 'pending' }),
    ValidationError
  );
});

// ── validateTask (extra cases) ───────────────────────────────────────────────

test('validateTask rejects unknown fields', () => {
  assert.throws(
    () =>
      validateTask({
        id:          '66666666-6666-4666-8666-666666666666',
        title:       'Task',
        description: '',
        status:      'todo',
        priority:    'medium',
        createdAt:   '2026-03-31T12:00:00.000Z',
        updatedAt:   '2026-03-31T12:00:00.000Z',
        extra:       true
      }),
    ValidationError
  );
});
