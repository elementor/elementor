import { useMemo } from 'react';
import { getFillers } from '../locations';
import { Filler } from '../types';

export default function useFillers( location : string ): Filler[] {
	return useMemo<Filler[]>(
		() => getFillers( location ),
		[ location ]
	);
}
