import * as React from 'react';
import { Portal } from '@elementor/ui';

import { KIT_PANEL_CONTENT_ID } from '../consts';
import { useActiveKitTab } from '../hooks/use-active-kit-tab';

export function KitSettingsTab() {
	const tab = useActiveKitTab();
	const TabComponent = tab?.component;
	const container = document.getElementById( KIT_PANEL_CONTENT_ID );

	return TabComponent && container ? (
		<Portal container={ container }>
			<TabComponent />
		</Portal>
	) : null;
}
