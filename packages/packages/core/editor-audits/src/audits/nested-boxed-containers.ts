import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

export const descriptor: AuditDescriptor = {
	id: 'audits/nested-boxed-containers',
	title: __( 'Boxed container nested inside a boxed parent', 'elementor' ),
	description: __( 'An inner container does not need to be boxed when its parent already is.', 'elementor' ),
	fixHint: __( "Change the inner container's content width to Full Width.", 'elementor' ),
	categories: [ 'performance', 'health' ],
	severity: 'warning',
	weight: 5,
};

function isBoxed( settings: Record< string, unknown > ): boolean {
	return settings.content_width === 'boxed';
}

export const evaluator: AuditEvaluator = ( ctx ) => {
	const violations: AuditViolation[] = [];

	walkElements( ctx.elements.tree, ( node, parents ) => {
		if ( node.elType !== 'container' || ! isBoxed( node.settings ) ) {
			return;
		}

		const nearestContainerAncestor = [ ...parents ].reverse().find( ( p ) => p.elType === 'container' );

		if ( nearestContainerAncestor && isBoxed( nearestContainerAncestor.settings ) ) {
			violations.push( {
				auditId: descriptor.id,
				elementId: node.id,
				targetHint: 'element-settings',
				label: __( 'Nested boxed container.', 'elementor' ),
			} );
		}
	} );

	return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
