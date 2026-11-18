import { type SxProps, type Theme } from '@elementor/ui';

export const sidebarPanelHeaderSx: SxProps< Theme > = {
	justifyContent: 'flex-start',
	width: '100%',
	boxSizing: 'border-box',
	p: 1,
	pl: 2,
};

export const sidebarPanelHeaderTitleSx: SxProps< Theme > = {
	flex: 1,
	minWidth: 0,
};
