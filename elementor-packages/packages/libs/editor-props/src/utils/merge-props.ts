import type { Props } from '../types';

export function mergeProps( current: Props, updates: Props ) {
	const props = structuredClone( current );

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
