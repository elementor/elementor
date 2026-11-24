import * as React from 'react';
import { NumberControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldLabelProps } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const COLUMN_COUNT_LABEL = __( 'Columns', 'elementor' );

export const ColumnCountField = ( { label = COLUMN_COUNT_LABEL }: StylesFieldLabelProps ) => {
	return (
		<StylesField bind="column-count" propDisplayName={ label }>
			<StylesFieldLayout label={ label }>
				<NumberControl shouldForceInt min={ 0 } step={ 1 } />
			</StylesFieldLayout>
		</StylesField>
	);
};
