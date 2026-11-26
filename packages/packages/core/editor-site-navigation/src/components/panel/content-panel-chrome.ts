const CONTENT_PANEL_INSET_SPACING = 2;
const CONTENT_PANEL_LIST_ROW_GAP = 0.5;
const CONTENT_PANEL_LIST_ROW_INSET_INLINE = 0.75;
const CONTENT_PANEL_LIST_ROW_TINY_ICON_BUTTON_SIZE = 8;
const CONTENT_PANEL_LIST_ROW_SECONDARY_ACTION_GAP = 0.5;
const CONTENT_PANEL_LIST_ITEM_MENU_SLOT_COUNT = 1;

export const contentPanelListItemSecondaryActionsStackSx = {
	flexShrink: 0,
};

export const contentPanelListItemSecondaryActionsRootSx = {
	'& .MuiListItemSecondaryAction-root': {
		alignItems: 'center',
		display: 'flex',
		marginInlineStart: 'auto',
		position: 'static',
		transform: 'none',
	},
};

const getContentPanelListItemTrailingInsetEnd = ( secondaryActionSlotCount: number ) => {
	if ( secondaryActionSlotCount <= CONTENT_PANEL_LIST_ITEM_MENU_SLOT_COUNT ) {
		return undefined;
	}

	const gapCount = secondaryActionSlotCount - 1;

	return (
		secondaryActionSlotCount * CONTENT_PANEL_LIST_ROW_TINY_ICON_BUTTON_SIZE +
		gapCount * CONTENT_PANEL_LIST_ROW_SECONDARY_ACTION_GAP
	);
};
const CONTENT_PANEL_LIST_ROW_TITLE_FONT_SIZE = '0.75rem';
const CONTENT_PANEL_LIST_SECTION_BOTTOM_SPACING = 1;

const CONTENT_PANEL_SECTION_HEADER_PADDING_BLOCK = 1.25;
const CONTENT_PANEL_SECTION_HEADER_TRAILING_GAP = 0.75;
const CONTENT_PANEL_SEARCH_PADDING_BLOCK = 1.5;

export const contentPanelInsetPaddingSx = {
	paddingInline: CONTENT_PANEL_INSET_SPACING,
};

export const contentPanelListRowPaddingSx = {
	...contentPanelInsetPaddingSx,
};

export function getContentPanelListItemSecondarySlotCount( options: {
	hasHomeIcon: boolean;
	hasRowActions: boolean;
} ): number {
	let count = CONTENT_PANEL_LIST_ITEM_MENU_SLOT_COUNT;

	if ( options.hasRowActions ) {
		count += 1;
	}

	if ( options.hasHomeIcon ) {
		count += 1;
	}

	return count;
}

export function getContentPanelListItemSx( secondaryActionSlotCount: number ) {
	const paddingInlineEnd = getContentPanelListItemTrailingInsetEnd( secondaryActionSlotCount );

	if ( undefined === paddingInlineEnd ) {
		return {
			...contentPanelListRowPaddingSx,
			...contentPanelListItemSecondaryActionsRootSx,
		};
	}

	return {
		...contentPanelListRowPaddingSx,
		...contentPanelListItemSecondaryActionsRootSx,
		'&& > .MuiListItemButton-root': {
			paddingInlineEnd,
			paddingRight: 'unset',
		},
	};
}

export const contentPanelHeaderStackSx = {
	width: '100%',
};

export const contentPanelSearchBoxSx = {
	...contentPanelInsetPaddingSx,
	py: CONTENT_PANEL_SEARCH_PADDING_BLOCK,
};

export const contentPanelSectionHeaderSx = {
	...contentPanelInsetPaddingSx,
	py: CONTENT_PANEL_SECTION_HEADER_PADDING_BLOCK,
};

export const contentPanelSectionHeaderTrailingGap = CONTENT_PANEL_SECTION_HEADER_TRAILING_GAP;

export const contentPanelFullBleedDividerSx = {
	marginInline: 0,
	width: '100%',
};

export const contentPanelListRowTitleSx = {
	fontSize: CONTENT_PANEL_LIST_ROW_TITLE_FONT_SIZE,
};

export const contentPanelListSectionListSx = {
	display: 'flex',
	flexDirection: 'column',
	gap: CONTENT_PANEL_LIST_ROW_GAP,
	paddingBlockEnd: CONTENT_PANEL_LIST_SECTION_BOTTOM_SPACING,
};

export const contentPanelListItemButtonSx = {
	justifyContent: 'flex-start',
	paddingInline: CONTENT_PANEL_LIST_ROW_INSET_INLINE,
	textAlign: 'start',
	width: '100%',
	'&.Mui-selected': {
		backgroundColor: 'action.selected',
	},
	'&.Mui-selected:hover': {
		backgroundColor: 'action.selected',
	},
	'&:hover:not(.Mui-disabled)': {
		backgroundColor: 'action.hover',
	},
};
