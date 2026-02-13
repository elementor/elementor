import { Box, ButtonBase, styled } from '@elementor/ui';

export const OptionCardRoot = styled( ButtonBase )( ( { theme } ) => ( {
	position: 'relative',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	gap: theme.spacing( 3 ),
	minWidth: 0,
	height: theme.spacing( 16 ),
	borderRadius: 8,
	border: `1px solid ${ theme.palette.divider }`,
	cursor: 'pointer',
	transition: 'border-color 150ms ease, background-color 150ms ease',
} ) );

export const CardGrid = styled( Box )( ( { theme } ) => ( {
	display: 'grid',
	gridTemplateColumns: 'repeat(4, 132px)',
	gap: 16,
	[ theme.breakpoints.down( 'sm' ) ]: {
		gridTemplateColumns: 'repeat(2, 1fr)',
	},
} ) );
