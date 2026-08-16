import { __ } from '@wordpress/i18n';

import { type Audit } from '../types';

export const audit: Audit = {
	id: 'audits/cookie-policy',
	title: __( 'Cookie policy', 'elementor' ),
	description: __(
		'A cookie policy is required by privacy regulations such as GDPR (EU) or CCPA (US) to inform visitors about tracking and data collection.',
		'elementor'
	),
	fixHint: __( 'Install the Cookiez plugin to add a cookie policy to your website.', 'elementor' ),
	categories: [ 'compliance' ],
	severity: 'info',
	weight: 1,
	evaluate: ( ctx ) => {
		if ( ctx.pageContext.cookiez_plugin_active ) {
			return { status: 'pass' };
		}

		return {
			status: 'fail',
			violations: [
				{
					auditId: audit.id,
					label: __( 'Cookiez plugin is not installed or active.', 'elementor' ),
					externalUrl: ctx.pageContext.cookiez_plugin_url,
				},
			],
		};
	},
};
