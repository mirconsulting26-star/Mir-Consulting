---
name: doc-generate
description: "Auto-generate documentation from code: API docs, type references, function signatures, and usage examples."
source: community
allowed-tools: "*"
user-invocable: true
---

# Documentation Generator

Generate documentation from source code: API references, type documentation, function signatures, and usage examples.

## STEP 1: SCOPE

Parse $ARGUMENTS for:
- Files, modules, or packages to document
- Documentation type (API reference, usage guide, type reference)
- Output format (Markdown, JSDoc, OpenAPI, etc.)
- Audience (library consumers, contributors, end users)

## STEP 2: ANALYZE CODE

Read the target source files and extract:

- **Exports**: All public functions, classes, types, and constants
- **Signatures**: Parameters, return types, generics
- **Types**: Interface definitions, type aliases, enums
- **Dependencies**: What the module imports and uses
- **Patterns**: How the code is intended to be used (from existing usage or tests)

## STEP 3: GENERATE DOCUMENTATION

For each exported item:

### Functions
```
### functionName(params): ReturnType

Description of what it does and when to use it.

**Parameters:**
- `param1` (Type) - Description
- `param2` (Type, optional) - Description. Default: value

**Returns:** Description of return value

**Throws:** Conditions that cause errors

**Example:**
```code
// Usage example
```
```

### Types/Interfaces
- All fields with types and descriptions
- Required vs. optional fields
- Default values
- Relationships to other types

### Classes
- Constructor parameters
- Public methods and properties
- Inheritance and implementation

### Constants/Enums
- Values and their meanings
- When to use each value

## STEP 4: ADD EXAMPLES

For each major function or class:
- Provide a minimal working example
- Show common use cases
- Include error handling examples
- Reference related functions

## STEP 5: OUTPUT

Write the documentation to the appropriate location:
- Inline JSDoc/TSDoc if enhancing source files
- Markdown files if generating standalone docs
- Include table of contents for multi-section docs
