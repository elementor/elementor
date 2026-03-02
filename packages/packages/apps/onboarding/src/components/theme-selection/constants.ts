import { getOnboardingAssetUrl } from '../../steps/step-visuals';
import type { ThemeSlug } from '../../types';
import { t } from '../../utils/translations';

export interface ThemeDefinition {
	slug: ThemeSlug;
	labelKey: string;
	descriptionKey: string;
	previewBgColor: string;
	previewImage: string;
}

export const HELLO_THEME: ThemeDefinition = {
	slug: 'hello-elementor',
	labelKey: 'steps.theme_selection.theme_hello_label',
	descriptionKey: 'steps.theme_selection.theme_hello_description',
	previewBgColor: '#f6f6f6',
	previewImage: getOnboardingAssetUrl( 'theme-hello.png' ),
};

export const HELLO_BIZ_THEME: ThemeDefinition = {
	slug: 'hello-biz',
	labelKey: 'steps.theme_selection.theme_hello_biz_label',
	descriptionKey: 'steps.theme_selection.theme_hello_biz_description',
	previewBgColor: '#ffb8e5',
	previewImage: getOnboardingAssetUrl( 'theme-hello-biz.png' ),
};

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
export function getRecommendedTheme( choices: {
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
export function getGreetingText( experienceLevel: string | null ): string {
	if ( experienceLevel === 'beginner' ) {
		return t( 'steps.theme_selection.greeting_beginner' );
	}

	return t( 'steps.theme_selection.greeting_default' );
}
