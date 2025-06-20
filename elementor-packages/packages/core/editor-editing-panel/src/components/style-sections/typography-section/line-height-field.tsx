import * as React from 'react';
import { useRef } from 'react';
import { SizeControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const LINE_HEIGHT_LABEL = __( 'Line height', 'elementor' );

export const LineHeightField = () => {
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<StylesField bind="line-height" propDisplayName={ LINE_HEIGHT_LABEL }>
			<StylesFieldLayout label={ LINE_HEIGHT_LABEL } ref={ rowRef }>
				<SizeControl anchorRef={ rowRef } />
			</StylesFieldLayout>
		</StylesField>
	);
};
