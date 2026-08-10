import * as React from 'react';
import { Portal } from '@elementor/ui';

import { SITE_SETTINGS_PANEL_CONTENT_ID } from '../consts';
import { useActiveSiteSettingsTab } from '../hooks/use-active-site-settings-tab';

export function SiteSettingsTab() {
  const tab = useActiveSiteSettingsTab();
  const TabComponent = tab?.component;
  const container = document.getElementById( SITE_SETTINGS_PANEL_CONTENT_ID );

  return TabComponent && container ? (
    <Portal container={ container }>
      <TabComponent />
    </Portal>
  ) : null;
}
