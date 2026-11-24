import * as React from 'react';
import { useRef } from 'react';
import { SizeControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldLabelProps } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const LINE_HEIGHT_LABEL = __( 'Line height', 'elementor' );

export const LineHeightField = ( { label = LINE_HEIGHT_LABEL }: StylesFieldLabelProps ) => {
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<StylesField bind="line-height" propDisplayName={ label }>
			<StylesFieldLayout label={ label } ref={ rowRef }>
				<SizeControl anchorRef={ rowRef } />
			</StylesFieldLayout>
		</StylesField>
	);
};
