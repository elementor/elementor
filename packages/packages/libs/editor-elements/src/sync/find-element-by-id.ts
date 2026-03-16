import { type V1ElementData } from './types';

export function findElementById( elements: V1ElementData[], targetId: string ): V1ElementData | null {
	for ( const element of elements ) {
		if ( element.id === targetId ) {
			return element;
		}

		if ( element.elements ) {
			const found = findElementById( element.elements, targetId );

			if ( found ) {
				return found;
			}
		}
	}

	return null;
}
