import { __ } from '@wordpress/i18n';

import { type Audit } from '../types';

export const audit: Audit = {
	id: 'audits/robots-noindex',
	title: __( 'Search engine visibility', 'elementor' ),
	description: __(
		'When Search engine visibility is checked in WordPress Settings -> Reading -> Search Engine Visibility, search engines are discouraged from indexing the website.',
		'elementor'
	),
	fixHint: __(
		'Go to Settings → Reading in the WordPress admin and uncheck "Discourage search engines from indexing this site" when the site should be indexed.',
		'elementor'
	),
	categories: [ 'seo' ],
	severity: 'warning',
	weight: 7,
	evaluate: ( ctx ) => {
		if ( ! ctx.pageContext.is_noindex ) {
			return { status: 'pass' };
		}

		return {
			status: 'fail',
			violations: [
				{
					auditId: audit.id,
					label: __(
						'Search engines are discouraged from indexing this website.',
						'elementor'
					),
					externalUrl: ctx.pageContext.reading_settings_url,
				},
			],
		};
	},
};
