import * as React from 'react';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { Divider } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export function AtomicElementsPanel() {
	return (
		<Panel>
			<PanelHeader>
				<PanelHeaderTitle>{ __( 'Elements', 'elementor' ) }</PanelHeaderTitle>
			</PanelHeader>
			<Divider />
			<PanelBody />
		</Panel>
	);
}
