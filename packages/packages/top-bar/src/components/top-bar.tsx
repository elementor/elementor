import * as React from 'react';
import { AppBar as BaseAppBar, Box, styled, Grid } from '@elementor/ui';
import LocationMainMenu from './locations/location-main-menu';
import LocationToolsMenu from './locations/location-tools-menu';
import LocationCanvasView from './locations/location-canvas-view';

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
					<LocationMainMenu />
					<LocationToolsMenu />
				</Grid>
				<Grid container justifyContent="center">
					<LocationCanvasView />
				</Grid>
				<Grid container justifyContent="end" />
			</Box>
		</AppBar>
	);
}
