import { BUILT_IN_ACTIONS } from './built-in-actions';

const ACTION_NAME = /^[a-z0-9-]+\/[a-z0-9-]+$/;

/**
 * Custom actions are static script files that call `elementorActions.register( name, run )`. They never reach
 * element data; elements only reference them by name.
 */
export function createActionRegistry() {
	const actions = new Map( Object.entries( BUILT_IN_ACTIONS ) );

	return {
		get: ( name ) => actions.get( name ),
		register( name, run ) {
			if ( ! ACTION_NAME.test( name ) || 'function' !== typeof run || BUILT_IN_ACTIONS[ name ] ) {
				// eslint-disable-next-line no-console
				console.error( `[data-flow] Can't register action "${ name }"` );
				return;
			}

			actions.set( name, run );
		},
	};
}
