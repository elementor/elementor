import { Box, Button, Divider, IconButton, Typography, styled } from '@elementor/ui';

export const TopBarContainer = styled( Box )( {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	height: 48,
	backgroundColor: '#0c0d0e',
	paddingLeft: 24,
	paddingRight: 16,
} );

export const LogoContainer = styled( Box )( {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
} );

export const Title = styled( Typography )( {
	color: '#ffffff',
	fontSize: 18,
	fontWeight: 500,
	lineHeight: '18px',
	letterSpacing: '0.15px',
} );

export const RightSection = styled( Box )( {
	display: 'flex',
	alignItems: 'center',
	gap: 4,
} );

export const IconButtonStyled = styled( IconButton )( {
	color: '#ffffff',
	width: 30,
	height: 30,
	'& .MuiSvgIcon-root': {
		fontSize: 18,
	},
} );

export const VerticalDivider = styled( Divider )( {
	height: 24,
	backgroundColor: 'rgba(255, 255, 255, 0.4)',
	marginLeft: 4,
	marginRight: 4,
} );

export const AccountButton = styled( Button )( {
	color: '#ffffff',
	fontSize: 13,
	fontWeight: 500,
	lineHeight: '22px',
	letterSpacing: '0.46px',
	textTransform: 'none',
	padding: '4px 5px',
	'& .MuiButton-startIcon': {
		marginRight: 8,
	},
	'& .MuiSvgIcon-root': {
		fontSize: 18,
	},
} );

