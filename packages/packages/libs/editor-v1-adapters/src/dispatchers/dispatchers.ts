import { type ExtendedWindow } from './types';
import { isJQueryDeferred, promisifyJQueryDeferred } from './utils';

type RunCommandOptions = {
	internal?: boolean;
};

export async function runCommand( command: string, args?: object, { internal = false }: RunCommandOptions = {} ) {
	const result = runCommandSync( command, args, { internal } );

	if ( result instanceof Promise ) {
		return result;
	}

	if ( isJQueryDeferred( result ) ) {
		return promisifyJQueryDeferred( result );
	}

	return Promise.resolve( result );
}

export function runCommandSync( command: string, args?: object, { internal = false }: RunCommandOptions = {} ) {
	const extendedWindow = window as unknown as ExtendedWindow;

	const run = internal ? extendedWindow.$e?.internal : extendedWindow.$e?.run;

	if ( ! run ) {
		const runnerName = internal ? '$e.internal' : '$e.run';

		throw new Error( `\`${ runnerName }()\` is not available` );
	}

	return run( command, args );
}

export function openRoute( route: string ) {
	const extendedWindow = window as unknown as ExtendedWindow;

	if ( ! extendedWindow.$e?.route ) {
		return Promise.reject( '`$e.route()` is not available' );
	}

	try {
		return Promise.resolve( extendedWindow.$e.route( route ) );
	} catch ( e ) {
		return Promise.reject( e );
	}
}

export function registerRoute( route: string ) {
	const extendedWindow = window as unknown as ExtendedWindow;

	if ( ! extendedWindow.$e?.routes?.register ) {
		return Promise.reject( '`$e.routes.register()` is not available' );
	}

	const routeParts = route.split( '/' );

	if ( routeParts.length < 2 ) {
		return Promise.reject( `\`${ route }\` is an invalid route` );
	}

	const componentRoute = routeParts.pop() as string; // routeParts.length must be >= 2
	const component = routeParts.join( '/' );

	try {
		return Promise.resolve( extendedWindow.$e.routes.register( component, componentRoute, () => null ) );
	} catch ( e ) {
		return Promise.reject( e );
	}
}
