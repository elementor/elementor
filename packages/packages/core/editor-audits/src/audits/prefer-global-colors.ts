import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

const HEX_RE = /^#[0-9a-f]{3,8}$/i;

export const descriptor: AuditDescriptor = {
	id: 'audits/prefer-global-colors',
	title: __( 'Prefer global colors over hard-coded values', 'elementor' ),
	description: __( 'Global colors make the design consistent and easy to update site-wide.', 'elementor' ),
	fixHint: __( "Replace the hard-coded color with one of your kit's global colors.", 'elementor' ),
	categories: [ 'health' ],
	severity: 'info',
	weight: 3,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
	if ( ctx.kit.globals.colors.length === 0 ) {
		return { status: 'skipped', reason: 'no globals' };
	}

	const violations: AuditViolation[] = [];

	walkElements( ctx.elements.tree, ( node ) => {
		if ( node.elType !== 'widget' ) {
			return;
		}

		for ( const [ key, value ] of Object.entries( node.settings ) ) {
			if ( typeof value === 'string' && HEX_RE.test( value ) ) {
				violations.push( {
					auditId: descriptor.id,
					elementId: node.id,
					targetHint: 'element-settings',
					label: `${ key }: ${ value }`,
				} );
			}
		}
	} );

	return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
