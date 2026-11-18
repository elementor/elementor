import { isExperimentActive } from '@elementor/editor-v1-adapters';

const V4_EXPERIMENT = 'e_atomic_elements';
const SIDEBAR_EXPERIMENT = 'e_editor_sidebar';

export function isSidebarPanelChromeEnabled() {
	return isExperimentActive( V4_EXPERIMENT ) && isExperimentActive( SIDEBAR_EXPERIMENT );
}