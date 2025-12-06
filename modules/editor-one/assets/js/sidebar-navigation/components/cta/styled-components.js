import { Box, Button, styled } from '@elementor/ui';

export const CtaContainer = styled( Box )( ( { theme } ) => ( {
	padding: theme.spacing( 2 ),
} ) );

export const CtaButton = styled( Button )( {
	justifyContent: 'center',
} );

CtaButton.defaultProps = {
	variant: 'outlined',
	color: 'promotion',
	fullWidth: true,
};

