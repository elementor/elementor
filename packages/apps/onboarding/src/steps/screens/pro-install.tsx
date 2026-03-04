import * as React from 'react';
import { useCallback } from 'react';
import { CircularProgress, Stack, styled, Typography } from '@elementor/ui';

import { FullscreenCard, PrimaryButton, TextButton } from '../../components/fullscreen-card';
import { useToast } from '../../components/toast/toast-context';
import { useInstallPro } from '../../hooks/use-install-pro';
import { useOnboarding } from '../../hooks/use-onboarding';
import { trackOnboardingError } from '../../utils/error-tracking';
import { t } from '../../utils/translations';
import { getOnboardingAssetUrl } from '../step-visuals';

const ProLogo = styled( 'img' )( ( { theme } ) => ( {
	maxWidth: 200,
	height: 'auto',
	margin: theme.spacing( 1, 0 ),
} ) );

export function ProInstall() {
	const { actions } = useOnboarding();
	const installPro = useInstallPro();
	const { showToast } = useToast();

	const handleInstall = useCallback( () => {
		installPro.mutate( undefined, {
			onSuccess: () => {
				actions.markProInstalled();
			},
			onError: ( error ) => {
				trackOnboardingError( 'pro_install_failed', { message: error.message } );
				showToast( t( 'error.pro_install_failed' ) );
				actions.dismissProInstallScreen();
			},
		} );
	}, [ installPro, actions, showToast ] );

	const handleDismiss = useCallback( () => {
		actions.dismissProInstallScreen();
	}, [ actions ] );

	const isInstalling = installPro.isPending;

	return (
		<FullscreenCard data-testid="pro-install-screen">
			<Typography variant="h5" align="center" fontWeight={ 500 } fontFamily="Poppins">
				{ t( 'pro_install.title' ) }
			</Typography>

			<Typography variant="body2" align="center" color="text.secondary">
				{ isInstalling ? t( 'pro_install.installing' ) : t( 'pro_install.subtitle' ) }
			</Typography>

			<ProLogo src={ getOnboardingAssetUrl( 'install-pro-logo.png' ) } alt={ t( 'pro_install.logo_alt' ) } />

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
					{ isInstalling ? t( 'pro_install.installing_short' ) : t( 'pro_install.install_button' ) }
				</PrimaryButton>

				<TextButton variant="text" color="info" onClick={ handleDismiss } disabled={ isInstalling }>
					{ t( 'pro_install.do_it_later' ) }
				</TextButton>
			</Stack>
		</FullscreenCard>
	);
}
