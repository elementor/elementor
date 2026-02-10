import * as React from 'react';
import { useMemo } from 'react';
import { Typography } from '@elementor/ui';

import { GREETING_FALLBACK, GREETING_MAP } from './constants';
import { GreetingBannerRoot } from './styled-components';

interface GreetingBannerProps {
	buildingFor: string | null;
}

export function GreetingBanner( { buildingFor }: GreetingBannerProps ) {
	const greetingText = useMemo( () => {
		const key = buildingFor ?? '';

		return GREETING_MAP[ key ] ?? GREETING_FALLBACK;
	}, [ buildingFor ] );

	return (
		<GreetingBannerRoot>
			<Typography variant="body1" color="text.primary" align="center">
				{ greetingText }
			</Typography>
		</GreetingBannerRoot>
	);
}
