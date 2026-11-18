import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { Box, Divider, Stack } from '@elementor/ui';

import { APP_BAR_HEIGHT, SIDEBAR_CLASS, SIDEBAR_WIDTH_VAR } from '../constants';
import { sidebarFooter, SidebarFooterSlot, sidebarTools, SidebarToolsSlot } from '../locations';
import { SIDEBAR_CHROME_ROW_HEIGHT_PX, sidebarInsetDividerSx } from '../sidebar-chrome';

const { useMenuItems: useToolsMenuItems } = sidebarTools;
const { useMenuItems: useFooterMenuItems } = sidebarFooter;

export default function Sidebar() {
	const toolsItems = useToolsMenuItems();
	const footerItems = useFooterMenuItems();

	return (
		<ThemeProvider>
			<Box
				component="aside"
				className={ SIDEBAR_CLASS }
				data-testid="editor-sidebar"
				aria-label="Editor sidebar"
				sx={ {
					position: 'fixed',
					zIndex: 2,
					insetBlockStart: APP_BAR_HEIGHT,
					insetBlockEnd: 0,
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
				<Stack alignItems="center" pb={ 1.25 } width="100%">
					<Groups
						groups={ [ toolsItems.elements, toolsItems.design, toolsItems.default ] }
						firstGroupHeight={ SIDEBAR_CHROME_ROW_HEIGHT_PX }
					/>
					<SidebarToolsSlot />
				</Stack>
				<Stack alignItems="center" pb={ 1.5 } width="100%">
					<Groups groups={ [ footerItems.document, footerItems.default ] } />
					<SidebarFooterSlot />
				</Stack>
			</Box>
		</ThemeProvider>
	);
}

type MenuItems = ReturnType< typeof useToolsMenuItems >[ 'default' ];

function Groups( { groups, firstGroupHeight }: { groups: MenuItems[]; firstGroupHeight?: number } ) {
	return (
		<>
			{ groups
				.filter( ( items ) => items.length > 0 )
				.map( ( items, index ) => (
					<React.Fragment key={ index }>
						{ index > 0 && <Divider sx={ sidebarInsetDividerSx } /> }
						<Stack
							alignItems="center"
							boxSizing="border-box"
							gap={ index === 0 ? 0 : 1 }
							justifyContent="center"
							py={ index === 0 ? 0 : 1.25 }
							sx={
								index === 0 && firstGroupHeight
									? {
											height: firstGroupHeight,
											paddingBlockEnd: 0.375,
									  }
									: undefined
							}
							width="100%"
						>
							{ items.map( ( { MenuItem, id } ) => (
								<MenuItem key={ id } />
							) ) }
						</Stack>
					</React.Fragment>
				) ) }
		</>
	);
}