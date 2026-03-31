import test from 'node:test';
import assert from 'node:assert/strict';

import { Task } from '../src/models/task.js';
import { ValidationError } from '../src/domain/errors.js';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_UTC  = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

// ── constructor ──────────────────────────────────────────────────────────────

test('Task constructor sets default status, priority, and description', () => {
  const task = new Task({ title: 'Build feature' });

  assert.equal(task.title, 'Build feature');
  assert.equal(task.status, 'todo');
  assert.equal(task.priority, 'medium');
  assert.equal(task.description, '');
  assert.match(task.id, UUID_V4);
  assert.match(task.createdAt, ISO_UTC);
  assert.match(task.updatedAt, ISO_UTC);
});

test('Task constructor trims title and description whitespace', () => {
  const task = new Task({ title: '  Hello  ', description: '  world  ' });

  assert.equal(task.title, 'Hello');
  assert.equal(task.description, 'world');
});

test('Task constructor preserves explicit status and priority', () => {
  const task = new Task({ title: 'Done task', status: 'done', priority: 'high' });

  assert.equal(task.status, 'done');
  assert.equal(task.priority, 'high');
});

test('Task constructor sets createdAt equal to updatedAt on creation', () => {
  const task = new Task({ title: 'Timestamps' });

  assert.equal(task.createdAt, task.updatedAt);
});

test('Task constructor throws ValidationError for missing title', () => {
  assert.throws(() => new Task({}), ValidationError);
});

test('Task constructor throws ValidationError for empty title', () => {
  assert.throws(() => new Task({ title: '   ' }), ValidationError);
});

test('Task constructor throws ValidationError for invalid status', () => {
  assert.throws(() => new Task({ title: 'X', status: 'invalid' }), ValidationError);
});

test('Task constructor throws ValidationError for invalid priority', () => {
  assert.throws(() => new Task({ title: 'X', priority: 'urgent' }), ValidationError);
});

test('Task constructor throws ValidationError for unknown fields', () => {
  assert.throws(() => new Task({ title: 'X', extra: true }), ValidationError);
});

// ── toObject() ───────────────────────────────────────────────────────────────

test('toObject() returns a plain object with all eight fields', () => {
  const task = new Task({ title: 'Export me' });
  const obj  = task.toObject();

  assert.ok(!(obj instanceof Task));
  assert.deepEqual(Object.keys(obj).sort(), [
    'category', 'createdAt', 'description', 'id', 'priority', 'status', 'title', 'updatedAt'
  ]);
});

test('toObject() values match the Task instance properties', () => {
  const task = new Task({ title: 'Match', status: 'in-progress', priority: 'low' });
  const obj  = task.toObject();

  assert.equal(obj.id,          task.id);
  assert.equal(obj.title,       task.title);
  assert.equal(obj.description, task.description);
  assert.equal(obj.status,      task.status);
  assert.equal(obj.priority,    task.priority);
  assert.equal(obj.createdAt,   task.createdAt);
  assert.equal(obj.updatedAt,   task.updatedAt);
});

test('toObject() returns a new object each call (no shared reference)', () => {
  const task = new Task({ title: 'Immutable' });
  const a = task.toObject();
  const b = task.toObject();

  assert.notEqual(a, b);
  assert.deepEqual(a, b);
});

// ── clone() ──────────────────────────────────────────────────────────────────

test('clone() returns an instance of Task', () => {
  const original = new Task({ title: 'Original' });

  assert.ok(original.clone() instanceof Task);
});

test('clone() has a different id from the original', () => {
  const original = new Task({ title: 'Original' });
  const cloned   = original.clone();

  assert.notEqual(cloned.id, original.id);
  assert.match(cloned.id, UUID_V4);
});

test('clone() preserves title, description, status, and priority', () => {
  const original = new Task({
    title: 'My task',
    description: 'Some detail',
    status: 'done',
    priority: 'high'
  });
  const cloned = original.clone();

  assert.equal(cloned.title,       original.title);
  assert.equal(cloned.description, original.description);
  assert.equal(cloned.status,      original.status);
  assert.equal(cloned.priority,    original.priority);
});

test('clone() has valid ISO UTC timestamps for createdAt and updatedAt', () => {
  const cloned = new Task({ title: 'Clone timestamps' }).clone();

  assert.match(cloned.createdAt, ISO_UTC);
  assert.match(cloned.updatedAt, ISO_UTC);
});

test('clone() does not mutate the original task', () => {
  const original  = new Task({ title: 'Original' });
  const originalId = original.id;
  original.clone();

  assert.equal(original.id, originalId);
});
