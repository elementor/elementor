import { ChevronDownIcon } from '@elementor/icons';
import { styled } from '@elementor/ui';

// TODO: Replace this with future Rotate component that will be implemented in elementor-ui
export const CollapseIcon = styled( ChevronDownIcon, {
	shouldForwardProp: ( prop ) => prop !== 'open',
} )< { open: boolean } >( ( { theme, open } ) => ( {
	transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
	transition: theme.transitions.create( 'transform', {
		duration: theme.transitions.duration.standard,
	} ),
} ) );
