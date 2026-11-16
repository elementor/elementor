import { forwardRef, type PropsWithChildren } from 'react';
import * as React from 'react';
import { Grid } from '@elementor/ui';

type PopoverGridContainerProps = PropsWithChildren< {
	gap?: number;
	alignItems?: React.ComponentProps< typeof Grid >[ 'alignItems' ];
	flexWrap?: React.ComponentProps< typeof Grid >[ 'flexWrap' ];
} >;

export const PopoverGridContainer = forwardRef< HTMLDivElement, PopoverGridContainerProps >(
	( { gap = 1.5, alignItems = 'center', flexWrap = 'nowrap', children }, ref ) => (
		<Grid container gap={ gap } alignItems={ alignItems } flexWrap={ flexWrap } ref={ ref }>
			{ children }
		</Grid>
	)
);
