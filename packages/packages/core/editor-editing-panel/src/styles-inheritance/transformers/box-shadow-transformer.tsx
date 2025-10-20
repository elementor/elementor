import * as React from 'react';
import { createTransformer } from '@elementor/editor-canvas';
import { Stack } from '@elementor/ui';

type Shadow = {
	hOffset?: string;
	vOffset?: string;
	blur?: string;
	spread?: string;
	color?: string;
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
		<Stack direction="column" gap={ 0.5 } pb={ 1 }>
			<span>
				{ colorValue } { positionValue }, { sizes }
			</span>
		</Stack>
	);
} );
