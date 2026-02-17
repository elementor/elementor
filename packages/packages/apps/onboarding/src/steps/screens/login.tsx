import * as React from 'react';
import { ArrowRightIcon, BrandFacebookIcon } from '@elementor/icons';
import { Box, Button, Divider, IconButton, Paper, Stack, styled, Typography } from '@elementor/ui';

import { StepTitle } from '../../components/ui/styled-components';
import { t } from '../../utils/translations';
import { getOnboardingAssetUrl } from '../step-visuals';

const BACKDROP_OPACITY = 0.6;

interface LoginRootProps {
	backgroundUrl: string;
}

const LoginRoot = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'backgroundUrl',
} )< LoginRootProps >( ( { theme, backgroundUrl } ) => ( {
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

const AuthCard = styled( Paper )( ( { theme } ) => ( {
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

const SignInButton = styled( Button )( ( { theme } ) => ( {
	borderRadius: theme.shape.borderRadius,
	textTransform: 'none',
	fontSize: theme.typography.pxToRem( 15 ),
	fontWeight: 500,
	letterSpacing: '0.46px',
	lineHeight: theme.typography.pxToRem( 26 ),
	padding: theme.spacing( 1, 2.75 ),
} ) );

const SecondaryButton = styled( Button )( ( { theme } ) => ( {
	borderRadius: theme.shape.borderRadius,
	textTransform: 'none',
	fontSize: theme.typography.pxToRem( 15 ),
	fontWeight: 500,
	letterSpacing: '0.46px',
	lineHeight: theme.typography.pxToRem( 26 ),
	padding: theme.spacing( 1, 1.5 ),
} ) );

const GuestButton = styled( Button )( ( { theme } ) => ( {
	textTransform: 'none',
	fontSize: theme.typography.pxToRem( 13 ),
	fontWeight: 500,
	letterSpacing: '0.46px',
	lineHeight: theme.typography.pxToRem( 22 ),
} ) );

const SocialButton = styled( IconButton )( ( { theme } ) => ( {
	borderRadius: 100,
	border: `1px solid ${ theme.palette.divider }`,
	padding: theme.spacing( 1 ),
	backgroundColor: theme.palette.background.paper,
	color: theme.palette.text.primary,
	'&:hover': {
		backgroundColor: theme.palette.background.paper,
	},
} ) );

interface LoginProps {
	onConnect?: () => void;
	onContinueAsGuest?: () => void;
	connectUrl?: string;
}

const backgroundUrl = getOnboardingAssetUrl( 'login.png' );

export function Login( { onConnect, onContinueAsGuest, connectUrl }: LoginProps ) {
	return (
		<LoginRoot backgroundUrl={ backgroundUrl } data-testid="login-screen">
			<Backdrop />
			<AuthCard elevation={ 24 }>
				<StepTitle variant="h5" align="center">
					{ t( 'login.title' ) }
				</StepTitle>
				<Stack spacing={ 3 } width="100%">
					<SignInButton
						variant="contained"
						color="primary"
						fullWidth
						size="large"
						href={ connectUrl || undefined }
						onClick={ onConnect }
					>
						{ t( 'login.sign_in' ) }
					</SignInButton>

					<Stack direction="row" alignItems="center" justifyContent="center" spacing={ 2 }>
						<Divider sx={ { width: 80 } } />
						<Typography variant="body2" color="text.tertiary">
							{ t( 'common.or' ) }
						</Typography>
						<Divider sx={ { width: 80 } } />
					</Stack>

					<Stack spacing={ 6 }>
						<Stack spacing={ 2 } alignItems="center">
							<SecondaryButton
								variant="text"
								color="secondary"
								fullWidth
								size="large"
								endIcon={ <ArrowRightIcon fontSize="tiny" /> }
							>
								{ t( 'login.continue_another_way' ) }
							</SecondaryButton>

							<Stack direction="row" spacing={ 0.5 }>
								<SocialButton>
									<BrandFacebookIcon fontSize="small" />
								</SocialButton>
							</Stack>
						</Stack>

						<GuestButton variant="text" color="info" onClick={ onContinueAsGuest }>
							{ t( 'login.continue_as_guest' ) }
						</GuestButton>
					</Stack>
				</Stack>
			</AuthCard>
		</LoginRoot>
	);
}
