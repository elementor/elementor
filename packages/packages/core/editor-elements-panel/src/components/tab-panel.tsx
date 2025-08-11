import * as React from 'react';
import { Portal } from '@elementor/ui';

import { useTab } from '../hooks/use-tab';

const PANEL_WRAPPER_ID = 'elementor-panel-elements-wrapper';

export function TabPanel() {
	const tab = useTab();

	const TabComponent = tab?.component;

	return TabComponent ? (
		<Portal container={ document.getElementById( PANEL_WRAPPER_ID ) }>
			<TabComponent />
		</Portal>
	) : null;
}
