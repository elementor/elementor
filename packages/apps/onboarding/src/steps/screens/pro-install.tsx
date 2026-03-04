import * as React from 'react';
import { useCallback } from 'react';
import { CircularProgress, Stack, styled, Typography } from '@elementor/ui';

import { FullscreenCard, PrimaryButton, TextButton } from '../../components/fullscreen-card';
import { useInstallPro } from '../../hooks/use-install-pro';
import { useOnboarding } from '../../hooks/use-onboarding';
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

	const handleInstall = useCallback( () => {
		installPro.mutate( undefined, {
			onSuccess: () => {
				actions.markProInstalled();
			},
		} );
	}, [ installPro, actions ] );

	const handleDismiss = useCallback(
		( event: React.SyntheticEvent ) => {
			event.preventDefault();
			actions.dismissProInstallScreen();
		},
		[ actions ]
	);

	const isInstalling = installPro.isPending;
	const error = installPro.error?.message ?? null;

	return (
		<FullscreenCard data-testid="pro-install-screen">
			<Typography
				variant="h5"
				color="text.primary"
				align="center"
				fontWeight={ 500 }
				fontFamily="Poppins"
				marginBottom={ -2 }
			>
				{ t( 'pro_install.title' ) }
			</Typography>

			<Typography variant="body2" align="center" color="text.secondary">
				{ isInstalling ? t( 'pro_install.installing' ) : t( 'pro_install.subtitle' ) }
			</Typography>

			<ProLogo src={ getOnboardingAssetUrl( 'install-pro-logo.png' ) } alt={ t( 'pro_install.logo_alt' ) } />

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
					{ isInstalling ? t( 'pro_install.installing_short' ) : t( 'pro_install.install_button' ) }
				</PrimaryButton>

				<TextButton
					href={ '#' }
					align="center"
					onClick={ ( event: React.SyntheticEvent ) => handleDismiss?.( event ) }
					disabled={ isInstalling }
				>
					{ t( 'pro_install.do_it_later' ) }
				</TextButton>
			</Stack>
		</FullscreenCard>
	);
}
