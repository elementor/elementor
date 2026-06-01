import { __ } from '@wordpress/i18n';

import { type AuditDescriptor, type AuditEvaluator } from '../types';

export const descriptor: AuditDescriptor = {
	id: 'audits/default-design-system',
	title: __( 'Default website kit is in use', 'elementor' ),
	description: __(
		'Your site is using the default design system colors and fonts. Custom branding makes the site feel uniquely yours.',
		'elementor'
	),
	fixHint: __( 'Open Site Settings and customize your kit (colors, fonts, layout).', 'elementor' ),
	categories: [ 'health' ],
	severity: 'info',
	weight: 3,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
	if ( ! ctx.pageContext.kit_is_default_unchanged ) {
		return { status: 'pass' };
	}

	return {
		status: 'fail',
		violations: [
			{
				auditId: descriptor.id,
				label: __( 'Kit appears unchanged from default.', 'elementor' ),
				targetHint: 'site-settings',
			},
		],
	};
};
