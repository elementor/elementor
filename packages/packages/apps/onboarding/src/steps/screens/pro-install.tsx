import * as React from 'react';
import { useCallback } from 'react';
import { CircularProgress, Stack, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { FullscreenCard, PrimaryButton, TextButton } from '../../components/fullscreen-card';
import { useInstallPro } from '../../hooks/use-install-pro';
import { useOnboarding } from '../../hooks/use-onboarding';
import { getOnboardingAssetUrl } from '../step-visuals';

const ProLogo = styled( 'img' )( ( { theme } ) => ( {
	maxWidth: 200,
	height: 'auto',
	margin: theme.spacing( 1, 0 ),
} ) );

export function ProInstall() {
	const { actions } = useOnboarding();
	const installPro = useInstallPro();

	const handleInstall = useCallback( () => {
		installPro.mutate( undefined, {
			onSuccess: () => {
				actions.markProInstalled();
			},
		} );
	}, [ installPro, actions ] );

	const handleDismiss = useCallback( () => {
		actions.dismissProInstallScreen();
	}, [ actions ] );

	const isInstalling = installPro.isPending;
	const error = installPro.error?.message ?? null;

	return (
		<FullscreenCard data-testid="pro-install-screen">
			<Typography variant="h5" align="center" fontWeight={ 500 } fontFamily="Poppins">
				{ __( 'You already have a Pro subscription', 'elementor' ) }
			</Typography>

			<Typography variant="body2" align="center" color="text.secondary">
				{ isInstalling
					? __( 'Installing Elementor Pro…', 'elementor' )
					: __( 'Would you like to install it on this site now?', 'elementor' ) }
			</Typography>

			<ProLogo
				src={ getOnboardingAssetUrl( 'install-pro-logo.png' ) }
				alt={ __( 'Elementor + Elementor Pro', 'elementor' ) }
			/>

			{ error && (
				<Typography variant="body2" align="center" color="error">
					{ error }
				</Typography>
			) }

			<Stack spacing={ 2 } width="100%" alignItems="center">
				<PrimaryButton
					variant="contained"
					color="primary"
					fullWidth
					size="large"
					onClick={ handleInstall }
					disabled={ isInstalling }
					startIcon={ isInstalling ? <CircularProgress size={ 18 } color="inherit" /> : undefined }
				>
					{ isInstalling ? __( 'Installing…', 'elementor' ) : __( 'Install Pro on this site', 'elementor' ) }
				</PrimaryButton>

				<TextButton variant="text" color="info" onClick={ handleDismiss } disabled={ isInstalling }>
					{ __( "I'll do it later", 'elementor' ) }
				</TextButton>
			</Stack>
		</FullscreenCard>
	);
}
