import * as React from 'react';
import { GridControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { PanelDivider } from '../../panel-divider';
import { AlignContentField } from './align-content-field';
import { AlignItemsField } from './align-items-field';
import { JustifyContentField } from './justify-content-field';
import { JustifyItemsField } from './justify-items-field';

const GRID_LABEL = __( 'Grid', 'elementor' );

export const GridControlField = () => {
	const advancedAlignmentSlot = (
		<>
			<JustifyItemsField />
			<AlignItemsField />
			<PanelDivider />
			<JustifyContentField />
			<AlignContentField />
		</>
	);

	return (
		<StylesField bind="grid" propDisplayName={ GRID_LABEL }>
			<GridControl
				presentation="inlinePanel"
				advancedAlignmentSlot={ advancedAlignmentSlot }
			/>
		</StylesField>
	);
};
