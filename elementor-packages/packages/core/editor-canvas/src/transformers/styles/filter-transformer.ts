import { type FilterItemPropValue } from '@elementor/editor-props';

import { createTransformer } from '../create-transformer';

export const filterTransformer = createTransformer( ( filterValues: FilterItemPropValue[ 'value' ][] ) => {
	if ( filterValues?.length < 1 ) {
		return null;
	}

	return filterValues.map( mapToFilterFunctionString ).join( ' ' );
} );

const mapToFilterFunctionString = ( value: FilterItemPropValue[ 'value' ] ): string => {
	if ( 'radius' in value ) {
		return `blur(${ value.radius })`;
	}

	if ( 'amount' in value ) {
		return `brightness(${ value.amount })`;
	}

	return '';
};
