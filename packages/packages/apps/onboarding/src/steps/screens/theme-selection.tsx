import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import {
	getGreetingText,
	getRecommendedTheme,
	HELLO_BIZ_THEME,
	HELLO_THEME,
	ThemeCard,
} from '../../components/theme-selection';
import { GreetingBanner } from '../../components/ui/greeting-banner';
import { useOnboarding } from '../../hooks/use-onboarding';
import type { ThemeSlug } from '../../types';
import { StepId } from '../../types';

interface ThemeSelectionProps {
	onComplete: ( choice: Record< string, unknown > ) => void;
}

export function ThemeSelection( { onComplete }: ThemeSelectionProps ) {
	const { choices, completedSteps, actions } = useOnboarding();

	const selectedValue = choices.theme_selection as ThemeSlug | null;
	const isStepCompleted = completedSteps.includes( StepId.THEME_SELECTION );
	const isInstalled = isStepCompleted && !! selectedValue;

	const recommendedTheme = useMemo( () => getRecommendedTheme( choices ), [ choices ] );
	const greetingText = useMemo( () => getGreetingText( choices.experience_level ), [ choices.experience_level ] );

	// Show both themes when Hello Biz is recommended.
	// TODO: Once the site_about step (S2) is implemented, this will work automatically.
	// For now, always show both themes so the UI can be tested.
	const showBothThemes = true;

	// Pre-select the recommended theme if no explicit selection was made yet.
	// `actions` is omitted from deps because it is a stable memoized object (useMemo + dispatch).
	useEffect( () => {
		if ( ! selectedValue ) {
			actions.setUserChoice( 'theme_selection', recommendedTheme );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ selectedValue, recommendedTheme ] );

	const handleSelect = useCallback(
		( slug: ThemeSlug ) => {
			if ( isInstalled ) {
				// If already installed, clicking just continues (same as footer button).
				onComplete( { theme_selection: selectedValue } );
				return;
			}

			actions.setUserChoice( 'theme_selection', slug );
		},
		[ actions, isInstalled, onComplete, selectedValue ]
	);

	const themes = useMemo(
		() => ( showBothThemes ? [ HELLO_THEME, HELLO_BIZ_THEME ] : [ HELLO_THEME ] ),
		[ showBothThemes ]
	);

	const effectiveSelection = selectedValue ?? recommendedTheme;

	return (
		<Stack spacing={ 7.5 } data-testid="theme-selection-step">
			<GreetingBanner>{ greetingText }</GreetingBanner>

			<Stack spacing={ 4 }>
				<Stack spacing={ 1 }>
					<Typography variant="h5" align="center" fontWeight={ 500 } fontFamily="Poppins">
						{ __( 'Start with a theme that fits your needs', 'elementor' ) }
					</Typography>
					<Typography variant="body1" color="text.secondary">
						{ __( 'Hello themes are built to work seamlessly with Elementor.', 'elementor' ) }
					</Typography>
				</Stack>

				<Stack
					direction="row"
					spacing={ 4 }
					role="radiogroup"
					aria-label={ __( 'Theme selection', 'elementor' ) }
				>
					{ themes.map( ( theme ) => {
						const isSelected = effectiveSelection === theme.slug;
						const isThemeInstalled = isInstalled && selectedValue === theme.slug;
						const isRecommended = theme.slug === recommendedTheme;

						return (
							<ThemeCard
								key={ theme.slug }
								slug={ theme.slug }
								label={ theme.label }
								description={ theme.description }
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
