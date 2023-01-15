import { Commands } from './commands';
import { ExtendedWindow, jQueryDeferred, Promisify } from './types';
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
