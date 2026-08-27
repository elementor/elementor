import { __ } from '@wordpress/i18n';

import { type Audit, type AuditViolation } from '../types';
import { walkElements } from '../utils/walk';

function isHiddenOnAllDevices( settings: Record< string, unknown > ): boolean {
	return Boolean( settings.hide_desktop ) && Boolean( settings.hide_tablet ) && Boolean( settings.hide_mobile );
}

export const audit: Audit = {
	id: 'audits/hidden-elements',
	title: __( 'Hidden elements', 'elementor' ),
	description: __(
		'Elements hidden on all devices simultaneously are effectively dead code in the page tree.',
		'elementor'
	),
	fixHint: __( 'Remove the element or make it visible on at least one device breakpoint.', 'elementor' ),
	categories: [ 'best-practices', 'performance' ],
	severity: 'info',
	weight: 3,
	evaluate: ( ctx ) => {
		if ( ctx.elements.tree.length === 0 ) {
			return { status: 'skipped', reason: __( 'No elements', 'elementor' ) };
		}

		const violations: AuditViolation[] = [];

		walkElements( ctx.elements.tree, ( node ) => {
			if ( isHiddenOnAllDevices( node.settings ) ) {
				violations.push( {
					auditId: audit.id,
					elementId: node.id,
					targetHint: 'element-settings',
					label: __( 'Element is hidden on all devices.', 'elementor' ),
				} );
			}
		} );

		return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
	},
};
