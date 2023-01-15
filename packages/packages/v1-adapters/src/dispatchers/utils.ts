import { jQueryDeferred } from './types';

export function isJQueryDeferred<T>( value: any ): value is jQueryDeferred<T> {
	// TODO: Copied from:
	//  https://github.com/elementor/elementor/blob/6a74fc94df735dc82a7c1f790311a7548228febe/modules/web-cli/assets/js/core/commands.js#L410

	return value && 'object' === typeof value && value.promise && value.then && value.fail;
}

export function promisifyJQueryDeferred<T>( deferred: jQueryDeferred<T> ): Promise<T> {
	return new Promise( ( resolve, reject ) => {
		deferred.then( resolve, reject );
	} );
}
