import { Route } from './types/routes';
import { Commands } from './types/commands';
import { ExtendedWindow, Promisify } from './types/util-types';
import { isJQueryDeferred, promisifyJQueryDeferred } from './utils';

export function runCommand<T extends keyof Commands>(
	command: T,
	args?: Commands[T]['args']
) : Promisify<Commands[T]['returnValue']> {
	const extendedWindow = window as unknown as ExtendedWindow;

	if ( ! extendedWindow.$e?.run ) {
		return Promise.reject( '`$e.run()` is not available' );
	}

	const result = extendedWindow.$e.run( command, args );

	if ( result instanceof Promise ) {
		return result as Promisify<Commands[T]['returnValue']>;
	}

	if ( isJQueryDeferred( result ) ) {
		return promisifyJQueryDeferred( result ) as Promisify<Commands[T]['returnValue']>;
	}

	return Promise.resolve( result );
}

export function goToRoute( route: Route ) {
	const extendedWindow = window as unknown as ExtendedWindow;

	if ( ! extendedWindow.$e?.route ) {
		return Promise.reject( '`$e.route()` is not available' );
	}

	// TODO: Do we want a Promise?
	try {
		return Promise.resolve(
			extendedWindow.$e.route( route )
		);
	} catch ( e ) {
		return Promise.reject( e );
	}
}
