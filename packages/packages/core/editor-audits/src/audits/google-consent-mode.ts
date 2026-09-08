import { __ } from '@wordpress/i18n';

import { type Audit } from '../types';
import { fetchRenderedHtml } from '../utils/fetch-rendered-html';
import { hasConsentDefaultCall, hasGoogleTracking } from '../utils/scan-consent-signals';

export const audit: Audit = {
	id: 'audits/google-consent-mode',
	title: __( 'Google Consent Mode', 'elementor' ),
	description: __(
		'Google Analytics, Ads, or Tag Manager are running on this site and may not receive a consent signal, which risks losing conversion/analytics data and compliance exposure.',
		'elementor'
	),
	fixHint: __(
		'Turn on Google Consent Mode in your cookie consent plugin so Google tags respect visitor consent choices.',
		'elementor'
	),
	categories: [ 'compliance' ],
	severity: 'warning',
	weight: 1,
	evaluate: async ( ctx ) => {
		const html = await fetchRenderedHtml( ctx.pageContext.frontend_url );

		if ( ! html || ! hasGoogleTracking( html ) ) {
			return { status: 'skipped', reason: __( 'No Google tracking product detected.', 'elementor' ) };
		}

		if ( hasConsentDefaultCall( html ) ) {
			return { status: 'pass' };
		}

		const label = __( 'No Google Consent Mode signal was found on the page.', 'elementor' );
		const isCookiezReady = ctx.pageContext.cookiez_plugin_installed && ctx.pageContext.cookiez_plugin_active;

		if ( isCookiezReady ) {
			return {
				status: 'fail',
				violations: [
					{
						auditId: audit.id,
						label,
						ctaLabel: __( 'Enable', 'elementor' ),
						externalUrl: ctx.pageContext.cookiez_consent_mode_settings_url,
					},
				],
			};
		}

		return {
			status: 'fail',
			violations: [
				{
					auditId: audit.id,
					label,
					externalUrl: ctx.pageContext.cookiez_plugin_action_url,
				},
			],
		};
	},
};
