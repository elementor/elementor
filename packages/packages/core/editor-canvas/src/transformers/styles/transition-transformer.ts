import { transitionProperties } from '@elementor/editor-controls';

import { createTransformer } from '../create-transformer';

export type TransitionValue = {
	selection: {
		key: string;
		value: string;
	};
	size: string;
};

const getAllowedProperties = (): Set< string > => {
	const allowedProperties = new Set< string >();

	transitionProperties.forEach( ( category ) => {
		category.properties.forEach( ( property ) => {
			allowedProperties.add( property.value );
		} );
	} );

	return allowedProperties;
};

export const transitionTransformer = createTransformer( ( transitionValues: TransitionValue[] ) => {
	if ( transitionValues?.length < 1 ) {
		return null;
	}

	const allowedProperties = getAllowedProperties();

	const validTransitions = transitionValues
		.map( ( value ) => mapToTransitionString( value, allowedProperties ) )
		.filter( Boolean );

	if ( validTransitions.length === 0 ) {
		return null;
	}

	return validTransitions.join( ', ' );
} );

const mapToTransitionString = ( value: TransitionValue, allowedProperties: Set< string > ): string => {
	if ( ! value.selection || ! value.size ) {
		return '';
	}

	const property = value.selection.value;

	if ( ! allowedProperties.has( property ) ) {
		return '';
	}

	return `${ property } ${ value.size }`;
};
