import * as React from 'react';
import { useRef } from 'react';
import { ControlActions, createControl, SizeComponent, useBoundProp } from '@elementor/editor-controls';
import {
	gridTrackSizePropTypeUtil,
	type GridTrackSizePropValue,
	type PropValue,
	stringPropTypeUtil,
} from '@elementor/editor-props';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { useStylesField } from '../../../hooks/use-styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';

type GridTrackUnit = 'fr' | 'custom';

type GridTrackValue = { kind: 'empty' } | { kind: 'fr'; count: number } | { kind: 'custom'; raw: string };

const FR = 'fr' as const;
const CUSTOM = 'custom' as const;
const UNITS: GridTrackUnit[] = [ FR, CUSTOM ];

const EMPTY: GridTrackValue = { kind: 'empty' };

// Backward-compat: legacy values were stored as `{$$type:'string', value:'repeat(N, 1fr)'}`.
const REPEAT_FR_PATTERN = /^repeat\(\s*(\d+)\s*,\s*1fr\s*\)$/;

const parseString = ( css: string | null ): GridTrackValue => {
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

const parseGridTrackSize = ( size: GridTrackSizePropValue[ 'value' ] | null ): GridTrackValue => {
	if ( ! size ) {
		return EMPTY;
	}
	if ( size.unit === FR ) {
		const n = Number( size.size );
		return Number.isFinite( n ) && n >= 1 ? { kind: 'fr', count: Math.trunc( n ) } : EMPTY;
	}
	const raw = String( size.size ?? '' );
	return raw === '' ? EMPTY : { kind: 'custom', raw };
};

const parseValue = ( value: PropValue | undefined | null ): GridTrackValue => {
	if ( ! value ) {
		return EMPTY;
	}
	if ( gridTrackSizePropTypeUtil.isValid( value ) ) {
		return parseGridTrackSize( gridTrackSizePropTypeUtil.extract( value ) );
	}
	if ( stringPropTypeUtil.isValid( value ) ) {
		return parseString( stringPropTypeUtil.extract( value ) );
	}
	return EMPTY;
};

const fromSizeInput = ( v: { size: number | string; unit: GridTrackUnit } ): GridTrackValue => {
	if ( v.size === '' || Number.isNaN( v.size ) ) {
		return EMPTY;
	}
	if ( v.unit === FR ) {
		const n = Number( v.size );
		return Number.isFinite( n ) && n >= 1 ? { kind: 'fr', count: Math.trunc( n ) } : EMPTY;
	}
	return { kind: 'custom', raw: String( v.size ) };
};

const toPropValue = ( v: GridTrackValue ): PropValue => {
	switch ( v.kind ) {
		case 'empty':
			return null;
		case 'fr':
			return gridTrackSizePropTypeUtil.create( { size: v.count, unit: FR } );
		case 'custom':
			return gridTrackSizePropTypeUtil.create( { size: v.raw, unit: CUSTOM } );
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

type GridTrackSizeInputProps = {
	value: { size: number | string; unit: GridTrackUnit };
	placeholder?: string;
	setValue: ( value: { size: number | string; unit: GridTrackUnit } ) => void;
	anchorRef: React.RefObject< HTMLDivElement | null >;
};

const SizeFieldWrapper = ( { children }: { children: React.ReactNode } ) => (
	<ControlActions>{ children as React.ReactElement }</ControlActions>
);

const GridTrackSizeInput = createControl( ( props: GridTrackSizeInputProps ) => (
	<SizeComponent
		units={ UNITS as unknown as Parameters< typeof SizeComponent >[ 0 ][ 'units' ] }
		value={ props.value as Parameters< typeof SizeComponent >[ 0 ][ 'value' ] }
		placeholder={ props.placeholder }
		defaultUnit={ FR as Parameters< typeof SizeComponent >[ 0 ][ 'defaultUnit' ] }
		setValue={ props.setValue as Parameters< typeof SizeComponent >[ 0 ][ 'setValue' ] }
		onBlur={ () => {} }
		min={ 1 }
		anchorRef={ props.anchorRef }
		SizeFieldWrapper={ SizeFieldWrapper }
	/>
) );

const GridTrackFieldContent = ( { cssProp, label }: GridTrackFieldProps ) => {
	const { value, setValue } = useStylesField< PropValue >( cssProp, {
		history: { propDisplayName: label },
	} );

	const { placeholder: inheritedPlaceholder } = useBoundProp();
	const anchorRef = useRef< HTMLDivElement >( null );

	const local = parseValue( value );
	const inherited = parseValue( inheritedPlaceholder );

	const displayValue = local.kind !== 'empty' ? toSizeInput( local ) : toSizeInput( EMPTY, unitOf( inherited ) );
	const placeholder = toPlaceholder( inherited );

	const handleChange = ( raw: { size: number | string; unit: GridTrackUnit } ) => {
		const next = fromSizeInput( raw );

		if ( next.kind === 'empty' && local.kind !== 'empty' && raw.unit !== unitOf( local ) ) {
			return;
		}

		setValue( toPropValue( next ) );
	};

	return (
		<StylesFieldLayout label={ label } direction="column">
			<div ref={ anchorRef }>
				<GridTrackSizeInput
					value={ displayValue }
					placeholder={ placeholder }
					setValue={ handleChange }
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
