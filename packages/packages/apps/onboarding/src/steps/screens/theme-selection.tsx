import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { CheckedCircleIcon } from '@elementor/icons';
import { Box, Chip, Stack, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useOnboarding } from '../../hooks/use-onboarding';
import type { ThemeSlug } from '../../types';
import { StepId } from '../../types';
import { getOnboardingAssetUrl } from '../step-visuals';

const GREETING_BANNER_BG_COLOR = '#fae4fa';

const GreetingBanner = styled( Box )( ( { theme } ) => ( {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	paddingInline: theme.spacing( 3 ),
	paddingBlock: theme.spacing( 1.5 ),
	borderRadius: 16,
	backgroundColor: GREETING_BANNER_BG_COLOR,
	alignSelf: 'flex-start',
} ) );

interface ThemeCardRootProps {
	selected: boolean;
	disabled: boolean;
}

const ThemeCardRoot = styled( Box, {
	shouldForwardProp: ( prop ) => ! [ 'selected', 'disabled' ].includes( prop as string ),
} )< ThemeCardRootProps >( ( { theme, selected, disabled } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: theme.spacing( 2 ),
	paddingBottom: theme.spacing( 3 ),
	borderRadius: 16,
	border: selected ? `2px solid ${ theme.palette.text.primary }` : `1px solid ${ theme.palette.divider }`,
	cursor: disabled ? 'default' : 'pointer',
	width: 240,
	flexShrink: 0,
	position: 'relative',
	overflow: 'visible',
	opacity: disabled && ! selected ? 0.5 : 1,
	transition: 'border-color 150ms ease, opacity 150ms ease',
	...( ! selected &&
		! disabled && {
			'&:hover': {
				borderColor: theme.palette.text.secondary,
			},
		} ),
} ) );

const ThemePreview = styled( Box )< { bgColor: string; previewImage?: string } >( ( { bgColor, previewImage } ) => ( {
	width: '100%',
	height: 112,
	overflow: 'hidden',
	borderTopLeftRadius: 14,
	borderTopRightRadius: 14,
	backgroundColor: bgColor,
	position: 'relative',
	...( previewImage && {
		backgroundImage: `url(${ previewImage })`,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
	} ),
} ) );

const InstalledChip = styled( Chip )( ( { theme } ) => ( {
	position: 'absolute',
	top: 9,
	left: 9,
	zIndex: 1,
	height: 20,
	backgroundColor: theme.palette.success.main,
	color: theme.palette.success.contrastText,
	'& .MuiChip-icon': {
		color: 'inherit',
	},
} ) );

const RecommendedChip = styled( Chip )( () => ( {
	position: 'absolute',
	top: 9,
	left: 9,
	zIndex: 1,
	height: 20,
} ) );

interface ThemeCardProps {
	slug: ThemeSlug;
	label: string;
	description: string;
	previewBgColor: string;
	previewImage?: string;
	selected: boolean;
	recommended: boolean;
	installed: boolean;
	disabled: boolean;
	onClick: ( slug: ThemeSlug ) => void;
}

function ThemeCard( {
	slug,
	label,
	description,
	previewBgColor,
	previewImage,
	selected,
	recommended,
	installed,
	disabled,
	onClick,
}: ThemeCardProps ) {
	return (
		<ThemeCardRoot
			selected={ selected }
			disabled={ disabled }
			onClick={ () => ! disabled && onClick( slug ) }
			role="radio"
			aria-checked={ selected }
			aria-label={ label }
			tabIndex={ 0 }
			onKeyDown={ ( e: React.KeyboardEvent ) => {
				if ( ( e.key === 'Enter' || e.key === ' ' ) && ! disabled ) {
					e.preventDefault();
					onClick( slug );
				}
			} }
		>
			<ThemePreview bgColor={ previewBgColor } previewImage={ previewImage }>
				{ installed && (
					<InstalledChip
						label={ __( 'Installed', 'elementor' ) }
						size="small"
						color="success"
						icon={ <CheckedCircleIcon /> }
					/>
				) }
				{ recommended && ! installed && (
					<RecommendedChip label={ __( 'Recommended', 'elementor' ) } size="small" color="secondary" />
				) }
			</ThemePreview>

			<Stack spacing={ 1 } alignItems="center" sx={ { textAlign: 'center', px: 2.25 } }>
				<Typography variant="subtitle1" color="text.primary">
					{ label }
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{ description }
				</Typography>
			</Stack>
		</ThemeCardRoot>
	);
}

/**
 * Determines the recommended theme based on previous choices.
 *
 * Hello Biz is recommended when:
 *   (building_for is "myself" OR "business" OR experience_level is "beginner")
 *   AND (site_about includes "local_services" OR "ecommerce")
 *
 * Otherwise, Hello (the base theme) is recommended.
 * @param choices
 * @param choices.building_for
 * @param choices.site_about
 * @param choices.experience_level
 */
function getRecommendedTheme( choices: {
	building_for: string | null;
	site_about: string[];
	experience_level: string | null;
} ): ThemeSlug {
	const buildingForQualifies = [ 'myself', 'business' ].includes( choices.building_for ?? '' );
	const experienceQualifies = choices.experience_level === 'beginner';
	const siteAboutQualifies =
		Array.isArray( choices.site_about ) &&
		choices.site_about.some( ( item ) => [ 'local_services', 'ecommerce' ].includes( item ) );

	if ( ( buildingForQualifies || experienceQualifies ) && siteAboutQualifies ) {
		return 'hello-biz';
	}

	return 'hello-elementor';
}

/**
 * Determines the greeting text based on the user's experience level choice.
 * @param experienceLevel
 */
function getGreetingText( experienceLevel: string | null ): string {
	if ( experienceLevel === 'beginner' ) {
		return __( "Glad you're here!", 'elementor' );
	}

	return __( "Great. Let's take it to the next step", 'elementor' );
}

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
	useEffect( () => {
		if ( ! selectedValue ) {
			actions.setUserChoice( 'theme_selection', recommendedTheme );
		}
	}, [ selectedValue, recommendedTheme, actions ] );

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

	const themes = useMemo( () => {
		const helloTheme = {
			slug: 'hello-elementor' as ThemeSlug,
			label: __( 'Hello', 'elementor' ),
			description: __( 'A flexible canvas theme you can shape from the ground up', 'elementor' ),
			previewBgColor: '#f6f6f6',
			previewImage: getOnboardingAssetUrl( 'theme-hello.png' ),
		};

		const helloBizTheme = {
			slug: 'hello-biz' as ThemeSlug,
			label: __( 'Hello Biz', 'elementor' ),
			description: __( 'A ready-to-start theme with smart layouts and widgets', 'elementor' ),
			previewBgColor: '#ffb8e5',
			previewImage: getOnboardingAssetUrl( 'theme-hello-biz.png' ),
		};

		if ( showBothThemes ) {
			return [ helloTheme, helloBizTheme ];
		}

		return [ helloTheme ];
	}, [ showBothThemes ] );

	const effectiveSelection = selectedValue ?? recommendedTheme;

	return (
		<Stack spacing={ 7.5 } sx={ { marginTop: -3.5 } } data-testid="theme-selection-step">
			<GreetingBanner>
				<Typography variant="body1" color="text.primary" align="center">
					{ greetingText }
				</Typography>
			</GreetingBanner>

			<Stack spacing={ 4 }>
				<Stack spacing={ 1 }>
					<Typography variant="h5">
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
