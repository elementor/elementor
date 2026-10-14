import * as React from 'react';
import { Box, type BoxProps, styled } from '@elementor/ui';

const Header = styled( Box )( ( { theme } ) => ( {
	height: theme?.spacing( 6 ) || '48px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: theme?.spacing( 0.5 ) || '4px',
} ) );

export default function PanelHeader( { children, ...props }: BoxProps ) {
	return (
		<>
			<Header component="header" { ...props }>
				{ children }
			</Header>
		</>
	);
}
