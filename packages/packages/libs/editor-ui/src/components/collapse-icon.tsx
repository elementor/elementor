import { ChevronDownIcon } from '@elementor/icons';
import { styled } from '@elementor/ui';

// TODO: Replace this with future Rotate component that will be implemented in elementor-ui
export const CollapseIcon = styled( ChevronDownIcon, {
	shouldForwardProp: ( prop ) => prop !== 'open' && prop !== 'disabled',
} )< { open: boolean; disabled?: boolean } >( ( { theme, open, disabled = false } ) => ( {
	transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
	transition: theme.transitions.create( 'transform', {
		duration: theme.transitions.duration.standard,
	} ),

	opacity: disabled ? 0.4 : 1,
} ) );
