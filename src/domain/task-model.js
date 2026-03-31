export const TASK_STATUSES = ['todo', 'in-progress', 'done'];
export const TASK_PRIORITIES = ['low', 'medium', 'high'];

export const PRIORITY_RANK = {
  low: 1,
  medium: 2,
  high: 3
};

/**
 * Build a normalized task object with generated metadata.
 *
 * @param {{ title: string, description?: string, status?: string, priority?: string, category?: string }} input
 * @param {{ id: string, timestamp: string }} meta
 * @returns {{
 *   id: string,
 *   title: string,
 *   description: string,
 *   status: string,
 *   priority: string,
 *   category: string,
 *   createdAt: string,
 *   updatedAt: string
 * }}
 */
export function buildTask(input, meta) {
  return {
    id: meta.id,
    title: input.title.trim(),
    description: (input.description ?? '').trim(),
    status: input.status ?? 'todo',
    priority: input.priority ?? 'medium',
    category: (input.category ?? 'general').trim(),
    createdAt: meta.timestamp,
    updatedAt: meta.timestamp
  };
}
