import { injectSiteSettingsTab } from '@elementor/editor-site-settings';

import { AGENTS_SITE_SETTINGS_TAB_ID, AgentsSettingsTab } from './components/agents-settings-tab';

const EXPERIMENT_NAME = 'agents_llms_txt';

function isAgentsExperimentActive(): boolean {
  const features = window.elementorCommon?.config?.experimentalFeatures ?? {};

  return Boolean( features[ EXPERIMENT_NAME ] );
}

export function init() {
  if ( ! isAgentsExperimentActive() ) {
    return;
  }

  injectSiteSettingsTab( {
    id: AGENTS_SITE_SETTINGS_TAB_ID,
    component: AgentsSettingsTab,
  } );
}
