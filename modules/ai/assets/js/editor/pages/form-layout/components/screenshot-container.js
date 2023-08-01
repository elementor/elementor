import { Box, styled } from '@elementor/ui';

const ScreenshotContainer = styled( Box )( ( { theme, selected, height } ) => {
	const outline = `${ theme.border.size.sm } ${ theme.border.style.solid } ${ theme.palette.text.primary }`;

	return {
		height,
		cursor: 'pointer',
		overflow: 'hidden',
		boxSizing: 'border-box',
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'center top',
		borderRadius: theme.border.size.md,
		transition: `all ${ theme.transitions.duration.standard }ms linear`,
		outline: selected ? outline : 'none',
		'&:hover': {
			outline,
		},
	};
} );

export default ScreenshotContainer;
