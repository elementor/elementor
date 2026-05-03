import * as React from 'react';
import { useRef } from 'react';
import { SizeComponent } from '@elementor/editor-controls';
import { stringPropTypeUtil, type StringPropValue } from '@elementor/editor-props';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useStylesInheritanceChain } from '../../../contexts/styles-inheritance-context';
import { StylesField } from '../../../controls-registry/styles-field';
import { useStylesField } from '../../../hooks/use-styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

type GridTrackUnit = 'fr' | 'custom';
type GridTrackValue = { size: number | string; unit: GridTrackUnit };

const FR = 'fr' as const;
const CUSTOM = 'custom' as const;
const UNITS: GridTrackUnit[] = [ FR, CUSTOM ];
const EMPTY_SIZE = '' as const;

const REPEAT_FR_PATTERN = /^repeat\(\s*(\d+)\s*,\s*1fr\s*\)$/;

const cssToTrackValue = ( css: string | null ): GridTrackValue | null => {
	if ( ! css ) {
		return null;
	}
	const match = css.match( REPEAT_FR_PATTERN );
	if ( match ) {
		return { size: parseInt( match[ 1 ], 10 ), unit: FR };
	}
	return { size: css, unit: CUSTOM };
};

const isEmptySize = ( size: GridTrackValue[ 'size' ] ): boolean => {
	return size === '' || size === null || ( typeof size === 'number' && isNaN( size ) );
};

const trackValueToCss = ( trackValue: GridTrackValue | null ): string | null => {
	if ( ! trackValue || isEmptySize( trackValue.size ) ) {
		return null;
	}
	if ( trackValue.unit === FR ) {
		const numericSize = Number( trackValue.size );
		if ( ! Number.isFinite( numericSize ) || numericSize < 1 ) {
			return null;
		}
		return `repeat(${ numericSize }, 1fr)`;
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

const useInheritedTrackCss = ( cssProp: GridTrackCssProp, hasLocalValue: boolean ): string | null => {
	const chain = useStylesInheritanceChain( [ cssProp ] );
	const inheritedEntry = chain[ hasLocalValue ? 1 : 0 ];

	if ( ! inheritedEntry ) {
		return null;
	}

	const inheritedString = stringPropTypeUtil.extract( inheritedEntry.value );
	return inheritedString ?? null;
};

const GridTrackFieldContent = ( { cssProp, label }: GridTrackFieldProps ) => {
	const { value, setValue } = useStylesField< StringPropValue | null >( cssProp, {
		history: { propDisplayName: label },
	} );

	const anchorRef = useRef< HTMLDivElement >( null );
	const localTrackValue = cssToTrackValue( value?.value ?? null );

	const inheritedCss = useInheritedTrackCss( cssProp, Boolean( value ) );
	const inheritedTrackValue = cssToTrackValue( inheritedCss );

	// When no local value is set, surface the inherited value so users can see what's applied.
	const displayValue = localTrackValue ?? inheritedTrackValue ?? { size: EMPTY_SIZE, unit: FR };

	const handleChange = ( newValue: GridTrackValue ) => {
		const css = trackValueToCss( newValue );
		setValue( css ? { $$type: 'string', value: css } : null );
	};

	return (
		<StylesFieldLayout label={ label } direction="column">
			<div ref={ anchorRef }>
				<SizeComponent
					units={ UNITS as unknown as Parameters< typeof SizeComponent >[ 0 ][ 'units' ] }
					value={ displayValue as Parameters< typeof SizeComponent >[ 0 ][ 'value' ] }
					defaultUnit={ FR as Parameters< typeof SizeComponent >[ 0 ][ 'defaultUnit' ] }
					setValue={ handleChange as Parameters< typeof SizeComponent >[ 0 ][ 'setValue' ] }
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
