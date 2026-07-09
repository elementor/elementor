import * as React from 'react';
import { useMemo } from 'react';
import { Stack, Typography } from '@elementor/ui';

import { getGreetingText, HELLO_THEME } from '../../components/theme-selection';
import { HelloThemePreview } from '../../components/theme-selection/hello-theme-preview';
import { FooterHighlights } from '../../components/ui/footer-highlights';
import { GreetingBanner } from '../../components/ui/greeting-banner';
import { StepTitle } from '../../components/ui/styled-components';
import { useOnboarding } from '../../hooks/use-onboarding';
import { StepId } from '../../types';
import { getConfig } from '../../utils/get-config';
import { t } from '../../utils/translations';
import { THEME_SELECTION_FOOTER_HIGHLIGHTS } from '../theme-selection-footer';

export function ThemeSelection() {
	const { choices, completedSteps } = useOnboarding();

	const isStepCompleted = completedSteps.includes( StepId.THEME_SELECTION );
	const isHelloThemeActive = getConfig()?.isHelloThemeActive ?? false;
	const isInstalled = isHelloThemeActive || ( isStepCompleted && choices.theme_selection === HELLO_THEME.slug );

	const greetingText = useMemo( () => getGreetingText( choices.experience_level ), [ choices.experience_level ] );

	return (
		<Stack spacing={ 7.5 } width="100%" sx={ { flex: 1 } } data-testid="theme-selection-step">
			<Stack width="100%" maxWidth={ 386 } alignSelf="center">
				<GreetingBanner>{ greetingText }</GreetingBanner>
			</Stack>

			<Stack useFlexGap spacing={ 4 } alignItems="center" width="100%" sx={ { flex: 1 } }>
				<Stack spacing={ 1 } textAlign="center" alignItems="center">
					<StepTitle color="text.primary" variant="h5" align="center">
						{ t( 'steps.theme_selection.v2.title' ) }
					</StepTitle>
					<Typography variant="body1" color="text.secondary">
						{ t( 'steps.theme_selection.v2.subtitle' ) }
					</Typography>
				</Stack>

				<HelloThemePreview isInstalled={ isInstalled } />

				<FooterHighlights
					items={ THEME_SELECTION_FOOTER_HIGHLIGHTS }
					testId="theme-selection-highlights"
					sx={ { marginBlockStart: 'auto' } }
				/>
			</Stack>
		</Stack>
	);
}
