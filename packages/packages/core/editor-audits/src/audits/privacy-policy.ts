import { __ } from '@wordpress/i18n';

import { type AuditDescriptor, type AuditEvaluator } from '../types';

export const descriptor: AuditDescriptor = {
	id: 'audits/privacy-policy',
	title: __( 'Privacy policy', 'elementor' ),
	description: __(
		'A privacy policy page is required by privacy regulations such as GDPR (EU) and CCPA (US).',
		'elementor'
	),
	fixHint: __(
		'Go to Settings > Privacy in the WordPress admin and assign a published privacy policy page.',
		'elementor'
	),
	categories: [ 'compliance' ],
	severity: 'warning',
	weight: 5,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
	if ( ctx.pageContext.privacy_policy_url ) {
		return { status: 'pass' };
	}

	return {
		status: 'fail',
		violations: [
			{
				auditId: descriptor.id,
				label: __( 'No privacy policy page is set.', 'elementor' ),
				externalUrl: ctx.pageContext.privacy_settings_url,
			},
		],
	};
};
