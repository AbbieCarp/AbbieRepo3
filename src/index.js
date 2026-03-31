import { TaskService } from './services/taskService.js';
import { ValidationError, NotFoundError } from './domain/errors.js';
import { colorizeStatus, colorizePriority } from './utils/colors.js';

const service = new TaskService();

// ── CREATE ────────────────────────────────────────────────────────────────────

console.log('=== CREATE TASKS ===');

const t1 = service.createTask({
  title: 'Write unit tests',
  description: 'Cover all validator and service paths',
  priority: 'high'
});
console.log('Created:', t1);

const t2 = service.createTask({
  title: 'Update README',
  priority: 'low',
  status: 'in-progress'
});
console.log('Created:', t2);

const t3 = service.createTask({
  title: 'Fix login bug',
  description: 'Session token expires too early',
  priority: 'high',
  status: 'todo'
});
console.log('Created:', t3);

const t4 = service.createTask({
  title: 'Refactor task service',
  priority: 'medium',
  status: 'done'
});
console.log('Created:', t4);

// ── LIST (unfiltered) ─────────────────────────────────────────────────────────

console.log('\n=== LIST ALL TASKS ===');
const all = service.listTasks();
console.log(`Total tasks: ${all.length}`);
all.forEach((t) => console.log(`  [${colorizePriority(t.priority)}] ${t.title} (${colorizeStatus(t.status)})` ));

// ── LIST (filter by status) ───────────────────────────────────────────────────

console.log('\n=== FILTER BY STATUS: todo ===');
const todos = service.listTasks({ status: 'todo' });
todos.forEach((t) => console.log(`  ${t.title}`));

// ── LIST (filter by priority) ─────────────────────────────────────────────────

console.log('\n=== FILTER BY PRIORITY: high ===');
const highPri = service.listTasks({ priority: 'high' });
highPri.forEach((t) => console.log(`  ${t.title}`));

// ── LIST (sort by priority asc) ───────────────────────────────────────────────

console.log('\n=== SORT BY PRIORITY (asc) ===');
const byPri = service.listTasks({ sortBy: 'priority', order: 'asc' });
byPri.forEach((t) => console.log(`  [${colorizePriority(t.priority)}] ${t.title}`));

// ── LIST (sort by createdAt desc) ─────────────────────────────────────────────

console.log('\n=== SORT BY CREATED AT (desc — most recent first) ===');
const byDate = service.listTasks({ sortBy: 'createdAt', order: 'desc' });
byDate.forEach((t) => console.log(`  ${t.createdAt.slice(0, 23)} – ${t.title}`));

// ── UPDATE ────────────────────────────────────────────────────────────────────

console.log('\n=== UPDATE TASK ===');
const updated = service.updateTask(t1.id, { status: 'done', title: 'Write unit tests ✓' });
console.log('Updated:', updated);

// ── VALIDATION ERROR ──────────────────────────────────────────────────────────

console.log('\n=== VALIDATION ERROR (expected) ===');
try {
  service.createTask({ title: '' });
} catch (err) {
  if (err instanceof ValidationError) {
    console.log('Caught ValidationError:', err.message);
  }
}

// ── NOT FOUND ERROR ───────────────────────────────────────────────────────────

console.log('\n=== NOT FOUND ERROR (expected) ===');
try {
  service.updateTask('00000000-0000-4000-8000-000000000000', { status: 'done' });
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log('Caught NotFoundError:', err.message);
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

console.log('\n=== DELETE TASK ===');
service.deleteTask(t2.id);
console.log(`Deleted task id: ${t2.id}`);

console.log('\n=== REMAINING TASKS ===');
service.listTasks().forEach((t) => console.log(`  ${t.title}`));
