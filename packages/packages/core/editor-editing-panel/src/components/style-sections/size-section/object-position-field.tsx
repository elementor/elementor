import * as React from 'react';
import { PositionControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';

const OBJECT_POSITION_LABEL = __( 'Object position', 'elementor' );

export const ObjectPositionField = () => {
	return (
		<StylesField bind="object-position" propDisplayName={ OBJECT_POSITION_LABEL }>
			<PositionControl />
		</StylesField>
	);
};
