import * as React from 'react';
import { Box, Stack, styled, Typography } from '@elementor/ui';

import { t } from '../../utils/translations';

const PROGRESS_BAR_WIDTH = 192;

const ProgressTrack = styled( Box )( ( { theme } ) => ( {
	width: PROGRESS_BAR_WIDTH,
	height: 4,
	borderRadius: 22,
	backgroundColor: theme.palette.action.hover,
	position: 'relative',
	overflow: 'hidden',
} ) );

const FAKE_PROGRESS_KEYFRAMES = {
	'0%': { width: '0%' },
	'30%': { width: '35%' },
	'60%': { width: '55%' },
	'80%': { width: '68%' },
	'100%': { width: '75%' },
} as const;

const ProgressFill = styled( Box )( ( { theme } ) => ( {
	position: 'absolute',
	left: 0,
	top: 0,
	height: '100%',
	borderRadius: 22,
	backgroundColor: theme.palette.text.primary,
	animation: 'e-onboarding-fake-progress 3s ease-out forwards',
	'@keyframes e-onboarding-fake-progress': FAKE_PROGRESS_KEYFRAMES,
} ) );

export function CompletionScreen() {
	return (
		<Box
			sx={ {
				width: '100%',
				height: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				bgcolor: 'background.paper',
			} }
		>
			<Stack spacing={ 4 } alignItems="center" sx={ { maxWidth: 463, width: '100%', px: 3 } }>
				<ProgressTrack>
					<ProgressFill />
				</ProgressTrack>

				<Stack spacing={ 1 } textAlign="center">
					<Typography variant="h5" fontWeight={ 500 } color="text.primary">
						{ t( 'completion.title' ) }
					</Typography>
					<Typography variant="body1" color="text.secondary">
						{ t( 'completion.subtitle' ) }
					</Typography>
				</Stack>
			</Stack>
		</Box>
	);
}
