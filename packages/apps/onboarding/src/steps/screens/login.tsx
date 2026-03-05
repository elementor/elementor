import * as React from 'react';
import { Box, Stack, Typography, useTheme } from '@elementor/ui';

import {
	FullscreenCard,
	PrimaryButton,
	SecondaryButton,
	SocialIconWrapper,
	TextButton,
} from '../../components/fullscreen-card';
import { ElementorIcon } from '../../components/ui/elementor-icon';
import { AppleIcon, FacebookIcon, GoogleIcon } from '../../icons';
import { t } from '../../utils/translations';

interface LoginProps {
	onConnect?: () => void;
	onContinueAsGuest?: (event: React.SyntheticEvent) => void;
}

export function Login({ onConnect, onContinueAsGuest }: LoginProps) {
	const theme = useTheme();

	return (
		<FullscreenCard data-testid="login-screen">
			<Stack display="flex" alignItems="center" marginBottom={-1}>
				<ElementorIcon sx={{ width: 32, height: 32 }} />
			</Stack>
			<Typography variant="h5" color="text.primary" align="center" fontWeight={500} fontFamily="Poppins">
				{t('login.title')}
			</Typography>
			<Stack width="100%" gap={theme.spacing(2)}>
				<PrimaryButton variant="contained" color="primary" fullWidth size="large" onClick={onConnect}>
					{t('login.sign_in')}
				</PrimaryButton>

				<Stack spacing={6}>
					<Stack spacing={2} alignItems="center">
						<SecondaryButton onClick={onConnect} variant="outlined" color="primary" fullWidth>
							<Box display="flex" alignItems="center">
								<SocialIconWrapper elevation={24}>
									<GoogleIcon />
								</SocialIconWrapper>
								<SocialIconWrapper elevation={24}>
									<FacebookIcon />
								</SocialIconWrapper>
								<SocialIconWrapper elevation={24}>
									<AppleIcon />
								</SocialIconWrapper>
							</Box>
							<Typography variant="button" fontWeight="500">
								{t('login.continue_another_way')}
							</Typography>
						</SecondaryButton>
					</Stack>

					<TextButton
						href={'#'}
						color="info.main"
						align="center"
						variant="body2"
						onClick={(event: React.SyntheticEvent) => onContinueAsGuest?.(event)}
						sx={{ textDecoration: 'none' }}
					>
						{t('login.continue_as_guest')}
					</TextButton>
				</Stack>
			</Stack>
		</FullscreenCard>
	);
}
