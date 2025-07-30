# Utils
This package contains utility functions that are being used across the Elementor packages.

## Errors 
This module contains a standard API for creating custom error classes in Elementor packages.

### `createError`
To ensure consistency across the Elementor packages, we recommend creating a new error class that extends the
`ElementorError` class using the `createError` function that does it for you.

#### Creating a new error type
For convenience, we've exposed a `createError` utility function that will create a custom error type for you.
This function will force your error code and message to be static (per our guidelines), and will shorten your code a little bit:

```ts
// errors.ts
import { createError } from '@elementor/utils';

export const CannotRender = createError<{ id: string; }>( 'cannot-render', 'Cannot render element' );
export const CannotSave = createError<{ id: number; status: string; }>( 'cannot-save', 'Cannot save document' );
export const ElementNotFound = createError<{ id: string; }>( 'element-not-found', 'Element not found' );
```

#### Creating a new error type manually
If you prefer to create a new error type manually, you can extend the `ElementorError` class.

Inside your class, you'll need to define a unique error code and message that should be passed to the parent constructor.

We recommend having static string values for both the code and the message, so it'll then be easier to filter them in the
error-tracking tools (e.g. `message = 'cannot render element';` rather than `message = 'Cannot render element' + id;`).
If you need to pass more information about the error, attach it to the context.

```ts
import { ElementorError, type ElementorErrorOptions } from '@elementor/utils';

type CannotRenderContext = {
	id: string;
};

type CannotRenderOptions = {
	context: CannotRenderContext;
	cause?: ElementorErrorOptions['cause'];
};

class CannotRender extends ElementorError {
	constructor( { context, cause }: CannotRenderOptions ) {
		const code = 'cannot-render';
		const message = 'Cannot render element';

		super( message, { cause, context, code } );
	}
}
```

#### Throwing your custom error type
After creating your custom error type (as described above), you can throw it in your code:

Basic example:
```ts
export const ElementNotFound = createError<{ id: string; }>( 'element-not-found', 'Element not found' );

function renderElement( id: string ): string {
	const element = findElementById( id );

	if ( ! element ) {
		throw new ElementNotFound({ context: { id } });
	}

	return element.render();
}
```

Example with a cause:
```ts
export const CannotSave = createError<{ id: number; status: string; }>( 'cannot-save', 'Cannot save document' );

try {
	 thirdPartyService.save( id );
} catch ( error ) {
	throw new CannotSave({ context: { id, status: error.status }, cause: error });
}
```

### `ensureError`
The  `ensureError` function is a utility function that ensures that the given value is an error.
If the value is already an error, it will be returned as is.
If the value is not an error, it will be wrapped with an `Error` that includes the thrown value.

```ts
import { ensureError } from '@elementor/utils';

const CannotUpdate = createError<{ id: number; }>( 'cannot-update', 'Cannot update document' );

try {
	thirdPartyService.update( id );
} catch ( error ) {
	const errorInstance = ensureError( error );

	throw new CannotUpdate({ context: { id }, cause: errorInstance });
}
```
