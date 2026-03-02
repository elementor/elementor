import * as React from 'react';
import { Box, Divider, Stack, Typography } from '@elementor/ui';

import {
	FullscreenCard,
	PrimaryButton,
	SecondaryButton,
	SocialIconWrapper,
	TextButton,
} from '../../components/fullscreen-card';
import { t } from '../../utils/translations';
import { AppleIcon, FacebookIcon, GoogleIcon } from '../components/login/social-icons';

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
						<SecondaryButton onClick={ onConnect } variant="outlined" color="primary" fullWidth>
							<Box display="flex" alignItems="center">
								<SocialIconWrapper elevation={ 24 }>
									<GoogleIcon />
								</SocialIconWrapper>
								<SocialIconWrapper elevation={ 24 }>
									<FacebookIcon />
								</SocialIconWrapper>
								<SocialIconWrapper elevation={ 24 }>
									<AppleIcon />
								</SocialIconWrapper>
							</Box>
							<Typography variant="button" fontWeight="500">
								{ t( 'login.continue_another_way' ) }
							</Typography>
						</SecondaryButton>
					</Stack>

					<TextButton variant="text" color="info" onClick={ onContinueAsGuest }>
						{ t( 'login.continue_as_guest' ) }
					</TextButton>
				</Stack>
			</Stack>
		</FullscreenCard>
	);
}
