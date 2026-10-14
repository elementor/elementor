import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { injectIntoSettingsTab } from '../settings-tab';
import { StateSection } from './state-section';

const DATA_FLOW_EXPERIMENT = 'e_data_flow';

export const init = () => {
	if ( ! isExperimentActive( DATA_FLOW_EXPERIMENT ) ) {
		return;
	}

	injectIntoSettingsTab( {
		id: 'data-flow-state',
		component: StateSection,
	} );
};
