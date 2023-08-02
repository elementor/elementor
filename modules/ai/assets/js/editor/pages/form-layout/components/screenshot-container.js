import { Box, styled } from '@elementor/ui';

const ScreenshotContainer = styled( Box )( ( { theme, selected, height } ) => {
	const outline = `${ theme.border.size.sm } ${ theme.border.style.solid } ${ theme.palette.text.primary }`;

	return {
		height,
		cursor: 'pointer',
		overflow: 'hidden',
		boxSizing: 'border-box',
		backgroundPosition: 'center',
		backgroundSize: '100% auto',
		backgroundRepeat: 'no-repeat',
		borderRadius: theme.border.size.md,
		outlineOffset: theme.spacing( 1 ),
		outline: selected ? outline : 'none',
		transition: `all ${ theme.transitions.duration.standard }ms linear`,
		'&:hover': {
			outline,
		},
		backgroundColor: theme.palette.common.white,
	};
} );

export default ScreenshotContainer;
