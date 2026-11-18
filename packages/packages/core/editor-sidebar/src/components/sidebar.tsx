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
					px: SIDEBAR_HORIZONTAL_PADDING_SPACING,
					backgroundColor: 'rgb( 242, 242, 242 )',
				} }
			>
				<Stack alignItems="center" width="100%">
					<Groups
						chromeRowHeightPx={ SIDEBAR_CHROME_ROW_HEIGHT_PX }
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
	chromeRowHeightPx,
	groupPaddingBlockEnd = 1.5,
	itemGap,
}: {
	groups: MenuItems[];
	chromeRowHeightPx?: number;
	groupPaddingBlockEnd?: number;
	itemGap: number;
} ) {
	const groupPaddingBlockStart = 1.5;
	const visibleGroups = groups.filter( ( items ) => items.length > 0 );
	const usesChromeRow = chromeRowHeightPx !== undefined && visibleGroups.length > 0;

	return (
		<>
			{ visibleGroups.map( ( items, index ) => {
				const isFirstGroup = index === 0;
				const isLastGroup = index === visibleGroups.length - 1;
				const isChromeRow = isFirstGroup && usesChromeRow;
				const skipLeadingDivider = index === 1 && usesChromeRow;

				let paddingTop = groupPaddingBlockStart;

				if ( isChromeRow ) {
					paddingTop = 0;
				} else if ( ! isFirstGroup ) {
					paddingTop = SIDEBAR_GROUP_DIVIDER_INSET_SPACING;
				}

				const paddingBottom = isLastGroup ? groupPaddingBlockEnd : SIDEBAR_GROUP_DIVIDER_INSET_SPACING;

				const menuItems = items.map( ( { MenuItem, id } ) => <MenuItem key={ id } /> );

				return (
					<React.Fragment key={ index }>
						{ index > 0 && ! skipLeadingDivider && <Divider sx={ { ...sidebarInsetDividerSx, my: 0 } } /> }
						<Stack
							alignItems="center"
							boxSizing="border-box"
							gap={ isChromeRow ? 0 : itemGap }
							sx={ isChromeRow ? { height: `${ chromeRowHeightPx }px` } : undefined }
							justifyContent="center"
							pt={ isChromeRow ? 0 : paddingTop }
							pb={ isChromeRow ? 0 : paddingBottom }
							width="100%"
						>
							{ isChromeRow ? (
								<>
									<Stack
										alignItems="center"
										flex={ 1 }
										justifyContent="center"
										minHeight={ 0 }
										width="100%"
									>
										{ menuItems }
									</Stack>
									{ visibleGroups.length > 1 && (
										<Divider sx={ { ...sidebarInsetDividerSx, flexShrink: 0 } } />
									) }
								</>
							) : (
								menuItems
							) }
						</Stack>
					</React.Fragment>
				);
			} ) }
		</>
	);
}
