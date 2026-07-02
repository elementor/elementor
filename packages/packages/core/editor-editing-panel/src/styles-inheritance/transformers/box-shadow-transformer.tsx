import * as React from 'react';
import { type ReactNode } from 'react';
import { createTransformer } from '@elementor/editor-canvas';

type Shadow = {
	hOffset?: string;
	vOffset?: string;
	blur?: string;
	spread?: string;
	color?: ReactNode;
	position?: string | null;
};

export const boxShadowTransformer = createTransformer( ( value: Shadow ) => {
	if ( ! value ) {
		return null;
	}

	const { color, hOffset, vOffset, blur, spread, position } = value;

	const colorValue = color || '#000000';
	const sizes = [ hOffset || '0px', vOffset || '0px', blur || '10px', spread || '0px' ].join( ' ' );
	const positionValue = position || 'outset';

	return (
		<>
			{ colorValue } { positionValue }, { sizes }
		</>
	);
} );
