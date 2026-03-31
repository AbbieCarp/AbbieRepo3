import chalk from 'chalk';

/**
 * Color helpers for terminal output
 */

export function colorizeStatus(status) {
  switch (status) {
    case 'done':
      return chalk.green(status);
    case 'in-progress':
      return chalk.yellow(status);
    case 'todo':
      return chalk.red(status);
    default:
      return status;
  }
}

export function colorizePriority(priority) {
  switch (priority) {
    case 'high':
      return chalk.bold.red(priority);
    case 'medium':
      return chalk.bold.yellow(priority);
    case 'low':
      return chalk.dim(priority);
    default:
      return priority;
  }
}

export function formatTaskForDisplay(task) {
  return {
    ...task,
    status: colorizeStatus(task.status),
    priority: colorizePriority(task.priority),
  };
}
