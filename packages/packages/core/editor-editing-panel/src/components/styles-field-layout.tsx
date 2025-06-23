import * as React from 'react';
import { Grid, Stack, type Theme } from '@elementor/ui';

import { ControlLabel } from './control-label';

type StylesFieldLayoutProps = {
	label: string;
	children: React.ReactNode;
	direction?: 'row' | 'column';
};

export const StylesFieldLayout = React.forwardRef< HTMLDivElement, StylesFieldLayoutProps >( ( props, ref ) => {
	const { direction = 'row', children, label } = props;

	const LayoutComponent = direction === 'row' ? Row : Column;

	return <LayoutComponent label={ label } ref={ ref } children={ children } />;
} );

const Row = React.forwardRef< HTMLDivElement, { label: string; children: React.ReactNode } >(
	( { label, children }, ref ) => {
		return (
			<Grid container gap={ 2 } alignItems="center" flexWrap="nowrap" ref={ ref }>
				<Grid item xs={ 6 }>
					<ControlLabel>{ label }</ControlLabel>
				</Grid>
				<Grid
					item
					xs={ 6 }
					sx={ ( theme: Theme ) => ( {
						width: `calc(50% - ${ theme.spacing( 2 ) })`,
					} ) }
				>
					{ children }
				</Grid>
			</Grid>
		);
	}
);

const Column = React.forwardRef< HTMLDivElement, { label: string; children: React.ReactNode } >(
	( { label, children }, ref ) => {
		return (
			<Stack gap={ 0.75 } ref={ ref }>
				<ControlLabel>{ label }</ControlLabel>
				{ children }
			</Stack>
		);
	}
);
