import { __ } from '@wordpress/i18n';

import { type AuditDescriptor, type AuditEvaluator } from '../types';

export const descriptor: AuditDescriptor = {
	id: 'audits/missing-page-title',
	title: __( 'Missing page title', 'elementor' ),
	description: __( 'Pages need a clear title for SEO and screen-reader navigation.', 'elementor' ),
	fixHint: __( 'Open Page Settings and add a title.', 'elementor' ),
	categories: [ 'seo', 'accessibility' ],
	severity: 'error',
	weight: 10,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
	if ( ctx.pageContext.post_title ) {
		return { status: 'pass' };
	}

	return {
		status: 'fail',
		violations: [
			{
				auditId: descriptor.id,
				label: __( 'Page has no title.', 'elementor' ),
				targetHint: 'page-settings',
			},
		],
	};
};
