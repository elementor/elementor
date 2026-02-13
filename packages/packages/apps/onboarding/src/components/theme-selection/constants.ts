import { __ } from '@wordpress/i18n';

import { getOnboardingAssetUrl } from '../../steps/step-visuals';
import type { ThemeSlug } from '../../types';

export interface ThemeDefinition {
	slug: ThemeSlug;
	label: string;
	description: string;
	previewBgColor: string;
	previewImage: string;
}

export const HELLO_THEME: ThemeDefinition = {
	slug: 'hello-elementor',
	label: __( 'Hello', 'elementor' ),
	description: __( 'A flexible canvas theme you can shape from the ground up', 'elementor' ),
	previewBgColor: '#f6f6f6',
	previewImage: getOnboardingAssetUrl( 'theme-hello.png' ),
};

export const HELLO_BIZ_THEME: ThemeDefinition = {
	slug: 'hello-biz',
	label: __( 'Hello Biz', 'elementor' ),
	description: __( 'A ready-to-start theme with smart layouts and widgets', 'elementor' ),
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
		return __( "Glad you're here!", 'elementor' );
	}

	return __( "Great. Let's take it to the next step", 'elementor' );
}
