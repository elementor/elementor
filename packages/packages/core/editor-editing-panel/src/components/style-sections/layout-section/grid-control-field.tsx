import * as React from 'react';
import { useState } from 'react';
import { GridControl } from '@elementor/editor-controls';
import { Collapse, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { PanelDivider } from '../../panel-divider';
import { AlignContentField } from './align-content-field';
import { AlignItemsField } from './align-items-field';
import { JustifyContentField } from './justify-content-field';
import { JustifyItemsField } from './justify-items-field';

const GRID_LABEL = __( 'Grid', 'elementor' );

export const GridControlField = () => {
	const [ advancedOpen, setAdvancedOpen ] = useState( false );

	return (
		<Stack gap={ 1.5 }>
			<StylesField bind="grid" propDisplayName={ GRID_LABEL }>
				<GridControl advancedOpen={ advancedOpen } onAdvancedOpenChange={ setAdvancedOpen } />
			</StylesField>
			<Collapse in={ advancedOpen } timeout="auto">
				<Stack gap={ 1.5 } sx={ { pt: 0.5 } }>
					<JustifyItemsField />
					<AlignItemsField />
					<PanelDivider />
					<JustifyContentField />
					<AlignContentField />
				</Stack>
			</Collapse>
		</Stack>
	);
};
