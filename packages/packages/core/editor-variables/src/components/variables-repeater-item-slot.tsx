import * as React from 'react';
import {
	type BackgroundColorOverlayPropValue,
	type BoxShadowPropValue,
	cssFilterFunctionPropUtil,
	dropShadowFilterPropTypeUtil,
	type KeyValuePropValue,
	moveTransformPropTypeUtil,
	type PropValue,
	selectionSizePropTypeUtil,
	type SelectionSizePropValue,
	shadowPropTypeUtil,
} from '@elementor/editor-props';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getVariable } from '../hooks/use-prop-variables';
import { sizeValue } from '../utils/size-value';
import { ColorIndicator } from './ui/color-indicator';

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
	const { args } = cssFilterFunctionPropUtil.extract( value ) || {};
	const { color } = dropShadowFilterPropTypeUtil.extract( args ) || {};
	const colorVariable = getVariable( color?.value || '' );

	return <ColorIndicator component="span" size="inherit" value={ colorVariable?.value } />;
};

export const FilterSingleSizeRepeaterLabel = ( { value }: Props ) => {
	const cssFilterFunction = cssFilterFunctionPropUtil.extract( value );

	if ( dropShadowFilterPropTypeUtil.isValid( cssFilterFunction?.args ) ) {
		return null;
	}

	const args = cssFilterFunction?.args as { value?: { size?: PropValue } };
	const func = cssFilterFunction?.func?.value ?? '';
	const rendered = sizeValue( args?.value?.size );

	return (
		<>
			<Box component="span" style={ { textTransform: 'capitalize' } }>
				{ `${ func }: ` }
			</Box>
			<Box component="span">{ rendered }</Box>
		</>
	);
};

export const FilterDropShadowRepeaterLabel = ( { value }: Props ) => {
	const { args } = cssFilterFunctionPropUtil.extract( value ) || {};
	const { xAxis, yAxis, blur } = dropShadowFilterPropTypeUtil.extract( args ) || {};

	const labels = [];

	for ( const val of [ xAxis, yAxis, blur ] ) {
		const rendered = sizeValue( val );
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

export const BoxShadowRepeaterLabel = ( { value }: Props ) => {
	const { position, hOffset, vOffset, blur, spread } = shadowPropTypeUtil.extract( value ) || {};

	const labels: string[] = [];

	for ( const val of [ hOffset, vOffset, blur, spread ] ) {
		const rendered = sizeValue( val );
		if ( rendered ) {
			labels.push( rendered );
		}
	}

	const positionLabel = position?.value || 'outset';

	return (
		<Box component="span" style={ { textTransform: 'capitalize' } }>
			{ positionLabel }: { labels.join( ' ' ) }
		</Box>
	);
};

export const TransformRepeaterLabel = ( { value }: Props ) => {
	const labels: string[] = [];

	if ( moveTransformPropTypeUtil.isValid( value ) ) {
		labels.push( __( 'Move:', 'elementor' ) );

		const { x, y, z } = moveTransformPropTypeUtil.extract( value ) || {};

		for ( const val of [ x, y, z ] ) {
			const rendered = sizeValue( val );
			if ( rendered ) {
				labels.push( rendered );
			}
		}
	}

	return <Box component="span">{ labels.join( ' ' ) }</Box>;
};

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
