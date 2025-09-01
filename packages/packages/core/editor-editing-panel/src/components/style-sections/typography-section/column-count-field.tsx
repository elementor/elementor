import * as React from 'react';
import { NumberControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const COLUMN_COUNT_LABEL = __( 'Columns', 'elementor' );

export const ColumnCountField = () => {
	return (
		<StylesField bind="column-count" propDisplayName={ COLUMN_COUNT_LABEL }>
			<StylesFieldLayout label={ COLUMN_COUNT_LABEL }>
				<NumberControl shouldForceInt min={ 0 } step={ 1 } />
			</StylesFieldLayout>
		</StylesField>
	);
};
