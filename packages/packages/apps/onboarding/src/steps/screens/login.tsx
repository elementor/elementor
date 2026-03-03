import * as React from 'react';
import { ChevronRightIcon } from '@elementor/icons';
import { Box, Divider, Image, Stack, styled, Typography } from '@elementor/ui';

import { FullscreenCard, PrimaryButton, SecondaryButton, TextButton } from '../../components/fullscreen-card';
import { t } from '../../utils/translations';
import { getOnboardingAssetUrl } from '../step-visuals';

const SocialIcon = styled( Box )( ( { theme } ) => ( {
	borderRadius: 100,
	border: `1px solid ${ theme.palette.divider }`,
	padding: theme.spacing( 1 ),
	backgroundColor: theme.palette.common.white,
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
				{ t( 'login.title' ) }
			</Typography>
			<Stack spacing={ 3 } width="100%">
				<PrimaryButton variant="contained" color="primary" fullWidth size="large" onClick={ onConnect }>
					{ t( 'login.sign_in' ) }
				</PrimaryButton>

				<Stack direction="row" alignItems="center" justifyContent="center" spacing={ 2 }>
					<Divider sx={ { width: 80 } } />
					<Typography variant="body2" color="text.tertiary">
						{ t( 'login.or' ) }
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
							{ t( 'login.continue_another_way' ) }
						</SecondaryButton>

						<Stack direction="row">
							<SocialIcon>
								<Image src={ getOnboardingAssetUrl( 'google.svg' ) } alt="Google" variant="circle" />
							</SocialIcon>
							<SocialIcon sx={ { marginInlineStart: '-10px' } }>
								<Image
									src={ getOnboardingAssetUrl( 'facebook.svg' ) }
									alt="Facebook"
									variant="circle"
								/>
							</SocialIcon>
							<SocialIcon sx={ { marginInlineStart: '-10px' } }>
								<Image src={ getOnboardingAssetUrl( 'apple.svg' ) } alt="Apple" variant="circle" />
							</SocialIcon>
						</Stack>
					</Stack>

					<TextButton variant="text" color="info" onClick={ onContinueAsGuest }>
						{ t( 'login.continue_as_guest' ) }
					</TextButton>
				</Stack>
			</Stack>
		</FullscreenCard>
	);
}
