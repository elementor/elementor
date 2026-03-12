import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { Stack, Typography } from '@elementor/ui';

import {
	getGreetingText,
	getRecommendedTheme,
	HELLO_BIZ_THEME,
	HELLO_THEME,
	ThemeCard,
} from '../../components/theme-selection';
import { GreetingBanner } from '../../components/ui/greeting-banner';
import { StepTitle } from '../../components/ui/styled-components';
import { useOnboarding } from '../../hooks/use-onboarding';
import { useOnboardingEvent } from '../../hooks/use-onboarding-event';
import type { ThemeSlug } from '../../types';
import { StepId } from '../../types';
import { t } from '../../utils/translations';

interface ThemeSelectionProps {
	onComplete: ( choice: Record< string, unknown > ) => void;
}

export function ThemeSelection( { onComplete }: ThemeSelectionProps ) {
	const { choices, completedSteps, actions } = useOnboarding();
	const { trackThemeSuggested, trackThemeSelected } = useOnboardingEvent();

	const selectedValue = choices.theme_selection as ThemeSlug | null;
	const isStepCompleted = completedSteps.includes( StepId.THEME_SELECTION );
	const isInstalled = isStepCompleted && !! selectedValue;

	const recommendedTheme = useMemo( () => getRecommendedTheme( choices ), [ choices ] );
	const greetingText = useMemo( () => getGreetingText( choices.experience_level ), [ choices.experience_level ] );

	const showBothThemes = recommendedTheme === 'hello-biz';

	const hasTrackedSuggestion = React.useRef( false );

	useEffect( () => {
		if ( recommendedTheme && ! hasTrackedSuggestion.current ) {
			hasTrackedSuggestion.current = true;
			trackThemeSuggested( recommendedTheme );
		}
	}, [ recommendedTheme, trackThemeSuggested ] );

	const handleSelect = useCallback(
		( slug: ThemeSlug ) => {
			if ( isInstalled ) {
				onComplete( { theme_selection: selectedValue } );
				return;
			}

			trackThemeSelected( slug );
			actions.setUserChoice( 'theme_selection', slug );
		},
		[ actions, isInstalled, onComplete, selectedValue, trackThemeSelected ]
	);

	const themes = useMemo(
		() => ( showBothThemes ? [ HELLO_THEME, HELLO_BIZ_THEME ] : [ HELLO_THEME ] ),
		[ showBothThemes ]
	);

	const effectiveSelection = selectedValue ?? recommendedTheme;

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

				<Stack
					direction="row"
					justifyContent="center"
					flexWrap="wrap"
					gap={ 4 }
					role="radiogroup"
					aria-label={ t( 'steps.theme_selection.aria_label' ) }
				>
					{ themes.map( ( theme ) => {
						const isSelected = effectiveSelection === theme.slug;
						const isThemeInstalled = isInstalled && selectedValue === theme.slug;
						const isRecommended = theme.slug === recommendedTheme;

						return (
							<ThemeCard
								key={ theme.slug }
								slug={ theme.slug }
								label={ t( theme.labelKey ) }
								description={ t( theme.descriptionKey ) }
								previewBgColor={ theme.previewBgColor }
								previewImage={ theme.previewImage }
								selected={ isSelected }
								recommended={ isRecommended }
								installed={ isThemeInstalled }
								disabled={ isInstalled && ! isSelected }
								onClick={ handleSelect }
							/>
						);
					} ) }
				</Stack>
			</Stack>
		</Stack>
	);
}
