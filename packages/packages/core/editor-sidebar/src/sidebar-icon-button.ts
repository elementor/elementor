import { type SxProps, type Theme } from '@elementor/ui';

export const SIDEBAR_ICON_SIZE_PX = 20;

export const SIDEBAR_ICON_BUTTON_SIZE_PX = 28;

export const editorChromeIconBorderRadiusSx: SxProps< Theme > = {
	borderRadius: ( theme: Theme ) => theme.shape.borderRadius,
};

type SidebarIconButtonState = {
	selected?: boolean;
	active?: boolean;
};

export function getSidebarIconButtonSx( {
	selected = false,
	active = false,
}: SidebarIconButtonState = {} ): SxProps< Theme > {
	const isEmphasized = selected || active;

	return {
		...editorChromeIconBorderRadiusSx,
		width: SIDEBAR_ICON_BUTTON_SIZE_PX,
		height: SIDEBAR_ICON_BUTTON_SIZE_PX,
		padding: '6px',
		color: isEmphasized ? 'primary.main' : 'grey.800',
		backgroundColor: isEmphasized ? 'action.selected' : 'transparent',
		'&:hover': {
			backgroundColor: isEmphasized ? 'action.selected' : 'action.hover',
		},
		'& .MuiSvgIcon-root': {
			fontSize: SIDEBAR_ICON_SIZE_PX,
		},
	};
}
