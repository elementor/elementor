import { type FilterItemPropValue } from '@elementor/editor-props';

import { createTransformer } from '../create-transformer';

export const filterTransformer = createTransformer( ( filterValues: FilterItemPropValue[ 'value' ][] ) => {
	if ( filterValues?.length < 1 ) {
		return null;
	}

	return filterValues.filter( Boolean ).map( mapToFilterFunctionString ).join( ' ' );
} );

const mapToFilterFunctionString = ( value: FilterItemPropValue[ 'value' ] ): string => {
	if ( 'radius' in value ) {
		return value.radius ? `blur(${ value.radius })` : '';
	}

	if ( 'amount' in value ) {
		return value.amount ? `brightness(${ value.amount })` : '';
	}

	if ( 'xAxis' in value && 'yAxis' in value && 'blur' in value && 'color' in value ) {
		const { xAxis, yAxis, blur, color } = value;
		return `drop-shadow(${ xAxis || '0px' } ${ yAxis || '0px' } ${ blur || '10px' } ${ color || 'transparent' })`;
	}

	const keys = Object.keys( value );

	if ( ! keys[ 0 ] ) {
		return '';
	}

	return value[ keys[ 0 ] ] ? `${ keys[ 0 ] }(${ value[ keys[ 0 ] ] })` : '';
};
