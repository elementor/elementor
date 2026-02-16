import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { OptionsGrid } from '../../components/site-about';
import { GREETING_FALLBACK, GREETING_MAP } from '../../components/site-about/constants';
import { GreetingBanner } from '../../components/ui/greeting-banner';
import { useOnboarding } from '../../hooks/use-onboarding';

export function SiteAbout() {
	const { choices, actions } = useOnboarding();

	const selectedValues: string[] = useMemo(
		() => ( Array.isArray( choices.site_about ) ? choices.site_about : [] ),
		[ choices.site_about ]
	);

	const greetingText = useMemo( () => {
		const key = choices.building_for ?? '';

		return GREETING_MAP[ key ] ?? GREETING_FALLBACK;
	}, [ choices.building_for ] );

	const handleToggle = useCallback(
		( value: string ) => {
			const next = selectedValues.includes( value )
				? selectedValues.filter( ( v ) => v !== value )
				: [ ...selectedValues, value ];

			actions.setUserChoice( 'site_about', next );
		},
		[ selectedValues, actions ]
	);

	return (
		<Stack spacing={ 7.5 } data-testid="site-about-step">
			<GreetingBanner>{ greetingText }</GreetingBanner>

			<Stack spacing={ 4 } alignItems="center">
				<Stack spacing={ 1 } alignItems="center">
					<Typography variant="h5" align="center" fontWeight={ 500 } sx={ { fontFamily: "'Poppins', sans-serif" } }>
						{ __( 'What is your site about?', 'elementor' ) }
					</Typography>
					<Typography variant="body1" color="text.secondary" align="center">
						{ __( 'Choose anything that applies.', 'elementor' ) }
					</Typography>
				</Stack>

				<OptionsGrid selectedValues={ selectedValues } onToggle={ handleToggle } />
			</Stack>
		</Stack>
	);
}
