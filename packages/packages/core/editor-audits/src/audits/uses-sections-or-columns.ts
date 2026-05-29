import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

export const descriptor: AuditDescriptor = {
	id: 'audits/uses-sections-or-columns',
	title: __( 'Uses outdated sections or columns', 'elementor' ),
	description: __(
		'Sections and columns are legacy elements. Containers render fewer DOM nodes and are more flexible.',
		'elementor'
	),
	fixHint: __( 'Use the Container Converter to replace each section/column with a container.', 'elementor' ),
	categories: [ 'health', 'performance' ],
	severity: 'warning',
	weight: 7,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
	const violations: AuditViolation[] = [];

	walkElements( ctx.elements.tree, ( node ) => {
		if ( node.elType === 'section' || node.elType === 'column' ) {
			violations.push( {
				auditId: descriptor.id,
				elementId: node.id,
				label:
					node.elType === 'section'
						? __( 'Section element', 'elementor' )
						: __( 'Column element', 'elementor' ),
			} );
		}
	} );

	return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
