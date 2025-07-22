import { Box, Typography, Stack, Button } from '@elementor/ui';
import PropTypes from 'prop-types';
import { XIcon } from '../../shared/components/icons';

const HELP_URL = 'https://go.elementor.com/app-import-download-failed';

export default function ExportError( { statusText } ) {
	const handleTryAgain = () => {
		window.location.href = elementorAppConfig.base_url + '#/export-customization/';
	};

	const handleLearnMore = () => {
		window.open( HELP_URL, '_blank' );
	};

	return (
		<>
			<Box sx={ {
				width: 60,
				height: 60,
				borderRadius: '50%',
				backgroundColor: 'error.main',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				color: 'white',
			} }>
				<XIcon sx={ { fontSize: '24px' } } />
			</Box>

			<Typography variant="h5" component="h2">
				{ statusText }
			</Typography>

			<Typography variant="body1" color="text.secondary">
				{ __( 'We couldn\'t complete the export. Please try again, and if the problem persists, check our help guide for troubleshooting steps.', 'elementor' ) }
			</Typography>

			<Stack direction="row" spacing={ 2 }>
				<Button variant="contained" onClick={ handleTryAgain } data-testid="export-error-try-again-button">
					{ __( 'Try Again', 'elementor' ) }
				</Button>
				<Button variant="outlined" onClick={ handleLearnMore } data-testid="export-error-learn-more-button">
					{ __( 'Learn More', 'elementor' ) }
				</Button>
			</Stack>
		</>
	);
}

ExportError.propTypes = {
	statusText: PropTypes.string.isRequired,
};
