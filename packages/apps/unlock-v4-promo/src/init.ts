import { register } from '@elementor/editor-elements-panel-notice';

import { AtomicElementsPromo } from './components/atomic-elements-promo';

export function init() {
	const { experimentalFeatures = {} } = window.elementorCommon?.config || {};
	const currentAtomicElementsExperimentState = experimentalFeatures?.e_atomic_elements;
	const currentContainerExperimentState = experimentalFeatures?.container;

	// The logic is if the atomic elements experiment is not active and the container experiment is active, then show the promo.
	// Container experiment must be on as part of the container feature can break site (ask about moving sections to containers breaking changes)
	if ( ! currentAtomicElementsExperimentState && currentContainerExperimentState ) {
		register( AtomicElementsPromo );
	}
}
