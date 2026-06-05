import { __, sprintf } from '@wordpress/i18n';

import { collectHardcodedColors } from '../lib/collect-hardcoded-colors';
import { findMatchingGlobalColor } from '../lib/match-global-color';
import { walkElements } from '../lib/walk';
import { type Audit, type AuditViolation } from '../types';

export const audit: Audit = {
	id: 'audits/prefer-global-colors',
	title: __( 'Prefer global colors', 'elementor' ),
	description: __( 'Global colors make the design consistent and easy to update site-wide.', 'elementor' ),
	fixHint: __( 'Replace the hard-coded value with the matching global color.', 'elementor' ),
	categories: [ 'best-practices' ],
	severity: 'info',
	weight: 3,
	evaluate: ( ctx ) => {
		if ( ctx.elements.tree.length === 0 ) {
			return { status: 'skipped', reason: __( 'No elements', 'elementor' ) };
		}

		if ( ctx.kit.globals.colors.length === 0 ) {
			return { status: 'skipped', reason: __( 'No global colors', 'elementor' ) };
		}

		const violations: AuditViolation[] = [];

		walkElements( ctx.elements.tree, ( node ) => {
			for ( const { value } of collectHardcodedColors( node.settings ) ) {
				const global = findMatchingGlobalColor( value, ctx.kit.globals.colors );

				if ( ! global ) {
					continue;
				}

				violations.push( {
					auditId: audit.id,
					elementId: node.id,
					targetHint: 'element-settings',
					label: sprintf(
						/* translators: 1: hard-coded color value, 2: global color title. */
						__( 'replace "%1$s" with "%2$s" global color', 'elementor' ),
						value,
						global.title
					),
				} );
			}
		} );

		return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
	},
};
