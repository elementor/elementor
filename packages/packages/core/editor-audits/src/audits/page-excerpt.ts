import { __ } from '@wordpress/i18n';

import { type Audit } from '../types';

export const audit: Audit = {
	id: 'audits/page-excerpt',
	title: __( 'Page excerpt', 'elementor' ),
	description: __( 'A descriptive excerpt helps search engines and previews summarize the page.', 'elementor' ),
	fixHint: __( 'Open Page Settings and write a short excerpt.', 'elementor' ),
	categories: [ 'seo', 'accessibility' ],
	severity: 'warning',
	weight: 5,
	evaluate: ( ctx ) => {
		if ( ctx.pageContext.post_excerpt ) {
			return { status: 'pass' };
		}

		return {
			status: 'fail',
			violations: [
				{
					auditId: audit.id,
					label: __( 'Page has no excerpt.', 'elementor' ),
					targetHint: 'page-settings',
				},
			],
		};
	},
};
