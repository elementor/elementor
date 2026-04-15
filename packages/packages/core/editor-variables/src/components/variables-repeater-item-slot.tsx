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
} from '@elementor/editor-props';

import { useVariable } from '../hooks/use-prop-variables';
import { ColorIndicator } from './ui/color-indicator';

type Props = {
	value: PropValue;
};

const useColorVariable = ( value: BackgroundColorOverlayPropValue | BoxShadowPropValue ) => {
	const variableId = value?.value?.color?.value;

	return useVariable( variableId || '' );
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

export const DropShadowFilterIconIndicator = ( { value }: Props ) => {
	const args = cssFilterFunctionPropUtil.extract( value )?.args;
	const color = dropShadowFilterPropTypeUtil.extract( args )?.color;
	const colorVariable = useVariable( color?.value || '' );

	return <ColorIndicator component="span" size="inherit" value={ colorVariable?.value } />;
};

export const TransitionsSizeVariableLabel = ( { value: prop }: Props ) => {
	let label = '';

	const variableId = ( prop as SelectionSizePropValue )?.value?.size?.value || '';
	const variable = useVariable( variableId );

	if ( variable && selectionSizePropTypeUtil.isValid( prop ) ) {
		const selection = ( prop.value?.selection as KeyValuePropValue )?.value?.key?.value;
		if ( selection ) {
			label += `${ selection }: `;
		}
		label += variable?.value;
	}

	return <span>{ label }</span>;
};
