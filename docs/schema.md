# Task Manager CLI Schema

## 1. Data Schema

### 1.1 Enums

- `TaskStatus`: `'todo' | 'in-progress' | 'done'`
- `TaskPriority`: `'low' | 'medium' | 'high'`
- `SortBy`: `'priority' | 'createdAt'`
- `SortOrder`: `'asc' | 'desc'`

### 1.2 Core Entity: Task

| Field | Type | Required | Default | Rules |
|---|---|---|---|---|
| `id` | `string` | Yes | `crypto.randomUUID()` | Must be unique in memory store |
| `title` | `string` | Yes | — | Trimmed length `1..120` |
| `description` | `string` | No | `''` | Max length `500` |
| `status` | `TaskStatus` | No | `'todo'` | Must match enum |
| `priority` | `TaskPriority` | No | `'medium'` | Must match enum |
| `createdAt` | `string` | Yes | `new Date().toISOString()` | ISO 8601 timestamp |
| `updatedAt` | `string` | Yes | `new Date().toISOString()` | ISO 8601 timestamp; updated on successful mutation |

### 1.3 Command Payload Schemas

#### CreateTaskInput

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | `string` | Yes | Trimmed length `1..120` |
| `description` | `string` | No | Max length `500` |
| `status` | `TaskStatus` | No | Defaults to `'todo'` |
| `priority` | `TaskPriority` | No | Defaults to `'medium'` |

#### UpdateTaskInput

| Field | Type | Required | Rules |
|---|---|---|---|
| `id` | `string` | Yes | Must refer to existing task |
| `title` | `string` | No | If present, trimmed length `1..120` |
| `description` | `string` | No | If present, max length `500` |
| `status` | `TaskStatus` | No | Must match enum |
| `priority` | `TaskPriority` | No | Must match enum |

Validation behavior:
- Reject unknown fields.
- Apply updates atomically (all-or-nothing).
- Refresh `updatedAt` only after validation succeeds.

#### DeleteTaskInput

| Field | Type | Required | Rules |
|---|---|---|---|
| `id` | `string` | Yes | Must refer to existing task |

#### ListTaskQuery

| Field | Type | Required | Default | Rules |
|---|---|---|---|---|
| `status` | `TaskStatus` | No | `undefined` | Filter by status |
| `priority` | `TaskPriority` | No | `undefined` | Filter by priority |
| `sortBy` | `SortBy` | No | `undefined` | `priority` or `createdAt` |
| `order` | `SortOrder` | No | Contextual | For `createdAt`: `desc`; for `priority`: `asc` |

### 1.4 In-Memory Store Schema

```js
{
  tasks: Task[]
}
```

Store constraints:
- Source of truth is process memory only.
- IDs are unique within `tasks`.
- No persistence to disk or database.

### 1.5 Error Schema

Use typed error classes for predictable handling:
- `ValidationError`
- `NotFoundError`
- `CommandError`

Error output conventions:
- Write user-facing errors to stderr.
- Message format: `Error: <reason>. Hint: <how to fix>`.
- Exit code `1` for user/input errors; `0` for successful commands.

## 2. Proposed File Structure

```text
src/
  index.js                   # CLI entry point
  cli/
    parse-args.js            # Parse process.argv into command + flags
    commands.js              # Command dispatcher (create/list/update/delete)
    output.js                # Console output formatting for rows/errors/help
  domain/
    task-model.js            # Enum constants and task-related shared definitions
    task-validators.js       # Validation for create/update/query inputs
    errors.js                # ValidationError, NotFoundError, CommandError
  services/
    task-service.js          # Business logic: CRUD + filtering + sorting
  storage/
    memory-store.js          # In-memory collection and lookup helpers
  utils/
    id.js                    # randomUUID wrapper
    time.js                  # ISO timestamp helpers
```

## 3. Module Responsibility Map

- `cli/` handles user input/output concerns only.
- `domain/` owns rules, enums, and validation.
- `services/` executes use cases and orchestrates domain + storage.
- `storage/` abstracts in-memory collection access.
- `utils/` provides deterministic helpers with no business rules.

This separation keeps workshop scope small while making each module testable in isolation.
