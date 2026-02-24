import * as React from 'react';
import { Box, styled, useTheme } from '@elementor/ui';

interface SelectionBadgeRootProps {
	variant: 'free' | 'paid';
}

interface SelectionBadgeProps {
	icon: React.ElementType;
	variant?: 'free' | 'paid';
}

const SelectionBadgeRoot = styled( Box, {
	shouldForwardProp: ( prop ) => 'variant' !== prop,
} )< SelectionBadgeRootProps >( ( { theme, variant } ) => ( {
	position: 'absolute',
	top: theme.spacing( -1 ),
	insetInlineEnd: theme.spacing( -1 ),
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: theme.spacing( 2.25 ),
	height: theme.spacing( 2.25 ),
	borderRadius: '50%',
	backgroundColor: variant === 'paid' ? theme.palette.promotion.main : theme.palette.text.primary,
	color: theme.palette.common.white,
	'& .MuiSvgIcon-root': {
		fontSize: theme.typography.pxToRem( 14 ),
	},
} ) );

export function SelectionBadge( { icon: Icon, variant = 'free' }: SelectionBadgeProps ) {
	const theme = useTheme();

	return (
		<SelectionBadgeRoot variant={ variant }>
			<Icon sx={ { fill: variant === 'paid' ? 'white' : theme.palette.secondary.contrastText } } />
		</SelectionBadgeRoot>
	);
}
