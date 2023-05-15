import { useEffect, useRef } from 'react';
import { Stack, Button, Typography, Link } from '@elementor/ui';
import { AIIcon } from '@elementor/icons';

const Connect = ( { connectUrl, onSuccess } ) => {
	const approveButtonRef = useRef();

	useEffect( () => {
		jQuery( approveButtonRef.current ).elementorConnect( {
			success: ( _, data ) => onSuccess( data ),
			error: () => {
				throw new Error( 'Elementor AI: Failed to connect.' );
			},
		} );
	}, [] );

	return (
		<Stack alignItems="center" gap={ 5 }>
			<AIIcon sx={ { color: 'text.primary', fontSize: '60px', mb: 3 } } />

			<Typography variant="h4" sx={ { color: 'text.primary' } }>{ __( 'Step into the future with Elementor AI', 'elementor' ) }</Typography>

			<Typography variant="body2">{ __( 'Create smarter with AI text and code generators built right into the editor.', 'elementor' ) }</Typography>

			<Typography variant="caption" sx={ { maxWidth: 520, textAlign: 'center' } }>
				{ __( 'By clicking "Connect", I approve the ', 'elementor' ) }
				<Link href="https://go.elementor.com/ai-terms/" target="_blank" color="info.main">{ __( 'Terms of Service', 'elementor' ) }</Link>
				{ ' & ' }
				<Link href="https://go.elementor.com/ai-privacy-policy/" target="_blank" color="info.main">{ __( 'Privacy Policy', 'elementor' ) }</Link>
				{ __( ' of the Elementor AI service.', 'elementor' ) }
			</Typography>

			<Button
				ref={ approveButtonRef }
				href={ connectUrl }
				variant="contained"
				sx={ {
					mt: 3,
					'&:hover': {
						color: 'primary.contrastText',
					},
				} }
			>
				{ __( 'Connect', 'elementor' ) }
			</Button>
		</Stack>
	);
};

Connect.propTypes = {
	connectUrl: PropTypes.string.isRequired,
	onSuccess: PropTypes.func.isRequired,
};

export default Connect;
