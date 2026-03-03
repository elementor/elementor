import * as React from 'react';
import { createTransformer } from '@elementor/editor-canvas';
import { Stack, styled, UnstableColorIndicator } from '@elementor/ui';

function isValidCSSColor( value: string ): boolean {
	if ( ! value.trim() ) {
		return false;
	}

	return CSS.supports( 'color', value.trim() );
}

const StyledColorIndicator = styled( UnstableColorIndicator )( ( { theme } ) => ( {
	width: '1em',
	height: '1em',
	borderRadius: `${ theme.shape.borderRadius / 2 }px`,
	outline: `1px solid ${ theme.palette.action.disabled }`,
	flexShrink: 0,
} ) );

export const colorTransformer = createTransformer( ( value: string ) => {
	if ( ! isValidCSSColor( value ) ) {
		return value;
	}

	return (
		<Stack direction="row" gap={ 1 } alignItems="center">
			<StyledColorIndicator size="inherit" component="span" value={ value } />
			<span>{ value }</span>
		</Stack>
	);
} );
