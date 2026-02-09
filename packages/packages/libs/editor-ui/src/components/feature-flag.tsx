import { type PropsWithChildren } from 'react';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

export const FeatureFlag = ( { experiment, children }: PropsWithChildren & { experiment: string } ) => {
	if ( ! isExperimentActive( experiment ) ) {
		return null;
	}

	return children;
};
