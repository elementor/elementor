import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { initDesignSystemExperiment } from './experiment/init-design-system-experiment';

export function init() {
	if ( ! isExperimentActive( 'e_editor_design_system_panel' ) ) {
		return;
	}

	initDesignSystemExperiment();
}
