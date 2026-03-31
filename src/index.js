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

// ── CATEGORY FEATURE ──────────────────────────────────────────────────────────

console.log('\n=== CATEGORY FEATURE ===');

// Create tasks with different categories
const c1 = service.createTask({
  title: 'Deploy to production',
  category: 'devops',
  priority: 'high'
});
console.log('Created with category "devops":', { title: c1.title, category: c1.category });

const c2 = service.createTask({
  title: 'Review code changes',
  category: 'code-review',
  priority: 'medium'
});
console.log('Created with category "code-review":', { title: c2.title, category: c2.category });

const c3 = service.createTask({
  title: 'Update documentation',
  category: 'documentation',
  priority: 'low'
});
console.log('Created with category "documentation":', { title: c3.title, category: c3.category });

// List unique categories
console.log('\n=== ALL UNIQUE CATEGORIES ===');
const categories = service.listUniqueCategories();
console.log('Unique categories:', categories);

// Filter tasks by category
console.log('\n=== FILTER BY CATEGORY: devops ===');
const devopsTasks = service.filterTasksByCategory('devops');
devopsTasks.forEach((t) => console.log(`  [${t.priority}] ${t.title}`));

console.log('\n=== FILTER BY CATEGORY: general ===');
const generalTasks = service.filterTasksByCategory('general');
console.log(`Found ${generalTasks.length} tasks in "general" category`);

