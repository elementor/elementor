const CONTENT_PANEL_INSET_SPACING = 2;
const CONTENT_PANEL_LIST_ROW_GAP = 0.5;
const CONTENT_PANEL_LIST_ROW_INSET_INLINE = 0.75;
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
	paddingInline: CONTENT_PANEL_LIST_ROW_INSET_INLINE,
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
