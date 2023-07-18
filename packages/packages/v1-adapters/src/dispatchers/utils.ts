import { jQueryDeferred } from './types';

export function isJQueryDeferred<T>( value: unknown ): value is jQueryDeferred<T> {
	// TODO: Copied from:
	//  https://github.com/elementor/elementor/blob/6a74fc9/modules/web-cli/assets/js/core/commands.js#L410

	return ( !! value ) &&
		'object' === typeof value &&
		Object.hasOwn( value, 'promise' ) &&
		Object.hasOwn( value, 'then' ) &&
		Object.hasOwn( value, 'fail' );
}

export function promisifyJQueryDeferred<T>( deferred: jQueryDeferred<T> ): Promise<T> {
	return new Promise( ( resolve, reject ) => {
		deferred.then( resolve, reject );
	} );
}
