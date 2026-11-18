import * as React from 'react';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { Divider } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { isElementsPanelSwitcherEnabled } from '../gate';
import { ElementsPanelSwitcher } from './elements-panel-switcher';

export function AtomicElementsPanel() {
	return (
		<Panel>
			<PanelHeader sx={ { justifyContent: 'space-between', px: 2 } }>
				<PanelHeaderTitle>{ __( 'Elements', 'elementor' ) }</PanelHeaderTitle>
				{ isElementsPanelSwitcherEnabled() && <ElementsPanelSwitcher value="atomic" /> }
			</PanelHeader>
			<Divider />
			<PanelBody />
		</Panel>
	);
}
