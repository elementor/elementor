import { SCANNER_COLORS } from '../scanner-constants';

const filledButtonSx = ( background, hoverBackground, color = SCANNER_COLORS.paper ) => ( {
	bgcolor: background,
	color,
	boxShadow: 'none',
	'&:hover': {
		bgcolor: hoverBackground,
		boxShadow: 'none',
	},
} );

export const scannerButtonSx = {
	accent: filledButtonSx( SCANNER_COLORS.accent, SCANNER_COLORS.accentHover ),
	check: {
		...filledButtonSx( SCANNER_COLORS.checkButton, SCANNER_COLORS.checkButtonHover, SCANNER_COLORS.textPrimary ),
		'&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
	},
	activate: filledButtonSx( SCANNER_COLORS.activate, SCANNER_COLORS.activateHover ),
	plainText: {
		minWidth: 0,
		p: 0,
		fontSize: '14px',
		lineHeight: '20px',
		textTransform: 'none',
		'&:hover': {
			bgcolor: 'transparent',
			textDecoration: 'underline',
		},
	},
};
