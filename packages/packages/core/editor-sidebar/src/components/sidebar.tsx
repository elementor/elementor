import * as React from 'react';
import { useEffect } from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { Box, Stack } from '@elementor/ui';

import { SIDEBAR_ACTIVE_CLASS, SIDEBAR_WIDTH_VAR } from '../constants';
import { SidebarFooterSlot, SidebarToolsSlot } from '../locations';

export default function Sidebar() {
	useEffect( () => {
		document.body.classList.add( SIDEBAR_ACTIVE_CLASS );

		return () => {
			document.body.classList.remove( SIDEBAR_ACTIVE_CLASS );
		};
	}, [] );

	return (
		<ThemeProvider>
			<Box
				component="aside"
				data-testid="editor-sidebar"
				aria-label="Editor sidebar"
				sx={ {
					position: 'fixed',
					insetBlock: 0,
					insetInlineStart: 0,
					width: `var(${ SIDEBAR_WIDTH_VAR })`,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					alignItems: 'center',
					px: 1,
					backgroundColor: 'rgb( 242, 242, 242 )',
				} }
			>
				<Stack alignItems="center" gap={ 1.5 } pt={ 2 } pb={ 1.25 }>
					<SidebarToolsSlot />
				</Stack>
				<Stack alignItems="center" gap={ 1 } pb={ 1.5 }>
					<SidebarFooterSlot />
				</Stack>
			</Box>
		</ThemeProvider>
	);
}
