import { ExtendedWindow } from './types';
import { isJQueryDeferred, promisifyJQueryDeferred } from './utils';

export function runCommand( command: string, args?: object ) {
	const extendedWindow = window as unknown as ExtendedWindow;

	if ( ! extendedWindow.$e?.run ) {
		return Promise.reject( '`$e.run()` is not available' );
	}

	const result = extendedWindow.$e.run( command, args );

	if ( result instanceof Promise ) {
		return result;
	}

	if ( isJQueryDeferred( result ) ) {
		return promisifyJQueryDeferred( result );
	}

	return Promise.resolve( result );
}

export function openRoute( route: string ) {
	const extendedWindow = window as unknown as ExtendedWindow;

	if ( ! extendedWindow.$e?.route ) {
		return Promise.reject( '`$e.route()` is not available' );
	}

	try {
		return Promise.resolve(
			extendedWindow.$e.route( route )
		);
	} catch ( e ) {
		return Promise.reject( e );
	}
}
