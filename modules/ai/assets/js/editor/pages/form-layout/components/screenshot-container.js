import { Box, styled } from '@elementor/ui';

const ScreenshotContainer = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'outlineOffset',
} )( ( { theme, selected, height, disabled, outlineOffset = '0px' } ) => {
	const outline = `${ theme.border.size.sm } ${ theme.border.style.solid } ${ theme.palette.text.primary }`;

	return {
		height,
		cursor: disabled ? 'default' : 'pointer',
		overflow: 'hidden',
		boxSizing: 'border-box',
		backgroundPosition: 'top center',
		backgroundSize: '100% auto',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.palette.common.white,
		borderRadius: theme.border.size.md,
		outlineOffset,
		outline: selected ? outline : 'none',
		opacity: disabled ? '0.4' : '1',
		transition: `all 50ms linear`,
		'&:hover': {
			outline: ( disabled && ! selected ) ? 'none' : outline,
		},
	};
} );

export default ScreenshotContainer;
