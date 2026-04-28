import { createTransformer } from '../create-transformer';

const INVALID_DATE = 'Invalid Date';
export const minMaxDateTimeTransformer = createTransformer< { min?: string; max?: string } >( ( value ) => {
	if ( ! value || Object.keys( value ).length === 0 ) {
		return null;
	}

	return {
		min: value.min && value.min !== INVALID_DATE ? value.min : '',
		max: value.max && value.max !== INVALID_DATE ? value.max : '',
	};
} );
