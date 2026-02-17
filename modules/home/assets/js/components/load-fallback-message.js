import { Container, Box, Paper, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const LoadFallbackMessage = () => (
	<Box>
		<Container disableGutters={ true } maxWidth="lg" sx={ { px: { xs: 1.5, md: 4 }, pt: 4 } }>
			<Paper elevation={ 0 } sx={ { py: 4, px: 4, borderRadius: 1, border: '1px solid rgba(0, 0, 0, 0.12)', textAlign: 'center' } }>
				<Typography variant="body1" color="text.secondary">
					{ __( "We couldn't load this content right now. Please try again later.", 'elementor' ) }
				</Typography>
			</Paper>
		</Container>
	</Box>
);

export default LoadFallbackMessage;
