import * as React from 'react';
import { useRef } from 'react';
import { SizeControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const COLUMN_GAP_LABEL = __( 'Column gap', 'elementor' );

export const ColumnGapField = () => {
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<StylesField bind="column-gap" propDisplayName={ COLUMN_GAP_LABEL }>
			<StylesFieldLayout label={ COLUMN_GAP_LABEL } ref={ rowRef }>
				<SizeControl anchorRef={ rowRef } />
			</StylesFieldLayout>
		</StylesField>
	);
};
