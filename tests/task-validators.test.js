import test from 'node:test';
import assert from 'node:assert/strict';

import { ValidationError } from '../src/domain/errors.js';
import {
  validateCreateTaskInput,
  validateDescription,
  validateId,
  validateIsoTimestamp,
  validateListTaskQuery,
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
