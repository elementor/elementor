import { isSidebarEnabled, SIDEBAR_ICON_SIZE_PX } from '@elementor/editor-sidebar';
import { type SxProps, type Theme } from '@elementor/ui';

const LEGACY_TOOLBAR_ICON_FONT_SIZE = '1.25rem';

export function getToolbarChromeIconSvgSx(): SxProps< Theme > {
	if ( ! isSidebarEnabled() ) {
		return {
			fontSize: LEGACY_TOOLBAR_ICON_FONT_SIZE,
			height: '1em',
			width: '1em',
		};
	}

	const iconSize = `${ SIDEBAR_ICON_SIZE_PX }px`;

	return {
		fontSize: iconSize,
		height: iconSize,
		width: iconSize,
	};
}

export function getToolbarChromeTabsIconSx(): SxProps< Theme > {
	if ( ! isSidebarEnabled() ) {
		return {};
	}

	const iconSx = getToolbarChromeIconSvgSx();

	return {
		'& .MuiTab-root svg': iconSx,
	};
}
