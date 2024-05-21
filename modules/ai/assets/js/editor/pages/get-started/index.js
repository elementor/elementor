import { useState } from 'react';
import { Stack, Typography, Button, Link, Checkbox, InputLabel } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { setGetStarted } from '../../api';
import { AIIcon } from '@elementor/icons';

const GetStarted = ( { onSuccess } ) => {
	const [ isTermsChecked, setIsTermsChecked ] = useState( false );

	const onGetStartedClick = async () => {
		await setGetStarted();

		onSuccess();
	};

	return (
		<Stack alignItems="center" gap={ 1.5 }>
			<AIIcon sx={ { color: 'text.primary', fontSize: '60px', mb: 1 } } />

			<Typography variant="h4" sx={ { color: 'text.primary' } }>{ __( 'Step into the future with Elementor AI', 'elementor' ) }</Typography>

			<Typography variant="body2">{ __( 'Create smarter with AI text and code generators built right into the editor.', 'elementor' ) }</Typography>

			<Stack direction="row" gap={ 1.5 } alignItems="flex-start" >
				<InputLabel onClick={ () => setIsTermsChecked( ( prevState ) => ! prevState ) }>
					<Checkbox id="e-ai-terms-approval" color="secondary" checked={ isTermsChecked } />
					<Stack>
						<Typography variant="caption" sx={ { maxWidth: 520 } } component="label" htmlFor="e-ai-terms-approval">
							{ __( 'I approve the ', 'elementor' ) }
							<Link href="https://go.elementor.com/ai-terms/" target="_blank" color="info.main">{ __( 'Terms of Service', 'elementor' ) }</Link>
							{ ' & ' }
							<Link href="https://go.elementor.com/ai-privacy-policy/" target="_blank" color="info.main">{ __( 'Privacy Policy', 'elementor' ) }</Link>
							{ __( ' of the Elementor AI service.', 'elementor' ) }
							<br />
							{ __( 'This includes consenting to the collection and use of data to improve user experience.', 'elementor' ) }
						</Typography>
					</Stack>
				</InputLabel>
			</Stack>

			<Button
				disabled={ ! isTermsChecked }
				variant="contained"
				onClick={ onGetStartedClick }
				sx={ {
					mt: 1,
					'&:hover': {
						color: 'primary.contrastText',
					},
				} }
			>
				{ __( 'Get Started', 'elementor' ) }
			</Button>
		</Stack>
	);
};

GetStarted.propTypes = {
	onSuccess: PropTypes.func.isRequired,
};

export default GetStarted;
