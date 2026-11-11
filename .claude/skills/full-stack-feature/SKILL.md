---
name: full-stack-feature
description: "Build full-stack features: database to API to frontend, with types shared across the stack."
source: community
allowed-tools: "*"
user-invocable: true
---

# Full-Stack Feature Builder

Build a feature across the entire stack: database schema, backend API, frontend UI, with shared types and end-to-end type safety.

## STEP 1: DEFINE THE FEATURE

Parse $ARGUMENTS for:
- Feature description and user story
- Data requirements
- UI requirements
- API requirements
- Authentication/authorization needs

## STEP 2: DATABASE LAYER

Design and implement the data model:

- Create migration files for schema changes
- Define indexes for expected query patterns
- Add constraints for data integrity
- Create seed data for development

## STEP 3: SHARED TYPES

Define types shared across the stack:

- Database row types (from schema or ORM)
- API request/response types
- Validation schemas (Zod or equivalent)
- Use `z.infer<typeof schema>` to derive types from validation schemas
- Export from a shared location accessible to both backend and frontend

## STEP 4: BACKEND API

Implement the API:

- Route handlers with input validation
- Business logic separated from request handling
- Database queries with proper error handling
- Authorization checks
- Response formatting consistent with existing API patterns

## STEP 5: FRONTEND

Build the UI:

- API client functions with proper typing
- React components with loading, error, and empty states
- Form handling with validation matching backend
- Optimistic updates where appropriate
- State management integration

## STEP 6: INTEGRATION

Wire everything together:

- Verify end-to-end type safety (change a type, see errors everywhere it's used)
- Test the complete flow (UI -> API -> DB -> API -> UI)
- Handle error scenarios at every layer
- Verify auth/permissions work correctly

## STEP 7: VERIFY

Final checks:
- All TypeScript types align across the stack
- Error handling is consistent
- Loading and empty states are handled
- The feature works end-to-end
