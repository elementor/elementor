import * as React from 'react';
import { Box, Button, Divider, Paper, Stack, styled, Typography } from '@elementor/ui';

import { FullscreenCard, PrimaryButton, TextButton } from '../../components/fullscreen-card';
import { t } from '../../utils/translations';
import { AppleIcon, FacebookIcon, GoogleIcon } from '../components/login/social-icons';

const StyledButton = styled( Button )( ( { theme } ) => ( {
	width: '100%',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	flexWrap: 'wrap',
	padding: theme.spacing( 1.5, 3 ),
	gap: theme.spacing( 1 ),
	border: `1px solid ${ theme.palette.divider }`,
	borderRadius: theme.shape.borderRadius,
	color: theme.palette.text.primary,
	textTransform: 'none',
	backgroundColor: 'transparent',
	minHeight: 48,
	'&:hover': {
		backgroundColor: theme.palette.action.hover,
		borderColor: theme.palette.text.primary,
	},
} ) );

const SocialIconWrapper = styled( Paper )( ( { theme } ) => ( {
	width: 28,
	height: 28,
	borderRadius: '50%',
	border: `1px solid ${ theme.palette.divider }`,
	boxShadow: 'none',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	flexWrap: 'wrap',
	marginLeft: -8,
	'&:first-of-type': {
		marginLeft: 0,
		zIndex: 1,
	},
	'&:nth-of-type(2)': {
		zIndex: 2,
	},
	'&:nth-of-type(3)': {
		zIndex: 3,
	},
	'& svg': {
		width: 16,
		height: 16,
	},
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
						<StyledButton onClick={ onConnect } variant="outlined" color="secondary">
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
						</StyledButton>
					</Stack>

					<TextButton variant="text" color="info" onClick={ onContinueAsGuest }>
						{ t( 'login.continue_as_guest' ) }
					</TextButton>
				</Stack>
			</Stack>
		</FullscreenCard>
	);
}
