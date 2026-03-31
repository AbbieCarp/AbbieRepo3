/**
 * Error used when user input fails validation rules.
 */
export class ValidationError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error used when a requested entity does not exist.
 */
export class NotFoundError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Error used for command-level failures.
 */
export class CommandError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = 'CommandError';
  }
}
