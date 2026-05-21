import * as React from 'react';
import { GridSpanControl } from '@elementor/editor-controls';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';
type GridSpanCssProp = 'grid-column' | 'grid-row';

type GridSpanFieldProps = {
	cssProp: GridSpanCssProp;
	label: string;
};

const GridSpanFieldContent = ( { label }: GridSpanFieldProps ) => {
	return (
		<StylesFieldLayout label={ label } direction="column">
			<GridSpanControl />
		</StylesFieldLayout>
	);
};

const GridSpanField = ( { cssProp, label }: GridSpanFieldProps ) => (
	<StylesField bind={ cssProp } propDisplayName={ label }>
		<UiProviders>
			<GridSpanFieldContent cssProp={ cssProp } label={ label } />
		</UiProviders>
	</StylesField>
);

export const GridSpanFields = () => (
	<Grid container gap={ 2 } flexWrap="nowrap">
		<Grid item xs={ 6 }>
			<GridSpanField cssProp="grid-column" label={ __( 'Grid column', 'elementor' ) } />
		</Grid>
		<Grid item xs={ 6 }>
			<GridSpanField cssProp="grid-row" label={ __( 'Grid row', 'elementor' ) } />
		</Grid>
	</Grid>
);
