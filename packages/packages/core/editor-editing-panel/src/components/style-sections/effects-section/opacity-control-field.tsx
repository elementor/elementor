import * as React from 'react';
import { useRef } from 'react';
import { SizeControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const OPACITY_LABEL = __( 'Opacity', 'elementor' );

export const OpacityControlField = () => {
	const rowRef = useRef< HTMLDivElement | null >( null );

	return (
		<StylesField bind={ 'opacity' } propDisplayName={ OPACITY_LABEL }>
			<StylesFieldLayout ref={ rowRef } label={ OPACITY_LABEL }>
				<SizeControl units={ [ '%' ] } anchorRef={ rowRef } defaultUnit="%" />
			</StylesFieldLayout>
		</StylesField>
	);
};
