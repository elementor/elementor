import { __ } from '@wordpress/i18n';

import { type AuditDescriptor, type AuditEvaluator } from '../types';

export const descriptor: AuditDescriptor = {
	id: 'audits/missing-accessibility-policy',
	title: __( 'Missing accessibility policy', 'elementor' ),
	description: __(
		'An accessibility policy demonstrates your commitment to digital inclusion and may be legally required in some regions.',
		'elementor'
	),
	fixHint: __( 'Install the Ally plugin to add an accessibility policy to your website.', 'elementor' ),
	categories: [ 'compliance' ],
	severity: 'info',
	weight: 1,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
	if ( ctx.pageContext.ally_plugin_active ) {
		return { status: 'pass' };
	}

	return {
		status: 'fail',
		violations: [
			{
				auditId: descriptor.id,
				label: __( 'Ally plugin is not installed or active.', 'elementor' ),
				externalUrl: ctx.pageContext.ally_plugin_url,
			},
		],
	};
};
