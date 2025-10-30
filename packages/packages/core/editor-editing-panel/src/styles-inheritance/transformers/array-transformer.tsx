import * as React from 'react';
import { type ReactNode } from 'react';
import { createTransformer } from '@elementor/editor-canvas';
import { Stack } from '@elementor/ui';

type ArrayValues = ReactNode[];

export const arrayTransformer = createTransformer( ( values: ArrayValues[] ) => {
	if ( ! values || values.length === 0 ) {
		return null;
	}

	return (
		<Stack direction="column">
			{ values.map( ( item, index ) => (
				<Stack key={ index }>{ item }</Stack>
			) ) }
		</Stack>
	);
} );
