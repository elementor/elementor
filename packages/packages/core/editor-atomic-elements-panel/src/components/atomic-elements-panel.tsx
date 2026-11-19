import * as React from 'react';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { Divider } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ElementsPanelSwitcher, type ElementsPanelSwitcherProps } from './elements-panel-switcher';

export function AtomicElementsPanel( props: Omit< ElementsPanelSwitcherProps, 'value' > ) {
	return (
		<Panel>
			<PanelHeader sx={ { justifyContent: 'space-between', px: 2 } }>
				<PanelHeaderTitle>{ __( 'Add', 'elementor' ) }</PanelHeaderTitle>
				<ElementsPanelSwitcher value="atomic" { ...props } />
			</PanelHeader>
			<Divider />
			<PanelBody />
		</Panel>
	);
}
