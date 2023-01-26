import { useMemo } from 'react';
import { getInjectionsAt } from '../injections';
import { Injection } from '../types';

export default function useInjectionsAt( locations: string[] ): Injection[][];
export default function useInjectionsAt( location: string ): Injection[];
export default function useInjectionsAt( location: string | string[] ): Injection[] | Injection[][] {
	return useMemo(
		() => {
			if ( Array.isArray( location ) ) {
				return location.map( ( loc ) => getInjectionsAt( loc ) );
			}

			return getInjectionsAt( location );
		},
		[ location ]
	);
}
