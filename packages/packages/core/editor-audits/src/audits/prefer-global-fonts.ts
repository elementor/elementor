import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

const FONT_FAMILY_KEY_PATTERN = /font_family/;

function isHardCodedFont( value: unknown ): value is string {
	return typeof value === 'string' && value.length > 0 && ! value.startsWith( 'globals/' );
}

export const descriptor: AuditDescriptor = {
	id: 'audits/prefer-global-fonts',
	title: __( 'Prefer global fonts over hard-coded values', 'elementor' ),
	description: __( 'Global fonts make the design consistent and easy to update site-wide.', 'elementor' ),
	fixHint: __( "Replace the hard-coded font with one of your kit's global fonts.", 'elementor' ),
	categories: [ 'health', 'performance' ],
	severity: 'info',
	weight: 3,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
	if ( ctx.kit.globals.fonts.length === 0 ) {
		return { status: 'skipped', reason: 'no globals' };
	}

	const violations: AuditViolation[] = [];

	walkElements( ctx.elements.tree, ( node ) => {
		if ( node.elType !== 'widget' ) {
			return;
		}

		for ( const [ key, value ] of Object.entries( node.settings ) ) {
			if ( FONT_FAMILY_KEY_PATTERN.test( key ) && isHardCodedFont( value ) ) {
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
