import { __ } from '@wordpress/i18n';

import { type Audit, type AuditViolation } from '../types';

export const audit: Audit = {
	id: 'audits/site-identity',
	title: __( 'Site identity', 'elementor' ),
	description: __(
		'Site name, description, logo, and favicon establish your brand and appear in search results and browser tabs.',
		'elementor'
	),
	fixHint: __( 'Open Site Settings → Site Identity and complete all the missing fields.', 'elementor' ),
	categories: [ 'best-practices', 'seo' ],
	severity: 'info',
	weight: 7,
	evaluate: ( ctx ) => {
		const { site_identity: identity } = ctx.pageContext;
		const violations: AuditViolation[] = [];

		if ( ! identity.site_name_set ) {
			violations.push( {
				auditId: audit.id,
				label: __( 'Site name is missing or still uses the default.', 'elementor' ),
				targetHint: 'site-identity-settings',
			} );
		}

		if ( ! identity.site_description_set ) {
			violations.push( {
				auditId: audit.id,
				label: __( 'Site description is missing or still uses the default.', 'elementor' ),
				targetHint: 'site-identity-settings',
				angieFix: true,
			} );
		}

		if ( ! identity.site_logo_set ) {
			violations.push( {
				auditId: audit.id,
				label: __( 'Site logo is not set.', 'elementor' ),
				targetHint: 'site-identity-settings',
			} );
		}

		if ( ! identity.site_favicon_set ) {
			violations.push( {
				auditId: audit.id,
				label: __( 'Site favicon is not set.', 'elementor' ),
				targetHint: 'site-identity-settings',
			} );
		}

		if ( violations.length === 0 ) {
			return { status: 'pass' };
		}

		return {
			status: 'fail',
			violations,
		};
	},
};
