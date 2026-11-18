const CONTENT_PANEL_INSET_SPACING = 2;

const CONTENT_PANEL_SECTION_HEADER_PADDING_BLOCK = 1.25;
const CONTENT_PANEL_SEARCH_PADDING_BLOCK_START = 1.5;
const CONTENT_PANEL_SEARCH_PADDING_BLOCK_END = 2;

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

export const contentPanelSectionHeaderSx = {
	py: CONTENT_PANEL_SECTION_HEADER_PADDING_BLOCK,
};

export const contentPanelFullBleedDividerSx = {
	marginInline: 0,
	width: '100%',
};
