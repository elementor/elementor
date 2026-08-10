import { Chip, styled } from '@elementor/ui';

export const InstalledChip = styled( Chip )( ( { theme } ) => ( {
	position: 'absolute',
	insetBlockStart: theme.spacing( 1 ),
	insetInlineStart: theme.spacing( 1 ),
	zIndex: 1,
	backgroundColor: theme.palette.success.main,
	color: theme.palette.success.contrastText,
	'& .MuiChip-icon': {
		color: 'inherit',
	},
} ) );
