import { __ } from '@wordpress/i18n';

import { type Audit, type AuditViolation } from '../types';
import { walkElements } from '../utils/walk';

export const audit: Audit = {
	id: 'audits/sections-and-columns',
	title: __( 'Sections and columns', 'elementor' ),
	description: __(
		'Sections and columns are legacy elements. Containers render fewer DOM nodes and are more flexible.',
		'elementor'
	),
	fixHint: __( 'Use the Container Converter to replace each section/column with a container.', 'elementor' ),
	categories: [ 'best-practices', 'performance' ],
	severity: 'warning',
	weight: 7,
	evaluate: ( ctx ) => {
		if ( ctx.elements.tree.length === 0 ) {
			return { status: 'skipped', reason: __( 'No elements', 'elementor' ) };
		}

		const violations: AuditViolation[] = [];

		walkElements( ctx.elements.tree, ( node ) => {
			if ( node.elType === 'section' || node.elType === 'column' ) {
				violations.push( {
					auditId: audit.id,
					elementId: node.id,
					label:
						node.elType === 'section'
							? __( 'Section element', 'elementor' )
							: __( 'Column element', 'elementor' ),
				} );
			}
		} );

		return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
	},
};
