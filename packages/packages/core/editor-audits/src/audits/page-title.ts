import { __ } from '@wordpress/i18n';

import { type Audit } from '../types';

const MAX_TITLE_LENGTH = 60;

export const audit: Audit = {
	id: 'audits/page-title',
	title: __( 'Page title', 'elementor' ),
	description: __( 'Pages need a clear title for SEO and screen-reader navigation.', 'elementor' ),
	fixHint: __( 'Open Page Settings and add a title.', 'elementor' ),
	categories: [ 'seo', 'accessibility' ],
	severity: 'error',
	weight: 10,
	evaluate: ( ctx ) => {
		const title = ctx.pageContext.post_title;

		if ( ! title ) {
			return {
				status: 'fail',
				violations: [
					{
						auditId: audit.id,
						label: __( 'Page has no title.', 'elementor' ),
						targetHint: 'page-settings',
					},
				],
			};
		}

		if ( title.length > MAX_TITLE_LENGTH ) {
			return {
				status: 'fail',
				violations: [
					{
						auditId: audit.id,
						label: __( 'Page title is too long.', 'elementor' ),
						targetHint: 'page-settings',
					},
				],
			};
		}

		return { status: 'pass' };
	},
};
