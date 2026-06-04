import { __ } from '@wordpress/i18n';

import { type Audit } from '../types';

export const audit: Audit = {
	id: 'audits/default-design-system',
	title: __( 'Default website kit', 'elementor' ),
	description: __(
		'Your website is using the default design system colors and fonts. Custom branding makes the website feel uniquely yours.',
		'elementor'
	),
	fixHint: __( 'Open Site Settings and customize your kit (colors, fonts, layout).', 'elementor' ),
	categories: [ 'best-practices' ],
	severity: 'info',
	weight: 3,
	evaluate: ( ctx ) => {
		if ( ! ctx.pageContext.kit_is_default_unchanged ) {
			return { status: 'pass' };
		}

		return {
			status: 'fail',
			violations: [
				{
					auditId: audit.id,
					label: __( 'Kit appears unchanged from default.', 'elementor' ),
					targetHint: 'site-settings',
				},
			],
		};
	},
};
