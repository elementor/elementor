import * as React from 'react';
import { getTab } from '@elementor/editor-elements-panel';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { CloseButton, Divider, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { Components } from '../components-tab/components';

const COMPONENTS_TAB_ID = 'components';

type Props = {
	onRequestClose: () => void;
};

export function ComponentsPanel( { onRequestClose }: Props ) {
	const ComponentsTab = getTab( COMPONENTS_TAB_ID )?.component ?? Components;

	return (
		<Panel>
			<PanelHeader>
				<Stack width="100%" direction="row" alignItems="center" spacing={ 0.5 }>
					<PanelHeaderTitle sx={ { flex: 1, minWidth: 0 } }>
						{ __( 'Components', 'elementor' ) }
					</PanelHeaderTitle>
					<CloseButton
						aria-label={ __( 'Close', 'elementor' ) }
						sx={ { flexShrink: 0 } }
						onClick={ onRequestClose }
					/>
				</Stack>
			</PanelHeader>
			<Divider />
			<PanelBody sx={ { display: 'flex', flexDirection: 'column' } }>
				<ComponentsTab />
			</PanelBody>
		</Panel>
	);
}
