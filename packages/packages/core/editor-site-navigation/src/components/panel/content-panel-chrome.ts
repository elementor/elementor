const CONTENT_PANEL_INSET_SPACING = 2;
const CONTENT_PANEL_LIST_ROW_GAP = 0.5;
const CONTENT_PANEL_LIST_ROW_INSET_INLINE = 0.75;
const CONTENT_PANEL_LIST_ROW_SECONDARY_ACTION_SLOT_WIDTH = 5.5;
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

const contentPanelListItemSecondaryInsetSx = ( trailingActionCount: number ) => ( {
	'&& > .MuiListItemButton-root': {
		paddingInlineEnd:
			trailingActionCount * CONTENT_PANEL_LIST_ROW_SECONDARY_ACTION_SLOT_WIDTH,
		paddingRight: 'unset',
	},
} );

export function getContentPanelListItemSx( trailingActionCount: number ) {
	return {
		...contentPanelListRowPaddingSx,
		...contentPanelListItemSecondaryInsetSx( trailingActionCount ),
	};
}

export function getContentPanelListItemRowStateSx( isActive: boolean, allowRowHover: boolean ) {
	if ( isActive ) {
		return {
			borderRadius: 1,
			backgroundColor: 'action.selected',
			'&:hover': {
				backgroundColor: 'action.selected',
			},
		};
	}

	if ( ! allowRowHover ) {
		return {
			borderRadius: 1,
		};
	}

	return {
		borderRadius: 1,
		'&:hover': {
			backgroundColor: 'action.hover',
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

const contentPanelListItemButtonTransparentSx = {
	backgroundColor: 'transparent',
	'&.Mui-selected': {
		backgroundColor: 'transparent',
	},
	'&.Mui-selected:hover': {
		backgroundColor: 'transparent',
	},
	'&:hover': {
		backgroundColor: 'transparent',
	},
	'&.Mui-disabled': {
		backgroundColor: 'transparent',
	},
};

export const contentPanelListItemButtonSx = {
	...contentPanelListItemButtonTransparentSx,
	justifyContent: 'flex-start',
	paddingInline: CONTENT_PANEL_LIST_ROW_INSET_INLINE,
	textAlign: 'start',
	width: '100%',
};
