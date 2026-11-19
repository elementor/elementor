import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { Box, Divider, Stack } from '@elementor/ui';

import { APP_BAR_HEIGHT, SIDEBAR_CLASS, SIDEBAR_WIDTH_VAR } from '../constants';
import { sidebarFooter, SidebarFooterSlot, sidebarTools, SidebarToolsSlot } from '../locations';
import { sidebarRailIconButtonsSx } from '../sidebar-rail-icon-buttons-sx';

const { useMenuItems: useToolsMenuItems } = sidebarTools;
const { useMenuItems: useFooterMenuItems } = sidebarFooter;

const SIDEBAR_INSET_DIVIDER_SX = {
	alignSelf: 'center',
	flexShrink: 0,
	width: 28,
} as const;

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
					...sidebarRailIconButtonsSx,
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
					px: 1.25,
					backgroundColor: 'rgb( 242, 242, 242 )',
				} }
			>
				<Stack alignItems="center" width="100%">
					<Groups
						chromeRowHeightPx={ APP_BAR_HEIGHT }
						groups={ [ toolsItems.elements, toolsItems.design, toolsItems.default ] }
						itemGap={ 1.5 }
					/>
					<SidebarToolsSlot />
				</Stack>
				<Stack alignItems="center" pb={ 1.5 } width="100%">
					<Groups
						groups={ [ footerItems.document, footerItems.default ] }
						groupPaddingBlockEnd={ 0 }
						itemGap={ 1 }
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
					paddingTop = 1.5;
				}

				const paddingBottom = isLastGroup ? groupPaddingBlockEnd : 1.5;

				const menuItems = items.map( ( { MenuItem, id } ) => <MenuItem key={ id } /> );

				return (
					<React.Fragment key={ index }>
						{ index > 0 && ! skipLeadingDivider && (
							<Divider sx={ { ...SIDEBAR_INSET_DIVIDER_SX, my: 0 } } />
						) }
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
										<Divider sx={ { ...SIDEBAR_INSET_DIVIDER_SX, flexShrink: 0 } } />
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
