import * as React from 'react';
import { useRef } from 'react';
import { SizeControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const LETTER_SPACING_LABEL = __( 'Letter spacing', 'elementor' );

export const LetterSpacingField = () => {
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<StylesField bind="letter-spacing" propDisplayName={ LETTER_SPACING_LABEL }>
			<StylesFieldLayout label={ LETTER_SPACING_LABEL } ref={ rowRef }>
				<SizeControl anchorRef={ rowRef } />
			</StylesFieldLayout>
		</StylesField>
	);
};
