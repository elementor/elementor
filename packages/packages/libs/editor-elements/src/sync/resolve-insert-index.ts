import { type ElementPosition, type V1ElementData } from './types';

export function resolveInsertIndex( position: ElementPosition, elements: V1ElementData[] ): number {
	const lastIndex = elements.length;

	switch ( position.kind ) {
		case 'first':
			return 0;

		case 'last':
			return lastIndex;

		case 'index': {
			const index = typeof position.value === 'number' ? position.value : lastIndex;

			return Math.max( 0, Math.min( index, lastIndex ) );
		}

		case 'after_type': {
			const anchor = elements.findIndex( ( element ) => element.elType === position.value );

			return anchor >= 0 ? anchor + 1 : lastIndex;
		}

		case 'before_type': {
			const anchor = elements.findIndex( ( element ) => element.elType === position.value );

			return anchor >= 0 ? anchor : lastIndex;
		}

		default:
			return lastIndex;
	}
}
