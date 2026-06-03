import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

function isHiddenOnAllDevices( settings: Record< string, unknown > ): boolean {
	return Boolean( settings.hide_desktop ) && Boolean( settings.hide_tablet ) && Boolean( settings.hide_mobile );
}

export const descriptor: AuditDescriptor = {
	id: 'audits/hidden-elements',
	title: __( 'Hidden elements', 'elementor' ),
	description: __(
		'Elements hidden on all devices simultaneously are effectively dead code in the page tree.',
		'elementor'
	),
	fixHint: __( 'Remove the element or make it visible on at least one device breakpoint.', 'elementor' ),
	categories: [ 'health' ],
	severity: 'info',
	weight: 3,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
	const violations: AuditViolation[] = [];

	walkElements( ctx.elements.tree, ( node ) => {
		if ( isHiddenOnAllDevices( node.settings ) ) {
			violations.push( {
				auditId: descriptor.id,
				elementId: node.id,
				targetHint: 'element-settings',
				label: __( 'Element is hidden on all devices.', 'elementor' ),
			} );
		}
	} );

	return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
