import * as React from 'react';
import {
	type BackgroundColorOverlayPropValue,
	type BoxShadowPropValue,
	type KeyValuePropValue,
	type PropValue,
	selectionSizePropTypeUtil,
	type SelectionSizePropValue,
	shadowPropTypeUtil,
} from '@elementor/editor-props';

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

	return <span>{ colorVariable?.label }</span>;
};

export const BoxShadowRepeaterColorIndicator = ( { value }: Props ) => {
	const colorVariable = useColorVariable( value as BoxShadowPropValue );

	return <ColorIndicator component="span" size="inherit" value={ colorVariable?.value } />;
};

export const BoxShadowRepeaterLabel = ( { value }: Props ) => {
	const shadowPropValue = shadowPropTypeUtil.extract( value ) || {};

	const labels: string[] = [];

	for ( const key of [ 'hOffset', 'vOffset', 'blur', 'spread' ] ) {
		const rendered = sizeValue( shadowPropValue[ key as keyof typeof shadowPropValue ] );
		if ( rendered ) {
			labels.push( rendered );
		}
	}

	const positionLabel = shadowPropValue.position?.value || 'outset';

	return (
		<span style={ { textTransform: 'capitalize' } }>
			{ positionLabel }: { labels.join( ' ' ) }
		</span>
	);
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

	return <span>{ label }</span>;
};
