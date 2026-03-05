import * as React from 'react';
import { type ControlLayout } from '@elementor/editor-elements';
import { Box, type BoxProps, styled } from '@elementor/ui';

export const ControlTypeContainer = ( { children, layout }: React.PropsWithChildren< { layout?: ControlLayout } > ) => {
	if ( layout === 'custom' ) {
		return children;
	}

	return <StyledContainer layout={ layout }>{ children }</StyledContainer>;
};

const StyledContainer = styled( Box, {
	shouldForwardProp: ( prop: string ) => ! [ 'layout' ].includes( prop ),
} )< BoxProps & { layout: ControlLayout } >( ( { layout, theme } ) => ( {
	display: 'grid',
	gridGap: theme.spacing( 1 ),
	...getGridLayout( layout ),
} ) );

const getGridLayout = ( layout: ControlLayout ) => ( {
	justifyContent: 'space-between',
	...getStyleByLayout( layout ),
} );

const getStyleByLayout = ( layout: ControlLayout ) => {
	if ( layout === 'full' ) {
		return {
			gridTemplateColumns: 'minmax(0, 1fr)',
		};
	}

	if ( layout === 'two-columns' ) {
		return {
			alignItems: 'center',
			gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
		};
	}
};
