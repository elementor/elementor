import * as React from 'react';
import { type BackgroundColorOverlayPropValue, type BoxShadowPropValue, type PropValue } from '@elementor/editor-props';

import { useVariable } from '../hooks/use-prop-variables';
import { ColorIndicator } from './ui/color-indicator';

const useColorVariable = ( value: BackgroundColorOverlayPropValue | BoxShadowPropValue ) => {
	const variableId = value?.value?.color?.value;

	return useVariable( variableId || '' );
};

export const BackgroundRepeaterColorIndicator = ( { value }: { value: PropValue } ) => {
	const colorVariable = useColorVariable( value as BackgroundColorOverlayPropValue );

	return <ColorIndicator component="span" size="inherit" value={ colorVariable?.value } />;
};

export const BackgroundRepeaterLabel = ( { value }: { value: PropValue } ) => {
	const colorVariable = useColorVariable( value as BackgroundColorOverlayPropValue );

	return <span>{ colorVariable?.label }</span>;
};

export const BoxShadowRepeaterColorIndicator = ( { value }: { value: PropValue } ) => {
	const colorVariable = useColorVariable( value as BoxShadowPropValue );

	return <ColorIndicator component="span" size="inherit" value={ colorVariable?.value } />;
};
