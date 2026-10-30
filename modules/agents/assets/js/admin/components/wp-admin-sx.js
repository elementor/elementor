export const wpAdminInputResetSx = {
	'.wp-admin & .MuiInputBase-input, & .MuiInputBase-input:focus': {
		backgroundColor: 'initial',
		border: 0,
		boxShadow: 'none',
		minHeight: 'auto',
		outline: 0,
	},
};

const muiSwitchInputReset = {
	top: 0,
	left: 0,
	width: '100%',
	height: '100%',
	margin: 0,
	padding: 0,
	minWidth: 0,
	minHeight: 0,
	border: 0,
	background: 'transparent',
	boxShadow: 'none',
	position: 'absolute',
	opacity: '0 !important',
	'&::before, &::after': {
		content: 'none',
		display: 'none',
	},
};

export const wpAdminSwitchSx = {
	'& .MuiSwitch-input': {
		...muiSwitchInputReset,
	},
	'& .MuiSwitch-input:focus': {
		outline: 0,
		boxShadow: 'none',
	},
};
