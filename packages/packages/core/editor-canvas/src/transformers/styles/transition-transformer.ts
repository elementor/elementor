import { createTransformer } from '../create-transformer';

type TransitionValue = {
	selection: string;
	size: string;
};

const ALL_PROPERTIES = { text: 'all properties', css: 'all' };

export const transitionTransformer = createTransformer( ( transitionValues: TransitionValue[] ) => {
	if ( transitionValues?.length < 1 ) {
		return null;
	}

	return transitionValues.filter( Boolean ).map( mapToTransitionString ).join( ', ' );
} );

const mapToTransitionString = ( value: TransitionValue ): string => {
	if ( ! value.selection || ! value.size ) {
		return '';
	}

	if ( value.selection === ALL_PROPERTIES.text ) {
		return `${ ALL_PROPERTIES.css } ${ value.size }`;
	}

	return `${ value.selection } ${ value.size }`;
};
