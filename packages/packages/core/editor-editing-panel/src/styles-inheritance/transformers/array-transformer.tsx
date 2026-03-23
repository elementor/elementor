import * as React from 'react';
import { type ReactNode } from 'react';
import { createTransformer } from '@elementor/editor-canvas';

type ArrayValues = ReactNode | ReactNode[];

export const arrayTransformer = createTransformer( ( values: ArrayValues[] ) => {
	if ( ! values || values.length === 0 ) {
		return null;
	}

	const allStrings = values.every( ( item ) => typeof item === 'string' || typeof item === 'number' );

	if ( allStrings ) {
		return ( values as ( string | number )[] ).join( ' ' );
	}

	return (
		<>
			{ values.map( ( item, index ) => (
				<React.Fragment key={ index }>
					{ index > 0 && ' ' }
					{ item }
				</React.Fragment>
			) ) }
		</>
	);
} );
