import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

const MAX_NESTING_DEPTH = 6;

export const descriptor: AuditDescriptor = {
	id: 'audits/deep-nesting',
	title: __( 'Deep container nesting', 'elementor' ),
	description: __(
		'Container nesting exceeds the recommended depth. Deep DOM trees hurt rendering performance and readability.',
		'elementor'
	),
	fixHint: __( 'Flatten the layout by removing unnecessary wrapper containers.', 'elementor' ),
	categories: [ 'performance', 'best-practices' ],
	severity: 'warning',
	weight: 5,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
	const violations: AuditViolation[] = [];

	walkElements( ctx.elements.tree, ( node, parents ) => {
		if ( node.elType !== 'container' ) {
			return;
		}

		const depth = parents.length + 1;

		if ( depth > MAX_NESTING_DEPTH ) {
			violations.push( {
				auditId: descriptor.id,
				elementId: node.id,
				targetHint: 'element-settings',
				label: __( 'Container nesting is too deep.', 'elementor' ),
			} );
		}
	} );

	return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
