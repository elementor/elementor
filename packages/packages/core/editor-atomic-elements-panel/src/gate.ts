import { isExperimentActive } from '@elementor/editor-v1-adapters';

const ATOMIC_PANEL_EXPERIMENT = 'e_editor_atomic_panel';

export function isAtomicElementsPanelEnabled() {
	return isExperimentActive( ATOMIC_PANEL_EXPERIMENT );
}
