import * as React from 'react';
import { Grid, Stack, type Theme } from '@elementor/ui';

import { ControlLabel } from './control-label';

type StylesFieldLayoutProps = {
	label: string;
	children: React.ReactNode;
	direction?: 'row' | 'column';
	infoTooltip?: string;
};

export const StylesFieldLayout = React.forwardRef< HTMLDivElement, StylesFieldLayoutProps >( ( props, ref ) => {
	const { direction = 'row', children, label, infoTooltip } = props;

	const LayoutComponent = direction === 'row' ? Row : Column;

	return <LayoutComponent label={ label } infoTooltip={ infoTooltip } ref={ ref } children={ children } />;
} );

type LayoutProps = {
	label: string;
	children: React.ReactNode;
	infoTooltip?: string;
};

const Row = React.forwardRef< HTMLDivElement, LayoutProps >(
	( { label, children, infoTooltip }, ref ) => {
		return (
			<Grid
				container
				gap={ 2 }
				alignItems="center"
				flexWrap="nowrap"
				ref={ ref }
				aria-label={ `${ label } control` }
			>
				<Grid item xs={ 6 }>
					<ControlLabel infoTooltip={ infoTooltip }>{ label }</ControlLabel>
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

const Column = React.forwardRef< HTMLDivElement, LayoutProps >(
	( { label, children, infoTooltip }, ref ) => {
		return (
			<Stack gap={ 0.75 } ref={ ref }>
				<ControlLabel infoTooltip={ infoTooltip }>{ label }</ControlLabel>
				{ children }
			</Stack>
		);
	}
);
