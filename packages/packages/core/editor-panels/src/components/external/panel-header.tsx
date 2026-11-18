import * as React from 'react';
import { isSidebarEnabled } from '@elementor/editor-sidebar';
import { Box, type BoxProps, styled } from '@elementor/ui';

import { sidebarPanelHeaderSx } from '../../panel-header-chrome';

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
					...( sidebarChrome ? sidebarPanelHeaderSx : {} ),
					...sx,
				} }
				{ ...props }
			>
				{ children }
			</Header>
		</>
	);
}
