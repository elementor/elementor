import { Box, Chip, styled } from '@elementor/ui';

interface ThemeCardRootProps {
	selected: boolean;
	disabled: boolean;
}

export const ThemeCardRoot = styled( Box, {
	shouldForwardProp: ( prop ) => ! [ 'selected', 'disabled' ].includes( prop as string ),
} )< ThemeCardRootProps >( ( { theme, selected, disabled } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: theme.spacing( 2 ),
	paddingBlockEnd: theme.spacing( 3 ),
	borderRadius: theme.spacing( 2 ),
	border: selected ? `2px solid ${ theme.palette.text.primary }` : `1px solid ${ theme.palette.divider }`,
	cursor: disabled ? 'default' : 'pointer',
	inlineSize: theme.spacing( 30 ),
	flexShrink: 0,
	position: 'relative',
	overflow: 'visible',
	opacity: disabled && ! selected ? 0.5 : 1,
	transition: 'border-color 150ms ease, opacity 150ms ease',
	...( ! selected &&
		! disabled && {
			'&:hover': {
				borderColor: theme.palette.text.secondary,
			},
		} ),
} ) );

export const ThemePreview = styled( Box, {
	shouldForwardProp: ( prop ) => ! [ 'bgColor', 'previewImage' ].includes( prop as string ),
} )< { bgColor: string; previewImage?: string } >( ( { theme, bgColor, previewImage } ) => ( {
	inlineSize: '100%',
	blockSize: theme.spacing( 14 ),
	overflow: 'hidden',
	borderStartStartRadius: theme.spacing( 1.75 ),
	borderStartEndRadius: theme.spacing( 1.75 ),
	backgroundColor: bgColor,
	position: 'relative',
	...( previewImage && {
		backgroundImage: `url(${ previewImage })`,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
	} ),
} ) );

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

export const RecommendedChip = styled( Chip )( ( { theme } ) => ( {
	position: 'absolute',
	insetBlockStart: theme.spacing( 1 ),
	insetInlineStart: theme.spacing( 1 ),
	zIndex: 1,
} ) );
