// Example of hook after the command runs.
class CustomHook extends $e.modules.HookBase.After {
	getCommand() {
		// Command to hook.
		return 'custom-component/example';
	}

	getId() {
		// Unique id for the hook.
		return 'custom-component-example-hook';
	}

	/*
	 * Recommended function, used for optimization, if the container type is known in advance,
	 * you can pass it here.
	 */
	// bindContainerType() {
	// If `args.container.type` is always the same for the hook return it:
	// return 'container_type';
	// }

	/* Optional function, the conditions for hook to be run. */
	getConditions( args ) {
		return 'value' === args.property;
	}

	/*
	 * The actual hook logic.
	 */
	apply( args, result ) {
		console.log( 'My hook custom logic', 'args: ', args, 'result: ', result );
	}
}

// Add new hook to `$e.hooks`;
const myHook = new CustomHook();

// Output new hook.
console.log( myHook );

// Output all hooks after.
console.log( $e.hooks.getAll().after );

// Test the hook.
result = $e.run( 'custom-component/example', {
	property: 'value', // The conditions for the hook to be run.
} );

// Output command run result.
console.log( 'e-hooks-eg-1-result:', result );
