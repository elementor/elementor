import * as React from 'react';
import { ChevronRightIcon } from '@elementor/icons';
import type { Theme } from '@elementor/ui';
import { Box, Divider, Stack, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { FullscreenCard, PrimaryButton, SecondaryButton, TextButton } from '../../components/fullscreen-card';
import { AppleIcon, FacebookIcon, GoogleIcon } from '../components/login/social-icons';

const SocialIcon = styled( Box )( ( { theme } ) => ( {
	borderRadius: 100,
	border: `1px solid ${ theme.palette.divider }`,
	padding: theme.spacing( 1 ),
	backgroundColor: theme.palette.secondary.contrastText,
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
} ) );

interface LoginProps {
	onConnect?: () => void;
	onContinueAsGuest?: () => void;
}

export function Login( { onConnect, onContinueAsGuest }: LoginProps ) {
	return (
		<FullscreenCard data-testid="login-screen">
			<Typography variant="h5" align="center" fontWeight={ 500 } fontFamily="Poppins">
				{ __( "Let's get to work.", 'elementor' ) }
			</Typography>
			<Stack spacing={ 3 } width="100%">
				<PrimaryButton variant="contained" color="primary" fullWidth size="large" onClick={ onConnect }>
					{ __( 'Sign in to Elementor', 'elementor' ) }
				</PrimaryButton>

				<Stack direction="row" alignItems="center" justifyContent="center" spacing={ 2 }>
					<Divider sx={ { width: 80 } } />
					<Typography variant="body2" color="text.tertiary">
						{ __( 'OR', 'elementor' ) }
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
							endIcon={ <ChevronRightIcon fontSize="tiny" /> }
							onClick={ onConnect }
						>
							{ __( 'Continue another way', 'elementor' ) }
						</SecondaryButton>

						<Stack direction="row">
							<SocialIcon>
								<GoogleIcon />
							</SocialIcon>
							<SocialIcon sx={ { marginInlineStart: '-10px' } }>
								<FacebookIcon />
							</SocialIcon>
							<SocialIcon sx={ ( theme: Theme ) => ( { marginInlineStart: '-10px', color: theme.palette.text.primary } ) }>
								<AppleIcon />
							</SocialIcon>
						</Stack>
					</Stack>

					<TextButton variant="text" color="info" onClick={ onContinueAsGuest }>
						{ __( 'Continue as a guest', 'elementor' ) }
					</TextButton>
				</Stack>
			</Stack>
		</FullscreenCard>
	);
}
