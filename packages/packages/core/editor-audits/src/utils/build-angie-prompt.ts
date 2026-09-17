import { __, sprintf } from '@wordpress/i18n';

export function buildAngiePrompt( violationText: string ): string {
	return sprintf(
		/* translators: %s: audit violation description. */
		__( 'Help me fix: %s', 'elementor' ),
		violationText
	);
}
