import { EXPERIMENTAL_FEATURES, isExperimentActive } from '@elementor/editor-v1-adapters';

export function init() {
	if ( ! isExperimentActive( EXPERIMENTAL_FEATURES.COMPONENTS ) ) {
		// TODO: Remove this ESLint disable once package implementation is added.
		// eslint-disable-next-line no-useless-return
		return;
	}
}
