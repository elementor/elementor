import * as React from 'react';
import { Portal } from '@elementor/ui';

import { useActiveTab } from '../hooks/use-active-tab';

const PANEL_WRAPPER_ID = 'elementor-panel-elements-wrapper';

export function TabPanel() {
	const tab = useActiveTab();

	const TabComponent = tab?.component;

	return TabComponent ? (
		<Portal container={ document.getElementById( PANEL_WRAPPER_ID ) }>
			<TabComponent />
		</Portal>
	) : null;
}
