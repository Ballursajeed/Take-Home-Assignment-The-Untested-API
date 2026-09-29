# Bug Report

## 1. Arbitrary fields can be added during task update

### Location
src/services/taskService.js

### Problem
The update logic originally merged the request body directly into the existing task:

const updated = { ...tasks[index], ...fields };

This allowed unknown fields such as:

{
  "randomField": "hello"
}

to be stored in the task.

### Expected
Only supported task fields should be updateable.

### Actual
Any key supplied in the request body was added to the task.

### Fix
Restricted updates to known editable fields and added validation for unknown fields.

---

## 2. dueDate validation accepts non-ISO date strings

### Location
src/utils/validators.js

### Problem
Validation used:

Date.parse(body.dueDate)

Date.parse() accepts values such as:

nov-21
nov 21

even though the API expects an ISO 8601 date.

### Expected

2026-11-21T00:00:00.000Z

### Actual
Non-ISO but parseable values were accepted.

### Fix
Added stricter ISO 8601 validation and checks for invalid calendar dates.

---

## 3. Completing a task changes its priority

### Location
src/services/taskService.js

### Problem
completeTask() contained:

priority: 'medium'

This caused a task with high or low priority to be changed to medium when it was marked complete.

### Expected
Completing a task should only update completion-related fields:

status
completedAt

### Actual

A task with:

priority: high

became:

priority: medium

after calling the complete endpoint.

### Fix
Removed the priority modification from completeTask().

---

## 4. Pagination skips the first page

### Location
src/services/taskService.js

### Problem
The pagination offset was calculated as:

const offset = page * limit;

For:

?page=1&limit=5

the offset becomes:

5

which skips the first five tasks.

### Expected
Page 1 should begin at index 0.

The correct calculation is:

const offset = (page - 1) * limit;

### Actual
Page 1 behaved like page 2.

For example, with six tasks and:

?page=1&limit=5

only the sixth task was returned.

### Fix
Changed the pagination offset to:

const offset = (page - 1) * limit;

---

## 5. Status filtering allows partial matches

### Location
src/services/taskService.js

### Problem
Status filtering originally used:

tasks.filter((t) => t.status.includes(status));

Because includes() was used, a query such as:

?status=progress

matched:

in_progress

even though progress is not a valid task status.

### Expected
Status filtering should match the exact status value.

### Actual
Partial strings could match existing statuses.

### Fix
Changed the filter from:

t.status.includes(status)

to:

t.status === status