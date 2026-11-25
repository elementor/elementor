import * as React from 'react';
import { useRef } from 'react';
import { SizeControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldLabelProps } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const FONT_SIZE_LABEL = __( 'Font size', 'elementor' );

export const FontSizeField = ( { label = FONT_SIZE_LABEL }: StylesFieldLabelProps ) => {
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<StylesField bind="font-size" propDisplayName={ label }>
			<StylesFieldLayout label={ label } ref={ rowRef }>
				<SizeControl anchorRef={ rowRef } ariaLabel={ label } />
			</StylesFieldLayout>
		</StylesField>
	);
};
