import * as React from 'react';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { Divider, ErrorBoundary } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { AtomicPanelFallback } from './atomic-panel-fallback';
import { ElementsPanelSwitcher, type ElementsPanelSwitcherProps } from './elements-panel-switcher';

export function AtomicElementsPanel( props: Omit< ElementsPanelSwitcherProps, 'value' > ) {
	return (
		<ErrorBoundary fallback={ <AtomicPanelFallback close={ props.close } /> }>
			<Panel>
				<PanelHeader sx={ { justifyContent: 'space-between', px: 2 } }>
					<PanelHeaderTitle>{ __( 'Elements', 'elementor' ) }</PanelHeaderTitle>
					<ElementsPanelSwitcher value="atomic" { ...props } />
				</PanelHeader>
				<Divider />
				<PanelBody />
			</Panel>
		</ErrorBoundary>
	);
}
