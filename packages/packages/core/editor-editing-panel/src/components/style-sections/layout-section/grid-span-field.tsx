import * as React from 'react';
import { NumberInput } from '@elementor/editor-controls';
import { type StringPropValue } from '@elementor/editor-props';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { useStylesField } from '../../../hooks/use-styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';

type GridSpanCssProp = 'grid-column' | 'grid-row';

const SPAN_PATTERN = /^span\s+(\d+)$/;
const MIN_SPAN = 1;

const cssToSpanValue = ( css: string | null ): number | null => {
	if ( ! css ) {
		return null;
	}

	const match = css.match( SPAN_PATTERN );

	return match ? parseInt( match[ 1 ], 10 ) : null;
};

const spanValueToCss = ( span: number | null ): string | null => {
	if ( span === null || span < MIN_SPAN ) {
		return null;
	}

	return `span ${ span }`;
};

type GridSpanFieldProps = {
	cssProp: GridSpanCssProp;
	label: string;
};

const GridSpanFieldContent = ( { cssProp, label }: GridSpanFieldProps ) => {
	const { value, setValue, canEdit } = useStylesField< StringPropValue | null >( cssProp, {
		history: { propDisplayName: label },
	} );

	const spanValue = cssToSpanValue( value?.value ?? null );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const raw = event.target.value;

		if ( raw === '' ) {
			setValue( null );

			return;
		}

		const num = parseInt( raw, 10 );

		if ( Number.isNaN( num ) ) {
			return;
		}

		const clamped = Math.max( num, MIN_SPAN );
		const css = spanValueToCss( clamped );

		setValue( css ? { $$type: 'string', value: css } : null );
	};

	return (
		<StylesFieldLayout label={ label } direction="column">
			<NumberInput
				size="tiny"
				type="number"
				fullWidth
				disabled={ ! canEdit }
				value={ spanValue ?? '' }
				onInput={ handleChange }
				inputProps={ { min: MIN_SPAN } }
			/>
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
			<GridSpanField cssProp="grid-column" label={ __( 'Column Span', 'elementor' ) } />
		</Grid>
		<Grid item xs={ 6 }>
			<GridSpanField cssProp="grid-row" label={ __( 'Row Span', 'elementor' ) } />
		</Grid>
	</Grid>
);
