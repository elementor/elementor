import * as React from 'react';
import { Box, styled } from '@elementor/ui';

interface SelectionBadgeRootProps {
	variant: 'default' | 'pro';
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
	backgroundColor: variant === 'pro' ? theme.palette.promotion.main : theme.palette.text.primary,
	color: theme.palette.common.white,
	'& .MuiSvgIcon-root': {
		fontSize: theme.typography.pxToRem( 14 ),
	},
} ) );

interface SelectionBadgeProps {
	icon: React.ElementType;
	variant?: 'default' | 'pro';
}

export function SelectionBadge( { icon: Icon, variant = 'default' }: SelectionBadgeProps ) {
	return (
		<SelectionBadgeRoot variant={ variant }>
			<Icon />
		</SelectionBadgeRoot>
	);
}
