import { isExperimentActive } from '@elementor/editor-v1-adapters';

// TODO: Replace with the final flag names.
const V4_EXPERIMENT = 'e_atomic_elements';
const SIDEBAR_EXPERIMENT = 'e_editor_sidebar';

export function isSidebarEnabled() {
	return isExperimentActive( V4_EXPERIMENT ) && isExperimentActive( SIDEBAR_EXPERIMENT );
}
