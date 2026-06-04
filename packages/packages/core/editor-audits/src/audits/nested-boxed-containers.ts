import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type Audit, type AuditViolation } from '../types';

function isBoxed( settings: Record< string, unknown > ): boolean {
	return settings.content_width === 'boxed';
}

export const audit: Audit = {
	id: 'audits/nested-boxed-containers',
	title: __( 'Boxed container nested inside a boxed parent', 'elementor' ),
	description: __( 'An inner container does not need to be boxed when its parent already is.', 'elementor' ),
	fixHint: __( "Change the inner container's content width to Full Width.", 'elementor' ),
	categories: [ 'best-practices', 'performance' ],
	severity: 'info',
	weight: 5,
	evaluate: ( ctx ) => {
		const violations: AuditViolation[] = [];

		walkElements( ctx.elements.tree, ( node, parents ) => {
			if ( node.elType !== 'container' || ! isBoxed( node.settings ) ) {
				return;
			}

			const nearestContainerAncestor = [ ...parents ].reverse().find( ( p ) => p.elType === 'container' );

			if ( nearestContainerAncestor && isBoxed( nearestContainerAncestor.settings ) ) {
				violations.push( {
					auditId: audit.id,
					elementId: node.id,
					targetHint: 'element-settings',
					label: __( 'Nested boxed container.', 'elementor' ),
				} );
			}
		} );

		return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
	},
};
