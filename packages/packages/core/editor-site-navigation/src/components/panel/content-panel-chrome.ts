const CONTENT_PANEL_INSET_SPACING = 2;

const CONTENT_PANEL_SEARCH_PADDING_BLOCK_START = 1.5;
const CONTENT_PANEL_SEARCH_PADDING_BLOCK_END = 1.25;

export const contentPanelInsetPaddingSx = {
	paddingInline: CONTENT_PANEL_INSET_SPACING,
};

export const contentPanelHeaderStackSx = {
	paddingInlineEnd: CONTENT_PANEL_INSET_SPACING,
	paddingInlineStart: CONTENT_PANEL_INSET_SPACING,
	paddingBlock: 1,
	width: '100%',
};

export const contentPanelSearchBoxSx = {
	...contentPanelInsetPaddingSx,
	pb: CONTENT_PANEL_SEARCH_PADDING_BLOCK_END,
	pt: CONTENT_PANEL_SEARCH_PADDING_BLOCK_START,
};

export const contentPanelFullBleedDividerSx = {
	marginInline: 0,
	width: '100%',
};
