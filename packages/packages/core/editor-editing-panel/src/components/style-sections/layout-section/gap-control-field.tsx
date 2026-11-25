import * as React from 'react';
import { GapControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldLabelProps } from '../../../controls-registry/styles-field';

const GAPS_LABEL = __( 'Gaps', 'elementor' );

export const GapControlField = ( { label = GAPS_LABEL }: StylesFieldLabelProps ) => {
	return (
		<StylesField bind={ 'gap' } propDisplayName={ label }>
			<GapControl label={ label } />
		</StylesField>
	);
};
