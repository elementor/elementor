import { createTransformer } from '../create-transformer';

type TransitionValue = {
	selection: string;
	size: string;
};

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

	return `${ value.selection } ${ value.size }`;
};
