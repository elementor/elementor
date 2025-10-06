import * as React from 'react';
import { useRef } from 'react';
import { SizeControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const FONT_SIZE_LABEL = __( 'Font size', 'elementor' );

export const FontSizeField = () => {
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<StylesField bind="font-size" propDisplayName={ FONT_SIZE_LABEL }>
			<StylesFieldLayout label={ FONT_SIZE_LABEL } ref={ rowRef }>
				<SizeControl anchorRef={ rowRef } />
			</StylesFieldLayout>
		</StylesField>
	);
};
