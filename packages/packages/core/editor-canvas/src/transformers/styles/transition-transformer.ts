import { createTransformer } from '../create-transformer';

type TransitionValue = {
	selection: {
		key: string;
		value: string;
	};
	size: string;
};

export const transitionTransformer = createTransformer( ( transitionValues: TransitionValue[] ) => {
	if ( transitionValues?.length < 1 ) {
		return null;
	}

	const transitionString = transitionValues.filter( Boolean ).map( mapToTransitionString ).join( ', ' );

	return `${ transitionString }; @media (prefers-reduced-motion: reduce) { transition-duration: 0s !important; }`;
} );

const mapToTransitionString = ( value: TransitionValue ): string => {
	if ( ! value.selection || ! value.size ) {
		return '';
	}

	return `${ value.selection.value } ${ value.size }`;
};
