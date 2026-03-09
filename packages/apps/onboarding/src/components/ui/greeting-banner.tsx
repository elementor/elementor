import * as React from 'react';
import type { ReactNode } from 'react';
import { Typography } from '@elementor/ui';

import { GreetingBannerRoot } from './styled-components';

const GREETING_BANNER_TEXT_COLOR = '#0c0d0e';

interface GreetingBannerProps {
	children: ReactNode;
}

export function GreetingBanner( { children }: GreetingBannerProps ) {
	return (
		<GreetingBannerRoot>
			<Typography variant="body1" color={ GREETING_BANNER_TEXT_COLOR } align="center">
				{ children }
			</Typography>
		</GreetingBannerRoot>
	);
}
