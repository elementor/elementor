import * as React from 'react';
import { useRef } from 'react';
import { type LengthUnit, SizeControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const OFFSET_LABEL = __( 'Anchor offset', 'elementor' );

const UNITS: LengthUnit[] = [ 'px', 'em', 'rem', 'vw', 'vh' ];

export const OffsetField = () => {
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<StylesField bind="scroll-margin-top" propDisplayName={ OFFSET_LABEL }>
			<StylesFieldLayout label={ OFFSET_LABEL } ref={ rowRef }>
				<SizeControl units={ UNITS } anchorRef={ rowRef } />
			</StylesFieldLayout>
		</StylesField>
	);
};
