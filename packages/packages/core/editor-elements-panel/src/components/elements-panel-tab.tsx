import * as React from 'react';
import { Portal } from '@elementor/ui';

import { useActiveTab } from '../hooks/use-active-tab';

const PANEL_WRAPPER_ID = 'elementor-panel-elements-wrapper';

export function ElementsPanelTab() {
	const tab = useActiveTab();

	const TabComponent = tab?.component;
	const container = document.getElementById( PANEL_WRAPPER_ID );

	return TabComponent && container ? (
		<Portal container={ container }>
			<TabComponent />
		</Portal>
	) : null;
}
