import { isExperimentActive } from '@elementor/editor-v1-adapters';

const V4_EXPERIMENT = 'e_atomic_elements';
const ATOMIC_PANEL_EXPERIMENT = 'e_editor_atomic_panel';

export function isAtomicElementsPanelEnabled() {
	return isExperimentActive( V4_EXPERIMENT ) && isExperimentActive( ATOMIC_PANEL_EXPERIMENT );
}
