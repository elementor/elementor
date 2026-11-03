import { type V1Element } from './types';

export function findClosestContainer(
	start: V1Element | null | undefined,
	predicate: ( container: V1Element ) => boolean
): V1Element | null {
	let current = start ?? null;

	while ( current ) {
		if ( predicate( current ) ) {
			return current;
		}

		current = current.parent ?? null;
	}

	return null;
}
