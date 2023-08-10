import { memo } from 'react';
import { Box, styled } from '@elementor/ui';

const ScreenshotContainer = styled( Box )( ( { theme, selected, height, disabled } ) => {
	const outline = `${ theme.border.size.sm } ${ theme.border.style.solid } ${ theme.palette.text.primary }`;

	return {
		height,
		cursor: disabled ? 'default' : 'pointer',
		overflow: 'hidden',
		boxSizing: 'border-box',
		backgroundPosition: 'center',
		backgroundSize: '100% auto',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.palette.common.white,
		borderRadius: theme.border.size.md,
		outlineOffset: theme.spacing( 1 ),
		outline: selected ? outline : 'none',
		opacity: disabled ? '0.4' : '1',
		transition: `all ${ theme.transitions.duration.standard }ms linear`,
		'&:hover': {
			outline: ( disabled && ! selected ) ? 'none' : outline,
		},
	};
} );

export default memo( ScreenshotContainer );
