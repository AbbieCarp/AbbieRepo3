import { randomUUID } from 'node:crypto';
import { buildTask, PRIORITY_RANK } from '../domain/task-model.js';
import {
  validateCreateTaskInput,
  validateId,
  validateListTaskQuery,
  validateTask,
  validateUpdateTaskInput
} from '../domain/task-validators.js';
import { NotFoundError, ValidationError } from '../domain/errors.js';

/**
 * In-memory task service with CRUD, filtering, and sorting behaviors.
 */
export class TaskService {
  /**
   * @param {{ idGenerator?: () => string, timeProvider?: () => string }} [deps]
   */
  constructor(deps = {}) {
    this.tasks = [];
    this.idGenerator = deps.idGenerator ?? randomUUID;
    this.timeProvider = deps.timeProvider ?? (() => new Date().toISOString());
  }

  /**
   * Create and store a new task.
   *
   * @param {{ title: string, description?: string, status?: string, priority?: string }} input
   * @returns {object}
   */
  createTask(input) {
    validateCreateTaskInput(input);

    const id = this.idGenerator();
    validateId(id);
    if (this.tasks.some((task) => task.id === id)) {
      throw new ValidationError('Generated id collides with an existing task id.');
    }

    const timestamp = this.timeProvider();
    const task = buildTask(input, { id, timestamp });
    validateTask(task);

    this.tasks.push(task);
    return { ...task };
  }

  /**
   * List tasks with optional filtering and sorting.
   *
   * @param {{ status?: string, priority?: string, sortBy?: string, order?: string }} [query]
   * @returns {object[]}
   */
  listTasks(query = {}) {
    validateListTaskQuery(query);

    let results = [...this.tasks];

    if (query.status) {
      results = results.filter((task) => task.status === query.status);
    }

    if (query.priority) {
      results = results.filter((task) => task.priority === query.priority);
    }

    const sortBy = query.sortBy;
    if (sortBy === 'priority') {
      const order = query.order ?? 'asc';
      results.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
      if (order === 'desc') {
        results.reverse();
      }
    }

    if (sortBy === 'createdAt') {
      const order = query.order ?? 'desc';
      results.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      if (order === 'desc') {
        results.reverse();
      }
    }

    return results.map((task) => ({ ...task }));
  }

  /**
   * Update an existing task atomically.
   *
   * @param {string} id
   * @param {{ title?: string, description?: string, status?: string, priority?: string }} updates
   * @returns {object}
   */
  updateTask(id, updates) {
    validateId(id);
    validateUpdateTaskInput(updates);

    const index = this.tasks.findIndex((task) => task.id === id);
    if (index < 0) {
      throw new NotFoundError(`Task not found for id: ${id}.`);
    }

    const current = this.tasks[index];
    const next = {
      ...current,
      ...updates,
      title: updates.title !== undefined ? updates.title.trim() : current.title,
      description:
        updates.description !== undefined ? updates.description.trim() : current.description,
      updatedAt: this.timeProvider()
    };

    validateTask(next);
    this.tasks[index] = next;
    return { ...next };
  }

  /**
   * Delete a task by id.
   *
   * @param {string} id
   */
  deleteTask(id) {
    validateId(id);

    const index = this.tasks.findIndex((task) => task.id === id);
    if (index < 0) {
      throw new NotFoundError(`Task not found for id: ${id}.`);
    }

    this.tasks.splice(index, 1);
  }
}
