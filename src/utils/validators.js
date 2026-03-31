// Convenience re-exports from the domain validation module so consumers can
// import from the conventional utils path (src/utils/validators.js).
export {
  validateCreateTaskInput,
  validateUpdateTaskInput,
  validateListTaskQuery,
  validateTask,
  validateTitle,
  validateDescription,
  validateStatus,
  validatePriority,
  validateId
} from '../domain/task-validators.js';
