import { useEffect, useRef, useState } from 'react';
import { Stack, Button, Typography, Link, Checkbox, Divider } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { AIIcon } from '@elementor/icons';

const ConnectAndGetStarted = ( { connectUrl, onSuccess, isConnected, getStartedAction } ) => {
	const approveButtonRef = useRef();
	const [ isTermsChecked, setIsTermsChecked ] = useState( false );

	useEffect( () => {
		// On local dev (as a standalone app), the connect lib is not loaded.
		if ( ! jQuery.fn.elementorConnect ) {
			return;
		}

		jQuery( approveButtonRef.current ).elementorConnect( {
			// Success: ( _, data ) => onSuccess( data ).then( onSuccess ),
			success: ( _, data ) => {
				onSuccess( data );
			},
			error: () => {
				throw new Error( 'Elementor AI: Failed to connect.' );
			},
		} );
	}, [] );

	return (
		<Stack alignItems="center" gap={ 2 }>
			<AIIcon sx={ { color: 'text.primary', fontSize: '60px', mb: 1 } } />

			<Typography variant="h4" sx={ { color: 'text.primary' } }>{ __( 'Step into the future with Elementor AI', 'elementor' ) }</Typography>

			<Typography variant="body2">{ __( 'Create websites faster with AI built right into the Editor.', 'elementor' ) }</Typography>

			<Divider sx={ { mt: 2, ml: 2, mr: 2, height: '1px', width: '50%' } } />

			<Stack direction="row" gap={ 1.5 } alignItems="flex-start" >
				<Checkbox id="e-ai-terms-approval" color="secondary" checked={ isTermsChecked } onClick={ () => setIsTermsChecked( ( prevState ) => ! prevState ) } />
				<Stack>
					<Typography variant="caption" sx={ { maxWidth: 520 } } component="label" htmlFor="e-ai-terms-approval">
						{ __( 'I approve the ', 'elementor' ) }
						<Link href="https://go.elementor.com/ai-terms/" target="_blank" color="info.main">{ __( 'Terms of Service', 'elementor' ) }</Link>
						{ ' & ' }
						<Link href="https://go.elementor.com/ai-privacy-policy/" target="_blank" color="info.main">{ __( 'Privacy Policy', 'elementor' ) }</Link>
						{ __( ' of the Elementor AI service. ', 'elementor' ) }
						{ __( 'This includes consenting to the collection and use of data to improve user experience.', 'elementor' ) }
					</Typography>
				</Stack>
			</Stack>

			{ isConnected
				?				<Button disabled={ ! isTermsChecked } variant="contained" onClick={ getStartedAction } sx={ {
					mt: 1,
					'&:hover': {
						color: 'primary.contrastText',
					},
				} }
				>
					{ __( 'Get Started', 'elementor' ) }
				</Button>
				:				<Button ref={ approveButtonRef } disabled={ ! isTermsChecked } href={ connectUrl } variant="contained" sx={ {
					mt: 1,
					'&:hover': {
						color: 'primary.contrastText',
					},
				} }
				>
					{ __( 'Connect', 'elementor' ) }
				</Button>
			}
		</Stack>
	);
};

ConnectAndGetStarted.propTypes = {
	connectUrl: PropTypes.string.isRequired,
	onSuccess: PropTypes.func.isRequired,
	isConnected: PropTypes.bool.isRequired,
	getStartedAction: PropTypes.func.isRequired,
};

export default ConnectAndGetStarted;
