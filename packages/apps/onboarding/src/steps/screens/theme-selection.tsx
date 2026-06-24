import * as React from 'react';
import { useMemo } from 'react';
import { CheckedCircleIcon } from '@elementor/icons';
import { Stack, Typography } from '@elementor/ui';

import { getGreetingText, HELLO_THEME } from '../../components/theme-selection';
import {
	InstalledChip,
	RecommendedChip,
	ThemeCardRoot,
	ThemePreview,
} from '../../components/theme-selection/styled-components';
import { GreetingBanner } from '../../components/ui/greeting-banner';
import { StepTitle } from '../../components/ui/styled-components';
import { useOnboarding } from '../../hooks/use-onboarding';
import { StepId } from '../../types';
import { t } from '../../utils/translations';

export function ThemeSelection() {
	const { choices, completedSteps } = useOnboarding();

	const isStepCompleted = completedSteps.includes( StepId.THEME_SELECTION );
	const isInstalled = isStepCompleted && choices.theme_selection === HELLO_THEME.slug;

	const greetingText = useMemo( () => getGreetingText( choices.experience_level ), [ choices.experience_level ] );

	return (
		<Stack spacing={ 7.5 } data-testid="theme-selection-step">
			<Stack width="100%" maxWidth={ 386 } alignSelf="center">
				<GreetingBanner>{ greetingText }</GreetingBanner>
			</Stack>

			<Stack spacing={ 4 }>
				<Stack spacing={ 1 } textAlign="center">
					<StepTitle color="text.primary" variant="h5" align="center">
						{ t( 'steps.theme_selection.title' ) }
					</StepTitle>
					<Typography variant="body1" color="text.secondary">
						{ t( 'steps.theme_selection.subtitle' ) }
					</Typography>
				</Stack>

				<Stack direction="row" justifyContent="center" gap={ 4 }>
					<ThemeCardRoot selected={ false } disabled>
						<ThemePreview bgColor={ HELLO_THEME.previewBgColor } previewImage={ HELLO_THEME.previewImage }>
							{ isInstalled ? (
								<InstalledChip
									label={ t( 'common.installed' ) }
									size="small"
									color="success"
									icon={ <CheckedCircleIcon /> }
								/>
							) : (
								<RecommendedChip label={ t( 'common.recommended' ) } size="small" color="default" />
							) }
						</ThemePreview>

						<Stack spacing={ 0.5 } alignItems="center" sx={ { textAlign: 'center', px: 2.25 } }>
							<Typography variant="subtitle1" color="text.primary">
								{ t( HELLO_THEME.labelKey ) }
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{ t( 'steps.theme_selection.by_elementor' ) }
							</Typography>
						</Stack>
					</ThemeCardRoot>
				</Stack>
			</Stack>
		</Stack>
	);
}
