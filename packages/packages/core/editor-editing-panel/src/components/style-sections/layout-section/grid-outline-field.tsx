import * as React from 'react';
import { SwitchControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { SettingsField } from '../../../controls-registry/settings-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const GRID_OUTLINE_LABEL = __( 'Show Grid Outline', 'elementor' );

export const GridOutlineField = () => {
	return (
		<SettingsField bind="grid_outline" propDisplayName={ GRID_OUTLINE_LABEL }>
			<StylesFieldLayout label={ GRID_OUTLINE_LABEL }>
				<SwitchControl />
			</StylesFieldLayout>
		</SettingsField>
	);
};
