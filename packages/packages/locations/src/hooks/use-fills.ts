import { useMemo } from 'react';
import { getFills } from '../locations';
import { Fill } from '../types';

export default function useFills( location : string ): Fill[] {
	return useMemo<Fill[]>(
		() => getFills( location ),
		[ location ]
	);
}
