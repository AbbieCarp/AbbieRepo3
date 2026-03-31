import test from 'node:test';
import assert from 'node:assert/strict';

import { NotFoundError, ValidationError } from '../src/domain/errors.js';
import { TaskService } from '../src/services/task-service.js';

/**
 * @param {string[]} timestamps
 * @returns {() => string}
 */
function makeTimeProvider(timestamps) {
  let index = 0;
  return () => {
    const value = timestamps[index] ?? timestamps[timestamps.length - 1];
    index += 1;
    return value;
  };
}

test('createTask stores a normalized task with generated metadata', () => {
  const service = new TaskService({
    idGenerator: () => 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    timeProvider: () => '2026-03-31T09:00:00.000Z'
  });

  const created = service.createTask({
    title: '  Plan sprint  ',
    description: '  backlog grooming  '
  });

  assert.equal(created.id, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  assert.equal(created.title, 'Plan sprint');
  assert.equal(created.description, 'backlog grooming');
  assert.equal(created.status, 'todo');
  assert.equal(created.priority, 'medium');
  assert.equal(service.listTasks().length, 1);
});

test('createTask throws when generated id collides', () => {
  let count = 0;
  const service = new TaskService({
    idGenerator: () => {
      count += 1;
      return 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    },
    timeProvider: () => '2026-03-31T09:30:00.000Z'
  });

  service.createTask({ title: 'First' });
  assert.throws(() => service.createTask({ title: 'Second' }), ValidationError);
  assert.equal(count, 2);
});

test('listTasks filters by status and priority', () => {
  const service = new TaskService({
    idGenerator: (() => {
      const ids = [
        'c1111111-1111-4111-8111-111111111111',
        'c2222222-2222-4222-8222-222222222222'
      ];
      let index = 0;
      return () => ids[index++];
    })(),
    timeProvider: makeTimeProvider([
      '2026-03-31T10:00:00.000Z',
      '2026-03-31T10:01:00.000Z'
    ])
  });

  service.createTask({ title: 'A', status: 'todo', priority: 'low' });
  service.createTask({ title: 'B', status: 'done', priority: 'high' });

  const byStatus = service.listTasks({ status: 'done' });
  const byPriority = service.listTasks({ priority: 'low' });

  assert.equal(byStatus.length, 1);
  assert.equal(byStatus[0].title, 'B');
  assert.equal(byPriority.length, 1);
  assert.equal(byPriority[0].title, 'A');
});

test('listTasks sorts by priority ascending by default', () => {
  const service = new TaskService({
    idGenerator: (() => {
      const ids = [
        'd1111111-1111-4111-8111-111111111111',
        'd2222222-2222-4222-8222-222222222222',
        'd3333333-3333-4333-8333-333333333333'
      ];
      let index = 0;
      return () => ids[index++];
    })(),
    timeProvider: makeTimeProvider([
      '2026-03-31T11:00:00.000Z',
      '2026-03-31T11:01:00.000Z',
      '2026-03-31T11:02:00.000Z'
    ])
  });

  service.createTask({ title: 'High', priority: 'high' });
  service.createTask({ title: 'Low', priority: 'low' });
  service.createTask({ title: 'Medium', priority: 'medium' });

  const sorted = service.listTasks({ sortBy: 'priority' });
  assert.deepEqual(
    sorted.map((task) => task.title),
    ['Low', 'Medium', 'High']
  );
});

test('listTasks sorts by createdAt descending by default', () => {
  const service = new TaskService({
    idGenerator: (() => {
      const ids = [
        'e1111111-1111-4111-8111-111111111111',
        'e2222222-2222-4222-8222-222222222222'
      ];
      let index = 0;
      return () => ids[index++];
    })(),
    timeProvider: makeTimeProvider([
      '2026-03-31T12:00:00.000Z',
      '2026-03-31T12:05:00.000Z'
    ])
  });

  service.createTask({ title: 'Older' });
  service.createTask({ title: 'Newer' });

  const sorted = service.listTasks({ sortBy: 'createdAt' });
  assert.deepEqual(
    sorted.map((task) => task.title),
    ['Newer', 'Older']
  );
});

test('updateTask applies valid changes atomically and refreshes updatedAt', () => {
  const service = new TaskService({
    idGenerator: () => 'f1111111-1111-4111-8111-111111111111',
    timeProvider: makeTimeProvider([
      '2026-03-31T13:00:00.000Z',
      '2026-03-31T13:10:00.000Z'
    ])
  });

  const created = service.createTask({ title: 'Initial title' });
  const updated = service.updateTask(created.id, {
    title: '  Updated title  ',
    status: 'in-progress'
  });

  assert.equal(updated.title, 'Updated title');
  assert.equal(updated.status, 'in-progress');
  assert.equal(updated.createdAt, '2026-03-31T13:00:00.000Z');
  assert.equal(updated.updatedAt, '2026-03-31T13:10:00.000Z');
});

test('updateTask throws NotFoundError for unknown id', () => {
  const service = new TaskService();
  assert.throws(
    () => service.updateTask('f2222222-2222-4222-8222-222222222222', { title: 'X' }),
    NotFoundError
  );
});

test('updateTask rejects invalid patch and leaves task unchanged', () => {
  const service = new TaskService({
    idGenerator: () => 'f3333333-3333-4333-8333-333333333333',
    timeProvider: makeTimeProvider([
      '2026-03-31T14:00:00.000Z',
      '2026-03-31T14:05:00.000Z'
    ])
  });

  const created = service.createTask({ title: 'Keep me' });
  assert.throws(() => service.updateTask(created.id, { priority: 'urgent' }), ValidationError);

  const persisted = service.listTasks()[0];
  assert.equal(persisted.title, 'Keep me');
  assert.equal(persisted.updatedAt, '2026-03-31T14:00:00.000Z');
});

test('deleteTask removes an existing task', () => {
  const service = new TaskService({
    idGenerator: () => 'f4444444-4444-4444-8444-444444444444',
    timeProvider: () => '2026-03-31T15:00:00.000Z'
  });

  const created = service.createTask({ title: 'To delete' });
  service.deleteTask(created.id);

  assert.equal(service.listTasks().length, 0);
});

test('deleteTask throws NotFoundError for unknown id', () => {
  const service = new TaskService();
  assert.throws(
    () => service.deleteTask('f5555555-5555-4555-8555-555555555555'),
    NotFoundError
  );
});

// ── additional service coverage ───────────────────────────────────────────────

test('createTask throws ValidationError for missing title', () => {
  const service = new TaskService();
  assert.throws(() => service.createTask({}), ValidationError);
});

test('createTask throws ValidationError for empty title', () => {
  const service = new TaskService();
  assert.throws(() => service.createTask({ title: '   ' }), ValidationError);
});

test('listTasks returns empty array when no tasks exist', () => {
  const service = new TaskService();
  assert.deepEqual(service.listTasks(), []);
});

test('listTasks returns shallow copies (mutation does not affect store)', () => {
  const ids = ['ee111111-1111-4111-8111-111111111111'];
  let i = 0;
  const service = new TaskService({
    idGenerator: () => ids[i++],
    timeProvider: () => '2026-03-31T18:00:00.000Z'
  });

  service.createTask({ title: 'Original' });
  const [copy] = service.listTasks();
  copy.title = 'Mutated';

  assert.equal(service.listTasks()[0].title, 'Original');
});

test('listTasks sorts by priority descending', () => {
  const ids = [
    '0a111111-1111-4111-8111-111111111111',
    '0a222222-2222-4222-8222-222222222222',
    '0a333333-3333-4333-8333-333333333333'
  ];
  let i = 0;
  const service = new TaskService({
    idGenerator: () => ids[i++],
    timeProvider: () => '2026-03-31T16:00:00.000Z'
  });

  service.createTask({ title: 'Low',    priority: 'low'    });
  service.createTask({ title: 'High',   priority: 'high'   });
  service.createTask({ title: 'Medium', priority: 'medium' });

  const sorted = service.listTasks({ sortBy: 'priority', order: 'desc' });
  assert.deepEqual(sorted.map((t) => t.title), ['High', 'Medium', 'Low']);
});

test('listTasks sorts by createdAt ascending', () => {
  const ids = [
    '0b111111-1111-4111-8111-111111111111',
    '0b222222-2222-4222-8222-222222222222'
  ];
  let i = 0;
  const service = new TaskService({
    idGenerator: () => ids[i++],
    timeProvider: makeTimeProvider([
      '2026-03-31T17:00:00.000Z',
      '2026-03-31T17:10:00.000Z'
    ])
  });

  service.createTask({ title: 'Older' });
  service.createTask({ title: 'Newer' });

  const sorted = service.listTasks({ sortBy: 'createdAt', order: 'asc' });
  assert.deepEqual(sorted.map((t) => t.title), ['Older', 'Newer']);
});

test('listTasks throws ValidationError for invalid query', () => {
  const service = new TaskService();
  assert.throws(() => service.listTasks({ sortBy: 'name' }), ValidationError);
});

test('updateTask throws ValidationError for empty updates object', () => {
  const ids = ['0c111111-1111-4111-8111-111111111111'];
  let i = 0;
  const service = new TaskService({
    idGenerator: () => ids[i++],
    timeProvider: () => '2026-03-31T19:00:00.000Z'
  });

  const created = service.createTask({ title: 'Stable' });
  assert.throws(() => service.updateTask(created.id, {}), ValidationError);
});

test('deleteTask removes only the targeted task', () => {
  const ids = [
    '0d111111-1111-4111-8111-111111111111',
    '0d222222-2222-4222-8222-222222222222'
  ];
  let i = 0;
  const service = new TaskService({
    idGenerator: () => ids[i++],
    timeProvider: () => '2026-03-31T20:00:00.000Z'
  });

  const a = service.createTask({ title: 'Keep'   });
  const b = service.createTask({ title: 'Delete' });

  service.deleteTask(b.id);

  const remaining = service.listTasks();
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, a.id);
});
