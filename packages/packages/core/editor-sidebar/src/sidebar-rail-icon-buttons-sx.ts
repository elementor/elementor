import { type SxProps, type Theme } from '@elementor/ui';

export const sidebarRailIconButtonsSx: SxProps< Theme > = {
	'& .MuiIconButton-root': {
		borderRadius: 1,
		color: 'grey.800',
		'&:hover': {
			backgroundColor: 'action.hover',
		},
	},
	'& .MuiIconButton-root.Mui-disabled': {
		color: 'action.disabled',
	},
	'& .MuiIconButton-root:is([aria-pressed="true"], [aria-expanded="true"])': {
		color: 'primary.main',
		backgroundColor: 'action.selected',
		'&:hover': {
			backgroundColor: 'action.selected',
		},
	},
};
