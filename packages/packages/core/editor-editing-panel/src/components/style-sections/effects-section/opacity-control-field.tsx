import * as React from 'react';
import { useRef } from 'react';
import { SizeControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldLabelProps } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const OPACITY_LABEL = __( 'Opacity', 'elementor' );

export const OpacityControlField = ( { label = OPACITY_LABEL }: StylesFieldLabelProps ) => {
	const rowRef = useRef< HTMLDivElement | null >( null );

	return (
		<StylesField bind={ 'opacity' } propDisplayName={ label }>
			<StylesFieldLayout ref={ rowRef } label={ label }>
				<SizeControl units={ [ '%' ] } anchorRef={ rowRef } defaultUnit="%" />
			</StylesFieldLayout>
		</StylesField>
	);
};
