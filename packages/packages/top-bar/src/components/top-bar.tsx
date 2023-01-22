import * as React from 'react';
import { AppBar as BaseAppBar, Box, styled, Grid } from '@elementor/ui';
import MainMenuLocation from './locations/main-menu-location';
import ToolsMenuLocation from './locations/tools-menu-location';
import LocationCanvasView from './locations/canvas-view-location';
import UtilitiesMenuLocation from './locations/utilities-menu-location';
import PrimaryActionLocation from './locations/primary-action-location';

const AppBar = styled( BaseAppBar )`
	background-color: #232629;
	height: 48px;
	box-shadow: none;
`;

export default function TopBar() {
	return (
		<AppBar position="sticky">
			<Box display="grid" gridTemplateColumns="repeat(3, 1fr)">
				<Grid container>
					<MainMenuLocation />
					<ToolsMenuLocation />
				</Grid>
				<Grid container justifyContent="center">
					<LocationCanvasView />
				</Grid>
				<Grid container justifyContent="end">
					<UtilitiesMenuLocation />
					<PrimaryActionLocation />
				</Grid>
			</Box>
		</AppBar>
	);
}
