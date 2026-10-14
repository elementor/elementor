import { VARIABLE_LABEL_MAX_LENGTH } from './validations';

export const COPY_SUFFIX = '-Copy';

const trimToFit = ( base: string, suffix: string ): string => {
	const combined = base + suffix;
	if ( combined.length <= VARIABLE_LABEL_MAX_LENGTH ) {
		return combined;
	}
	return base.slice( 0, VARIABLE_LABEL_MAX_LENGTH - suffix.length ) + suffix;
};

export const generateDuplicateLabel = ( originalLabel: string, existingLabels: string[] ): string => {
	const labelsSet = new Set( existingLabels );

	const firstCandidate = trimToFit( originalLabel, COPY_SUFFIX );
	if ( ! labelsSet.has( firstCandidate ) ) {
		return firstCandidate;
	}

	for ( let i = 2; i <= labelsSet.size + 1; i++ ) {
		const candidate = trimToFit( originalLabel, `${ COPY_SUFFIX }-${ i }` );
		if ( ! labelsSet.has( candidate ) ) {
			return candidate;
		}
	}

	return firstCandidate;
};
