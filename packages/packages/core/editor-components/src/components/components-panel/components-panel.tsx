import * as React from 'react';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { __ } from '@wordpress/i18n';

import { Components } from '../components-tab/components';

export function ComponentsPanel() {
	return (
		<Panel>
			<PanelHeader>
				<PanelHeaderTitle>{ __( 'Components', 'elementor' ) }</PanelHeaderTitle>
			</PanelHeader>
			<PanelBody>
				<Components />
			</PanelBody>
		</Panel>
	);
}
