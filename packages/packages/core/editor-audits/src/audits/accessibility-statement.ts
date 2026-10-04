import { __ } from '@wordpress/i18n';

import { type Audit } from '../types';

export const audit: Audit = {
	id: 'audits/accessibility-statement',
	title: __( 'Create an accessibility statement', 'elementor' ),
	description: __(
		'An accessibility statement showcases your efforts to create an inclusive online space, highlighting helpful features and a commitment to accessibility.',
		'elementor'
	),
	fixHint: __( 'Use Ally to create and publish an accessibility statement for your site.', 'elementor' ),
	categories: [ 'accessibility' ],
	severity: 'info',
	weight: 1,
	evaluate: ( ctx ) => {
		const isReady = ctx.pageContext.ally_plugin_active;

		if ( isReady && ctx.pageContext.ally_accessibility_statement_created ) {
			return { status: 'pass' };
		}

		return {
			status: 'fail',
			violations: [
				{
					auditId: audit.id,
					label: __( 'No accessibility statement has been created for this site.', 'elementor' ),
					externalUrl: isReady
						? ctx.pageContext.ally_accessibility_statement_url
						: ctx.pageContext.ally_plugin_url,
					ctaLabel: isReady ? __( 'Create', 'elementor' ) : undefined,
					secondaryCtaLabel: __( 'Learn more', 'elementor' ),
					secondaryCtaUrl: 'https://go.elementor.com/acc-plg-learn-more',
				},
			],
		};
	},
};
