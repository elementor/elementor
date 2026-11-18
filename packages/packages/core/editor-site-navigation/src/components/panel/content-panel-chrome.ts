const CONTENT_PANEL_INSET_SPACING = 2;

const CONTENT_PANEL_SEARCH_PADDING_BLOCK_START = 1.5;
const CONTENT_PANEL_SEARCH_PADDING_BLOCK_END = 1.25;
const CONTENT_PANEL_SECTION_HEADER_PADDING_BLOCK = 1.25;
const CONTENT_PANEL_SECTION_DIVIDER_MARGIN_BLOCK = 1.5;

export const contentPanelInsetPaddingSx = {
	paddingInline: CONTENT_PANEL_INSET_SPACING,
};

export const contentPanelHeaderStackSx = {
	paddingInlineStart: CONTENT_PANEL_INSET_SPACING,
	paddingInlineEnd: CONTENT_PANEL_INSET_SPACING,
	paddingBlock: 1,
	width: '100%',
};

export const contentPanelSearchBoxSx = {
	...contentPanelInsetPaddingSx,
	pb: CONTENT_PANEL_SEARCH_PADDING_BLOCK_END,
	pt: CONTENT_PANEL_SEARCH_PADDING_BLOCK_START,
};

export const contentPanelSectionHeaderPaddingSx = {
	...contentPanelInsetPaddingSx,
	py: CONTENT_PANEL_SECTION_HEADER_PADDING_BLOCK,
};

export const contentPanelInsetDividerSx = {
	marginInline: CONTENT_PANEL_INSET_SPACING,
};

export const contentPanelFullBleedDividerSx = {
	marginInline: 0,
	width: '100%',
};

export function getContentPanelSectionDividerSx( isLastSection: boolean ) {
	return {
		...( isLastSection ? contentPanelFullBleedDividerSx : contentPanelInsetDividerSx ),
		flexShrink: 0,
		my: isLastSection ? 0 : CONTENT_PANEL_SECTION_DIVIDER_MARGIN_BLOCK,
	};
}
