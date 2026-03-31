# Task Manager CLI Project Plan

## 1. Project Overview
The Task Manager CLI is a Node.js 20+ command-line application for managing personal tasks in memory without external dependencies. Users can create, list, update, and delete tasks, then refine views by filtering on status or priority and sorting by priority or creation date. The goal is a small, workshop-friendly project that demonstrates clean CLI design, predictable validation, and modular architecture using only built-in Node.js modules.

## 2. User Stories
1. As a user, I want to create a task so I can track work I need to do.
   - Acceptance criteria:
   - Given a valid title, when I run the create command, then a task is added with a generated id and timestamps.
   - Given no description, when I create a task, then description defaults to an empty string.
   - Given invalid status or priority values, when I create a task, then the CLI returns a validation error and does not create the task.

2. As a user, I want to list tasks so I can see all current work items.
   - Acceptance criteria:
   - When I run the list command with no filters, then all tasks are displayed.
   - When no tasks exist, then the CLI shows a clear empty-state message.

3. As a user, I want to update a task so I can keep task details current.
   - Acceptance criteria:
   - Given an existing task id, when I update one or more fields, then only those fields change and updatedAt is refreshed.
   - Given a non-existent task id, when I run update, then the CLI shows a not-found error.
   - Given invalid field values, when I run update, then the CLI shows a validation error and preserves original data.

4. As a user, I want to delete a task so I can remove completed or obsolete work.
   - Acceptance criteria:
   - Given an existing task id, when I run delete, then that task is removed from memory.
   - Given a non-existent task id, when I run delete, then the CLI shows a not-found error.

5. As a user, I want to filter tasks by status or priority so I can focus on relevant items.
   - Acceptance criteria:
   - When I pass --status with todo, in-progress, or done, then only matching tasks are shown.
   - When I pass --priority with low, medium, or high, then only matching tasks are shown.
   - When I pass both filters, then only tasks matching both filters are shown.

6. As a user, I want to sort tasks by priority or creation date so I can prioritize my work.
   - Acceptance criteria:
   - When I sort by priority, then order is high, medium, low.
   - When I sort by creation date, then order can be newest-first or oldest-first based on an option.
   - When sorting is requested, then output order is deterministic for tasks with equal values.

7. As a user, I want to organize tasks by category so I can group related work items.
   - Acceptance criteria:
   - Given a category name when I create a task, then the task is assigned that category.
   - Given no category when I create a task, then the category defaults to "general".
   - When I update a task, then I can change its category to any string value or keep the existing value.
   - When I filter by category, then only tasks with that category are shown.
   - When I request a list of all categories, then all unique category values present in tasks are returned.

8. As a user, I want to filter tasks by category so I can focus on specific groups of work.
   - Acceptance criteria:
   - When I pass --category with a valid category value, then only tasks with that category are shown.
   - When multiple tasks share a category, then all matching tasks are displayed.
   - When no tasks have the requested category, then the CLI shows an empty-state message.

## 3. Data Model
- Entity: Task
  - id: string
  - title: string (required)
  - description: string (optional, default "")
  - status: "todo" | "in-progress" | "done"
  - priority: "low" | "medium" | "high"
  - category: string (optional, default "general")
  - createdAt: string (ISO 8601 timestamp)
  - updatedAt: string (ISO 8601 timestamp)

- Entity: TaskFilterOptions
  - status: "todo" | "in-progress" | "done" | undefined
  - priority: "low" | "medium" | "high" | undefined
  - category: string | undefined

- Entity: TaskSortOptions
  - sortBy: "priority" | "createdAt" | undefined
  - order: "asc" | "desc" | undefined

- In-memory store
  - tasks: Task[]

## 4. File Structure
```text
src/
  index.js                 # CLI entry point
  cli/
    parse-args.js          # Parse command and flags from process.argv
    commands.js            # Route parsed args to service operations
    output.js              # Print tables/messages to console
  domain/
    task-model.js          # Task shape and enums/constants
    task-validators.js     # Input validation rules
  services/
    task-service.js        # CRUD, filtering, sorting business logic
  storage/
    memory-store.js        # In-memory task collection and lookup helpers
  utils/
    time.js                # Timestamp helpers
    id.js                  # crypto.randomUUID wrapper
```

## 5. Implementation Phases
1. Milestone 1: Project skeleton and CLI contract
   - Create src structure and command map.
   - Implement argument parsing for create, list, update, delete.
   - Define help text and usage examples.

2. Milestone 2: Core task domain and in-memory storage
   - Define task model constants for status/priority.
   - Implement in-memory store and id/timestamp utility helpers.
   - Add create and list operations.

3. Milestone 3: Validation and robust CRUD behavior
   - Add validation for required fields and enum values.
   - Implement update and delete with clear not-found errors.
   - Ensure updatedAt changes only on successful updates.

4. Milestone 4: Filtering and sorting
   - Add status/priority filtering.
   - Add sorting by priority and createdAt with configurable order.
   - Ensure deterministic tie-breaking behavior.

5. Milestone 5: Hardening and documentation
   - Add edge-case handling (empty store, invalid args, duplicate flags).
   - Add inline module docs and examples in README snippets.
   - Perform manual CLI verification against all user stories.

## 6. Error Handling Conventions and Input Validation Rules

### Error handling conventions
- Use a small, explicit error taxonomy in `src/domain/errors.js`:
   - `ValidationError` for bad input.
   - `NotFoundError` for unknown task ids.
   - `CommandError` for unsupported commands/flags.
- Return user-safe messages to stderr via `console.error`.
- Use exit code `1` for user/input errors and exit code `0` for successful operations.
- Avoid stack traces for expected user mistakes; reserve thrown internal errors for unexpected failures.
- Keep error messages actionable and consistent:
   - Format: `Error: <reason>. Hint: <how to fix>`.
   - Example: `Error: Invalid status 'doing'. Hint: use todo, in-progress, or done.`

### Input validation rules
- `title`
   - Required on create.
   - Must be a string after trimming whitespace.
   - Must be 1-120 characters.
- `description`
   - Optional.
   - Defaults to empty string.
   - Must be a string with max length 500.
- `status`
   - Allowed values: `todo`, `in-progress`, `done`.
   - Defaults to `todo` on create if omitted.
- `priority`
   - Allowed values: `low`, `medium`, `high`.
   - Defaults to `medium` on create if omitted.
- `category`
   - Optional.
   - Defaults to `general` on create if omitted.
   - Must be a string if provided.
   - Trimmed length must be 1-100 characters.
   - Used for organizing and filtering task groups.
- `id`
   - Required for update/delete.
   - Must be a non-empty string and match an existing task.
- Filters and sorting
   - `--status` and `--priority` must use allowed enum values.
   - `--category` must be a non-empty string matching an existing task's category.
   - `--sortBy` must be `priority` or `createdAt`.
   - `--order` must be `asc` or `desc`; default to `desc` for `createdAt` and `asc` for `priority`.
- Unknown fields or duplicate flags
   - Reject unknown update fields.
   - Reject duplicate flags with conflicting values.

### Validation timing and behavior
- Validate all command inputs before mutating state.
- On validation failure, do not change any task data.
- On update, apply changes atomically (all-or-nothing) and only refresh `updatedAt` after validation passes.
- Centralize validators in `src/domain/task-validators.js` so rules are shared across commands.

## Constraints and Technical Notes
- Runtime: Node.js 20+
- Dependencies: none (built-in modules only: crypto, assert, process, console)
- Storage: process memory only (no database, no file persistence)
