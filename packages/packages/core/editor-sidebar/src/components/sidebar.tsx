import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { Box, Divider, Stack } from '@elementor/ui';

import {
	APP_BAR_HEIGHT,
	SIDEBAR_CLASS,
	SIDEBAR_FOOTER_ITEM_GAP_SPACING,
	SIDEBAR_GROUP_DIVIDER_INSET_SPACING,
	SIDEBAR_HORIZONTAL_PADDING_SPACING,
	SIDEBAR_RAIL_BOTTOM_INSET_SPACING,
	SIDEBAR_TOOLS_ITEM_GAP_SPACING,
	SIDEBAR_WIDTH_VAR,
} from '../constants';
import { sidebarFooter, SidebarFooterSlot, sidebarTools, SidebarToolsSlot } from '../locations';
import { sidebarInsetDividerSx } from '../sidebar-chrome';

const { useMenuItems: useToolsMenuItems } = sidebarTools;
const { useMenuItems: useFooterMenuItems } = sidebarFooter;

const SIDEBAR_FIRST_GROUP_PADDING_BLOCK_END = 0.375;

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
					px: SIDEBAR_HORIZONTAL_PADDING_SPACING,
					backgroundColor: 'rgb( 242, 242, 242 )',
				} }
			>
				<Stack alignItems="center" width="100%">
					<Groups
						firstGroupHeight={ APP_BAR_HEIGHT }
						groups={ [ toolsItems.elements, toolsItems.design, toolsItems.default ] }
						itemGap={ SIDEBAR_TOOLS_ITEM_GAP_SPACING }
					/>
					<SidebarToolsSlot />
				</Stack>
				<Stack alignItems="center" pb={ SIDEBAR_RAIL_BOTTOM_INSET_SPACING } width="100%">
					<Groups
						groups={ [ footerItems.document, footerItems.default ] }
						groupPaddingBlockEnd={ 0 }
						itemGap={ SIDEBAR_FOOTER_ITEM_GAP_SPACING }
					/>
					<SidebarFooterSlot />
				</Stack>
			</Box>
		</ThemeProvider>
	);
}

type MenuItems = ReturnType< typeof useToolsMenuItems >[ 'default' ];

function Groups( {
	groups,
	firstGroupHeight,
	groupPaddingBlockEnd = 1.5,
	itemGap,
}: {
	groups: MenuItems[];
	firstGroupHeight?: number;
	groupPaddingBlockEnd?: number;
	itemGap: number;
} ) {
	const groupPaddingBlockStart = 1.5;
	const visibleGroups = groups.filter( ( items ) => items.length > 0 );

	return (
		<>
			{ visibleGroups.map( ( items, index ) => {
				const isFirstGroup = index === 0;
				const isLastGroup = index === visibleGroups.length - 1;
				const usesChromeRowHeight = isFirstGroup && firstGroupHeight !== undefined;

				let paddingTop = groupPaddingBlockStart;

				if ( usesChromeRowHeight ) {
					paddingTop = 0;
				} else if ( ! isFirstGroup ) {
					paddingTop = SIDEBAR_GROUP_DIVIDER_INSET_SPACING;
				}

				let paddingBottom = isLastGroup ? groupPaddingBlockEnd : SIDEBAR_GROUP_DIVIDER_INSET_SPACING;

				if ( usesChromeRowHeight ) {
					paddingBottom = SIDEBAR_FIRST_GROUP_PADDING_BLOCK_END;
				}

				return (
					<React.Fragment key={ index }>
						{ index > 0 && <Divider sx={ { ...sidebarInsetDividerSx, my: 0 } } /> }
						<Stack
							alignItems="center"
							boxSizing="border-box"
							gap={ itemGap }
							height={ usesChromeRowHeight ? firstGroupHeight : undefined }
							justifyContent="center"
							pt={ paddingTop }
							pb={ paddingBottom }
							width="100%"
						>
							{ items.map( ( { MenuItem, id } ) => (
								<MenuItem key={ id } />
							) ) }
						</Stack>
					</React.Fragment>
				);
			} ) }
		</>
	);
}
