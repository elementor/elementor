import * as React from 'react';
import { PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { AtomIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { useElement } from '../contexts/element-context';
import { PromotionEditingPanelTabs } from './promotion-editing-panel-tabs';

export const PromotionEditingPanel = () => {
	const { elementType } = useElement();

	/* translators: %s: Element type title. */
	const panelTitle = __( 'Edit %s', 'elementor' ).replace( '%s', elementType.title );

	return (
		<>
			<PanelHeader>
				<PanelHeaderTitle>{ panelTitle }</PanelHeaderTitle>
				<AtomIcon fontSize="small" sx={ { color: 'text.tertiary' } } />
			</PanelHeader>
			<PanelBody>
				<PromotionEditingPanelTabs />
			</PanelBody>
		</>
	);
};
