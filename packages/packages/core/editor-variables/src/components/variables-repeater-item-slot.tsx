import * as React from 'react';
import {
	type BackgroundColorOverlayPropValue,
	type BoxShadowPropValue,
	cssFilterFunctionPropUtil,
	dropShadowFilterPropTypeUtil,
	type KeyValuePropValue,
	type PropValue,
	selectionSizePropTypeUtil,
	type SelectionSizePropValue,
	sizePropTypeUtil,
} from '@elementor/editor-props';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getVariable } from '../hooks/use-prop-variables';
import { customSizeVariablePropTypeUtil, sizeVariablePropTypeUtil } from '../prop-types';
import { ColorIndicator } from './ui/color-indicator';

const DEFAULT_UNIT = 'px';

type Props = {
	value: PropValue;
};

const useColorVariable = ( value: BackgroundColorOverlayPropValue | BoxShadowPropValue ) => {
	const variableId = value?.value?.color?.value;

	return getVariable( variableId || '' );
};

export const BackgroundRepeaterColorIndicator = ( { value }: Props ) => {
	const colorVariable = useColorVariable( value as BackgroundColorOverlayPropValue );

	return <ColorIndicator component="span" size="inherit" value={ colorVariable?.value } />;
};

export const BackgroundRepeaterLabel = ( { value }: Props ) => {
	const colorVariable = useColorVariable( value as BackgroundColorOverlayPropValue );

	return <Box component="span">{ colorVariable?.label }</Box>;
};

export const BoxShadowRepeaterColorIndicator = ( { value }: Props ) => {
	const colorVariable = useColorVariable( value as BoxShadowPropValue );

	return <ColorIndicator component="span" size="inherit" value={ colorVariable?.value } />;
};

export const FilterDropShadowIconIndicator = ( { value }: Props ) => {
	const args = cssFilterFunctionPropUtil.extract( value )?.args;
	const color = dropShadowFilterPropTypeUtil.extract( args )?.color;
	const colorVariable = getVariable( color?.value || '' );

	return <ColorIndicator component="span" size="inherit" value={ colorVariable?.value } />;
};

export const FilterSingleSizeRepeaterLabel = ( { value }: Props ) => {
	const cssFilterFunction = cssFilterFunctionPropUtil.extract( value );

	if ( dropShadowFilterPropTypeUtil.isValid( cssFilterFunction?.args ) ) {
		return null;
	}

	const args = cssFilterFunction?.args as { size?: PropValue };
	const rendered = renderedSizeValue( args?.size );

	return (
		<>
			<Box component="span" style={ { textTransform: 'capitalize' } }>
				{ cssFilterFunction?.func?.value ?? '' }:
			</Box>
			<Box component="span">{ rendered }</Box>
		</>
	);
};

export const FilterDropShadowRepeaterLabel = ( { value }: Props ) => {
	const args = cssFilterFunctionPropUtil.extract( value )?.args;

	const { xAxis, yAxis, blur } = dropShadowFilterPropTypeUtil.extract( args ) || {};

	const labels = [];
	for ( const val of [ xAxis, yAxis, blur ] ) {
		const rendered = renderedSizeValue( val );
		if ( rendered ) {
			labels.push( rendered );
		}
	}

	return (
		<Box component="span">
			{ __( 'Drop shadow:', 'elementor' ) } { labels.join( ' ' ) }
		</Box>
	);
};

function renderedSizeValue( value: PropValue ) {
	if ( sizeVariablePropTypeUtil.isValid( value ) || customSizeVariablePropTypeUtil.isValid( value ) ) {
		const variable = getVariable( value?.value );
		return variable?.value;
	}

	if ( sizePropTypeUtil.isValid( value ) ) {
		const { size, unit } = value.value;

		if ( 'custom' !== unit ) {
			return `${ size ?? 0 }${ unit ?? DEFAULT_UNIT }`;
		}

		if ( ! size ) {
			return __( 'fx', 'elementor' );
		}

		return size;
	}

	return '';
}

export const TransitionsSizeVariableLabel = ( { value: prop }: Props ) => {
	let label = '';

	const variableId = ( prop as SelectionSizePropValue )?.value?.size?.value || '';
	const variable = getVariable( variableId );

	if ( variable && selectionSizePropTypeUtil.isValid( prop ) ) {
		const selection = ( prop.value?.selection as KeyValuePropValue )?.value?.key?.value;
		if ( selection ) {
			label += `${ selection }: `;
		}
		label += variable?.value;
	}

	return <Box component="span">{ label }</Box>;
};
