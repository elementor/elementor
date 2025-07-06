import * as React from 'react';
import { GapControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';

const GAPS_LABEL = __( 'Gaps', 'elementor' );

export const GapControlField = () => {
	return (
		<StylesField bind={ 'gap' } propDisplayName={ GAPS_LABEL }>
			<GapControl label={ GAPS_LABEL } />
		</StylesField>
	);
};
