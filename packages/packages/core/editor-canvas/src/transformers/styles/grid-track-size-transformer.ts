import { createTransformer } from '../create-transformer';

type GridTrackSize = {
	size?: number | string;
	unit?: string;
};

export const gridTrackSizeTransformer = createTransformer( ( value: GridTrackSize ) => {
	if ( value.unit === 'custom' ) {
		return value.size;
	}

	if ( value.unit === 'fr' ) {
		const count = Math.trunc( Number( value.size ) );

		return count >= 1 ? `repeat(${ count }, 1fr)` : null;
	}

	return `${ value.size }${ value.unit }`;
} );
