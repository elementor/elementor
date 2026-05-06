import * as React from 'react';
import { useRef } from 'react';
import { SizeComponent, useBoundProp } from '@elementor/editor-controls';
import { stringPropTypeUtil, type StringPropValue } from '@elementor/editor-props';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { useStylesField } from '../../../hooks/use-styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';

type GridTrackUnit = 'fr' | 'custom';

type GridTrackValue =
	| { kind: 'empty' }
	| { kind: 'fr'; count: number }
	| { kind: 'custom'; raw: string };

const FR = 'fr' as const;
const CUSTOM = 'custom' as const;
const UNITS: GridTrackUnit[] = [ FR, CUSTOM ];

const EMPTY: GridTrackValue = { kind: 'empty' };

const REPEAT_FR_PATTERN = /^repeat\(\s*(\d+)\s*,\s*1fr\s*\)$/;

const parseCss = ( css: string | null ): GridTrackValue => {
	if ( ! css ) {
		return EMPTY;
	}
	const match = css.match( REPEAT_FR_PATTERN );
	if ( match ) {
		const count = parseInt( match[ 1 ], 10 );
		return count >= 1 ? { kind: 'fr', count } : EMPTY;
	}
	return { kind: 'custom', raw: css };
};

const fromSizeInput = ( v: { size: number | string; unit: GridTrackUnit } ): GridTrackValue => {
	if ( v.size === '' || v.size === null || ( typeof v.size === 'number' && isNaN( v.size ) ) ) {
		return EMPTY;
	}
	if ( v.unit === FR ) {
		const n = Number( v.size );
		return Number.isFinite( n ) && n >= 1 ? { kind: 'fr', count: Math.trunc( n ) } : EMPTY;
	}
	return { kind: 'custom', raw: String( v.size ) };
};

const toCss = ( v: GridTrackValue ): string | null => {
	switch ( v.kind ) {
		case 'empty':
			return null;
		case 'fr':
			return `repeat(${ v.count }, 1fr)`;
		case 'custom':
			return v.raw;
	}
};

const toSizeInput = (
	v: GridTrackValue,
	fallbackUnit: GridTrackUnit = FR
): { size: number | string; unit: GridTrackUnit } => {
	switch ( v.kind ) {
		case 'empty':
			return { size: '', unit: fallbackUnit };
		case 'fr':
			return { size: v.count, unit: FR };
		case 'custom':
			return { size: v.raw, unit: CUSTOM };
	}
};

const toPlaceholder = ( v: GridTrackValue ): string | undefined => {
	switch ( v.kind ) {
		case 'empty':
			return undefined;
		case 'fr':
			return String( v.count );
		case 'custom':
			return v.raw;
	}
};

const unitOf = ( v: GridTrackValue, fallback: GridTrackUnit = FR ): GridTrackUnit => {
	if ( v.kind === 'fr' ) {
		return FR;
	}
	if ( v.kind === 'custom' ) {
		return CUSTOM;
	}
	return fallback;
};

type GridTrackCssProp = 'grid-template-rows' | 'grid-template-columns';

type GridTrackFieldProps = {
	cssProp: GridTrackCssProp;
	label: string;
};

const GridTrackField = ( { cssProp, label }: GridTrackFieldProps ) => (
	<UiProviders>
		<StylesField bind={ cssProp } propDisplayName={ label }>
			<GridTrackFieldContent cssProp={ cssProp } label={ label } />
		</StylesField>
	</UiProviders>
);

const GridTrackFieldContent = ( { cssProp, label }: GridTrackFieldProps ) => {
	const { value, setValue } = useStylesField< StringPropValue | null >( cssProp, {
		history: { propDisplayName: label },
	} );

	const { placeholder: inheritedPlaceholder } = useBoundProp();
	const anchorRef = useRef< HTMLDivElement >( null );

	const local = parseCss( value?.value ?? null );
	const inherited = parseCss( stringPropTypeUtil.extract( inheritedPlaceholder ?? null ) ?? null );

	const displayValue = local.kind !== 'empty' ? toSizeInput( local ) : toSizeInput( EMPTY, unitOf( inherited ) );
	const placeholder = local.kind === 'empty' ? toPlaceholder( inherited ) : undefined;

	const handleChange = ( raw: { size: number | string; unit: GridTrackUnit } ) => {
		const next = fromSizeInput( raw );

		// Don't clobber a set value when the user is only flipping the unit selector
		// on an empty input (they haven't entered a size in the new unit yet).
		if ( next.kind === 'empty' && local.kind !== 'empty' && raw.unit !== unitOf( local ) ) {
			return;
		}

		const css = toCss( next );
		setValue( css === null ? null : { $$type: 'string', value: css } );
	};

	return (
		<StylesFieldLayout label={ label } direction="column">
			<div ref={ anchorRef }>
				<SizeComponent
					units={ UNITS as unknown as Parameters< typeof SizeComponent >[ 0 ][ 'units' ] }
					value={ displayValue as Parameters< typeof SizeComponent >[ 0 ][ 'value' ] }
					placeholder={ placeholder }
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
