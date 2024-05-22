import { Box, styled } from '@elementor/ui';

const Overlay = styled( Box )( ( { theme } ) => ( {
	width: '100%',
	height: '100%',
	position: 'absolute',
	backgroundColor: 'rgba(0,0,0,0.5)',
	transition: `opacity ${ theme.transitions.duration.short }ms ${ theme.transitions.easing.easeInOut }`,
	opacity: 0,
	'&:hover': {
		opacity: 1,
	},
} ) );

export default Overlay;
