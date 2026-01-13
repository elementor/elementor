import * as React from 'react';
import { useEffect, useRef } from 'react';
import { ComponentPropListIcon } from '@elementor/icons';
import { Badge, Box, keyframes, styled, ToggleButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const ComponentsBadge = React.forwardRef< HTMLDivElement, { overridesCount: number; onClick: () => void } >(
	( { overridesCount, onClick }, ref ) => {
		const prevCount = usePrevious( overridesCount );

		const isFirstOverride = prevCount === 0 && overridesCount === 1;

		return (
			<StyledBadge
				ref={ ref }
				color="primary"
				key={ overridesCount }
				invisible={ overridesCount === 0 }
				animate={ isFirstOverride }
				anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
				badgeContent={
					<Box sx={ { animation: ! isFirstOverride ? `${ slideUp } 300ms ease-out` : 'none' } }>
						{ overridesCount }
					</Box>
				}
			>
				<ToggleButton
					value="overrides"
					size="tiny"
					onClick={ onClick }
					aria-label={ __( 'View overrides', 'elementor' ) }
				>
					<ComponentPropListIcon fontSize="tiny" />
				</ToggleButton>
			</StyledBadge>
		);
	}
);

const StyledBadge = styled( Badge, { shouldForwardProp: ( prop ) => prop !== 'animate' } )(
	( { theme, animate } ) => ( {
		'& .MuiBadge-badge': {
			minWidth: theme.spacing( 2 ),
			height: theme.spacing( 2 ),
			minHeight: theme.spacing( 2 ),
			maxWidth: theme.spacing( 2 ),
			fontSize: theme.typography.caption.fontSize as string,
			animation: animate ? `${ bounceIn } 300ms ease-out` : 'none',
		},
	} )
);

function usePrevious< T >( value: T ) {
	const ref = useRef< T >( value );
	useEffect( () => {
		ref.current = value;
	}, [ value ] );
	return ref.current;
}

const bounceIn = keyframes`
	0% { transform: scale(0) translate(50%, 50%); opacity: 0; }
	70% { transform: scale(1.1) translate(50%, -50%); opacity: 1; }
	100% { transform: scale(1) translate(50%, -50%); opacity: 1; }
`;

const slideUp = keyframes`
	from { transform: translateY(100%); opacity: 0; }
	to { transform: translateY(0); opacity: 1; }
`;
