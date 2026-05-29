import { __ } from '@wordpress/i18n';

import { type AuditDescriptor, type AuditEvaluator } from '../types';

export const descriptor: AuditDescriptor = {
	id: 'audits/missing-featured-image',
	title: __( 'Missing featured image', 'elementor' ),
	description: __( 'Featured images are used by social shares and many themes for hero visuals.', 'elementor' ),
	fixHint: __( 'Open Page Settings and set a featured image.', 'elementor' ),
	categories: [ 'seo' ],
	severity: 'warning',
	weight: 5,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
	if ( ctx.pageContext.featured_image_id ) {
		return { status: 'pass' };
	}

	return {
		status: 'fail',
		violations: [
			{
				auditId: descriptor.id,
				label: __( 'No featured image set.', 'elementor' ),
				targetHint: 'page-settings',
			},
		],
	};
};
