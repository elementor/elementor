export function runHook( HookInstance, args = {} ) {
	if ( HookInstance.getConditions && ! HookInstance.getConditions( args ) ) {
		return;
	}

	return HookInstance.apply( args );
}

/**
 * @see https://gist.github.com/the0neWhoKnocks/bdac1d09b93b8418d948558f7ab233d7
 */
export function mockLocation() {
	Object.defineProperty( window, 'location', {
		writable: true,
		value: window.location,
	} );

	jest.spyOn( window.history, 'replaceState' );

	window.history.replaceState.mockImplementation( ( state, title, url ) => {
		window.location = url;
	} );
}
