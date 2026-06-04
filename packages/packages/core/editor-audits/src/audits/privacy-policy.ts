import { __ } from '@wordpress/i18n';

import { type Audit } from '../types';

export const audit: Audit = {
	id: 'audits/privacy-policy',
	title: __( 'Privacy policy', 'elementor' ),
	description: __(
		'A privacy policy page is required by privacy regulations such as GDPR (EU) and CCPA (US).',
		'elementor'
	),
	fixHint: __(
		'Go to Settings > Privacy in the WordPress admin and assign a published privacy policy page.',
		'elementor'
	),
	categories: [ 'compliance' ],
	severity: 'warning',
	weight: 5,
	evaluate: ( ctx ) => {
		if ( ctx.pageContext.privacy_policy_url ) {
			return { status: 'pass' };
		}

		return {
			status: 'fail',
			violations: [
				{
					auditId: audit.id,
					label: __( 'No privacy policy page is set.', 'elementor' ),
					externalUrl: ctx.pageContext.privacy_settings_url,
				},
			],
		};
	},
};
