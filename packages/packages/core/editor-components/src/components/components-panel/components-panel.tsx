import * as React from 'react';
import { getTab } from '@elementor/editor-elements-panel';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { Divider } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { Components } from '../components-tab/components';

const COMPONENTS_TAB_ID = 'components';

export function ComponentsPanel() {
	const ComponentsTab = getTab( COMPONENTS_TAB_ID )?.component ?? Components;

	return (
		<Panel>
			<PanelHeader>
				<PanelHeaderTitle>{ __( 'Components', 'elementor' ) }</PanelHeaderTitle>
			</PanelHeader>
			<Divider />
			<PanelBody sx={ { display: 'flex', flexDirection: 'column' } }>
				<ComponentsTab />
			</PanelBody>
		</Panel>
	);
}
