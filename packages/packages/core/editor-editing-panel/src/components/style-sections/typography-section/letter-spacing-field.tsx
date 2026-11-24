import * as React from 'react';
import { useRef } from 'react';
import { SizeControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldLabelProps } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const LETTER_SPACING_LABEL = __( 'Letter spacing', 'elementor' );

export const LetterSpacingField = ( { label = LETTER_SPACING_LABEL }: StylesFieldLabelProps ) => {
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<StylesField bind="letter-spacing" propDisplayName={ label }>
			<StylesFieldLayout label={ label } ref={ rowRef }>
				<SizeControl anchorRef={ rowRef } min={ -Number.MAX_SAFE_INTEGER } />
			</StylesFieldLayout>
		</StylesField>
	);
};
