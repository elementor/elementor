# New Code Rules

**Applies to**: All new code written from this point forward  
**Existing code**: Leave unchanged - no modifications required

## Rule 1: No Comments
- **New functions/classes**: Must be self-documenting through naming
- **New code blocks**: No explanatory comments allowed
- **Exception**: Required docblocks for public APIs only
- **Test integrity**: Never simplify a test to make it pass without explicit consent

## Rule 2: Self-Documenting Functions
- **Function names**: Must clearly describe what they do
- **Examples**: 
  - ✅ `validateUserInput()`, `sendReturnEvent()`, `calculateTotalPrice()`
  - ❌ `doStuff()`, `handle()`, `process()`, `run()`

## Rule 3: Named Constants
- **No magic numbers**: Use named constants for any number except 0, 1, -1
- **Examples**:
  - ✅ `const STEP_NUMBER = 4; if (step === STEP_NUMBER)`
  - ❌ `if (step === 4)`

## Rule 4: Clean Temporary Files
- **New temp files**: Must go in `tmp/` folders only
- **Naming**: Use descriptive prefixes (`test-`, `debug-`, `validate-`)
- **Cleanup**: Remove when no longer needed

## Rule 5: Linting Compliance
- **JS/TS files**: Must pass ESLint without errors
- **Run after editing**: `npm run format` or `npx eslint --fix`
- **Zero tolerance**: Fix all linting errors before committing

## Application

### For New Files
- Follow all 5 rules completely
- No exceptions or grandfathering

### For Editing Existing Files
- **Only apply rules to new code you add**
- Don't modify existing code to comply with rules
- Don't add comments to explain existing code

### For Code Reviews
- Check new code against these 5 rules only
- Ignore rule violations in existing code
- Focus on new additions and modifications

## Examples

### ✅ Good New Code
```javascript
const MAX_RETRY_ATTEMPTS = 3;
const STEP_FOUR = 4;

function validateReturnScenario(existingChoice, newChoice) {
    return existingChoice && existingChoice.site_starter !== newChoice;
}

function sendReturnEventWithOriginalChoice(existingChoice, newChoice) {
    if (this.shouldRetryAfterFailure(attempts)) {
        return this.dispatchReturnEvent(existingChoice, newChoice);
    }
}
```

### ❌ Bad New Code
```javascript
// Check if this is a return scenario
function check(a, b) {
    return a && a.site_starter !== b; // Compare choices
}

// Send the event 3 times if needed
function send(x, y) {
    if (attempts < 3) {
        return this.dispatch(x, y);
    }
}
```

## Benefits

- **Gradual improvement**: New code gets better over time
- **No disruption**: Existing code remains stable
- **Clear standards**: New developers know what's expected
- **Maintainable**: New code is easier to understand and modify
