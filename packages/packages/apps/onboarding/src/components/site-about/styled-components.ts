import { Box, ButtonBase, styled } from '@elementor/ui';

const GREETING_BANNER_BG_COLOR = '#fae4fa';

export const GreetingBannerRoot = styled( Box )( ( { theme } ) => ( {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	paddingInline: theme.spacing( 3 ),
	paddingBlock: theme.spacing( 1.5 ),
	borderRadius: 16,
	backgroundColor: GREETING_BANNER_BG_COLOR,
	alignSelf: 'flex-start',
} ) );

export const OptionCardRoot = styled( ButtonBase )( ( { theme } ) => ( {
	position: 'relative',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 24,
	minWidth: 0,
	height: 128,
	borderRadius: 8,
	border: `1px solid ${ theme.palette.divider }`,
	cursor: 'pointer',
	transition: 'border-color 150ms ease, background-color 150ms ease',
	'&:hover': {
		backgroundColor: theme.palette.action.hover,
	},
	'&:focus-visible': {
		outline: 'none',
		backgroundColor: theme.palette.action.hover,
	},
	'&.Mui-selected': {
		borderWidth: 2,
		borderColor: theme.palette.text.primary,
	},
} ) );

export const CheckBadge = styled( Box )( ( { theme } ) => ( {
	position: 'absolute',
	top: -8,
	insetInlineEnd: -8,
	width: 18,
	height: 18,
	borderRadius: '50%',
	backgroundColor: theme.palette.text.primary,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
} ) );

export const CardGrid = styled( Box )( ( { theme } ) => ( {
	display: 'grid',
	gridTemplateColumns: 'repeat(4, 132px)',
	gap: 16,
	[ theme.breakpoints.down( 'sm' ) ]: {
		gridTemplateColumns: 'repeat(2, 1fr)',
	},
} ) );
