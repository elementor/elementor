import { SCANNER_COLORS } from '../scanner-constants';

const filledButtonSx = ( background, hoverBackground ) => ( {
	bgcolor: background,
	color: SCANNER_COLORS.paper,
	boxShadow: 'none',
	'&:hover': {
		bgcolor: hoverBackground,
		boxShadow: 'none',
	},
} );

export const scannerButtonSx = {
	accent: filledButtonSx( SCANNER_COLORS.accent, SCANNER_COLORS.accentHover ),
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
