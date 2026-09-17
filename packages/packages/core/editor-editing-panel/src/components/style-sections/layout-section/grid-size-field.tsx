import * as React from 'react';
import { useRef } from 'react';
import { ControlActions, createControl, SizeComponent, useBoundProp } from '@elementor/editor-controls';
import { type PropValue } from '@elementor/editor-props';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { useStylesField } from '../../../hooks/use-styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';
import {
	EMPTY,
	FR,
	fromSizeInput,
	type GridTrackUnit,
	parseValue,
	toPlaceholder,
	toPropValue,
	toSizeInput,
	unitOf,
	UNITS,
} from './utils/grid-track-value';

type GridTrackCssProp = 'grid-template-rows' | 'grid-template-columns';

type GridTrackFieldProps = {
	cssProp: GridTrackCssProp;
	label: string;
};

type GridTrackSizeInputProps = {
	value: { size: number | string; unit: GridTrackUnit };
	placeholder?: string;
	setValue: ( value: { size: number | string; unit: GridTrackUnit } ) => void;
	anchorRef: React.RefObject< HTMLDivElement | null >;
};

type SizeComponentProps = Parameters< typeof SizeComponent >[ 0 ];

const SizeFieldWrapper = ( { children }: { children: React.ReactNode } ) => (
	<ControlActions>{ children as React.ReactElement }</ControlActions>
);

const GridTrackSizeInput = createControl( ( props: GridTrackSizeInputProps ) => (
	<SizeComponent
		units={ UNITS as unknown as SizeComponentProps[ 'units' ] }
		value={ props.value as SizeComponentProps[ 'value' ] }
		placeholder={ props.placeholder }
		defaultUnit={ FR as SizeComponentProps[ 'defaultUnit' ] }
		setValue={ props.setValue as SizeComponentProps[ 'setValue' ] }
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

const GridTrackField = ( { cssProp, label }: GridTrackFieldProps ) => (
	<UiProviders>
		<StylesField bind={ cssProp } propDisplayName={ label }>
			<GridTrackFieldContent cssProp={ cssProp } label={ label } />
		</StylesField>
	</UiProviders>
);

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
