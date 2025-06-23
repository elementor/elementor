import * as React from 'react';
import { createTransformer } from '@elementor/editor-canvas';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type Color, StyledUnstableColorIndicator } from './background-color-overlay-transformer';

type ColorStop = Color & {
	offset: number;
};

type Gradient = {
	type: string;
	angle?: number;
	positions?: string;
	stops: ColorStop[];
};

export const backgroundGradientOverlayTransformer = createTransformer( ( value: Gradient ) => (
	<Stack direction="row" gap={ 10 }>
		<ItemIconGradient value={ value } />
		<ItemLabelGradient value={ value } />
	</Stack>
) );

const ItemIconGradient = ( { value }: { value: Gradient } ) => {
	const gradient = getGradientValue( value );

	return <StyledUnstableColorIndicator size="inherit" component="span" value={ gradient } />;
};

const ItemLabelGradient = ( { value }: { value: Gradient } ) => {
	if ( value.type === 'linear' ) {
		return <span>{ __( 'Linear Gradient', 'elementor' ) }</span>;
	}

	return <span>{ __( 'Radial Gradient', 'elementor' ) }</span>;
};

const getGradientValue = ( gradient: Gradient ) => {
	const stops = gradient.stops
		?.map( ( { color, offset }: ColorStop ) => `${ color } ${ offset ?? 0 }%` )
		?.join( ',' );

	if ( gradient.type === 'linear' ) {
		return `linear-gradient(${ gradient.angle }deg, ${ stops })`;
	}

	return `radial-gradient(circle at ${ gradient.positions }, ${ stops })`;
};
