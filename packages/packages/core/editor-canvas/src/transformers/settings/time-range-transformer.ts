import { createTransformer } from '../create-transformer';

export const timeRangeTransformer = createTransformer< { min?: string | null; max?: string | null } >( ( value ) => {
	if ( ! value || Object.keys( value ).length === 0 ) {
		return null;
	}

	return {
		min: value.min || null,
		max: value.max || null,
	};
} );
