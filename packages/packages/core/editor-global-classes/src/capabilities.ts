import { type UserCapabilities } from '@elementor/editor-styles-repository';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

const EXPERIMENT_KEY = 'global_classes_should_enforce_capabilities';
const UPDATE_CLASS_CAPABILITY_KEY = 'elementor_global_classes_update_class';

export const getCapabilities = (): UserCapabilities | undefined => {
	const shouldEnforceCapabilities = isExperimentActive( EXPERIMENT_KEY );

	if ( shouldEnforceCapabilities ) {
		return {
			update: UPDATE_CLASS_CAPABILITY_KEY,
			create: UPDATE_CLASS_CAPABILITY_KEY,
			delete: UPDATE_CLASS_CAPABILITY_KEY,
			updateProps: UPDATE_CLASS_CAPABILITY_KEY,
		};
	}
};
