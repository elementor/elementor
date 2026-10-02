import { useState } from 'react';
import Alert from '@elementor/ui/Alert';
import Box from '@elementor/ui/Box';
import Button from '@elementor/ui/Button';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';

import { activateAgentsReady } from '../api';
import { PageTitle } from './page-title';
import { WelcomeIllustration } from './welcome-illustration';

export const WelcomeScreen = () => {
	const [ isActivating, setIsActivating ] = useState( false );
	const [ hasError, setHasError ] = useState( false );

	const handleActivate = async () => {
		setHasError( false );
		setIsActivating( true );

		try {
			await activateAgentsReady();
			window.location.reload();
		} catch {
			setHasError( true );
			setIsActivating( false );
		}
	};

	return (
		<Stack alignItems="center" spacing={ 3 } pt={ 6 }>
			<PageTitle />
			<WelcomeIllustration />
			<Stack alignItems="center" spacing={ 0.5 } textAlign="center">
				<Typography variant="h6">
					{ __( 'Optimize your site for AI agents', 'elementor' ) }
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={ { maxWidth: 254 } }>
					{ __( 'Enable discovery, access controls, and Markdown tools in one click.', 'elementor' ) }
				</Typography>
			</Stack>
			<Button
				variant="contained"
				color="primary"
				size="medium"
				loading={ isActivating }
				onClick={ handleActivate }
			>
				{ __( 'Activate', 'elementor' ) }
			</Button>
			{ hasError && (
				<Box sx={ { maxWidth: 360 } }>
					<Alert severity="error" variant="standard" size="small">
						{ __( 'Activation failed. Please try again.', 'elementor' ) }
					</Alert>
				</Box>
			) }
		</Stack>
	);
};

