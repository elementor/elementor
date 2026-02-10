import * as React from 'react';
import { useMemo } from 'react';
import { Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { GreetingBannerRoot } from './styled-components';

const GREETING_MAP: Record< string, string > = {
	myself: __( "Got it! We'll keep things simple.", 'elementor' ),
	business: __( "Great! Let's set up your business site.", 'elementor' ),
	client: __( "Nice! Let's create something for your client.", 'elementor' ),
	exploring: __( "Got it! We'll keep things simple.", 'elementor' ),
};

interface GreetingBannerProps {
	buildingFor: string | null;
}

export function GreetingBanner( { buildingFor }: GreetingBannerProps ) {
	const greetingText = useMemo( () => {
		const key = buildingFor ?? '';

		return GREETING_MAP[ key ] ?? __( "Let's get started!", 'elementor' );
	}, [ buildingFor ] );

	return (
		<GreetingBannerRoot>
			<Typography variant="body1" color="text.primary" align="center">
				{ greetingText }
			</Typography>
		</GreetingBannerRoot>
	);
}
