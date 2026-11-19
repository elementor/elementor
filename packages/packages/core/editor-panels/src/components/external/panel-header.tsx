import * as React from 'react';
import { isSidebarEnabled } from '@elementor/editor-sidebar';
import { Box, type BoxProps, styled } from '@elementor/ui';

const Header = styled( Box )( ( { theme } ) => ( {
	height: theme?.spacing( 6 ) || '48px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: theme?.spacing( 0.5 ) || '4px',
} ) );

export default function PanelHeader( { children, sx, ...props }: BoxProps ) {
	const sidebarChrome = isSidebarEnabled();

	return (
		<>
			<Header
				component="header"
				sx={ {
					...( sidebarChrome
						? {
								justifyContent: 'flex-start',
								width: '100%',
								boxSizing: 'border-box',
								p: 1,
								pl: 2,
						  }
						: {} ),
					...sx,
				} }
				{ ...props }
			>
				{ children }
			</Header>
		</>
	);
}