import { injectKitTab } from '@elementor/editor-kit-settings';

import { AGENTS_KIT_TAB_ID, AgentsSettingsTab } from './components/agents-settings-tab';

const EXPERIMENT_NAME = 'agents_llms_txt';

function isAgentsExperimentActive(): boolean {
	const features = window.elementorCommon?.config?.experimentalFeatures ?? {};

	return Boolean( features[ EXPERIMENT_NAME ] );
}

export function init() {
	if ( ! isAgentsExperimentActive() ) {
		return;
	}

	injectKitTab( {
		id: AGENTS_KIT_TAB_ID,
		component: AgentsSettingsTab,
	} );
}
