import { Button, styled } from '@elementor/ui';

export const OptionButton = styled( Button )( ( { theme } ) => ( {
	justifyContent: 'space-between',
	height: 56,
	borderRadius: 8,
	textTransform: 'none',
	fontWeight: theme.typography.body1.fontWeight,
	fontSize: theme.typography.body1.fontSize,
	letterSpacing: theme.typography.body1.letterSpacing,
	lineHeight: theme.typography.body1.lineHeight,
	color: theme.palette.text.secondary,
	borderColor: theme.palette.divider,
	paddingInlineStart: 20,
	paddingInlineEnd: 12,
	'& .MuiButton-endIcon': {
		opacity: 0,
	},
	'&:hover': {
		borderColor: theme.palette.divider,
		'& .MuiButton-endIcon': {
			opacity: 1,
		},
	},
	'&:focus, &:active, &.Mui-focusVisible': {
		outline: 'none',
		backgroundColor: 'transparent',
		borderColor: theme.palette.divider,
	},
	'&.Mui-selected': {
		borderWidth: 2,
		borderColor: theme.palette.text.primary,
		'& .MuiButton-endIcon': {
			opacity: 1,
		},
		'&:hover': {
			borderColor: theme.palette.text.primary,
		},
	},
} ) );
