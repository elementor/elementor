import * as React from 'react';
import type { ReactNode } from 'react';
import { Typography } from '@elementor/ui';

import { GreetingBannerRoot } from './styled-components';

interface GreetingBannerProps {
	children: ReactNode;
}

export function GreetingBanner( { children }: GreetingBannerProps ) {
	return (
		<GreetingBannerRoot>
			<Typography variant="body1" color="#0c0d0e" align="center">
				{ children }
			</Typography>
		</GreetingBannerRoot>
	);
}
