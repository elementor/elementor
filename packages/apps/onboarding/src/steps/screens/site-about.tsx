import * as React from 'react';
import { Stack, Typography } from '@elementor/ui';

import { OptionsGrid } from '../../components/site-about';
import { getGreeting } from '../../components/site-about/constants';
import { GreetingBanner } from '../../components/ui/greeting-banner';
import { StepTitle } from '../../components/ui/styled-components';
import { useOnboarding } from '../../hooks/use-onboarding';
import { useOnboardingEvent } from '../../hooks/use-onboarding-event';
import { t } from '../../utils/translations';

export function SiteAbout() {
	const { choices, actions } = useOnboarding();
	const { trackSiteTopicSelected } = useOnboardingEvent();

	const selectedValues: string[] = Array.isArray( choices.site_about ) ? choices.site_about : [];
	const greetingText = getGreeting( choices.building_for ?? '' );

	function handleToggle( value: string ) {
		const next = selectedValues.includes( value )
			? selectedValues.filter( ( v ) => v !== value )
			: [ ...selectedValues, value ];

		trackSiteTopicSelected( next );
		actions.setUserChoice( 'site_about', next );
	}

	return (
		<Stack spacing={ 7.5 } data-testid="site-about-step">
			<GreetingBanner>{ greetingText }</GreetingBanner>

			<Stack spacing={ 4 } alignItems="center">
				<Stack spacing={ 1 } alignItems="center">
					<StepTitle color="text.primary" variant="h5" align="center">
						{ t( 'steps.site_about.title' ) }
					</StepTitle>
					<Typography variant="body1" color="text.secondary" align="center">
						{ t( 'steps.site_about.subtitle' ) }
					</Typography>
				</Stack>

				<OptionsGrid selectedValues={ selectedValues } onToggle={ handleToggle } />
			</Stack>
		</Stack>
	);
}
