import { __ } from '@wordpress/i18n';

import { type Audit } from '../types';

export const audit: Audit = {
	id: 'audits/accessibility-policy',
	title: __( 'Accessibility policy', 'elementor' ),
	description: __(
		'An accessibility policy demonstrates your commitment to digital inclusion and may be legally required in some regions.',
		'elementor'
	),
	fixHint: __( 'Install the Ally plugin to add an accessibility policy to your website.', 'elementor' ),
	categories: [ 'compliance' ],
	severity: 'info',
	weight: 1,
	evaluate: ( ctx ) => {
		if ( ctx.pageContext.ally_plugin_active ) {
			return { status: 'pass' };
		}

		return {
			status: 'fail',
			violations: [
				{
					auditId: audit.id,
					label: __( 'Ally plugin is not installed or active.', 'elementor' ),
					externalUrl: ctx.pageContext.ally_plugin_url,
				},
			],
		};
	},
};
