import { __ } from '@wordpress/i18n';

import { type AuditDescriptor, type AuditEvaluator } from '../types';

export const descriptor: AuditDescriptor = {
	id: 'audits/missing-excerpt',
	title: __( 'Missing page excerpt', 'elementor' ),
	description: __( 'A descriptive excerpt helps search engines and previews summarize the page.', 'elementor' ),
	fixHint: __( 'Open Page Settings and write a short excerpt.', 'elementor' ),
	categories: [ 'seo', 'accessibility' ],
	severity: 'warning',
	weight: 5,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
	if ( ctx.pageContext.post_excerpt ) {
		return { status: 'pass' };
	}

	return {
		status: 'fail',
		violations: [
			{
				auditId: descriptor.id,
				label: __( 'Page has no excerpt.', 'elementor' ),
				targetHint: 'page-settings',
			},
		],
	};
};
