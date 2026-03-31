import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildTask,
  PRIORITY_RANK,
  TASK_PRIORITIES,
  TASK_STATUSES
} from '../src/domain/task-model.js';

test('TASK_STATUSES exposes all allowed statuses', () => {
  assert.deepEqual(TASK_STATUSES, ['todo', 'in-progress', 'done']);
});

test('TASK_PRIORITIES exposes all allowed priorities', () => {
  assert.deepEqual(TASK_PRIORITIES, ['low', 'medium', 'high']);
});

test('PRIORITY_RANK maps priority values in ascending order', () => {
  assert.equal(PRIORITY_RANK.low, 1);
  assert.equal(PRIORITY_RANK.medium, 2);
  assert.equal(PRIORITY_RANK.high, 3);
});

test('buildTask normalizes strings and applies defaults', () => {
  const task = buildTask(
    {
      title: '  Buy groceries  '
    },
    {
      id: '11111111-1111-4111-8111-111111111111',
      timestamp: '2026-03-31T10:00:00.000Z'
    }
  );

  assert.equal(task.id, '11111111-1111-4111-8111-111111111111');
  assert.equal(task.title, 'Buy groceries');
  assert.equal(task.description, '');
  assert.equal(task.status, 'todo');
  assert.equal(task.priority, 'medium');
  assert.equal(task.createdAt, '2026-03-31T10:00:00.000Z');
  assert.equal(task.updatedAt, '2026-03-31T10:00:00.000Z');
});

test('buildTask preserves provided description, status, and priority', () => {
  const task = buildTask(
    {
      title: 'Task',
      description: '  detail  ',
      status: 'done',
      priority: 'high'
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      timestamp: '2026-03-31T10:30:00.000Z'
    }
  );

  assert.equal(task.description, 'detail');
  assert.equal(task.status, 'done');
  assert.equal(task.priority, 'high');
});
