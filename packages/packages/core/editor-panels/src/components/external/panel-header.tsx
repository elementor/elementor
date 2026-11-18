import * as React from 'react';
import { Box, type BoxProps, styled } from '@elementor/ui';

import { isSidebarPanelChromeEnabled } from '../../panel-chrome-gate';
import { sidebarPanelHeaderSx } from '../../panel-header-chrome';

const Header = styled( Box )( ( { theme } ) => ( {
	height: theme?.spacing( 6 ) || '48px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: theme?.spacing( 0.5 ) || '4px',
} ) );

export default function PanelHeader( { children, sx, ...props }: BoxProps ) {
	const sidebarChrome = isSidebarPanelChromeEnabled();

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
