import * as React from 'react';
import { useRef } from 'react';
import { SizeControl } from '@elementor/editor-controls';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const AUTO_ROWS_LABEL = __( 'Auto rows', 'elementor' );
const AUTO_COLUMNS_LABEL = __( 'Auto columns', 'elementor' );

type GridAutoTrackFieldProps = {
	bind: 'grid-auto-rows' | 'grid-auto-columns';
	label: string;
	rowRef: React.RefObject< HTMLDivElement >;
};

const GridAutoTrackField = ( { bind, label, rowRef }: GridAutoTrackFieldProps ) => (
	<StylesField bind={ bind } propDisplayName={ label }>
		<StylesFieldLayout label={ label } ref={ rowRef }>
			<SizeControl enablePropTypeUnits anchorRef={ rowRef } />
		</StylesFieldLayout>
	</StylesField>
);

export const GridAutoTrackFields = () => {
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<Stack gap={ 2 } pt={ 2 } ref={ rowRef }>
			<GridAutoTrackField bind="grid-auto-rows" label={ AUTO_ROWS_LABEL } rowRef={ rowRef } />
			<GridAutoTrackField bind="grid-auto-columns" label={ AUTO_COLUMNS_LABEL } rowRef={ rowRef } />
		</Stack>
	);
};
