import * as React from 'react';
import { useRef } from 'react';
import { SizeComponent } from '@elementor/editor-controls';
import { type SizePropValue, type StringPropValue } from '@elementor/editor-props';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { useStylesField } from '../../../hooks/use-styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

type TrackValue = SizePropValue[ 'value' ];
type TrackUnit = TrackValue[ 'unit' ];

const FR: TrackUnit = 'fr';
const CUSTOM: TrackUnit = 'custom';
const UNITS: TrackUnit[] = [ FR, CUSTOM ];

const REPEAT_FR_PATTERN = /^repeat\(\s*(\d+)\s*,\s*1fr\s*\)$/;

const cssToTrackValue = ( css: string | null ): TrackValue | null => {
	if ( ! css ) {
		return null;
	}
	const match = css.match( REPEAT_FR_PATTERN );
	if ( match ) {
		return { size: parseInt( match[ 1 ], 10 ), unit: FR };
	}
	return { size: css, unit: CUSTOM };
};

const trackValueToCss = ( trackValue: TrackValue | null ): string | null => {
	if ( ! trackValue || trackValue.size === '' || trackValue.size === null ) {
		return null;
	}
	if ( trackValue.unit === FR ) {
		return `repeat(${ trackValue.size }, 1fr)`;
	}
	return String( trackValue.size );
};

type GridTrackCssProp = 'grid-template-rows' | 'grid-template-columns';

type GridTrackFieldProps = {
	cssProp: GridTrackCssProp;
	label: string;
};

const GridTrackField = ( { cssProp, label }: GridTrackFieldProps ) => (
	<StylesField bind={ cssProp } propDisplayName={ label }>
		<GridTrackFieldContent cssProp={ cssProp } label={ label } />
	</StylesField>
);

const GridTrackFieldContent = ( { cssProp, label }: GridTrackFieldProps ) => {
	const { value, setValue } = useStylesField< StringPropValue | null >( cssProp, {
		history: { propDisplayName: label },
	} );

	const anchorRef = useRef< HTMLDivElement >( null );
	const trackValue = cssToTrackValue( value?.value ?? null );

	const handleChange = ( newValue: TrackValue ) => {
		const css = trackValueToCss( newValue );
		setValue( css ? { $$type: 'string', value: css } : null );
	};

	return (
		<StylesFieldLayout label={ label } direction="column">
			<div ref={ anchorRef }>
				<SizeComponent
					units={ UNITS }
					value={ trackValue ?? { size: NaN, unit: FR } }
					defaultUnit={ FR }
					setValue={ handleChange }
					onBlur={ () => {} }
					min={ 1 }
					anchorRef={ anchorRef }
				/>
			</div>
		</StylesFieldLayout>
	);
};

export const GridSizeFields = () => (
	<Grid container gap={ 2 } flexWrap="nowrap">
		<Grid item xs={ 6 }>
			<GridTrackField cssProp="grid-template-columns" label={ __( 'Columns', 'elementor' ) } />
		</Grid>
		<Grid item xs={ 6 }>
			<GridTrackField cssProp="grid-template-rows" label={ __( 'Rows', 'elementor' ) } />
		</Grid>
	</Grid>
);
