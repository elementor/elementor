import * as React from 'react';
import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { AppBar as BaseAppBar, Box, Divider, Grid, ThemeProvider, Toolbar } from '@elementor/ui';

import MainMenuLocation from './locations/main-menu-location';
import PageIndicationLocation from './locations/page-indication-location';
import PrimaryActionLocation from './locations/primary-action-location';
import ResponsiveLocation from './locations/responsive-location';
import ToolsMenuLocation from './locations/tools-menu-location';
import UtilitiesMenuLocation from './locations/utilities-menu-location';
import ToolbarMenu from './ui/toolbar-menu';

export default function AppBar() {
	const document = useActiveDocument();
	return (
		<ThemeProvider colorScheme="dark">
			<BaseAppBar position="sticky">
				<Toolbar disableGutters variant="dense">
					<Box display="grid" gridTemplateColumns="repeat(3, 1fr)" flexGrow={ 1 }>
						<Grid container flexWrap="nowrap">
							<MainMenuLocation />
							{ document?.permissions?.allowAddingWidgets && <ToolsMenuLocation /> }
						</Grid>
						<Grid container justifyContent="center">
							<ToolbarMenu spacing={ 1.5 }>
								<Divider orientation="vertical" />
								<PageIndicationLocation />
								<Divider orientation="vertical" />
								<ResponsiveLocation />
								<Divider orientation="vertical" />
							</ToolbarMenu>
						</Grid>
						<Grid container justifyContent="flex-end" flexWrap="nowrap">
							<UtilitiesMenuLocation />
							<PrimaryActionLocation />
						</Grid>
					</Box>
				</Toolbar>
			</BaseAppBar>
		</ThemeProvider>
	);
}
