import { useState } from 'react';
import { Stack, Typography, Button, Link, Checkbox } from '@elementor/ui';
import { setGetStarted } from '../../api';
import { AIIcon } from '@elementor/icons';

const GetStarted = ( { onSuccess } ) => {
	const [ isTermsChecked, setIsTermsChecked ] = useState( false );

	const onGetStartedClick = async () => {
		await setGetStarted();

		onSuccess();
	};

	return (
		<Stack alignItems="center" gap={ 4 }>
			<AIIcon sx={ { color: 'white', fontSize: '60px', mb: 3 } } />

			<Typography variant="h4">{ __( 'Step into the future with Elementor AI', 'elementor' ) }</Typography>

			<Typography variant="body2">{ __( 'Create smarter with AI text and code generators built right into the editor.', 'elementor' ) }</Typography>

			<Stack direction="row" gap={ 4 } alignItems="flex-start">
				<Checkbox color="secondary" sx={ { p: 0 } } onChange={ () => setIsTermsChecked( ( prevState ) => ! prevState ) } />

				<Typography variant="caption" sx={ { maxWidth: 520 } }>
					{ __( 'By clicking "Get Started", I approve the ', 'elementor' ) }
					<Link href="https://go.elementor.com/ai-terms/" target="_blank" color="info.main">{ __( 'Terms of Service', 'elementor' ) }</Link>
					{ ' & ' }
					<Link href="https://go.elementor.com/ai-privacy-policy/" target="_blank" color="info.main">{ __( 'Privacy Policy', 'elementor' ) }</Link>
					{ __( ' of the Elementor AI service. This includes consenting to the collection and use of data to improve user experience.', 'elementor' ) }
				</Typography>
			</Stack>

			<Button
				disabled={ ! isTermsChecked }
				variant="contained"
				onClick={ onGetStartedClick }
				sx={ {
					mt: 3,
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

export default GetStarted;
