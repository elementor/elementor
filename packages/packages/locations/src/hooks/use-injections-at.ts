import { useMemo } from 'react';
import { getInjectionsAt } from '../injections';
import { Injection } from '../types';

export default function useInjectionsAt( location : string ): Injection[] {
	return useMemo<Injection[]>(
		() => getInjectionsAt( location ),
		[ location ]
	);
}
