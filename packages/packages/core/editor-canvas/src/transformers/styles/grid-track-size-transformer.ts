import { createTransformer } from '../create-transformer';
import { formatGridTrackRepeat } from './grid-track-renderer';

type GridTrackSize = {
	size?: number | string;
	unit?: string;
};

export const gridTrackSizeTransformer = createTransformer( ( value: GridTrackSize ) => {
	if ( value.unit === 'custom' ) {
		return value.size;
	}

	if ( value.unit === 'fr' ) {
		return formatGridTrackRepeat( Math.trunc( Number( value.size ) ) );
	}

	return `${ value.size }${ value.unit }`;
} );
