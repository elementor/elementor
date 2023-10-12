import { Stack, styled } from '@elementor/ui';

const OverlayBar = styled( Stack )( ( { theme, position } ) => {
	const style = {
		width: '100%',
		position: 'absolute',
		left: 0,
		padding: theme.spacing( 2.5 ),
	};

	if ( 'top' === position ) {
		style.top = 0;
	} else if ( 'bottom' === position ) {
		style.bottom = 0;
	}

	return style;
} );

export default OverlayBar;
