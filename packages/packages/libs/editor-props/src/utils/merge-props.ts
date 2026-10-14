import type { Props } from '../types';

export function mergeProps( current: Props, updates: Props ) {
	// edge case, the server returns an array instead of an object when empty props because of PHP array / object conversion
	let props: Props = {};

	if ( ! Array.isArray( current ) ) {
		props = structuredClone( current );
	}

	Object.entries( updates ).forEach( ( [ key, value ] ) => {
		if ( value === null || value === undefined ) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete props[ key ];
		} else {
			props[ key ] = value;
		}
	} );

	return props;
}
