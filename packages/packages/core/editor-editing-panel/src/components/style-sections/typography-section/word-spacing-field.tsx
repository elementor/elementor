import * as React from 'react';
import { useRef } from 'react';
import { SizeControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const WORD_SPACING_LABEL = __( 'Word spacing', 'elementor' );

export const WordSpacingField = () => {
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<StylesField bind="word-spacing" propDisplayName={ WORD_SPACING_LABEL }>
			<StylesFieldLayout label={ WORD_SPACING_LABEL } ref={ rowRef }>
				<SizeControl anchorRef={ rowRef } />
			</StylesFieldLayout>
		</StylesField>
	);
};
