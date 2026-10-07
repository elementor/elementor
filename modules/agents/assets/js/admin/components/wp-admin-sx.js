export const wpAdminInputResetSx = {
	'.wp-admin & .MuiInputBase-input, & .MuiInputBase-input:focus': {
		backgroundColor: 'initial',
		border: 0,
		boxShadow: 'none',
		minHeight: 'auto',
		outline: 0,
	},
};

export const wpAdminSwitchSx = {
	'& .MuiSwitch-input': {
		position: 'absolute',
		// WordPress admin sets opacity on disabled checkboxes, which draws the native control through the switch.
		opacity: '0 !important',
	},
};
