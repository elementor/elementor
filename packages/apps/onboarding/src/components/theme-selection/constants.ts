import type { ThemeSlug } from '../../types';
import { t } from '../../utils/translations';

export interface ThemeDefinition {
	slug: ThemeSlug;
	labelKey: string;
	descriptionKey: string;
	previewBgColor: string;
	previewImage?: string;
}

export const HELLO_THEME: ThemeDefinition = {
	slug: 'hello-elementor',
	labelKey: 'steps.theme_selection.theme_hello_label',
	descriptionKey: 'steps.theme_selection.theme_hello_description',
	previewBgColor: '#f6f6f6',
};

export function getGreetingText( experienceLevel: string | null ): string {
	if ( experienceLevel === 'beginner' ) {
		return t( 'steps.theme_selection.greeting_beginner' );
	}

	return t( 'steps.theme_selection.greeting_default' );
}
