import * as React from 'react';
import { type AnyTransformer, createTransformer } from '@elementor/editor-canvas';
import { Stack } from '@elementor/ui';

export const createRepeaterToItemsTransformer = ( originalTransformer: AnyTransformer, separator: string = ' ' ) => {
	return createTransformer( ( value: string, options: { key: string; signal?: AbortSignal } ) => {
		const stringResult = originalTransformer( value, options );

		if ( ! stringResult || typeof stringResult !== 'string' ) {
			return stringResult;
		}

		const parts = stringResult.split( separator ).filter( Boolean );

		if ( parts.length <= 1 ) {
			return stringResult;
		}

		return (
			<Stack direction="column" gap={ 0.5 }>
				{ parts.map( ( part, index ) => (
					<Stack key={ index }>{ part.trim() }</Stack>
				) ) }
			</Stack>
		);
	} );
};
