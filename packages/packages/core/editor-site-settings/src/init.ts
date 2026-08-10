import { injectIntoTop } from '@elementor/editor';

import { SiteSettingsTab } from './components/site-settings-tab';

export function init() {
  injectIntoTop( {
    id: 'editor-site-settings-tab',
    component: SiteSettingsTab,
  } );
}
