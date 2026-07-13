import * as React from 'react';
import { useRef } from 'react';
import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { AppBar as BaseAppBar, Box, Divider, Grid, ThemeProvider, Toolbar } from '@elementor/ui';

import { MIN_APP_BAR_WIDTH } from '../constants';
import { AppBarSizeProvider } from '../contexts/app-bar-size-context';
import { useContainerWidth } from '../hooks/use-container-width';
import { getMaxToolbarActions } from '../utils/get-max-toolbar-actions';
import MainMenuLocation from './locations/main-menu-location';
import PageIndicationLocation from './locations/page-indication-location';
import PrimaryActionLocation from './locations/primary-action-location';
import ResponsiveLocation from './locations/responsive-location';
import ToolsMenuLocation from './locations/tools-menu-location';
import UtilitiesMenuLocation from './locations/utilities-menu-location';
import ToolbarMenu from './ui/toolbar-menu';

export default function AppBar() {
	const document = useActiveDocument();
	const containerRef = useRef< HTMLDivElement >( null );
	const containerWidth = useContainerWidth( containerRef );
	const maxToolbarActions = getMaxToolbarActions( containerWidth );

	return (
		<ThemeProvider colorScheme="dark">
			<BaseAppBar position="sticky">
				{ /* Below MIN_APP_BAR_WIDTH the content can no longer shrink without clipping, so the
				toolbar scrolls horizontally instead of squeezing the left/right sections further. */ }
				<Toolbar disableGutters variant="dense" sx={ { overflowX: 'auto' } }>
					{ /* The center column keeps its natural ("auto") width, so the left and right
					columns (`minmax(0, 1fr)`) shrink first as the app bar narrows. */ }
					<Box
						ref={ containerRef }
						display="grid"
						gridTemplateColumns="minmax(0, 1fr) auto minmax(0, 1fr)"
						flexGrow={ 1 }
						minWidth={ `${ MIN_APP_BAR_WIDTH }px` }
					>
						<AppBarSizeProvider value={ maxToolbarActions }>
							<Grid container flexWrap="nowrap" sx={ { minWidth: 0, overflow: 'hidden' } }>
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
							<Grid
								container
								justifyContent="flex-end"
								flexWrap="nowrap"
								sx={ { minWidth: 0, overflow: 'hidden' } }
							>
								<UtilitiesMenuLocation />
								<PrimaryActionLocation />
							</Grid>
						</AppBarSizeProvider>
					</Box>
				</Toolbar>
			</BaseAppBar>
		</ThemeProvider>
	);
}
