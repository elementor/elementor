import * as React from 'react';
import { AppBar, Box, Grid, ThemeProvider } from '@elementor/ui';
import MainMenuLocation from './locations/main-menu-location';
import ToolsMenuLocation from './locations/tools-menu-location';
import CanvasDisplayLocation from './locations/canvas-display-location';
import UtilitiesMenuLocation from './locations/utilities-menu-location';
import PrimaryActionLocation from './locations/primary-action-location';

export default function TopBar() {
	return (
		<ThemeProvider colorScheme="dark">
			<AppBar position="sticky">
				<Box display="grid" gridTemplateColumns="repeat(3, 1fr)">
					<Grid container>
						<MainMenuLocation />
						<ToolsMenuLocation />
					</Grid>
					<Grid container justifyContent="center">
						<CanvasDisplayLocation />
					</Grid>
					<Grid container justifyContent="flex-end">
						<UtilitiesMenuLocation />
						<PrimaryActionLocation />
					</Grid>
				</Box>
			</AppBar>
		</ThemeProvider>
	);
}
