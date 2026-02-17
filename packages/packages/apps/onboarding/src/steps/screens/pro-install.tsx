import * as React from 'react';
import { Box, Button, CircularProgress, Paper, Stack, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getOnboardingAssetUrl } from '../step-visuals';

const BACKDROP_OPACITY = 0.6;

interface ProInstallRootProps {
	backgroundUrl: string;
}

const ProInstallRoot = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'backgroundUrl',
} )< ProInstallRootProps >( ( { theme, backgroundUrl } ) => ( {
	position: 'relative',
	minHeight: '100%',
	width: '100%',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: theme.spacing( 4 ),
	backgroundImage: `url(${ backgroundUrl })`,
	backgroundSize: 'cover',
	backgroundPosition: 'center',
	backgroundRepeat: 'no-repeat',
} ) );

const Backdrop = styled( Box )( ( { theme } ) => ( {
	position: 'absolute',
	inset: 0,
	backgroundColor: theme.palette.text.primary,
	opacity: BACKDROP_OPACITY,
} ) );

const ProCard = styled( Paper )( ( { theme } ) => ( {
	width: 512,
	maxWidth: '90%',
	padding: theme.spacing( 6, 6, 5 ),
	borderRadius: theme.shape.borderRadius * 2,
	boxShadow: theme.shadows[ 24 ],
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: theme.spacing( 3 ),
	position: 'relative',
	zIndex: 1,
} ) );

const InstallButton = styled( Button )( ( { theme } ) => ( {
	borderRadius: theme.shape.borderRadius,
	textTransform: 'none',
	fontSize: theme.typography.pxToRem( 15 ),
	fontWeight: 500,
	letterSpacing: '0.46px',
	lineHeight: theme.typography.pxToRem( 26 ),
	padding: theme.spacing( 1, 2.75 ),
} ) );

const SkipButton = styled( Button )( ( { theme } ) => ( {
	textTransform: 'none',
	fontSize: theme.typography.pxToRem( 13 ),
	fontWeight: 500,
	letterSpacing: '0.46px',
	lineHeight: theme.typography.pxToRem( 22 ),
} ) );

const ProLogo = styled( 'img' )( ( { theme } ) => ( {
	maxWidth: 200,
	height: 'auto',
	margin: theme.spacing( 1, 0 ),
} ) );

interface ProInstallProps {
	onInstall?: () => void;
	onSkip?: () => void;
	isInstalling?: boolean;
	error?: string | null;
}

const backgroundUrl = getOnboardingAssetUrl( 'login.png' );

export function ProInstall( { onInstall, onSkip, isInstalling, error }: ProInstallProps ) {
	return (
		<ProInstallRoot backgroundUrl={ backgroundUrl } data-testid="pro-install-screen">
			<Backdrop />
			<ProCard elevation={ 24 }>
				<Typography variant="h5" align="center" fontWeight={ 500 } fontFamily="Poppins">
					{ __( 'You already have a Pro subscription', 'elementor' ) }
				</Typography>

				<Typography variant="body2" align="center" color="text.secondary">
					{ isInstalling
						? __( 'Installing Elementor Pro...', 'elementor' )
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
					<InstallButton
						variant="contained"
						color="primary"
						fullWidth
						size="large"
						onClick={ onInstall }
						disabled={ isInstalling }
						startIcon={ isInstalling ? <CircularProgress size={ 18 } color="inherit" /> : undefined }
					>
						{ isInstalling
							? __( 'Installing...', 'elementor' )
							: __( 'Install Pro on this site', 'elementor' ) }
					</InstallButton>

					<SkipButton variant="text" color="info" onClick={ onSkip } disabled={ isInstalling }>
						{ __( "I'll do it later", 'elementor' ) }
					</SkipButton>
				</Stack>
			</ProCard>
		</ProInstallRoot>
	);
}
