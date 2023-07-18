import { useMemo } from 'react';
import { getInjectionsOf } from '../injections';
import { Injection } from '../types';

export default function useInjectionsOf( locations: string[] ): Injection[][];
export default function useInjectionsOf( location: string ): Injection[];
export default function useInjectionsOf( locations: string | string[] ) {
	return useMemo(
		() => {
			if ( Array.isArray( locations ) ) {
				return locations.map( ( location ) => getInjectionsOf( location ) );
			}

			return getInjectionsOf( locations );
		},
		[ locations ]
	);
}
