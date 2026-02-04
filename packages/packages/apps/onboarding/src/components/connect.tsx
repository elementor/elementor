import * as React from 'react';
import { ArrowRightIcon, BrandFacebookIcon } from '@elementor/icons';
import {
	Box,
	Button,
	Divider,
	IconButton,
	Paper,
	Stack,
	styled,
	Typography,
} from '@elementor/ui';

const ConnectRoot = styled( Box )( ( { theme } ) => ( {
	position: 'relative',
	minHeight: '100%',
	width: '100%',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: theme.palette.background.default,
	padding: theme.spacing( 4 ),
} ) );

const Backdrop = styled( Box )( ( { theme } ) => ( {
	position: 'absolute',
	inset: 0,
	backgroundColor: theme.palette.text.primary,
	opacity: 0.6,
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

interface ConnectProps {
	onConnect?: () => void;
	onContinueAsGuest?: () => void;
	connectUrl?: string;
}

export function Connect( {
	onConnect,
	onContinueAsGuest,
	connectUrl,
}: ConnectProps ) {
	return (
		<ConnectRoot>
			<Backdrop />
			<AuthCard elevation={ 24 }>
				<Typography variant="h5" align="center">
					Let’s get to work.
				</Typography>
				<Stack spacing={ 3 } width="100%">
					<SignInButton
						variant="contained"
						color="primary"
						fullWidth
						size="large"
						href={ connectUrl || undefined }
						onClick={ onConnect }
					>
						Sign in to Elementor
					</SignInButton>

					<Stack
						direction="row"
						alignItems="center"
						justifyContent="center"
						spacing={ 2 }
					>
						<Divider sx={ { width: 80 } } />
						<Typography variant="body2" color="text.tertiary">
							OR
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
								Continue another way
							</SecondaryButton>

							<Stack direction="row" spacing={ 0.5 }>
								<SocialButton>
									<BrandFacebookIcon fontSize="small" />
								</SocialButton>
							</Stack>
						</Stack>

						<GuestButton
							variant="text"
							color="info"
							onClick={ onContinueAsGuest }
						>
							Continue as a guest
						</GuestButton>
					</Stack>
				</Stack>
			</AuthCard>
		</ConnectRoot>
	);
}
