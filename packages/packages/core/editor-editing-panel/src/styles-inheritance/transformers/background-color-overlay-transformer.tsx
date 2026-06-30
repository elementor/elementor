import * as React from 'react';
import { createTransformer } from '@elementor/editor-canvas';
import { Stack, styled, UnstableColorIndicator } from '@elementor/ui';

export type Color = {
	color: string;
};

export const backgroundColorOverlayTransformer = createTransformer( ( value: Color ) => (
	<Stack direction="row" gap={ 1 } alignItems="center">
		<ItemLabelColor value={ value } />
	</Stack>
) );

const ItemLabelColor = ( { value: { color } }: { value: Color } ) => {
	return <span>{ color }</span>;
};

export const StyledUnstableColorIndicator = styled( UnstableColorIndicator )( ( { theme } ) => ( {
	width: '1em',
	height: '1em',
	borderRadius: `${ theme.shape.borderRadius / 2 }px`,
	outline: `1px solid ${ theme.palette.action.disabled }`,
	flexShrink: 0,
} ) );
