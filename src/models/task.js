import { randomUUID } from 'node:crypto';
import { TASK_STATUSES, TASK_PRIORITIES, PRIORITY_RANK, buildTask } from '../domain/task-model.js';
import { validateCreateTaskInput } from '../domain/task-validators.js';

export { TASK_STATUSES, TASK_PRIORITIES, PRIORITY_RANK };

/**
 * Task entity class with built-in validation.
 * Construct with a plain input object; the instance is a validated,
 * fully-normalised task with generated id and timestamps.
 */
export class Task {
  /**
   * @param {{ title: string, description?: string, status?: string, priority?: string, category?: string }} input
   */
  constructor(input) {
    validateCreateTaskInput(input);

    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const data = buildTask(input, { id, timestamp });

    Object.assign(this, data);
  }

  /** Return a new Task that is a copy of this one with a fresh ID and timestamps. */
  clone() {
    const copy = Object.create(Task.prototype);
    Object.assign(copy, this.toObject(), {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return copy;
  }

  /** Return a plain copy with no class prototype methods attached. */
  toObject() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      category: this.category,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
