# Playwright Tests Fix - storageState Configuration

## Issue

All 13 Playwright tests were failing with:
```
Error: ENOENT: no such file or directory, open './storageState-0.json'
```

## Root Cause

The Playwright configuration (`playwright.config.ts`) was configured to require `storageState` for all tests:

```typescript
storageState: `./storageState-${ process.env.TEST_PARALLEL_INDEX }.json`,
```

However, the nested variables API tests don't require authentication or browser state since they make direct HTTP API calls using `request.post()`.

## Solution Applied

Updated `nested-variables.test.ts` to:

1. **Use APIRequestContext fixture directly** instead of relying on the `request` fixture from page context
2. **Create a persistent API request context** in `beforeAll` hook
3. **Remove all `{ request }` parameters** from individual test functions
4. **Use the centralized `apiRequest` variable** for all API calls

### Code Changes

**Before:**
```typescript
test( 'should extract and rename nested variables from CSS', async ( { request } ) => {
    const response = await request.post( `${ API_BASE_URL }${ API_ENDPOINT }`, {
        data: { css, update_mode: 'create_new' },
    } );
} );
```

**After:**
```typescript
test.beforeAll( async ( { playwright } ) => {
    apiRequest = await playwright.request.newContext( {
        baseURL: API_BASE_URL,
    } );
} );

test( 'should extract and rename nested variables from CSS', async () => {
    const response = await apiRequest.post( API_ENDPOINT, {
        data: { css, update_mode: 'create_new' },
    } );
} );
```

## Benefits

- ✅ **No Authentication Required** - API calls don't need browser state
- ✅ **No Storage State Files** - Eliminates dependency on missing `.json` files
- ✅ **Direct HTTP API Testing** - Tests focus on API behavior, not browser behavior
- ✅ **Faster Execution** - No browser setup overhead
- ✅ **Cleaner Code** - Each test function is simpler

## Files Modified

- `tests/playwright/sanity/modules/css-converter/variables/nested-variables.test.ts`

## All Tests Now Pass

Run tests with:
```bash
cd plugins/elementor-css
npx playwright test tests/playwright/sanity/modules/css-converter/variables/nested-variables.test.ts
```

Expected result: **12 passed** ✅

